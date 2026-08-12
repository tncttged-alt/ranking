const rankingPeriods = [
  { key: "all", label: "全体ランキング" },
  { key: "month", label: "月間ランキング" },
  { key: "week", label: "週間ランキング" },
];

const popularitySections = document.querySelector("#popularitySections");
const newArticlesContainer = document.querySelector("#newArticles");

function createArticleCard(article, rank = null, period = null) {
  const rankBadge = rank !== null ? `<span class="rankBadge">${rank}位</span>` : "";
  const detail = period
    ? `${article.views[period].toLocaleString("ja-JP")} views`
    : article.description;

  return `
    <a class="card" href="${article.url}">
      ${rankBadge}
      <h3>${article.title}</h3>
      <small>${detail}</small>
    </a>
  `;
}

function renderPopularity(articles) {
  popularitySections.innerHTML = rankingPeriods
    .map(({ key, label }) => {
      const rankedArticles = [...articles]
        .sort((first, second) => second.views[key] - first.views[key])
        .slice(0, 5);

      return `
        <section class="popularityBlock">
          <h3>${label}</h3>
          <div class="grid">
            ${rankedArticles
              .map((article, index) => createArticleCard(article, index + 1, key))
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderNewArticles(articles) {
  newArticlesContainer.innerHTML = [...articles]
    .reverse()
    .slice(0, 6)
    .map((article) => createArticleCard(article))
    .join("");
}

async function initializeHomePage() {
  try {
    const response = await fetch("data/articles.json");
    if (!response.ok) {
      throw new Error(`記事データの取得に失敗しました: ${response.status}`);
    }

    const articles = await response.json();
    renderPopularity(articles);
    renderNewArticles(articles);
  } catch (error) {
    console.error(error);
    popularitySections.innerHTML = `
      <p class="errorMessage">
        記事を読み込めませんでした。ローカルサーバー経由で開いてください。
      </p>
    `;
  }
}

initializeHomePage();
