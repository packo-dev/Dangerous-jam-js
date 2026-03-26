// ================================================================
//  DANGEROUS HARVEST — Game Engine
//  "Nothing is Safe" — Survival Arcade
// ================================================================

// ============ CANVAS SETUP ============
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ============ DOM REFERENCES ============
const gameoverScreen = document.getElementById("gameover-screen");
const hud = document.getElementById("hud");
const waveAnnounce = document.getElementById("wave-announce");
const waveAnnounceText = document.getElementById("wave-announce-text");

const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");

const heartsContainer = document.getElementById("hearts-container");
const scoreDisplay = document.getElementById("score-display");
const timeDisplay = document.getElementById("time-display");
const waveDisplay = document.getElementById("wave-display");

const finalScoreEl = document.getElementById("final-score");
const bestScoreEl = document.getElementById("best-score");
const finalTimeEl = document.getElementById("final-time");
const finalWaveEl = document.getElementById("final-wave");

const nameInputSection = document.getElementById("name-input-section");
const playerNameInput = document.getElementById("player-name");
const saveScoreBtn = document.getElementById("save-score-btn");
const gameoverLeaderboard = document.getElementById("gameover-leaderboard");
const muteBtn = document.getElementById("mute-btn");

// ============ CONFIGURATION ============
const CONFIG = {
    PLAYER_SPEED: 5,
    PLAYER_SIZE: 48,
    ITEM_SIZE: 36,
    INITIAL_LIVES: 5,
    INITIAL_SPAWN_INTERVAL: 1200,
    MIN_SPAWN_INTERVAL: 350,
    MUTATION_DELAY_BASE: 4000,
    MUTATION_DELAY_MIN: 1500,
    WARNING_DURATION: 1500,
    DANGEROUS_SPEED: 1.8,
    DANGEROUS_SPEED_MAX: 4.5,
    WAVE_DURATION: 30000,
    POINTS_PER_COLLECT: 10,
    POINTS_PER_SECOND: 1,
    INVINCIBILITY_DURATION: 1200,
    SCREEN_SHAKE_DURATION: 300,
    SCREEN_SHAKE_INTENSITY: 8,
    NOTHING_SAFE_CHANCE: 0.08,
    PARTICLE_COUNT_COLLECT: 12,
    PARTICLE_COUNT_HIT: 20,
};

// ============ ASSET LOADING ============
const ASSETS = {};
const ASSET_LIST = [
    { key: "farmer",         src: "../assets/img/farmer.svg" },
    { key: "fieldBg",        src: "../assets/img/field-bg.svg" },
    { key: "carrotSafe",     src: "../assets/img/carrot-safe.svg" },
    { key: "carrotDanger",   src: "../assets/img/carrot-danger.svg" },
    { key: "cornSafe",       src: "../assets/img/corn-safe.svg" },
    { key: "cornDanger",     src: "../assets/img/corn-danger.svg" },
    { key: "tomatoSafe",     src: "../assets/img/tomato-safe.svg" },
    { key: "tomatoDanger",   src: "../assets/img/tomato-danger.svg" },
    { key: "chickenSafe",    src: "../assets/img/chicken-safe.svg" },
    { key: "chickenDanger",  src: "../assets/img/chicken-danger.svg" },
    { key: "eggSafe",        src: "../assets/img/egg-safe.svg" },
    { key: "eggDanger",      src: "../assets/img/egg-danger.svg" },
];

let assetsLoaded = 0;

function loadAssets() {
    return new Promise((resolve) => {
        if (ASSET_LIST.length === 0) { resolve(); return; }
        for (const asset of ASSET_LIST) {
            const img = new Image();
            img.onload = () => {
                assetsLoaded++;
                if (assetsLoaded >= ASSET_LIST.length) resolve();
            };
            img.onerror = () => {
                assetsLoaded++;
                if (assetsLoaded >= ASSET_LIST.length) resolve();
            };
            img.src = asset.src;
            ASSETS[asset.key] = img;
        }
    });
}

// ============ ITEM TYPES ============
const ITEM_TYPES = [
    { safeImg: "carrotSafe",  dangerImg: "carrotDanger",  name: "carrot" },
    { safeImg: "cornSafe",    dangerImg: "cornDanger",    name: "corn" },
    { safeImg: "tomatoSafe",  dangerImg: "tomatoDanger",  name: "tomato" },
    { safeImg: "chickenSafe", dangerImg: "chickenDanger", name: "chicken" },
    { safeImg: "eggSafe",     dangerImg: "eggDanger",     name: "egg" },
];

// ============ GAME STATE ============
let gameState = "playing";
let score = 0;
let lives = CONFIG.INITIAL_LIVES;
let wave = 1;
let elapsedTime = 0;
let lastTimestamp = 0;
let spawnTimer = 0;
let waveTimer = 0;
let isInvincible = false;
let invincibilityTimer = 0;
let screenShakeTimer = 0;
let nothingSafeActive = false;
let nothingSafeTimer = 0;

let items = [];
let particles = [];
let bgStars = [];

// ============ PLAYER ============
const player = {
    x: 0,
    y: 0,
    width: CONFIG.PLAYER_SIZE,
    height: CONFIG.PLAYER_SIZE,
};

function resetPlayer() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
}

// ============ INPUT ============
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// ============ BACKGROUND PARTICLES ============
function initBackgroundStars() {
    bgStars = [];
    for (let i = 0; i < 60; i++) {
        bgStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.4 + 0.1,
            speed: Math.random() * 0.3 + 0.1,
        });
    }
}

function updateBackgroundStars() {
    for (const star of bgStars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

function drawBackgroundStars() {
    for (const star of bgStars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    }
}

// ============ HEARTS (HUD) ============
function renderHearts() {
    heartsContainer.innerHTML = "";
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        if (i >= lives) heart.classList.add("lost");
        heartsContainer.appendChild(heart);
    }
}

// ============ ITEMS ============
function createItem() {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
        case 0: x = Math.random() * canvas.width; y = -CONFIG.ITEM_SIZE; break;
        case 1: x = canvas.width + CONFIG.ITEM_SIZE; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + CONFIG.ITEM_SIZE; break;
        default: x = -CONFIG.ITEM_SIZE; y = Math.random() * canvas.height; break;
    }

    const mutationDelay = Math.max(
        CONFIG.MUTATION_DELAY_MIN,
        CONFIG.MUTATION_DELAY_BASE - (wave - 1) * 300
    );

    const margin = CONFIG.ITEM_SIZE * 2;
    const targetX = margin + Math.random() * (canvas.width - margin * 2);
    const targetY = margin + Math.random() * (canvas.height - margin * 2);

    return {
        x, y,
        targetX, targetY,
        width: CONFIG.ITEM_SIZE,
        height: CONFIG.ITEM_SIZE,
        type,
        state: "entering",
        stateTimer: 0,
        mutationDelay,
        enterSpeed: 3 + Math.random() * 2,
        dangerousSpeed: Math.min(
            CONFIG.DANGEROUS_SPEED_MAX,
            CONFIG.DANGEROUS_SPEED + (wave - 1) * 0.25
        ),
        angle: 0,
        bobOffset: Math.random() * Math.PI * 2,
    };
}

function updateItems(deltaTime) {
    const currentSpawnInterval = Math.max(
        CONFIG.MIN_SPAWN_INTERVAL,
        CONFIG.INITIAL_SPAWN_INTERVAL - (wave - 1) * 100
    );

    spawnTimer += deltaTime;
    if (spawnTimer >= currentSpawnInterval) {
        spawnTimer = 0;
        items.push(createItem());
    }

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.stateTimer += deltaTime;

        switch (item.state) {
            case "entering": {
                const dx = item.targetX - item.x;
                const dy = item.targetY - item.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5) {
                    item.state = "safe";
                    item.stateTimer = 0;
                    item.x = item.targetX;
                    item.y = item.targetY;
                } else {
                    item.x += (dx / dist) * item.enterSpeed;
                    item.y += (dy / dist) * item.enterSpeed;
                }
                break;
            }

            case "safe": {
                item.y += Math.sin((Date.now() / 600) + item.bobOffset) * 0.3;
                if (item.stateTimer >= item.mutationDelay) {
                    item.state = "warning";
                    item.stateTimer = 0;
                }
                break;
            }

            case "warning": {
                item.y += Math.sin((Date.now() / 200) + item.bobOffset) * 0.8;
                if (item.stateTimer >= CONFIG.WARNING_DURATION) {
                    item.state = "dangerous";
                    item.stateTimer = 0;
                    spawnParticles(item.x, item.y, "#ff4444", 8);
                }
                break;
            }

            case "dangerous": {
                const dx = player.x - item.x;
                const dy = player.y - item.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 1) {
                    item.x += (dx / dist) * item.dangerousSpeed;
                    item.y += (dy / dist) * item.dangerousSpeed;
                }
                item.angle += 0.05;
                break;
            }
        }

        // Collect safe items on collision
        if (item.state === "safe" && checkCollision(player, item)) {
            score += CONFIG.POINTS_PER_COLLECT;
            spawnParticles(item.x, item.y, "#4cff72", CONFIG.PARTICLE_COUNT_COLLECT);
            AudioSystem.sfxCollect();
            items.splice(i, 1);
            continue;
        }

        // Take damage from dangerous items on collision
        if (item.state === "dangerous" && checkCollision(player, item)) {
            takeDamage();
            spawnParticles(item.x, item.y, "#ff4444", CONFIG.PARTICLE_COUNT_HIT);
            AudioSystem.sfxHit();
            items.splice(i, 1);
            continue;
        }

        // Remove off-screen dangerous items
        const oobMargin = 250;
        if (item.state === "dangerous" && (
            item.x < -oobMargin || item.x > canvas.width + oobMargin ||
            item.y < -oobMargin || item.y > canvas.height + oobMargin
        )) {
            items.splice(i, 1);
        }
    }
}

function drawItems() {
    for (const item of items) {
        ctx.save();
        ctx.translate(item.x, item.y);

        const size = CONFIG.ITEM_SIZE;
        const halfSize = size / 2;

        switch (item.state) {
            case "entering":
            case "safe": {
                ctx.shadowColor = "#4cff72";
                ctx.shadowBlur = 12;
                const img = ASSETS[item.type.safeImg];
                if (img && img.complete) {
                    ctx.drawImage(img, -halfSize, -halfSize, size, size);
                }
                break;
            }

            case "warning": {
                const flash = Math.sin(Date.now() / 80) > 0;
                ctx.shadowColor = flash ? "#ffcc00" : "#ff4444";
                ctx.shadowBlur = flash ? 22 : 8;
                const scale = 1 + Math.sin(Date.now() / 100) * 0.15;
                ctx.scale(scale, scale);
                const img = ASSETS[item.type.safeImg];
                if (img && img.complete) {
                    ctx.drawImage(img, -halfSize, -halfSize, size, size);
                }
                break;
            }

            case "dangerous": {
                ctx.shadowColor = "#ff4444";
                ctx.shadowBlur = 20;
                ctx.rotate(item.angle);
                const dangerSize = size + 6;
                const halfDanger = dangerSize / 2;
                const img = ASSETS[item.type.dangerImg];
                if (img && img.complete) {
                    ctx.drawImage(img, -halfDanger, -halfDanger, dangerSize, dangerSize);
                }
                break;
            }
        }

        ctx.restore();
    }
}

// ============ PARTICLES ============
function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.02,
            radius: 2 + Math.random() * 4,
            color,
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ============ COLLISION (AABB) ============
function checkCollision(a, b) {
    const ax = a.x - a.width / 2;
    const ay = a.y - a.height / 2;
    const bx = b.x - b.width / 2;
    const by = b.y - b.height / 2;
    return (
        ax < bx + b.width &&
        ax + a.width > bx &&
        ay < by + b.height &&
        ay + a.height > by
    );
}

// ============ DAMAGE & INVINCIBILITY ============
function takeDamage() {
    if (isInvincible || lives <= 0) return;

    lives--;
    isInvincible = true;
    invincibilityTimer = CONFIG.INVINCIBILITY_DURATION;
    screenShakeTimer = CONFIG.SCREEN_SHAKE_DURATION;
    renderHearts();

    if (lives <= 0) {
        AudioSystem.sfxGameOver();
        gameOver();
    }
}

// ============ "NOTHING IS SAFE" EVENT ============
function triggerNothingSafe() {
    nothingSafeActive = true;
    nothingSafeTimer = 2000;
    AudioSystem.sfxNothingSafe();

    for (const item of items) {
        if (item.state === "safe" || item.state === "entering") {
            item.state = "dangerous";
            item.stateTimer = 0;
            item.dangerousSpeed = Math.min(
                CONFIG.DANGEROUS_SPEED_MAX,
                CONFIG.DANGEROUS_SPEED + (wave - 1) * 0.25
            );
            spawnParticles(item.x, item.y, "#ff4444", 6);
        }
    }
}

// ============ WAVE SYSTEM ============
function checkWaveProgress(deltaTime) {
    waveTimer += deltaTime;

    if (waveTimer >= CONFIG.WAVE_DURATION) {
        waveTimer = 0;
        wave++;
        announceWave();

        if (Math.random() < CONFIG.NOTHING_SAFE_CHANCE * wave) {
            setTimeout(triggerNothingSafe, 1500);
        }
    }
}

function announceWave() {
    AudioSystem.sfxWave();
    waveAnnounceText.textContent = `WAVE ${wave}`;
    waveAnnounce.style.display = "block";
    waveAnnounceText.style.animation = "none";
    void waveAnnounceText.offsetHeight;
    waveAnnounceText.style.animation = "wavePopIn 0.5s ease-out";

    setTimeout(() => {
        waveAnnounce.style.display = "none";
    }, 2000);
}

// ============ PLAYER ============
function updatePlayer() {
    const speed = CONFIG.PLAYER_SPEED;

    if (keys["ArrowUp"] || keys["w"] || keys["W"] || keys["z"] || keys["Z"]) player.y -= speed;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) player.y += speed;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"] || keys["q"] || keys["Q"]) player.x -= speed;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) player.x += speed;

    const halfW = player.width / 2;
    const halfH = player.height / 2;
    if (player.x < halfW) player.x = halfW;
    if (player.x > canvas.width - halfW) player.x = canvas.width - halfW;
    if (player.y < halfH) player.y = halfH;
    if (player.y > canvas.height - halfH) player.y = canvas.height - halfH;
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (isInvincible) {
        ctx.globalAlpha = Math.sin(Date.now() / 60) > 0 ? 1 : 0.3;
    }

    const size = CONFIG.PLAYER_SIZE;
    ctx.shadowColor = isInvincible ? "#ff4444" : "#4cff72";
    ctx.shadowBlur = 15;

    const img = ASSETS["farmer"];
    if (img && img.complete) {
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
    }

    ctx.restore();
}

// ============ SCREEN SHAKE ============
function applyScreenShake() {
    if (screenShakeTimer > 0) {
        const ratio = screenShakeTimer / CONFIG.SCREEN_SHAKE_DURATION;
        const intensity = CONFIG.SCREEN_SHAKE_INTENSITY * ratio;
        ctx.translate(
            (Math.random() - 0.5) * intensity * 2,
            (Math.random() - 0.5) * intensity * 2
        );
    }
}

// ============ "NOTHING IS SAFE" FLASH ============
function drawNothingSafeFlash() {
    if (!nothingSafeActive) return;

    const alpha = (nothingSafeTimer / 2000) * 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "bold 42px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255, 68, 68, ${Math.min(alpha * 3, 1)})`;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 30;
    ctx.fillText("NOTHING IS SAFE!", canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

// ============ BACKGROUND ============
function drawFieldBackground() {
    const bg = ASSETS["fieldBg"];
    if (bg && bg.complete) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 100,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        gradient.addColorStop(0, "#1a2a15");
        gradient.addColorStop(1, "#0a0a0f");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawBackgroundStars();
}

// ============ TIME FORMATTING ============
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ============ HUD UPDATE ============
function updateHUD() {
    scoreDisplay.textContent = Math.floor(score);
    timeDisplay.textContent = formatTime(elapsedTime);
    waveDisplay.textContent = `WAVE ${wave}`;
}

// ============ MAIN LOOP ============
function update(deltaTime) {
    if (gameState !== "playing") return;

    elapsedTime += deltaTime;
    score += CONFIG.POINTS_PER_SECOND * (deltaTime / 1000);

    if (isInvincible) {
        invincibilityTimer -= deltaTime;
        if (invincibilityTimer <= 0) isInvincible = false;
    }

    if (screenShakeTimer > 0) screenShakeTimer -= deltaTime;

    if (nothingSafeActive) {
        nothingSafeTimer -= deltaTime;
        if (nothingSafeTimer <= 0) nothingSafeActive = false;
    }

    updatePlayer();
    updateItems(deltaTime);
    updateParticles();
    updateBackgroundStars();
    checkWaveProgress(deltaTime);
    updateHUD();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    applyScreenShake();
    drawFieldBackground();
    drawItems();
    drawPlayer();
    drawParticles();
    drawNothingSafeFlash();
    ctx.restore();
}

function gameLoop(timestamp) {
    const deltaTime = lastTimestamp ? Math.min(timestamp - lastTimestamp, 50) : 16;
    lastTimestamp = timestamp;
    update(deltaTime);
    render();
    requestAnimationFrame(gameLoop);
}

// ============ GAME STATE MANAGEMENT ============
function startGame() {
    gameState = "playing";
    score = 0;
    lives = CONFIG.INITIAL_LIVES;
    wave = 1;
    elapsedTime = 0;
    spawnTimer = 0;
    waveTimer = 0;
    isInvincible = false;
    invincibilityTimer = 0;
    screenShakeTimer = 0;
    nothingSafeActive = false;
    nothingSafeTimer = 0;
    items = [];
    particles = [];
    lastTimestamp = 0;

    resetPlayer();
    renderHearts();
    initBackgroundStars();

    gameoverScreen.style.display = "none";
    hud.style.display = "flex";
    waveAnnounce.style.display = "none";

    AudioSystem.startMusic();
    announceWave();
}

function gameOver() {
    gameState = "gameover";

    const finalScoreValue = Math.floor(score);
    const bestScore = parseInt(localStorage.getItem("dangerousHarvestBest") || "0", 10);
    const newBest = Math.max(finalScoreValue, bestScore);
    localStorage.setItem("dangerousHarvestBest", String(newBest));

    finalScoreEl.textContent = finalScoreValue;
    bestScoreEl.textContent = newBest;
    finalTimeEl.textContent = formatTime(elapsedTime);
    finalWaveEl.textContent = wave;

    nameInputSection.style.display = "block";
    saveScoreBtn.disabled = false;
    gameoverLeaderboard.style.display = "none";

    const lastPlayerName = localStorage.getItem("dangerousHarvestPlayerName") || "";
    playerNameInput.value = lastPlayerName;

    AudioSystem.stopMusic();

    hud.style.display = "none";
    waveAnnounce.style.display = "none";
    gameoverScreen.style.display = "flex";

    setTimeout(() => playerNameInput.focus(), 100);
}

// ============ LEADERBOARD ============
const LEADERBOARD_KEY = "dangerousHarvestLeaderboard";
const MAX_LEADERBOARD_ENTRIES = 10;

function getLeaderboard() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
}

function saveToLeaderboard(name, scoreValue, timeValue, waveValue) {
    const entries = getLeaderboard();
    const entry = {
        name: name.trim().substring(0, 12) || "Player",
        score: scoreValue,
        time: timeValue,
        wave: waveValue,
        date: Date.now(),
    };

    entries.push(entry);
    entries.sort((a, b) => b.score - a.score || b.time - a.time);

    if (entries.length > MAX_LEADERBOARD_ENTRIES) {
        entries.length = MAX_LEADERBOARD_ENTRIES;
    }

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));

    const insertedIndex = entries.findIndex((e) => e.date === entry.date);
    return insertedIndex;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function renderGameoverLeaderboard(highlightIndex) {
    const entries = getLeaderboard();

    if (entries.length === 0) {
        gameoverLeaderboard.innerHTML = "";
        gameoverLeaderboard.style.display = "none";
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

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
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

    gameoverLeaderboard.innerHTML = html;
    gameoverLeaderboard.style.display = "block";
}

// ============ EVENT LISTENERS ============
saveScoreBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim() || "Player";
    localStorage.setItem("dangerousHarvestPlayerName", name);

    const insertedIndex = saveToLeaderboard(
        name,
        Math.floor(score),
        elapsedTime,
        wave
    );

    nameInputSection.style.display = "none";
    renderGameoverLeaderboard(insertedIndex);
    saveScoreBtn.disabled = true;
});

playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !saveScoreBtn.disabled) {
        saveScoreBtn.click();
    }
    e.stopPropagation();
});

playerNameInput.addEventListener("keyup", (e) => {
    e.stopPropagation();
});

muteBtn.addEventListener("click", () => {
    const muted = AudioSystem.toggleMute();
    muteBtn.textContent = muted ? "\u{1F507}" : "\u{1F50A}";
});

restartBtn.addEventListener("click", () => {
    startGame();
});

menuBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
});

// ============ INITIALIZATION ============
loadAssets().then(() => {
    startGame();
    requestAnimationFrame(gameLoop);
});
