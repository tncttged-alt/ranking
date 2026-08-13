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
        populateRelated();
        initComments();
    })
    .catch((error) => {
        console.error(error);
        rankingList.innerHTML = "<p>ランキングを読み込めませんでした。</p>";
    });

function populateRelated() {
    const relatedList = document.querySelector("#relatedList");
    if (!relatedList) return;
    const root = document.body.dataset.root || "";
    fetch(root + "data/articles.json")
        .then((r) => r.json())
        .then((articles) => {
            const currentTitle = document.querySelector("h1")?.textContent?.trim() || document.title;
            const others = articles.filter((a) => a.title !== currentTitle).slice(0, 5);
            if (!others.length) {
                relatedList.innerHTML = "<p>関連記事はありません。</p>";
                return;
            }
            relatedList.innerHTML = others
                .map(
                    (a) =>
                        `<div class="relatedItem"><a href="${root}${a.url}">${escapeHtml(a.title)}</a><p class="relatedDesc">${escapeHtml(
                            a.description || ""
                        )}</p></div>`
                )
                .join("");
        })
        .catch((e) => {
            console.error(e);
            relatedList.innerHTML = "<p>関連記事を読み込めませんでした。</p>";
        });
}

function initComments() {
    const commentsList = document.querySelector("#commentsList");
    const form = document.querySelector("#commentForm");
    if (!commentsList || !form) return;
    const nameInput = document.querySelector("#commentName");
    const textInput = document.querySelector("#commentText");
    const pagePath = window.location.pathname;
    const storageKey = "comments:" + pagePath;
    const root = document.body.dataset.root || "";
    const apiEndpoint = document.body.dataset.commentsApi || null;
    const detailUrl = `${root}rankings/comments.html?path=${encodeURIComponent(pagePath)}`;

    async function loadComments() {
        let arr = [];
        // Try API if configured
        if (apiEndpoint) {
            try {
                const res = await fetch(`${apiEndpoint}?path=${encodeURIComponent(pagePath)}`);
                if (res.ok) {
                    arr = await res.json();
                }
            } catch (e) {
                console.error(e);
            }
        }
        // Fallback to localStorage
        if (!arr || !arr.length) {
            try {
                arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
            } catch (e) {
                arr = [];
            }
        }

        if (!arr.length) {
            commentsList.innerHTML = "<p>まだコメントはありません。</p>";
            return;
        }

        const total = arr.length;
        const latest = arr.slice(-5);
        commentsList.innerHTML = latest
            .map(
                (c) =>
                    `<div class="commentItem"><div class="commentMeta"><strong>${escapeHtml(c.name || "匿名")}</strong> <time>${escapeHtml(
                        new Date(c.time).toLocaleString()
                    )}</time></div><div class="commentBody">${escapeHtml(c.text).replaceAll("
", "<br>")}</div></div>`
            )
            .join("");

        // If more than 5, show link to detail page
        const existingLink = document.querySelector('.moreCommentsLink');
        if (total > 5 && !existingLink) {
            const a = document.createElement('a');
            a.className = 'moreCommentsLink';
            a.href = detailUrl;
            a.textContent = `コメントをもっと見る (${total})`;
            commentsList.insertAdjacentElement('afterend', a);
        } else if (total <= 5 && existingLink) {
            existingLink.remove();
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim() || "匿名";
        const text = textInput.value.trim();
        if (!text) return;
        const comment = { name, text, time: Date.now() };
        // Try to POST to API if configured
        if (apiEndpoint) {
            try {
                await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: pagePath, ...comment }),
                });
            } catch (e) {
                console.error(e);
            }
        }
        // Always persist locally as fallback
        const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
        arr.push(comment);
        localStorage.setItem(storageKey, JSON.stringify(arr));
        nameInput.value = "";
        textInput.value = "";
        loadComments();
    });

    loadComments();
}
