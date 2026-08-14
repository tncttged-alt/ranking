const rankingList = document.querySelector("#rankingList");
const pageIndex = Number(document.body.dataset.pageIndex);

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
