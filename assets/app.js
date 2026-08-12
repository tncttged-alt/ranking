const rankingPeriods = {
  all: "全体",
  month: "月間",
  week: "週間",
};

const popularitySections = document.querySelector("#popularitySections");
const newArticles = document.querySelector("#newArticles");

function createArticleCard(article, rank = null, period = null) {
  const rankLabel = rank ? `<span class="rankBadge">${rank}位</span>` : "";
  const viewsLabel = period
    ? `${article.views[period].toLocaleString("ja-JP")} views`
    : article.description;

  return `
    <a class="card" href="${article.url}">
      ${rankLabel}
      <h3>${article.title}</h3>
      <small>${viewsLabel}</small>
    </a>
  `;
}

function renderPopularitySections(articles) {
  popularitySections.innerHTML = Object.entries(rankingPeriods)
    .map(([period, label]) => {
      const topArticles = [...articles]
        .sort((first, second) => second.views[period] - first.views[period])
        .slice(0, 3);

      return `
        <section class="popularityBlock">
          <h3>${label}ランキング</h3>
          <div class="grid">
            ${topArticles
              .map((article, index) =>
                createArticleCard(article, index + 1, period),
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderNewArticles(articles) {
  newArticles.innerHTML = articles
    .slice(0, 6)
    .map((article) => createArticleCard(article))
    .join("");
}

fetch("data/articles.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`記事データを取得できませんでした: ${response.status}`);
    }

    return response.json();
  })
  .then((articles) => {
    renderPopularitySections(articles);
    renderNewArticles(articles);
  })
  .catch((error) => {
    console.error(error);
    popularitySections.innerHTML = "<p>記事情報を読み込めませんでした。</p>";
  });
