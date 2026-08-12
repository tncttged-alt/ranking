const rankingList = document.querySelector("#rankingList");
const startRank = Number(document.body.dataset.start);
const endRank = Number(document.body.dataset.end);

function createRankingItem(character) {
  return `
    <section class="rank">
      <h3>
        <span class="num">${character.rank}位</span>
        ${character.name}
      </h3>
      <span class="score">総合評価 ${character.score}</span>
      <p>${character.description}</p>
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
  .then((rankingCharacters) => {
    const visibleCharacters = rankingCharacters.filter(
      (character) =>
        character.rank <= startRank && character.rank >= endRank,
    );

    rankingList.innerHTML = visibleCharacters
      .map(createRankingItem)
      .join("");
  })
  .catch((error) => {
    console.error(error);
    rankingList.innerHTML = "<p>ランキングを読み込めませんでした。</p>";
  });
