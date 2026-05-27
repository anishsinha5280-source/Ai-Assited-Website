const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.id = 'starfield';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none';

let width, height;
let stars = [];
let bgElements = [];
const numStars = 220;
let mouse = { x: -1000, y: -1000 };
let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 1.5 + 0.5; // 0.5 to 2px
        const opacity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
        const layer = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
        let speed = 0;
        if (layer === 1) speed = 0.05;
        if (layer === 2) speed = 0.12;
        if (layer === 3) speed = 0.2;
        
        stars.push({ 
            x, y, 
            baseX: x, baseY: y, 
            radius, opacity, speed,
            vx: 0, vy: 0 
        });
    }
    
    // Init Background Elements
    bgElements = [];
    const docHeight = window.innerHeight * 4; // Estimate
    
    // Black hole
    bgElements.push({
        type: 'blackhole',
        baseX: width * 0.8,
        baseY: window.innerHeight * 1.5,
        size: 150,
        speed: 0.15
    });
    
    // Distant planet
    bgElements.push({
        type: 'planet',
        baseX: width * 0.15,
        baseY: window.innerHeight * 0.8,
        size: 80,
        speed: 0.08,
        color: 'rgba(70, 40, 120, 0.4)'
    });

    // Asteroids
    for (let i = 0; i < 12; i++) {
        let vertices = [];
        for(let j=0; j<7; j++) vertices.push(0.7 + 0.5 * Math.random());
        bgElements.push({
            type: 'asteroid',
            baseX: Math.random() * width,
            baseY: Math.random() * docHeight,
            size: Math.random() * 40 + 15,
            speed: Math.random() * 0.3 + 0.1,
            rotation: Math.random() * Math.PI * 2,
            vertices: vertices
        });
    }
}

function updateAndDraw() {
    ctx.clearRect(0, 0, width, height);
    
    // Fallback for mobile or reduced motion
    if (window.innerWidth <= 768 || isReducedMotion) {
        stars.slice(0, 80).forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
        });
        return;
    }

    const scrollY = window.scrollY;

    // Draw background elements
    bgElements.forEach(el => {
        let y = el.baseY - scrollY * el.speed;
        
        ctx.save();
        ctx.translate(el.baseX, y);
        
        if (el.type === 'blackhole') {
            const gradient = ctx.createRadialGradient(0, 0, el.size*0.3, 0, 0, el.size);
            gradient.addColorStop(0, 'rgba(0,0,0,1)');
            gradient.addColorStop(0.2, 'rgba(0,0,0,0.8)');
            gradient.addColorStop(0.5, 'rgba(100,0,200,0.2)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, el.size, 0, Math.PI*2);
            ctx.fill();
            
            // Accretion disk
            ctx.strokeStyle = 'rgba(150, 50, 255, 0.15)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(0, 0, el.size*1.2, el.size*0.3, 15*Math.PI/180, 0, Math.PI*2);
            ctx.stroke();
        } else if (el.type === 'planet') {
            ctx.fillStyle = el.color;
            ctx.beginPath();
            ctx.arc(0, 0, el.size, 0, Math.PI*2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.ellipse(0, 0, el.size*1.6, el.size*0.4, -20*Math.PI/180, 0, Math.PI*2);
            ctx.stroke();
        } else if (el.type === 'asteroid') {
            ctx.rotate(el.rotation + scrollY * 0.002 * el.speed);
            ctx.fillStyle = 'rgba(100, 100, 120, 0.15)';
            ctx.beginPath();
            for(let j=0; j<7; j++) {
                const angle = (j/7) * Math.PI * 2;
                const r = el.size * el.vertices[j];
                if(j===0) ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r);
                else ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    });

    stars.forEach(star => {
        let targetY = (star.baseY - scrollY * star.speed) % height;
        if (targetY < 0) targetY += height;
        let targetX = star.baseX;

        // Interactive mouse repulsion
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const interactionDist = 150;
        if (dist < interactionDist && dist > 0.1) {
            const force = (interactionDist - dist) / interactionDist;
            star.vx -= (dx / dist) * force * 1.5;
            star.vy -= (dy / dist) * force * 1.5;
        }

        // Spring back to target
        star.vx += (targetX - star.x) * 0.05;
        star.vy += (targetY - star.y) * 0.05;

        // Friction / Damping
        star.vx *= 0.85;
        star.vy *= 0.85;

        star.x += star.vx;
        star.y += star.vy;

        // Teleport if wrapped around to prevent a huge visual spring line
        if (Math.abs(targetY - star.y) > height / 2) {
            star.y = targetY;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
    });

    requestAnimationFrame(updateAndDraw);
}

window.addEventListener('resize', resize);

// Initial setup
resize();
updateAndDraw();
