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

function findKanaGroup(titleKana) {
  const firstCharacter = titleKana.trim().charAt(0);
  return (
    kanaGroups.find((group) => group.characters.includes(firstCharacter))?.label ||
    "その他"
  );
}

function createIndexItem(article) {
  return `
    <a class="indexItem" href="${article.url}">
      <b>${article.title}</b>
      <small>${article.description}</small>
    </a>
  `;
}

fetch("data/articles.json")
  .then((response) => response.json())
  .then((articles) => {
    const sortedArticles = [...articles].sort((first, second) =>
      first.titleKana.localeCompare(second.titleKana, "ja"),
    );
    const labels = [...kanaGroups.map((group) => group.label), "その他"];

    articleIndex.innerHTML = labels
      .map((label) => {
        const groupArticles = sortedArticles.filter(
          (article) => findKanaGroup(article.titleKana) === label,
        );

        if (groupArticles.length === 0) {
          return "";
        }

        return `
          <section class="indexGroup">
            <h2>${label}</h2>
            ${groupArticles.map(createIndexItem).join("")}
          </section>
        `;
      })
      .join("");
  })
  .catch((error) => {
    console.error(error);
    articleIndex.innerHTML = "<p>記事一覧を読み込めませんでした。</p>";
  });
