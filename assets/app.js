let articles = [];
const articleList = document.querySelector("#articleList");
const popularList = document.querySelector("#popularList");

function createCard(article) {
  return `
    <a class="card" href="${article.url}">
      <img src="${article.image}" alt="${article.title}" width="800" height="450">
      <div>
        <span class="tag">${article.category}</span>
        <h3>${article.title}</h3>
        <span class="meta">更新 ${article.date}</span>
      </div>
    </a>`;
}

function renderArticles(items) {
  articleList.innerHTML = items.map(createCard).join("");
}

function renderPopular(period) {
  popularList.innerHTML = [...articles]
    .sort((a, b) => b.views[period] - a.views[period])
    .slice(0, 3)
    .map(createCard)
    .join("");
}

fetch("data/articles.json")
  .then((response) => response.json())
  .then((data) => {
    articles = data;
    renderArticles(articles);
    renderPopular("all");
  })
  .catch((error) => console.error("記事の読み込みに失敗しました", error));

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".tabs .active")?.classList.remove("active");
    button.classList.add("active");
    renderPopular(button.dataset.period);
  });
});

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  renderArticles(
    articles.filter((article) =>
      `${article.title} ${article.keywords}`.toLowerCase().includes(query),
    ),
  );
});