const rootPath = document.body.dataset.root || "";
const menuButton = document.querySelector("#menuBtn");
const menuDrawer = document.querySelector("#drawer");
const menuOverlay = document.querySelector("#overlay");
const closeButton = document.querySelector("#close");
const weeklyMenu = document.querySelector("#weekly");

function setMenuOpen(isOpen) {
  menuDrawer?.classList.toggle("open", isOpen);
  menuOverlay?.classList.toggle("open", isOpen);
  menuButton?.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
}

menuButton?.addEventListener("click", () => setMenuOpen(true));
closeButton?.addEventListener("click", () => setMenuOpen(false));
menuOverlay?.addEventListener("click", () => setMenuOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

fetch(`${rootPath}data/articles.json`)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`記事データを取得できませんでした: ${response.status}`);
    }

    return response.json();
  })
  .then((articles) => {
    const weeklyTopArticles = [...articles]
      .sort((first, second) => second.views.week - first.views.week)
      .slice(0, 3);

    weeklyMenu.innerHTML = weeklyTopArticles
      .map(
        (article, index) => `
          <a href="${rootPath}${article.url}">
            ${index + 1}位 ${article.title}
          </a>
        `,
      )
      .join("");
  })
  .catch((error) => {
    console.error(error);
    weeklyMenu.innerHTML = "<small>記事情報を読み込めませんでした。</small>";
  });
