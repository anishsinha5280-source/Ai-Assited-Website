// Scroll Progress Bar
const progressBar = document.getElementById('progress-bar');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollY = window.scrollY;
            const progress = (scrollY / docHeight) * 100;
            progressBar.style.width = `${progress}%`;
            ticking = false;
        });
        ticking = true;
    }
});

// CTA Button Scroll
const ctaBtn = document.querySelector('.cta-btn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        const missionSection = document.getElementById('mission');
        if (missionSection) {
            missionSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Typewriter Effect
const missionText = "Incoming transmission...\nDecryption successful.\n\nCommander, we have located the source of the anomaly. The energy readings are off the charts. Proceed with caution. The fate of the galaxy depends on this mission.";
const typewriterElement = document.getElementById('typewriter');
let i = 0;
let isTyping = false;

function typeWriter() {
    if (i < missionText.length) {
        if (missionText.charAt(i) === '\n') {
            typewriterElement.innerHTML += '<br>';
        } else {
            typewriterElement.innerHTML += missionText.charAt(i);
        }
        i++;
        setTimeout(typeWriter, 40);
    } else {
        setTimeout(() => {
            const nextSection = document.getElementById('planets');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1500);
    }
}

const missionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isTyping) {
            isTyping = true;
            typeWriter();
        }
    });
}, { threshold: 0.5 });

const missionEl = document.getElementById('mission');
if(missionEl) {
    missionObserver.observe(missionEl);
}

// Fake Coordinates update
const coordsEl = document.getElementById('coords');
const sections = document.querySelectorAll('section');
let coordTicking = false;

window.addEventListener('scroll', () => {
    if (!coordTicking) {
        window.requestAnimationFrame(() => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - window.innerHeight / 3) {
                    current = section.getAttribute('id');
                }
            });

            const coordsMap = {
                'hero': 'LAT: 00.0000<br>LNG: 00.0000',
                'mission': 'LAT: 34.2981<br>LNG: 12.9810',
                'planets': 'LAT: 88.1923<br>LNG: 99.4128',
                'timeline': 'LAT: 62.1931<br>LNG: 40.0911',
                'skills': 'LAT: 41.2291<br>LNG: 18.0123'
            };

            if (coordsMap[current] && coordsEl) {
                coordsEl.innerHTML = coordsMap[current];
            }
            coordTicking = false;
        });
        coordTicking = true;
    }
});

// Interactive Solar System
const systemPlanets = document.querySelectorAll('.system-planet');
const infoPanel = document.getElementById('planet-info-panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');
const closePanelBtn = document.getElementById('close-panel');

const planetData = {
    'Mercury': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg',
        subtitle: 'The Swift Planet',
        description: 'Mercury is the smallest planet in our solar system and the closest to the Sun. It is only slightly larger than Earth\'s Moon. From the surface of Mercury, the Sun would appear more than three times as large as it does when viewed from Earth, and the sunlight would be as much as seven times brighter. Despite its proximity to the Sun, Mercury is not the hottest planet in our solar system.',
        stats: { 'Radius': '2,439 km', 'Temperature': '430°C', 'Moons': '0', 'Orbital Period': '88 Days', 'Gravity': '3.7 m/s²' },
        funFact: 'A year on Mercury is just 88 days long, but a solar day (one full day-night cycle) takes 176 Earth days!'
    },
    'Venus': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg',
        subtitle: 'The Morning Star',
        description: 'Venus is the second planet from the Sun and is Earth\'s closest planetary neighbor. It\'s one of the four inner, terrestrial (or rocky) planets, and it\'s often called Earth\'s twin because it\'s similar in size and density. However, Venus has a thick, toxic atmosphere filled with carbon dioxide and it\'s perpetually shrouded in thick, yellowish clouds of sulfuric acid that trap heat in a runaway greenhouse effect.',
        stats: { 'Radius': '6,051 km', 'Temperature': '471°C', 'Moons': '0', 'Orbital Period': '225 Days', 'Gravity': '8.87 m/s²' },
        funFact: 'Venus spins in the opposite direction of most planets, meaning the Sun rises in the west and sets in the east.'
    },
    'Earth': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
        subtitle: 'The Blue Marble',
        description: 'Our home planet is the third planet from the Sun, and the only place we know of so far that\'s inhabited by living things. While Earth is only the fifth largest planet in the solar system, it is the only world in our solar system with liquid water on the surface. Just slightly larger than nearby Venus, Earth is the biggest of the four planets closest to the Sun.',
        stats: { 'Radius': '6,371 km', 'Temperature': '15°C', 'Moons': '1', 'Orbital Period': '365 Days', 'Gravity': '9.81 m/s²' },
        funFact: 'Earth is not a perfect sphere; due to its equatorial rotation speed, it bulges at the equator making it an oblate spheroid.'
    },
    'Mars': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
        subtitle: 'The Red Planet',
        description: 'Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere. Mars is also a dynamic planet with seasons, polar ice caps, canyons, extinct volcanoes, and evidence that it was even more active in the past. Mars is one of the most explored bodies in our solar system, and it\'s the only planet where we\'ve sent rovers to roam the alien landscape.',
        stats: { 'Radius': '3,389 km', 'Temperature': '-60°C', 'Moons': '2', 'Orbital Period': '687 Days', 'Gravity': '3.72 m/s²' },
        funFact: 'Mars is home to Olympus Mons, a volcano three times taller than Mount Everest.'
    },
    'Jupiter': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg',
        subtitle: 'The Gas Giant',
        description: 'Fifth in line from the Sun, Jupiter is, by far, the largest planet in the solar system – more than twice as massive as all the other planets combined. Jupiter\'s familiar stripes and swirls are actually cold, windy clouds of ammonia and water, floating in an atmosphere of hydrogen and helium.',
        stats: { 'Radius': '69,911 km', 'Temperature': '-110°C', 'Moons': '95', 'Orbital Period': '12 Years', 'Gravity': '24.79 m/s²' },
        funFact: 'Jupiter\'s Great Red Spot is a gigantic storm larger than Earth that has been raging for hundreds of years.'
    },
    'Saturn': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg',
        subtitle: 'The Ringed Planet',
        description: 'Saturn is the sixth planet from the Sun and the second-largest planet in our solar system. Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system. The other giant planets have rings, but none are as spectacular or as complicated as Saturn\'s. Like fellow gas giant Jupiter, Saturn is a massive ball made mostly of hydrogen and helium.',
        stats: { 'Radius': '58,232 km', 'Temperature': '-140°C', 'Moons': '146', 'Orbital Period': '29.5 Years', 'Gravity': '10.44 m/s²' },
        funFact: 'Saturn is the only planet in our solar system that is less dense than water. It would float in a giant bathtub!'
    },
    'Uranus': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
        subtitle: 'The Ice Giant',
        description: 'Uranus is the seventh planet from the Sun, and has the third-largest diameter in our solar system. It was the first planet found with the aid of a telescope, Uranus was discovered in 1781 by astronomer William Herschel. Uranus is an ice giant; most of its mass is a hot, dense fluid of "icy" materials – water, methane and ammonia – above a small rocky core.',
        stats: { 'Radius': '25,362 km', 'Temperature': '-195°C', 'Moons': '28', 'Orbital Period': '84 Years', 'Gravity': '8.69 m/s²' },
        funFact: 'Uranus rotates almost perfectly on its side, rolling around the Sun like a barrel rather than spinning like a top.'
    },
    'Neptune': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Neptune_-_Voyager_2_%2829777369328%29.png',
        subtitle: 'The Blue Giant',
        description: 'Dark, cold, and whipped by supersonic winds, ice giant Neptune is the eighth and most distant planet in our solar system. More than 30 times as far from the Sun as Earth, Neptune is the only planet in our solar system not visible to the naked eye. In 2011 Neptune completed its first 165-year orbit since its discovery in 1846.',
        stats: { 'Radius': '24,622 km', 'Temperature': '-200°C', 'Moons': '16', 'Orbital Period': '165 Years', 'Gravity': '11.15 m/s²' },
        funFact: 'Winds on Neptune can reach speeds of over 2,000 kilometers per hour, the fastest in the solar system.'
    }
};

// Preload background images so they are ready instantly
Object.values(planetData).forEach(data => {
    const img = new Image();
    img.src = data.image;
});

systemPlanets.forEach(planet => {
    planet.addEventListener('click', (e) => {
        // Fly spaceship to target tracking the planet element
        if (window.dockSpaceshipTo) {
            window.dockSpaceshipTo(planet);
        }
        
        // Populate and show info panel
        const planetName = planet.getAttribute('data-title');
        const data = planetData[planetName];
        
        if (panelTitle) panelTitle.textContent = planetName;
        
        if (panelDesc && data) {
            let statsHtml = '';
            for (const [key, value] of Object.entries(data.stats)) {
                statsHtml += `<div class="stat-box"><h4>${key}</h4><p>${value}</p></div>`;
            }
            
            panelDesc.innerHTML = `
                <div class="planet-subtitle">${data.subtitle}</div>
                <div class="planet-description">${data.description}</div>
                <div class="planet-stats-grid">${statsHtml}</div>
                <div class="planet-fun-fact">
                    <strong>DID YOU KNOW?</strong><br>${data.funFact}
                </div>
            `;
            
            if (infoPanel) {
                infoPanel.style.backgroundImage = `linear-gradient(rgba(10, 15, 30, 0.85), rgba(10, 15, 30, 0.95)), url('${data.image}')`;
                infoPanel.style.backgroundSize = 'cover';
                infoPanel.style.backgroundPosition = 'center';
                infoPanel.style.backgroundAttachment = 'fixed';
            }
        } else if (panelDesc) {
            panelDesc.innerHTML = planet.getAttribute('data-info');
            if (infoPanel) infoPanel.style.backgroundImage = '';
        }
        
        setTimeout(() => {
            if(infoPanel) infoPanel.classList.remove('hidden');
        }, 1200); // show panel as ship arrives
    });
});

if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
        if(infoPanel) infoPanel.classList.add('hidden');
        if (window.resumePatrol) {
            window.resumePatrol();
        }
    });
}

// Audio Player Logic
const audio = document.getElementById('bg-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = playPauseBtn ? playPauseBtn.querySelector('.icon') : null;

if (playPauseBtn && audio && playIcon) {
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playIcon.textContent = '||';
            playPauseBtn.classList.add('playing');
        } else {
            audio.pause();
            playIcon.textContent = '▶';
            playPauseBtn.classList.remove('playing');
        }
    });
}

const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');

if (lightbox && lightboxImg) {
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const bgImg = window.getComputedStyle(item).backgroundImage;
            const caption = item.getAttribute('data-caption');
            
            lightboxImg.style.backgroundImage = bgImg;
            if(lightboxCaption) lightboxCaption.textContent = caption || '';
            
            lightbox.classList.remove('hidden');
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.id === 'lightbox-content') {
            lightbox.classList.add('hidden');
        }
    });
}


// Skills Animation
const skillsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        document.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-percent');
        });
    }
}, { threshold: 0.3 });

// Timeline scroll animation
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.timeline-event').forEach(event => {
    timelineObserver.observe(event);
});

const skillsSection = document.getElementById('skills');
if (skillsSection) skillsObserver.observe(skillsSection);
