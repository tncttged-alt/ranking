const rootPath = document.body.dataset.root || "";
const menuButton = document.querySelector("#menuBtn");
const menuDrawer = document.querySelector("#drawer");
const menuOverlay = document.querySelector("#overlay");
const closeButton = document.querySelector("#close");
const weeklyContainer = document.querySelector("#weekly");

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

async function loadWeeklyMenu() {
  if (!weeklyContainer) return;

  try {
    const response = await fetch(`${rootPath}data/articles.json`);
    if (!response.ok) {
      throw new Error(`記事データの取得に失敗しました: ${response.status}`);
    }

    const articles = await response.json();
    const weeklyTopArticles = [...articles]
      .sort((first, second) => second.views.week - first.views.week)
      .slice(0, 3);

    weeklyContainer.innerHTML = weeklyTopArticles
      .map(
        (article, index) => `
          <a href="${rootPath}${article.url}">
            <span>${index + 1}位</span>
            ${article.title}
          </a>
        `,
      )
      .join("");
  } catch (error) {
    console.error(error);
    weeklyContainer.innerHTML = "<small>週間ランキングを読み込めませんでした。</small>";
  }
}

loadWeeklyMenu();
