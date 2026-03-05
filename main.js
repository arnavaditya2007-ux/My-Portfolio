// --- Preloader & Typing Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const heroName = document.getElementById('hero-name');
    const heroStatus = document.getElementById('hero-status');
    const loaderBar = document.querySelector('.loader-bar');
    const preloader = document.getElementById('preloader');
    const contentElements = document.querySelectorAll('.content-hidden');

    if (!heroName || !heroStatus || !loaderBar) return;

    // Config
    const fullName = "Arnav Aditya";
    const statusText = "System Initialized...";
    let currentIndex = 0;
    let isTypingName = false;

    function typeSequence() {
        if (!isTypingName) {
            // Typing status first
            if (currentIndex < statusText.length) {
                heroStatus.textContent += statusText[currentIndex];
                currentIndex++;
                setTimeout(typeSequence, 40);
            } else {
                isTypingName = true;
                currentIndex = 0;
                setTimeout(typeSequence, 600); // Pause before name
            }
        } else {
            // Typing name
            if (currentIndex < fullName.length) {
                const char = fullName[currentIndex];

                if (currentIndex < 6) {
                    // Typing "Arnav "
                    if (currentIndex === 5) {
                        heroName.innerHTML += '<br>';
                    } else {
                        heroName.innerHTML += char;
                    }
                } else {
                    // Typing "Aditya"
                    if (currentIndex === 6) {
                        heroName.innerHTML += `<span class="highlight">${char}</span>`;
                    } else {
                        const span = heroName.querySelector('.highlight');
                        if (span) span.innerHTML += char;
                    }
                }

                // Bar progress
                const totalSteps = statusText.length + fullName.length;
                const currentProgress = ((statusText.length + currentIndex + 1) / totalSteps) * 100;
                loaderBar.style.width = `${currentProgress}%`;

                currentIndex++;
                setTimeout(typeSequence, 180 + Math.random() * 100);
            } else {
                startGlitchPhase();
            }
        }
    }

    function startGlitchPhase() {
        heroName.classList.add('active');
        loaderBar.style.width = '100%';

        setTimeout(() => {
            revealWebsite();
        }, 1200);
    }

    function revealWebsite() {
        // Fade out ONLY the background layer and the intro bar
        const introBar = document.getElementById('intro-bar');

        gsap.to(preloader, {
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.style.display = 'none';
            }
        });

        gsap.to(introBar, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
        });

        // Reveal the rest of the website content
        setTimeout(() => {
            // First reveal hero description/buttons
            const heroDetails = document.querySelector('.hero-details');
            heroDetails.classList.add('content-show');

            // Then reveal other sections
            contentElements.forEach((el, index) => {
                // Skip if it's the hero details we just handled
                if (el !== heroDetails) {
                    setTimeout(() => {
                        el.classList.add('content-show');
                    }, index * 200);
                }
            });

            // Start existing GSAP animations
            initMainAnimations();

            // Refresh ScrollTrigger to ensure all triggers are correctly calculated after layout reveal
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }, 500);
    }

    // Start sequence
    setTimeout(typeSequence, 800);
});

// ── GLOBAL REFERENCES ──────────────────────────────────────────────────
const masterCard = document.querySelector('#master-card');
const masterCardPivot = document.querySelector('#master-card-pivot');
const masterCardContainer = document.querySelector('#master-card-container');

// Wrap existing init in a function to control timing
function initMainAnimations() {

    // ── CARD SLOTS ────────────────────────────────────────────────────────────
    // Rule: card always occupies the OPPOSITE column from the section's text.
    //   Normal section  (text→LEFT  col): card slot at RIGHT → left: 75%
    //   .content-right  (text→RIGHT col): card slot at LEFT  → left: 25%
    // left/top are viewport-% of the card's centre point.
    // xPercent/yPercent:-50 self-centres the card on that coordinate.
    // ─────────────────────────────────────────────────────────────────────────
    const CARD_SLOTS = {
        hero: { left: '75%', top: '50%' }, // hero text LEFT        → card RIGHT
        about: { left: '25%', top: '50%' }, // .content-right        → card LEFT
        highlights: { left: '75%', top: '50%' }, // centred section       → card RIGHT
        skills: { left: '75%', top: '50%' }, // text LEFT             → card RIGHT
        projects: { left: '75%', top: '50%' }, // text LEFT             → card RIGHT
        gameDev: { left: '75%', top: '50%' }, // text LEFT             → card RIGHT
        aiDev: { left: '25%', top: '50%' }, // .content-right        → card LEFT
        contentCreation: { left: '75%', top: '50%' }, // text LEFT             → card RIGHT
        devIntel: { left: '25%', top: '50%' }, // .content-right        → card LEFT
        certificates: { left: '75%', top: '50%' }, // text LEFT             → card RIGHT
        contact: { left: '50%', top: '50%' }, // centred contact       → card CENTRE
    };

    // ── ROTATION PROXY ────────────────────────────────────────────────────────
    // We use a proxy object to combine Scroll-based tilt and Mouse-based tilt.
    // This prevents them from fighting for control over the same property.
    // ─────────────────────────────────────────────────────────────────────────
    // ── MASTER CARD SYSTEM ──────────────────────────────────────────────────

    window.cardRotation = {
        baseRX: 0, baseRY: 0,
        mouseRX: 0, mouseRY: 0,
        flipRY: 0,
        isFlipped: false
    };

    // Shared face references (used by both ticker and click handler)
    const cardFront = masterCard ? masterCard.querySelector('.card-front') : null;
    const cardBack = masterCard ? masterCard.querySelector('.card-back') : null;

    gsap.ticker.add(() => {
        if (!masterCard || !masterCardPivot || !window.cardRotation) return;
        const totalRY = window.cardRotation.baseRY + window.cardRotation.mouseRY + window.cardRotation.flipRY;
        const totalRX = window.cardRotation.baseRX + window.cardRotation.mouseRX;

        // 3D rotation on the PIVOT — glass surface rotates with content as one unified card
        gsap.set(masterCardPivot, { rotationY: totalRY, rotationX: totalRX });

        // Face-swap: show back face once past the 90° edge
        if (!cardFront || !cardBack) return;
        const normRY = ((totalRY % 360) + 360) % 360;
        const showBack = normRY > 90 && normRY < 270;
        cardFront.style.display = showBack ? 'none' : 'flex';
        cardBack.style.display = showBack ? 'flex' : 'none';
    });

    // ── CLICK TO FLIP ────────────────────────────────────────────────────────
    if (masterCard) masterCard.addEventListener('click', () => {
        if (!window.cardRotation) return;

        const isFlipped = !window.cardRotation.isFlipped;
        window.cardRotation.isFlipped = isFlipped;
        const targetFlipRY = isFlipped ? 180 : 0;

        // Animate flipRY — the ticker reads & applies it every frame
        gsap.to(window.cardRotation, {
            flipRY: targetFlipRY,
            duration: 0.65,
            ease: 'expo.inOut',
            overwrite: true
        });

        // Depth pop effect
        gsap.to(masterCardPivot, {
            scale: 1.06,
            duration: 0.32,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out'
        });
    });

    // ── INITIAL STATE (Hero Screen) ──────────────────────────────────────────
    // gsap.set() is synchronous — the card is locked to the Hero slot the
    // instant the website reveals. No flickering, no FOUC.
    gsap.set(masterCardPivot, {
        left: CARD_SLOTS.hero.left,
        top: CARD_SLOTS.hero.top,
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        scale: 1
    });
    // Perspective comes from #master-card-container CSS — no inline override needed
    // Set initial base rotation on proxy
    window.cardRotation.baseRY = 15;
    window.cardRotation.baseRX = 0;

    // Entrance animation — slide card in from the right (no opacity fade so blur is instant)
    gsap.from(masterCardPivot, {
        left: '110%',
        duration: 2.2,
        ease: 'expo.out'
    });

    // ── SLOT MOVER ────────────────────────────────────────────────────────────
    // Moves the card to a named slot as the user scrolls into a new section.
    // Only drives slot coordinates + tilt — never fights the self-centering.
    // ─────────────────────────────────────────────────────────────────────────
    const moveCard = (trigger, slotName, tilt = {}) => {
        if (!document.querySelector(trigger) || !masterCardPivot) return;
        const slot = CARD_SLOTS[slotName];

        // Position the PIVOT (2D)
        gsap.to(masterCardPivot, {
            scrollTrigger: {
                trigger: trigger,
                start: 'top bottom',
                end: 'top center',
                scrub: 1,
                overwrite: 'auto'
            },
            left: slot.left,
            top: slot.top,
            xPercent: -50,
            yPercent: -50,
            scale: tilt.scale ?? 1,
            opacity: tilt.opacity ?? 1,
            immediateRender: false
        });

        // Animate base rotation separately on the proxy
        gsap.to(window.cardRotation, {
            scrollTrigger: {
                trigger: trigger,
                start: 'top bottom',
                end: 'top center',
                scrub: 1,
                overwrite: 'auto'
            },
            baseRX: tilt.rotationX ?? 0,
            baseRY: tilt.rotationY ?? 0,
            immediateRender: false
        });
    };

    // ── SCROLL SEQUENCE ───────────────────────────────────────────────────────
    // Each phase snaps the card to its predefined slot as that section enters.
    // The slot coordinate is constant — the card will always hit the same pixel
    // regardless of scroll speed, screen size, or animation timing.
    // ─────────────────────────────────────────────────────────────────────────

    // PHASE 1: About — left column, slight inward tilt (card visible)
    moveCard('#about', 'about', { rotationY: -15, rotationX: 0, scale: 0.85, opacity: 1 });

    // PHASE 2: Highlights — HIDE card (section has its own interactive shuffle deck)
    moveCard('#highlights', 'highlights', { rotationY: 5, rotationX: 0, scale: 0.9, opacity: 0 });

    // PHASE 3: Skills — HIDE card (section has interactive skill network graph)
    moveCard('#skills', 'skills', { rotationY: 0, rotationX: 0, scale: 0.8, opacity: 0 });

    // PHASE 4: Projects — HIDE card (section has interactive 3-D globe)
    moveCard('#projects', 'projects', { rotationY: 0, rotationX: 0, scale: 0.9, opacity: 0 });

    // PHASE 5: Game Architecture — card RETURNS, right column
    moveCard('#game-dev', 'gameDev', { rotationY: 15, rotationX: 10, scale: 0.85, opacity: 1 });

    // PHASE 6: AI Dev — left column
    moveCard('#ai-dev', 'aiDev', { rotationY: -15, rotationX: -5, scale: 0.9, opacity: 1 });

    // PHASE 7: Content Creation — right column
    moveCard('#content-creation', 'contentCreation', { rotationY: 15, rotationX: 5, scale: 0.85, opacity: 1 });

    // PHASE 8: Dev Intel — left column
    moveCard('#dev-intel', 'devIntel', { rotationY: -15, rotationX: -10, scale: 0.9, opacity: 1 });

    // PHASE 8.5: Certificates — HIDE card (section has its own large-scale 3D panel)
    moveCard('#certificates', 'certificates', { opacity: 0 });

    // PHASE 9: Contact — centred, flat
    moveCard('#contact', 'contact', { rotationY: 0, rotationX: 0, rotationZ: 0, scale: 1, opacity: 1 });

    // PHASE 10: Exit — fly down and fade on Thank You section
    gsap.to(masterCardPivot, {
        scrollTrigger: {
            trigger: '#thank-you',
            start: 'top bottom',
            end: 'top center',
            scrub: 1.5,
            overwrite: 'auto'
        },
        scale: 0,
        opacity: 0,
        top: '120%',
        ease: 'power2.in',
        immediateRender: false
    });
}

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

// Synchronize Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Ensure ScrollTrigger updates with Lenis
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Smooth Scroll for Nav Links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        lenis.scrollTo(targetId);
    });
});

// Smooth Scroll for Button Group in Hero
document.querySelectorAll('.button-group a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        lenis.scrollTo(targetId);
    });
});

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Core Variables
const sections = document.querySelectorAll('.panel');

document.addEventListener('mousemove', (e) => {
    if (!masterCardPivot || !window.cardRotation) return;

    // Only apply tilt if the card is visible
    if (gsap.getProperty(masterCardPivot, 'opacity') < 0.1) return;

    const { clientX, clientY } = e;
    const rect = masterCardPivot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate normalized distance from card center (-1 to 1)
    const dx = (clientX - centerX) / (window.innerWidth / 2);
    const dy = (clientY - centerY) / (window.innerHeight / 2);

    // Face the cursor:
    const multiplier = window.cardRotation.isFlipped ? -1 : 1;
    const targetMouseRX = -dy * 15;
    const targetMouseRY = dx * 15 * multiplier; // Invert Y tilt when flipped to maintain "look-at"

    gsap.to(window.cardRotation, {
        mouseRX: targetMouseRX,
        mouseRY: targetMouseRY,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
    });
});

// ── CARD FLIP INTERACTION ──────────────────────────────────────────────────
if (masterCard) {
    masterCard.addEventListener('click', () => {
        window.cardRotation.isFlipped = !window.cardRotation.isFlipped;

        // Target flip rotation
        const targetFlip = window.cardRotation.isFlipped ? 180 : 0;

        gsap.to(window.cardRotation, {
            flipRY: targetFlip,
            duration: 1.2,
            ease: "back.out(1.2)"
        });

        // Tactile scale effect on click
        gsap.to(masterCard, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });
    });
}

// --- 4. Background Particle Animation (Enhanced Web) ---
const canvas = document.querySelector('#bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };
const particleCount = 100; // Optimal for performance + density
const connectionDistance = 200; // Prominent web

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6; // Slightly faster for energy
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 2 + 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Mouse Parallax
        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }
        }
    }
    draw() {
        ctx.fillStyle = "rgba(0, 243, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                let opacity = 1 - (dist / connectionDistance);
                ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.3})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('resize', initCanvas);

initCanvas();
animate();

// --- 6. Skills Neural Network ---
const network = document.getElementById('skills-network');
const svg = document.getElementById('network-svg');
const nodes = document.querySelectorAll('.skill-node');

if (network && svg) {
    const nodePositions = {
        'node-data': { x: 0, y: 30, size: 130 }, // Central Hub

        // Left Cluster: AI
        'node-ml': { x: -380, y: -80 },
        'node-ai': { x: -380, y: 140 },
        'node-sql': { x: -180, y: 150 },

        // Right Cluster: App/Game
        'node-app': { x: 280, y: 30 },
        'node-unity': { x: 480, y: 120 },
        'node-unreal': { x: 480, y: -100 },
        'node-android': { x: 350, y: 250 },

        // Top Cluster: Web
        'node-html': { x: 0, y: -220 },
        'node-git': { x: -180, y: -320 },
        'node-cloud': { x: 180, y: -320 },

        // Bottom Cluster: Hardware/IoT
        'node-iot': { x: 0, y: 320 },
        'node-arduino': { x: -200, y: 400 }
    };

    // Set initial positions and floating animations
    const nodeAnimations = {};

    nodes.forEach(node => {
        const pos = nodePositions[node.id];
        if (pos) {
            gsap.set(node, {
                x: pos.x,
                y: pos.y,
                width: pos.size || 100,
                height: pos.size || 100
            });

            // Floating individual nodes
            nodeAnimations[node.id] = gsap.to(node, {
                y: `+=${10 + Math.random() * 10}`,
                x: `+=${5 + Math.random() * 5}`,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    });

    let pulseAnimations = [];

    // Create elements once
    function initNetwork() {
        svg.innerHTML = '';
        pulseAnimations = [];
        nodes.forEach(node => {
            if (!nodePositions[node.id]) {
                node.style.display = 'none';
                return;
            }
            if (!node.dataset.links) return;
            const links = node.dataset.links.split(',');
            links.forEach(linkId => {
                const targetNode = document.getElementById(linkId);
                if (!targetNode || !nodePositions[linkId]) return;

                // Create persistent line - offscreen initially
                const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
                line.setAttribute("class", "network-line");
                line.setAttribute("d", "M -1000 -1000 L -1000 -1000");
                line.id = `line-${node.id}-${linkId}`;
                line.dataset.from = node.id;
                line.dataset.to = linkId;
                svg.appendChild(line);

                // Create persistent pulse
                const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                pulse.setAttribute("r", "3");
                pulse.setAttribute("class", "data-pulse");
                pulse.style.display = "none"; // Hard hide
                svg.appendChild(pulse);

                // Setup animation but don't start yet
                const anim = gsap.to(pulse, {
                    duration: 2 + Math.random() * 3,
                    repeat: -1,
                    ease: "none",
                    paused: true, // Wait for paths to be real
                    motionPath: {
                        path: line,
                        align: line,
                        autoRotate: true
                    },
                    onStart: () => pulse.style.display = "block"
                });
                pulseAnimations.push(anim);
            });
        });
    }

    let initializedVisibility = false;

    // Update only positions in ticker
    function updateLinePaths() {
        const containerRect = network.getBoundingClientRect();
        const lines = svg.querySelectorAll('.network-line');

        lines.forEach(line => {
            const fromNode = document.getElementById(line.dataset.from);
            const toNode = document.getElementById(line.dataset.to);
            if (!fromNode || !toNode) return;

            const r1 = fromNode.getBoundingClientRect();
            const r2 = toNode.getBoundingClientRect();

            const x1 = (r1.left + r1.width / 2) - containerRect.left;
            const y1 = (r1.top + r1.height / 2) - containerRect.top;
            const x2 = (r2.left + r2.width / 2) - containerRect.left;
            const y2 = (r2.top + r2.height / 2) - containerRect.top;

            line.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
        });

        // Reveal everything and START animations only after first stable frame
        if (!initializedVisibility && containerRect.width > 0) {
            svg.style.visibility = "visible";
            nodes.forEach(n => {
                if (nodePositions[n.id]) n.style.visibility = "visible";
            });
            pulseAnimations.forEach(anim => anim.play());
            initializedVisibility = true;
        }
    }

    // Hover Interaction
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            if (!node.dataset.links) return;
            const links = node.dataset.links.split(',');

            document.querySelectorAll('.network-line').forEach(line => {
                if (line.dataset.from === node.id || line.dataset.to === node.id) {
                    line.classList.add('active');
                }
            });

            links.forEach(linkId => {
                const linked = document.getElementById(linkId);
                if (linked) linked.classList.add('active');
            });
        });

        node.addEventListener('mouseleave', () => {
            document.querySelectorAll('.network-line').forEach(l => l.classList.remove('active'));
            nodes.forEach(n => n.classList.remove('active'));
        });
    });

    // --- Click Expansion Logic ---
    const skillData = {
        'node-data': {
            title: "Data Analysis",
            body: "Processing and interpreting complex data to find meaningful patterns and insights. I focus on statistical modeling, data cleaning, and visualization to drive informed decision-making and uncover hidden trends."
        },
        'node-ml': {
            title: "Machine Learning",
            body: "Building predictive models and algorithms that learn from data. My experience includes supervised and unsupervised learning, using frameworks like Scikit-Learn and TensorFlow to solve real-world problems."
        },
        'node-ai': {
            title: "AI Development",
            body: "Creating intelligent systems that mimic human cognitive functions. I explore neural networks, natural language processing, and computer vision to build the next generation of smart applications."
        },
        'node-sql': {
            title: "SQL & Databases",
            body: "Managing and querying relational databases to ensure data integrity and accessibility. I work with MySQL and PostgreSQL to design efficient schemas and optimize complex queries for performance."
        },
        'node-app': {
            title: "App Development",
            body: "Designing and building high-performance mobile applications. I specialize in cross-platform development, focusing on intuitive user interfaces and seamless integration with backend services."
        },
        'node-unity': {
            title: "Unity Engine",
            body: "Developing interactive 3D and 2D games and simulations. I use C# to script gameplay mechanics, implement physics, and create immersive environments within the Unity ecosystem."
        },
        'node-unreal': {
            title: "Unreal Engine",
            body: "Engineering high-fidelity visual experiences and complex game systems. I leverage Blueprints and C++ to push the boundaries of real-time rendering and cinematic storytelling in UE5."
        },
        'node-android': {
            title: "Android Studio",
            body: "Native mobile development for the Android platform. I build robust, scalable apps using Kotlin and Java, ensuring they follow Google's Material Design guidelines and performance standards."
        },
        'node-html': {
            title: "Web Technologies",
            body: "Crafting modern, responsive web interfaces. I use HTML5, CSS3, and JavaScript to build fast, accessible, and visually stunning websites that work across all devices."
        },
        'node-cloud': {
            title: "Cloud Platforms",
            body: "Deploying and scaling applications in the cloud. I have experience with AWS and Firebase, focusing on serverless architectures, cloud storage, and secure authentication flows."
        },
        'node-git': {
            title: "Version Control",
            body: "Managing codebases and collaborating with teams using Git. I focus on clean commit history, effective branching strategies, and leveraging GitHub for CI/CD and project management."
        },
        'node-iot': {
            title: "Internet of Things",
            body: "Connecting physical devices to the digital world. I explore sensor integration, wireless communication protocols, and real-time data streaming to build smart, connected ecosystems."
        },
        'node-arduino': {
            title: "Arduino & Hardware",
            body: "Prototyping electronic systems and embedded software. I work with microcontrollers to interface with various hardware components, building custom solutions for automation and robotics."
        }
    };

    let isExpanded = false;
    let currentlyExpandedNode = null;

    const overlay = document.getElementById('skill-detail-overlay');
    const overlayTitle = document.getElementById('skill-detail-title');
    const overlayBody = document.getElementById('skill-detail-body');
    const closeBtn = document.getElementById('skill-detail-close');

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            if (isExpanded) return;

            const data = skillData[node.id];
            if (!data) return;

            isExpanded = true;
            currentlyExpandedNode = node;

            // 1. Pause all node animations
            Object.values(nodeAnimations).forEach(anim => anim.pause());
            if (typeof pulseAnimations !== 'undefined') pulseAnimations.forEach(anim => anim.pause());

            // 2. Hide everything else (background network)
            nodes.forEach(n => {
                if (n !== node) n.classList.add('skills-dimmed');
            });
            if (svg) svg.classList.add('skills-dimmed');
            const skillsTitle = document.getElementById('skills-title');
            if (skillsTitle) skillsTitle.classList.add('skills-dimmed');

            // 3. Expand and move the clicked node
            node.classList.add('expanded');

            // Get original position to return to later
            const originalPos = nodePositions[node.id];

            // Animate to left
            gsap.to(node, {
                x: -window.innerWidth * 0.25, // Move to left 25% of screen
                y: 0,
                width: 200,
                height: 200,
                duration: 0.8,
                ease: "expo.out",
                onComplete: () => {
                    // 4. Show overlay
                    overlayTitle.textContent = data.title;
                    overlayBody.textContent = data.body;
                    overlay.classList.remove('skill-detail-hidden');
                    overlay.classList.add('skill-detail-show');
                }
            });
        });
    });

    closeBtn.addEventListener('click', () => {
        if (!isExpanded || !currentlyExpandedNode) return;

        const node = currentlyExpandedNode;
        const originalPos = nodePositions[node.id];

        // 1. Hide overlay
        overlay.classList.remove('skill-detail-show');
        overlay.classList.add('skill-detail-hidden');

        setTimeout(() => {
            // 2. Return node to original position
            gsap.to(node, {
                x: originalPos.x,
                y: originalPos.y,
                width: originalPos.size || 100,
                height: originalPos.size || 100,
                duration: 0.8,
                ease: "expo.inOut",
                onComplete: () => {
                    node.classList.remove('expanded');

                    // 3. Restore visibility to the background network
                    nodes.forEach(n => n.classList.remove('skills-dimmed'));
                    if (svg) svg.classList.remove('skills-dimmed');
                    const skillsTitle = document.getElementById('skills-title');
                    if (skillsTitle) skillsTitle.classList.remove('skills-dimmed');

                    // 4. Resume animations
                    Object.values(nodeAnimations).forEach(anim => anim.resume());
                    if (typeof pulseAnimations !== 'undefined') pulseAnimations.forEach(anim => anim.play());

                    isExpanded = false;
                    currentlyExpandedNode = null;
                }
            });
        }, 300);
    });

    window.addEventListener('load', () => {
        initNetwork();
        updateLinePaths();
    });
    window.addEventListener('resize', updateLinePaths);
    gsap.ticker.add(updateLinePaths);
}

// --- 7. Feedback Interaction (Final Escape Logic) ---
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
const toast = document.getElementById('feedback-toast');

if (noBtn && yesBtn && toast) {
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    let noBtnX = 0;
    let noBtnY = 0;

    const escapeBtn = () => {
        // Calculate a smoother, more constrained random position
        const rx = (Math.random() - 0.5) * window.innerWidth * 0.6;
        const ry = (Math.random() - 0.5) * window.innerHeight * 0.6;
        const randomRotation = (Math.random() - 0.5) * 45; // Slight tumble during flight

        noBtnX = rx;
        noBtnY = ry;

        gsap.to(noBtn, {
            x: noBtnX,
            y: noBtnY,
            rotation: randomRotation,
            duration: 0.7, // Smooth glide
            ease: "circ.out", // High speed at start, smooth finish
            overwrite: "auto"
        });
    };

    window.addEventListener('mousemove', (e) => {
        const rect = noBtn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

        if (distance < 150) {
            escapeBtn();
        }
    });

    noBtn.addEventListener('mouseenter', escapeBtn);

    noBtn.addEventListener('click', (e) => {
        showToast("Impossible! System breached. Feedback registered.");
    });

    yesBtn.addEventListener('click', () => {
        showToast("System Acknowledged: Positive Feedback Registered.");
        gsap.to(yesBtn, {
            scale: 1.1,
            boxShadow: "0 0 50px var(--primary-glow)",
            duration: 0.5,
            yoyo: true,
            repeat: 1
        });
    });
}

// ─── 8. SHUFFLE HIGHLIGHT CARDS ───────────────────────────────────────────────
(function initShuffleCards() {
    const deck = document.getElementById('shuffleDeck');
    if (!deck) return;

    const positions = ['front', 'middle', 'back', 'far-back'];
    const cards = Array.from(deck.querySelectorAll('.sh-card'));

    // Assign initial positions
    function applyPositions(currentOrder) {
        cards.forEach((card, i) => {
            card.setAttribute('data-pos', currentOrder[i]);
        });
    }

    let order = [...positions];
    applyPositions(order);

    // Shuffle: cyclic rotation for 4 cards
    window.shuffleCards = function () {
        // Move front to back, others move up
        // new order: [far-back, front, middle, back]
        order = [order[3], order[0], order[1], order[2]];
        applyPositions(order);
    };

    // ── Drag to shuffle (mouse) ───────────────────────────────────────────────
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragging = false;
    let dragCard = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function getFrontCard() {
        return cards.find(c => c.getAttribute('data-pos') === 'front');
    }

    deck.addEventListener('mousedown', (e) => {
        const front = getFrontCard();
        if (!front) return;
        dragCard = front;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        isDragging = true;
        dragCard.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !dragCard) return;
        dragOffsetX = e.clientX - dragStartX;
        dragOffsetY = e.clientY - dragStartY;
        dragCard.style.transform = `rotate(${-5 + dragOffsetX * 0.03}deg) translate(${dragOffsetX}px, ${dragOffsetY}px)`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging || !dragCard) return;
        isDragging = false;
        dragCard.classList.remove('dragging');
        // If dragged far enough left → shuffle
        if (Math.abs(dragOffsetX) > 140) {
            dragCard.style.transform = '';
            window.shuffleCards();
        } else {
            // Spring back
            dragCard.style.transform = '';
        }
        dragCard = null;
        dragOffsetX = 0;
        dragOffsetY = 0;
    });

    // ── Touch support ─────────────────────────────────────────────────────────
    let touchStartX = 0;
    deck.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        const front = getFrontCard();
        if (front) front.classList.add('dragging');
    }, { passive: true });

    deck.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const front = getFrontCard();
        if (front) front.classList.remove('dragging');
        if (Math.abs(dx) > 120) window.shuffleCards();
    }, { passive: true });
})();

// ── CERTIFICATE LIGHTBOX ────────────────────────────────────────────────────
function openCertLightbox(card) {
    const lightbox = document.getElementById('cert-lightbox');
    const lightboxImg = document.getElementById('cert-lightbox-img');
    const lightboxCaption = document.getElementById('cert-lightbox-caption');

    if (!lightbox || !lightboxImg) return;

    const img = card.querySelector('.cert-image');
    const title = card.querySelector('.cert-title-overlap') || card.querySelector('.cert-title');

    if (img) lightboxImg.src = img.src;
    if (title) lightboxCaption.textContent = title.textContent.trim();

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCertLightbox(event) {
    const lightbox = document.getElementById('cert-lightbox');
    if (!lightbox) return;

    // Only close if clicking the overlay background or the close button
    if (event && event.target !== lightbox && !event.target.closest('.cert-lightbox-close')) return;

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// ESC key to close lightbox
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const lightbox = document.getElementById('cert-lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});
