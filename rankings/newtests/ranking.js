const rankingList = document.querySelector("#rankingList");
const pageIndex = Number(document.body.dataset.pageIndex);
const articleTitle = document.body.dataset.articleTitle || document.title;
const articleRootPath = document.body.dataset.root || "../../";

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyY0xu90qSz-h4IMzkrMyqVBja71HPnXyOqx00tEP4Rt7GTPIBnKJHBuY-xpXPV-JpX/exec";
const IP_LOOKUP_URL = "https://api.ipify.org?format=json";

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function createStatus(statusName, statusValue) {
  return `
    <span class="score">
      ${escapeHtml(statusName)}: ${escapeHtml(statusValue)}
    </span>
  `;
}

function createRankingItem(character) {
  const statuses = Object.entries(character.statuses)
    .map(([name, value]) => createStatus(name, value))
    .join("");

  return `
    <section class="rank">
      <h3>
        <span class="num">${character.rank}位</span>
        ${escapeHtml(character.name)}
      </h3>
      <div class="scores">${statuses}</div>
      <p>${escapeHtml(character.evaluation).replaceAll("\n", "<br>")}</p>
    </section>
  `;
}

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .replace(/top\d+/gi, "")
    .replace(/ランキング/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function titleSimilarity(firstTitle, secondTitle) {
  const first = normalizeTitle(firstTitle);
  const second = normalizeTitle(secondTitle);
  if (!first || !second) return 0;

  const firstBigrams = new Set();
  for (let index = 0; index < first.length - 1; index += 1) {
    firstBigrams.add(first.slice(index, index + 2));
  }

  let matches = 0;
  for (let index = 0; index < second.length - 1; index += 1) {
    if (firstBigrams.has(second.slice(index, index + 2))) matches += 1;
  }

  return matches / Math.max(first.length - 1, second.length - 1, 1);
}

async function loadRelatedPages() {
  const container = document.querySelector("#relatedPagesList");
  try {
    const response = await fetch(`${articleRootPath}data/articles.json`);
    if (!response.ok) throw new Error(`記事一覧取得エラー: ${response.status}`);
    const articles = await response.json();
    const relatedArticles = articles
      .filter((article) => article.title !== articleTitle)
      .map((article) => ({
        ...article,
        similarity: titleSimilarity(articleTitle, article.title),
      }))
      .sort((first, second) => second.similarity - first.similarity)
      .slice(0, 3);

    container.innerHTML = relatedArticles.length
      ? relatedArticles
        .map(
          (article) => `
              <a class="relatedPageLink" href="${articleRootPath}${article.url}">
                ${escapeHtml(article.title)}
              </a>
            `,
        )
        .join("")
      : "<p>関連ページはありません。</p>";
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>関連ページを読み込めませんでした。</p>";
  }
}

function createCommentItem(comment) {
  return `
    <article class="commentItem">
      <header>
        <b>${escapeHtml(comment.name || "匿名")}</b>
        <time>${escapeHtml(comment.writtenAt || "")}</time>
      </header>
      <p>${escapeHtml(comment.comment || "").replaceAll("\n", "<br>")}</p>
    </article>
  `;
}

async function loadComments() {
  const container = document.querySelector("#commentList");
  try {
    const response = await fetch(`comment.json?timestamp=${Date.now()}`);
    if (!response.ok) throw new Error(`コメント取得エラー: ${response.status}`);
    const comments = await response.json();
    container.innerHTML = comments.length
      ? comments.map(createCommentItem).join("")
      : "<p>まだコメントはありません。</p>";
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>コメントを読み込めませんでした。</p>";
  }
}

async function getPublicIpAddress() {
  const response = await fetch(IP_LOOKUP_URL);
  if (!response.ok) throw new Error("IPアドレスを取得できませんでした。");
  const data = await response.json();
  return data.ip;
}

async function submitComment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const message = document.querySelector("#commentMessage");
  const name = document.querySelector("#commentName").value.trim();
  const comment = document.querySelector("#commentBody").value.trim();

  button.disabled = true;
  message.textContent = "送信しています。";

  try {
    const ipAddress = await getPublicIpAddress();
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ipAddress,
        article: articleTitle,
        name,
        comment,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.message || "コメントを送信できませんでした。");
    }
    form.reset();
    message.textContent = "コメントを受け付けました。反映まで最大60分かかります。";
  } catch (error) {
    console.error(error);
    message.textContent = error.message || "コメントを送信できませんでした。";
  } finally {
    button.disabled = false;
  }
}

fetch("ranking-data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`ランキングデータを取得できませんでした: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const currentPage = data.pages[pageIndex] || [];
    rankingList.innerHTML = currentPage.map(createRankingItem).join("");
  })
  .catch((error) => {
    console.error(error);
    rankingList.innerHTML = "<p>ランキングを読み込めませんでした。</p>";
  });

document.querySelector("#commentForm")?.addEventListener("submit", submitComment);
loadRelatedPages();
loadComments();
