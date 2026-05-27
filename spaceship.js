// js/spaceship.js
const shipHTML = `
<div id="spaceship">
    <svg width="60" height="90" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="80" r="15" fill="#4FC3F7" class="engine-glow" opacity="0.8" />
        <polygon points="30,20 0,70 30,60 60,70" fill="#E0E0E8" />
        <polygon points="30,0 15,70 45,70" fill="#FFFFFF" />
        <polygon points="30,25 25,45 35,45" fill="#4FC3F7" opacity="0.8" />
        <rect x="22" y="70" width="6" height="8" fill="#555" />
        <rect x="32" y="70" width="6" height="8" fill="#555" />
    </svg>
</div>
`;
document.body.insertAdjacentHTML('beforeend', shipHTML);

const ship = document.getElementById('spaceship');
let lastScrollY = window.scrollY;
let isScrolling = false;
let dockingOverride = false;
let dockedScrollY = 0;

let shipTicking = false;

window.addEventListener('scroll', () => {
    if (!shipTicking) {
        window.requestAnimationFrame(() => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                ship.style.display = 'none';
                shipTicking = false;
                return;
            }
            if (dockingOverride) {
                if (Math.abs(window.scrollY - dockedScrollY) > 200) {
                    window.resumePatrol();
                    const infoPanel = document.getElementById('planet-info-panel');
                    if (infoPanel) infoPanel.classList.add('hidden');
                }
                shipTicking = false;
                return;
            }
            
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const currentScrollY = window.scrollY;
            
            if (docHeight > 0) {
                // Inverse scroll position (ship goes up as user scrolls down)
                const progress = currentScrollY / docHeight;
                const shipY = (window.innerHeight - 150) * (1 - progress); 
                
                // Tilt logic
                const scrollDiff = currentScrollY - lastScrollY;
                let tilt = 0;
                if (scrollDiff > 0) tilt = -15; // scroll down, tilt forward
                if (scrollDiff < 0) tilt = 10;  // scroll up, tilt back
                
                ship.style.transform = `translateY(${shipY}px) rotate(${tilt}deg)`;
                
                lastScrollY = currentScrollY;
                
                clearTimeout(isScrolling);
                isScrolling = setTimeout(() => {
                    if (!dockingOverride) {
                        ship.style.transform = `translateY(${shipY}px) rotate(0deg)`;
                    }
                }, 150);
            }
            shipTicking = false;
        });
        shipTicking = true;
    }
});

let dockedPlanet = null;
let dockingRaf = null;

// Expose docking methods
window.dockSpaceshipTo = function(planetElement) {
    dockingOverride = true;
    dockedScrollY = window.scrollY;
    dockedPlanet = planetElement;
    
    ship.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // 1. Calculate the initial target position
    const rect = dockedPlanet.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    const startX = window.innerWidth - (window.innerWidth * 0.05) - 30;
    const startY = 150;
    
    const moveX = targetX - startX;
    const moveY = targetY - startY - 45;
    
    const angle = Math.atan2(moveY, moveX) * (180 / Math.PI) + 90;
    
    // 2. Set the transform ONCE so the 1.5s CSS transition actually plays
    ship.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${angle}deg) scale(0.3)`;
    
    // 3. Wait for the transition to finish, then lock tightly onto the moving planet
    setTimeout(() => {
        if (!dockingOverride || dockedPlanet !== planetElement) return;
        
        ship.style.transition = 'none';
        
        function updateHoming() {
            if (!dockingOverride || dockedPlanet !== planetElement) return;
            
            const r = dockedPlanet.getBoundingClientRect();
            const tX = r.left + r.width / 2;
            const tY = r.top + r.height / 2;
            
            const mX = tX - startX;
            const mY = tY - startY - 45;
            
            ship.style.transform = `translate(${mX}px, ${mY}px) rotate(${angle}deg) scale(0.3)`;
            
            dockingRaf = requestAnimationFrame(updateHoming);
        }
        updateHoming();
    }, 1500);
};

window.resumePatrol = function() {
    dockingOverride = false;
    dockedPlanet = null;
    if (dockingRaf) cancelAnimationFrame(dockingRaf);
    
    ship.style.transition = 'transform 1s ease-in-out';
    
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = window.scrollY / (docHeight || 1);
    const shipY = (window.innerHeight - 150) * (1 - progress); 
    
    // Scale back up when resuming patrol
    ship.style.transform = `translateY(${shipY}px) rotate(0deg) scale(1)`;
    
    setTimeout(() => {
        if (!dockingOverride) ship.style.transition = 'transform 0.15s ease-out';
    }, 1000);
};
