const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const portrait = document.getElementById('portrait');
const portraitCtx = portrait.getContext('2d');

const hudName = document.getElementById('hudName');
const hudCalling = document.getElementById('hudCalling');
const hudScore = document.getElementById('hudScore');
const storyLog = document.getElementById('storyLog');
const startOverlay = document.getElementById('startOverlay');

const creatorForm = document.getElementById('creatorForm');
const heroNameInput = document.getElementById('heroName');
const heroCallingInput = document.getElementById('heroCalling');
const heroColorInput = document.getElementById('heroColor');
const heroSigilInput = document.getElementById('heroSigil');

const keys = new Set();
const world = { width: canvas.width, height: canvas.height, gravity: 0.5 };

const platforms = [
    { x: 0, y: 480, w: 960, h: 40 },
    { x: 160, y: 380, w: 180, h: 12 },
    { x: 420, y: 320, w: 200, h: 12 },
    { x: 690, y: 260, w: 180, h: 12 },
    { x: 820, y: 210, w: 120, h: 12 },
    { x: 40, y: 270, w: 140, h: 12 },
];

const enemy = {
    x: 860,
    y: 170,
    w: 30,
    h: 30,
    dir: -1,
    speed: 1.8,
    hp: 3,
    alive: true,
};

const player = {
    x: 80,
    y: 420,
    w: 32,
    h: 44,
    vx: 0,
    vy: 0,
    color: '#46d3ff',
    facing: 1,
    grounded: false,
    dashing: false,
    dashTime: 0,
    slashTime: 0,
    score: 0,
    name: '—',
    calling: '—',
};

let running = false;
let lastTime = 0;

function logStory(text) {
    const item = document.createElement('li');
    item.textContent = text;
    storyLog.prepend(item);
}

function updatePortrait() {
    const color = heroColorInput.value;
    portraitCtx.clearRect(0, 0, portrait.width, portrait.height);
    portraitCtx.fillStyle = '#070c1a';
    portraitCtx.fillRect(0, 0, portrait.width, portrait.height);

    portraitCtx.save();
    portraitCtx.translate(120, 140);

    portraitCtx.fillStyle = `rgba(255, 255, 255, 0.06)`;
    portraitCtx.beginPath();
    portraitCtx.arc(-40, -60, 70, 0, Math.PI * 2);
    portraitCtx.fill();

    portraitCtx.fillStyle = color;
    portraitCtx.strokeStyle = 'rgba(255,255,255,0.5)';
    portraitCtx.lineWidth = 6;
    portraitCtx.beginPath();
    portraitCtx.arc(0, 0, 40, 0, Math.PI * 2);
    portraitCtx.fill();
    portraitCtx.stroke();

    portraitCtx.fillStyle = '#0b1226';
    portraitCtx.beginPath();
    portraitCtx.arc(0, 0, 22, 0, Math.PI * 2);
    portraitCtx.fill();

    portraitCtx.fillStyle = color;
    portraitCtx.fillRect(-8, 12, 16, 36);

    portraitCtx.strokeStyle = color;
    portraitCtx.lineWidth = 4;
    portraitCtx.beginPath();
    portraitCtx.moveTo(0, 0);
    portraitCtx.lineTo(24 * player.facing, -26);
    portraitCtx.stroke();

    portraitCtx.restore();

    portraitCtx.save();
    portraitCtx.translate(120, 120);
    portraitCtx.globalAlpha = 0.6;
    portraitCtx.strokeStyle = color;
    portraitCtx.lineWidth = 5;
    if (heroSigilInput.value === 'orb') {
        portraitCtx.beginPath();
        portraitCtx.arc(0, 0, 90, 0, Math.PI * 2);
        portraitCtx.stroke();
    } else if (heroSigilInput.value === 'crescent') {
        portraitCtx.beginPath();
        portraitCtx.arc(0, 0, 90, Math.PI / 2, Math.PI * 1.5);
        portraitCtx.stroke();
    } else {
        portraitCtx.beginPath();
        portraitCtx.moveTo(0, -90);
        portraitCtx.lineTo(70, 0);
        portraitCtx.lineTo(0, 90);
        portraitCtx.lineTo(-70, 0);
        portraitCtx.closePath();
        portraitCtx.stroke();
    }
    portraitCtx.restore();
}

function resetGame(options = {}) {
    const { clearLog = false, skipIntro = false } = options;

    player.x = 80;
    player.y = 420;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.dashing = false;
    player.dashTime = 0;
    player.slashTime = 0;
    enemy.x = 860;
    enemy.y = 170;
    enemy.hp = 3;
    enemy.alive = true;
    player.score = 0;
    hudScore.textContent = '0';

    if (clearLog) {
        storyLog.innerHTML = '';
    }

    if (!skipIntro && player.name !== '—') {
        logStory(`${player.name} desperta com o chamado do Sino Rachado.`);
    }

    running = false;
    startOverlay.style.display = 'flex';
}

creatorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    player.name = heroNameInput.value || 'Viajante';
    player.calling = heroCallingInput.value;
    player.color = heroColorInput.value;
    updatePortrait();
    hudName.textContent = player.name;
    hudCalling.textContent = player.calling;
    resetGame({ clearLog: true });
    logStory(`${player.name}, ${player.calling}, carrega um brilho ${player.color}.`);
});

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, world.height);
    gradient.addColorStop(0, '#0a152d');
    gradient.addColorStop(1, '#050915');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 30; i++) {
        const x = (i * 120 + Date.now() * 0.01) % (world.width + 120) - 60;
        const y = 80 + Math.sin(i) * 10;
        ctx.fillRect(x, y, 80, 6);
    }
}

function drawParallax() {
    ctx.fillStyle = 'rgba(70, 211, 255, 0.08)';
    ctx.fillRect(0, 220, world.width, 6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(0, 340, world.width, 5);
}

function drawPlatforms() {
    platforms.forEach((p) => {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = 'rgba(70,211,255,0.3)';
        ctx.fillRect(p.x, p.y, p.w, 3);
    });
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.facing, 1);
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect(-player.w / 2, -player.h, player.w, player.h, 8);
    ctx.fill();

    ctx.fillStyle = '#0b1226';
    ctx.fillRect(-6, -player.h + 10, 12, 12);

    if (player.slashTime > 0) {
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(12, -player.h + 16, 26, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawEnemy() {
    if (!enemy.alive) return;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.fillStyle = 'rgba(249, 168, 212, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, enemy.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawHUD() {
    if (!enemy.alive) {
        ctx.fillStyle = 'rgba(70, 211, 255, 0.14)';
        ctx.fillRect(0, 0, world.width, world.height);
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Inter';
        ctx.fillText('Eco conquistado. Memória restaurada.', world.width / 2, 120);
    }
}

function applyPhysics(delta) {
    player.vy += world.gravity * delta;
    if (player.dashTime > 0) {
        player.vx = player.facing * 10;
        player.dashTime -= delta;
        if (player.dashTime <= 0) player.dashing = false;
    } else {
        const move = (keys.has('ArrowRight') || keys.has('KeyD')) - (keys.has('ArrowLeft') || keys.has('KeyA'));
        player.vx = move * 4;
    }

    player.x += player.vx * delta;
    player.y += player.vy * delta;

    player.grounded = false;
    platforms.forEach((p) => {
        const withinX = player.x + player.w / 2 > p.x && player.x - player.w / 2 < p.x + p.w;
        const hittingY = player.y >= p.y && player.y <= p.y + p.h + 8;
        if (withinX && hittingY && player.vy >= 0) {
            player.y = p.y;
            player.vy = 0;
            player.grounded = true;
        }
    });

    player.x = Math.max(player.w / 2, Math.min(world.width - player.w / 2, player.x));
    if (player.y > world.height + 80) {
        logStory('Queda longa. O eco puxa você de volta.');
        resetGame();
    }
}

function moveEnemy(delta) {
    if (!enemy.alive) return;
    enemy.x += enemy.dir * enemy.speed * delta * 60;
    if (enemy.x < 760 || enemy.x > 900) enemy.dir *= -1;
}

function detectAttacks() {
    if (!enemy.alive || player.slashTime <= 0) return;
    const rangeX = Math.abs(player.x - enemy.x) < 40;
    const rangeY = Math.abs(player.y - enemy.y) < 40;
    if (rangeX && rangeY) {
        enemy.hp -= 1;
        enemy.dir *= -1;
        logStory('Golpe ecoante acerta o inimigo.');
        player.slashTime = 0;
        if (enemy.hp <= 0) {
            enemy.alive = false;
            player.score += 1;
            hudScore.textContent = player.score.toString();
            logStory('Memória recuperada: um fragmento do Sino canta na sua mochila.');
        }
    }
}

function detectPlayerHit() {
    if (!enemy.alive) return;
    const close = Math.abs(player.x - enemy.x) < 30 && Math.abs(player.y - enemy.y) < 40;
    if (close) {
        logStory('Você toca no Eco Sombrio e perde o fôlego.');
        resetGame();
    }
}

function update(delta) {
    applyPhysics(delta);
    moveEnemy(delta);
    detectAttacks();
    detectPlayerHit();
    if (player.slashTime > 0) player.slashTime -= delta;
}

function render() {
    drawBackground();
    drawParallax();
    drawPlatforms();
    drawEnemy();
    drawPlayer();
    drawHUD();
}

function loop(timestamp) {
    const delta = Math.min((timestamp - lastTime) / 16.666, 3);
    lastTime = timestamp;
    if (running) {
        update(delta);
        render();
    }
    requestAnimationFrame(loop);
}

function startGame() {
    running = true;
    startOverlay.style.display = 'none';
    if (!player.name || player.name === '—') {
        player.name = 'Viajante';
        hudName.textContent = player.name;
    }
    logStory('O terreno responde ao seu passo. Sinta a fluidez.');
}

window.addEventListener('keydown', (event) => {
    keys.add(event.code);
    if (!running && player.name !== '—') startGame();
    if ((event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') && player.grounded) {
        player.vy = -10;
        player.grounded = false;
    }
    if (event.code === 'ShiftLeft' && !player.dashing) {
        player.dashing = true;
        player.dashTime = 8;
    }
    if (event.code === 'KeyJ' && player.slashTime <= 0) {
        player.slashTime = 6;
    }
});

window.addEventListener('keyup', (event) => keys.delete(event.code));

updatePortrait();
resetGame({ clearLog: true, skipIntro: true });
requestAnimationFrame(loop);
