// js/asteroid-game.js
(() => {
const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const startBtn = document.getElementById('start-game-btn');
const scoreEl = document.getElementById('score');
const acquiredSkillsEl = document.getElementById('acquired-skills');

let width, height;
let gameState = 'START'; // START, PLAYING, GAME_OVER, VICTORY
let score = 0;
let shipX;
let bullets = [];
let alienBullets = [];
let aliens = [];
let particles = [];
let alienDirection = 1;
let alienSpeed = 0.5;

let bgStars = Array.from({length: 80}, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.5,
    speed: Math.random() * 0.5 + 0.1
}));

let animationId;
let lastShootTime = 0;
let isGameInView = false;
const keys = new Set();
const skillsPool = ['JavaScript', 'CSS', 'React', 'Node.js', 'Design', 'Python', 'Web3', 'UI/UX'];

// Retro SVGs
const playerSvg = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- Nose -->
    <rect x="7" y="0" width="2" height="2" fill="#A0A0A0"/>
    <rect x="7" y="2" width="2" height="3" fill="#E0E0E0"/>
    <!-- Cockpit -->
    <rect x="6" y="5" width="4" height="3" fill="#4FC3F7"/>
    <rect x="7" y="5" width="2" height="2" fill="#FFFFFF"/>
    <!-- Wings -->
    <rect x="5" y="7" width="2" height="2" fill="#A0A0A0"/>
    <rect x="9" y="7" width="2" height="2" fill="#A0A0A0"/>
    <rect x="3" y="9" width="4" height="2" fill="#808080"/>
    <rect x="9" y="9" width="4" height="2" fill="#808080"/>
    <rect x="1" y="11" width="14" height="2" fill="#606060"/>
    <!-- Body -->
    <rect x="5" y="8" width="6" height="5" fill="#E0E0E0"/>
    <!-- Thrusters -->
    <rect x="4" y="13" width="2" height="1" fill="#FFFFFF"/>
    <rect x="10" y="13" width="2" height="1" fill="#FFFFFF"/>
    <!-- Flames -->
    <rect x="4" y="14" width="2" height="2" fill="#FF5722"/>
    <rect x="10" y="14" width="2" height="2" fill="#FF5722"/>
    <rect x="4" y="16" width="2" height="1" fill="#FFEB3B"/>
    <rect x="10" y="16" width="2" height="1" fill="#FFEB3B"/>
</svg>`;

const alienSvg = `<svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <!-- Dome -->
    <rect x="6" y="0" width="4" height="2" fill="#4FC3F7"/>
    <rect x="4" y="2" width="8" height="2" fill="#4FC3F7"/>
    <rect x="5" y="1" width="2" height="1" fill="#FFFFFF"/>
    <!-- Saucer Body -->
    <rect x="2" y="4" width="12" height="2" fill="#A0A0A0"/>
    <rect x="0" y="6" width="16" height="2" fill="#808080"/>
    <!-- Glow -->
    <rect x="1" y="8" width="14" height="2" fill="#E040FB"/>
    <rect x="3" y="10" width="10" height="2" fill="#E040FB"/>
</svg>`;

const playerImg = new Image();
playerImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(playerSvg);

const alienImg = new Image();
alienImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(alienSvg);

function resize() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 500;
    width = canvas.width;
    height = canvas.height;
    if(gameState === 'START') shipX = width / 2;
}

if (canvas) {
    window.addEventListener('resize', resize);
    resize();
}

window.addEventListener('keydown', e => {
    if (!isGameInView) return; // Ignore input if game is not visible
    keys.add(e.key);
    if (e.key === ' ') {
        if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
            e.preventDefault();
            startGame();
        } else if (gameState === 'PLAYING') {
            e.preventDefault();
        }
    }
    // Prevent arrow keys from scrolling the page while playing
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => keys.delete(e.key));

if (canvas) {
    canvas.addEventListener('mousedown', () => {
        if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
            startGame();
        } else {
            keys.add(' ');
        }
    });
    canvas.addEventListener('mouseup', () => keys.delete(' '));
    canvas.addEventListener('mouseleave', () => keys.delete(' '));
}

function initAliens() {
    aliens = [];
    alienDirection = 1;
    alienSpeed = width > 600 ? 0.6 : 0.3; // Reduced difficulty
    const rows = 4;
    const cols = 8;
    const paddingX = 50;
    const paddingY = 40;
    const offsetX = (width - (cols * paddingX)) / 2;
    
    let skillIndex = 0;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let skill = null;
            if (Math.random() > 0.6) {
                skill = skillsPool[skillIndex % skillsPool.length];
                skillIndex++;
            }
            
            aliens.push({
                x: offsetX + c * paddingX,
                y: 50 + r * paddingY,
                width: 32,
                height: 24,
                skill: skill,
                dead: false
            });
        }
    }
}

function startGame() {
    score = 0;
    if(scoreEl) scoreEl.textContent = 'SCORE: 0';
    if(acquiredSkillsEl) acquiredSkillsEl.textContent = 'ACQUIRED: ';
    bullets = [];
    alienBullets = [];
    particles = [];
    initAliens();
    shipX = width / 2;
    gameState = 'PLAYING';
    if(startBtn) startBtn.textContent = 'PAUSE GAME';
    if(canvas) canvas.style.border = '1px solid var(--accent)';
    startBtn.blur();
}

function createParticles(x, y, color) {
    for (let i=0; i<15; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color || '#FFEB3B'
        });
    }
}

function update() {
    if (gameState === 'PLAYING') {
        // Move ship
        if (keys.has('ArrowLeft') || keys.has('a')) shipX -= 5;
        if (keys.has('ArrowRight') || keys.has('d')) shipX += 5;
        shipX = Math.max(20, Math.min(width - 20, shipX));

        // Auto-Shoot for Player
        if (keys.has(' ') && Date.now() - lastShootTime > 300) {
            bullets.push({ x: shipX, y: height - 50, color: '#4FC3F7' });
            lastShootTime = Date.now();
        }
        
        // Move Aliens
        let hitEdge = false;
        aliens.forEach(a => {
            if (a.dead) return;
            a.x += alienSpeed * alienDirection;
            if (a.x < 20 || a.x > width - 40) {
                hitEdge = true;
            }
        });
        
        if (hitEdge) {
            alienDirection *= -1;
            aliens.forEach(a => {
                if(!a.dead) a.y += 15; // Reduced drop distance
                if(a.y > height - 80) {
                    gameState = 'GAME_OVER';
                    for(let i=0; i<30; i++) createParticles(shipX, height - 40, '#FF5722');
                }
            });
            alienSpeed += 0.05; // Less speed up
        }
        
        // Alien Shooting
        if (Math.random() < 0.005) { // Reduced firing rate
            const livingAliens = aliens.filter(a => !a.dead);
            if (livingAliens.length > 0) {
                const shooter = livingAliens[Math.floor(Math.random() * livingAliens.length)];
                alienBullets.push({ x: shooter.x + 16, y: shooter.y + 24, color: '#E040FB' });
            }
        }

        // Move bullets
        bullets.forEach(b => b.y -= 7);
        bullets = bullets.filter(b => b.y > 0);
        
        alienBullets.forEach(b => b.y += 5);
        alienBullets = alienBullets.filter(b => b.y < height);

        // Collisions: Player bullets -> Aliens
        bullets.forEach(b => {
            aliens.forEach(a => {
                if (b.dead || a.dead) return;
                if (b.x > a.x && b.x < a.x + a.width && b.y > a.y && b.y < a.y + a.height) {
                    createParticles(a.x + 16, a.y + 12, '#E040FB');
                    score += 100;
                    if(scoreEl) scoreEl.textContent = `SCORE: ${score}`;
                    if (a.skill && acquiredSkillsEl && !acquiredSkillsEl.textContent.includes(a.skill)) {
                        acquiredSkillsEl.textContent += ` ${a.skill},`;
                    }
                    b.dead = true;
                    a.dead = true;
                }
            });
        });

        // Collisions: Alien bullets -> Player
        alienBullets.forEach(b => {
            if (b.dead) return;
            if (b.x > shipX - 16 && b.x < shipX + 16 && b.y > height - 50 && b.y < height - 10) {
                gameState = 'GAME_OVER';
                for(let i=0; i<50; i++) createParticles(shipX, height - 40, '#FF5722');
                b.dead = true;
            }
        });

        bullets = bullets.filter(b => !b.dead);
        aliens = aliens.filter(a => !a.dead);
        
        // Win Condition
        if (aliens.length === 0) {
            gameState = 'VICTORY';
        }
    }

    // Move particles
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; });
    particles = particles.filter(p => p.life > 0);

    draw();
    animationId = requestAnimationFrame(update);
}

function drawGameBackground(ctx, width, height) {
    let grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#080B1A");
    grad.addColorStop(1, "#121A2F");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    bgStars.forEach(s => {
        s.y += s.speed;
        if (s.y > height) {
            s.y = 0;
            s.x = Math.random();
        }
        ctx.fillRect(s.x * width, s.y, s.size * 2, s.size * 2); // Square stars for retro feel
    });
}

function draw() {
    if (!ctx) return;
    drawGameBackground(ctx, width, height);
    
    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    if (gameState === 'START') {
        ctx.fillStyle = '#4FC3F7';
        ctx.font = 'bold 36px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ASTEROID DEFENSE', width/2, height/2 - 40);
        
        ctx.fillStyle = '#E040FB';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.fillText('Defend the portfolio from invaders!', width/2, height/2 + 10);
        
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.fillText('PRESS SPACE TO START', width/2, height/2 + 70);
        }
    } 
    else if (gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        // Draw Player Ship
        if (gameState !== 'GAME_OVER') {
            if (playerImg.complete) {
                ctx.drawImage(playerImg, shipX - 16, height - 55, 32, 32);
            }
        }

        // Draw Aliens
        aliens.forEach(a => {
            if (alienImg.complete) {
                ctx.drawImage(alienImg, a.x, a.y, a.width, a.height);
            }
            if (a.skill) {
                ctx.fillStyle = '#FFF';
                ctx.font = '10px "JetBrains Mono"';
                ctx.textAlign = 'center';
                ctx.fillText(a.skill, a.x + 16, a.y - 5);
            }
        });

        // Draw Player Bullets
        ctx.fillStyle = '#4FC3F7';
        bullets.forEach(b => {
            ctx.fillRect(b.x - 2, b.y, 4, 10);
        });
        
        // Draw Alien Bullets
        ctx.fillStyle = '#E040FB';
        alienBullets.forEach(b => {
            ctx.fillRect(b.x - 2, b.y, 4, 10);
        });

        if (gameState === 'GAME_OVER') {
            ctx.fillStyle = '#FF5722';
            ctx.font = 'bold 48px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', width/2, height/2);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '16px "JetBrains Mono", monospace';
            ctx.fillText('PRESS SPACE TO RESTART', width/2, height/2 + 40);
            if(startBtn) startBtn.textContent = 'RESTART MISSION';
        }
        
        if (gameState === 'VICTORY') {
            ctx.fillStyle = '#4FC3F7';
            ctx.font = 'bold 48px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SECTOR CLEARED', width/2, height/2);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '16px "JetBrains Mono", monospace';
            ctx.fillText('PRESS SPACE TO REPLAY', width/2, height/2 + 40);
            if(startBtn) startBtn.textContent = 'NEW MISSION';
        }
    }
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (gameState === 'START' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
            startGame();
        } else if (gameState === 'PLAYING') {
            // Pseudo-pause by clearing the animation id, but let's keep it simple
            // and actually toggle a pause state if needed.
            // For now, let's just make button reset if clicked during play.
            startGame(); 
        }
    });
}

const gameObserver = new IntersectionObserver((entries) => {
    isGameInView = entries[0].isIntersecting;
}, { threshold: 0.1 });

if (canvas) gameObserver.observe(canvas);

// Start the animation loop right away for the Start Screen
animationId = requestAnimationFrame(update);

})();
