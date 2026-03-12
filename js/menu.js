// ================================================================
//  DANGEROUS HARVEST — Menu Logic
// ================================================================

const playBtn = document.getElementById("play-btn");
const rulesBtn = document.getElementById("rules-btn");
const rulesBackBtn = document.getElementById("rules-back-btn");
const rulesModal = document.getElementById("rules-modal");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardBackBtn = document.getElementById("leaderboard-back-btn");
const leaderboardList = document.getElementById("leaderboard-list");

// ============ NAVIGATION ============
playBtn.addEventListener("click", () => {
    window.location.href = "html/game.html";
});

rulesBtn.addEventListener("click", () => {
    rulesModal.style.display = "flex";
});

rulesBackBtn.addEventListener("click", () => {
    rulesModal.style.display = "none";
});

leaderboardBtn.addEventListener("click", () => {
    renderLeaderboard(leaderboardList);
    leaderboardModal.style.display = "flex";
});

leaderboardBackBtn.addEventListener("click", () => {
    leaderboardModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === rulesModal) rulesModal.style.display = "none";
    if (e.target === leaderboardModal) leaderboardModal.style.display = "none";
});

// ============ LEADERBOARD RENDERING ============
function getLeaderboard() {
    const data = localStorage.getItem("dangerousHarvestLeaderboard");
    return data ? JSON.parse(data) : [];
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderLeaderboard(container, highlightIndex) {
    const entries = getLeaderboard();

    if (entries.length === 0) {
        container.innerHTML = '<p class="leaderboard-empty">No scores yet. Be the first!</p>';
        return;
    }

    let html = `
        <div class="lb-header">
            <span>#</span>
            <span>NAME</span>
            <span style="text-align:right">SCORE</span>
            <span style="text-align:right">TIME</span>
        </div>
    `;

    const maxDisplay = 10;
    const displayed = entries.slice(0, maxDisplay);

    for (let i = 0; i < displayed.length; i++) {
        const entry = displayed[i];
        const isHighlighted = i === highlightIndex;
        html += `
            <div class="lb-row${isHighlighted ? " lb-highlight" : ""}">
                <span class="lb-rank">${i + 1}</span>
                <span class="lb-name">${escapeHtml(entry.name)}</span>
                <span class="lb-score">${entry.score}</span>
                <span class="lb-time">${formatTime(entry.time)}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
