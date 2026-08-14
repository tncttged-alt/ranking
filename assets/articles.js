const articleIndex = document.querySelector("#articleIndex");

const kanaGroups = [
  { label: "あ行", characters: "あいうえおぁぃぅぇぉ" },
  { label: "か行", characters: "かきくけこがぎぐげご" },
  { label: "さ行", characters: "さしすせそざじずぜぞ" },
  { label: "た行", characters: "たちつてとだぢづでど" },
  { label: "な行", characters: "なにぬねの" },
  { label: "は行", characters: "はひふへほばびぶべぼぱぴぷぺぽ" },
  { label: "ま行", characters: "まみむめも" },
  { label: "や行", characters: "やゆよゃゅょ" },
  { label: "ら行", characters: "らりるれろ" },
  { label: "わ行", characters: "わをん" },
];

function getKanaGroup(titleKana) {
  const firstCharacter = (titleKana || "").trim().charAt(0);
  const matchedGroup = kanaGroups.find((group) =>
    group.characters.includes(firstCharacter),
  );

  return matchedGroup?.label || "その他";
}

function createArticleLink(article) {
  return `
    <a class="indexItem" href="${article.url}">
      <b>${article.title}</b>
      <small>${article.description}</small>
    </a>
  `;
}

function renderArticleIndex(articles) {
  const sortedArticles = [...articles].sort((first, second) =>
    (first.titleKana || first.title).localeCompare(
      second.titleKana || second.title,
      "ja",
    ),
  );
  const groupLabels = [...kanaGroups.map((group) => group.label), "その他"];

  articleIndex.innerHTML = groupLabels
    .map((label) => {
      const articlesInGroup = sortedArticles.filter(
        (article) =>
          getKanaGroup(article.titleKana || article.title) === label,
      );

      if (articlesInGroup.length === 0) return "";

      return `
        <section class="indexGroup">
          <h2>${label}</h2>
          <div class="articleIndexList">
            ${articlesInGroup.map(createArticleLink).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

async function initializeArticleIndex() {
  try {
    const response = await fetch("data/articles.json");
    if (!response.ok) {
      throw new Error(`記事データの取得に失敗しました: ${response.status}`);
    }

    const articles = await response.json();
    renderArticleIndex(articles);
  } catch (error) {
    console.error(error);
    articleIndex.innerHTML = `
      <p class="errorMessage">
        記事一覧を読み込めませんでした。ローカルサーバー経由で開いてください。
      </p>
    `;
  }
}

initializeArticleIndex();
