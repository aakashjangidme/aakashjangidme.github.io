// Theme Management
function setTheme(theme) {
    const themeRoot = document.getElementById("theme-root");
    if (!themeRoot) return;

    themeRoot.className = `${theme} bg-[var(--bg-dark)] text-white font-sans`;

    let primaryRgb;
    switch (theme) {
        case "theme-cyberpunk":
            primaryRgb = "244, 114, 182";
            break;
        case "theme-matrix":
            primaryRgb = "0, 255, 0";
            break;
        case "theme-nebula":
            primaryRgb = "110, 231, 183";
            break;
        default:
            primaryRgb = "56, 189, 248";
    }

    document.documentElement.style.setProperty("--primary-rgb", primaryRgb);
    updateThreeJSColors();
}

// Intersection Observer for animations
function initIntersectionObserver() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => {
        if (el) observer.observe(el);
    });
}

// Mouse Trail Effect (Canvas-based for better performance)
function initMouseTrail() {
    const canvas = document.createElement('canvas');
    canvas.className = 'mouse-trail-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouseX = 0;
    let mouseY = 0;
    const particles = [];
    const particleCount = 20;

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 2;
            this.color = color;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.life = 100;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            this.size *= 0.98;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get current theme color
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary");

        // Add new particles at mouse position
        for (let i = 0; i < particleCount / 5; i++) {
            particles.push(new Particle(mouseX, mouseY, primaryColor));
        }

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Remove dead particles
            if (particles[i].life <= 0 || particles[i].size <= 0.5) {
                particles.splice(i, 1);
                i--;
            }
        }

        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    animate();
}

// Typing Effect
function initTypingEffect() {
    const typingText = document.getElementById("typing-text");
    if (!typingText) return;

    const texts = ["Aakash Jangid", "Full Stack Developer", "AI Enthusiast"];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = charIndex === currentText.length ? 1500 : 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

// Interactive Background with Vanta.js
let vantaEffect;
function initVanta() {
    const interactiveBg = document.getElementById("interactive-bg");
    if (!interactiveBg) return;

    if (vantaEffect) vantaEffect.destroy();

    const theme = document.getElementById("theme-root").className.split(" ")[0];
    let color1, color2;

    switch (theme) {
        case "theme-cyberpunk":
            color1 = 0xf472b6;
            color2 = 0x7c3aed;
            break;
        case "theme-matrix":
            color1 = 0x00ff00;
            color2 = 0x003300;
            break;
        case "theme-nebula":
            color1 = 0x6ee7b7;
            color2 = 0x3b82f6;
            break;
        default:
            color1 = 0x38bdf8;
            color2 = 0x9333ea;
    }

    vantaEffect = VANTA.NET({
        el: "#interactive-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: color1,
        backgroundColor: 0x0f172a,
        points: 12.0,
        maxDistance: 22.0,
        spacing: 18.0,
        showDots: false,
    });
}

// Three.js Scenes Management
let heroScene, heroRenderer, heroCamera, heroMesh;
let techSphereScene, techRenderer, techCamera, techSphere;

function initThreeJS() {
    initHeroScene();
    initTechSphereScene();
}

function initHeroScene() {
    const heroContainer = document.getElementById("hero-3d");
    if (!heroContainer) return;

    // Clear previous canvas if exists
    const existingCanvas = document.getElementById("hero-canvas");
    if (existingCanvas) heroContainer.removeChild(existingCanvas);

    const heroCanvas = document.createElement("canvas");
    heroCanvas.id = "hero-canvas";
    heroContainer.appendChild(heroCanvas);

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);

    // Add lights
    const heroLight = new THREE.AmbientLight(0xffffff, 0.5);
    heroScene.add(heroLight);
    const heroPointLight = new THREE.PointLight(0xffffff, 0.3);
    heroPointLight.position.set(5, 5, 5);
    heroScene.add(heroPointLight);

    // Add 3D model
    const heroGeometry = new THREE.IcosahedronGeometry(2, 1);
    const heroMaterial = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        emissive: 0x9333ea,
        emissiveIntensity: 0.5,
        shininess: 100,
    });
    heroMesh = new THREE.Mesh(heroGeometry, heroMaterial);
    heroScene.add(heroMesh);

    heroCamera.position.z = 6;

    function animateHero() {
        requestAnimationFrame(animateHero);
        if (heroMesh) {
            heroMesh.rotation.x += 0.01;
            heroMesh.rotation.y += 0.01;
        }
        if (heroRenderer && heroScene && heroCamera) {
            heroRenderer.render(heroScene, heroCamera);
        }
    }

    animateHero();
}

function initTechSphereScene() {
    const techContainer = document.getElementById("tech-sphere");
    if (!techContainer) return;

    // Clear previous canvas if exists
    const existingCanvas = document.getElementById("tech-sphere-canvas");
    if (existingCanvas) techContainer.removeChild(existingCanvas);

    const techCanvas = document.createElement("canvas");
    techCanvas.id = "tech-sphere-canvas";
    techContainer.appendChild(techCanvas);

    techSphereScene = new THREE.Scene();
    techCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    techRenderer = new THREE.WebGLRenderer({ canvas: techCanvas, alpha: true });
    techRenderer.setSize(400, 400);

    // Create sphere with tech icons as textures
    const techGeometry = new THREE.SphereGeometry(3, 32, 32);
    const techMaterial = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
    });
    techSphere = new THREE.Mesh(techGeometry, techMaterial);
    techSphereScene.add(techSphere);

    techCamera.position.z = 5;

    function animateTechSphere() {
        requestAnimationFrame(animateTechSphere);
        if (techSphere) {
            techSphere.rotation.x += 0.005;
            techSphere.rotation.y += 0.01;
        }
        if (techRenderer && techSphereScene && techCamera) {
            techRenderer.render(techSphereScene, techCamera);
        }
    }

    animateTechSphere();
}

function cleanupThreeJS() {
    // Cleanup hero scene
    if (heroScene) {
        heroScene.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
    if (heroRenderer) heroRenderer.dispose();

    // Cleanup tech sphere scene
    if (techSphereScene) {
        techSphereScene.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
    if (techRenderer) techRenderer.dispose();
}

// Update Three.js colors based on theme
function updateThreeJSColors() {
    const themeRoot = document.getElementById("theme-root");
    if (!themeRoot) return;

    const theme = themeRoot.className.split(" ")[0];
    let primaryColor, secondaryColor;

    switch (theme) {
        case "theme-cyberpunk":
            primaryColor = 0xf472b6;
            secondaryColor = 0x7c3aed;
            break;
        case "theme-matrix":
            primaryColor = 0x00ff00;
            secondaryColor = 0x003300;
            break;
        case "theme-nebula":
            primaryColor = 0x6ee7b7;
            secondaryColor = 0x3b82f6;
            break;
        default:
            primaryColor = 0x38bdf8;
            secondaryColor = 0x9333ea;
    }

    // Update hero scene colors
    if (heroScene && heroMesh) {
        heroMesh.material.color.setHex(primaryColor);
        heroMesh.material.emissive.setHex(secondaryColor);
    }

    // Update tech sphere colors
    if (techSphereScene && techSphere) {
        techSphere.material.color.setHex(primaryColor);
    }
}

// Handle window resize
function handleResize() {
    if (vantaEffect) {
        vantaEffect.resize();
    }

    if (heroRenderer && heroCamera) {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    if (techRenderer && techCamera) {
        // Tech sphere maintains aspect ratio of 1:1
        techRenderer.setSize(400, 400);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initIntersectionObserver();
    initMouseTrail();
    initTypingEffect();
    initVanta();
    initThreeJS();

    // Update colors when theme changes
    document.querySelectorAll('[onclick^="setTheme"]').forEach((btn) => {
        btn.addEventListener("click", () => {
            setTimeout(() => {
                initVanta();
                updateThreeJSColors();
            }, 100);
        });
    });

    // AI Assistant Button
    const aiAssistant = document.getElementById("ai-assistant");
    if (aiAssistant) {
        aiAssistant.addEventListener("click", () => {
            alert(
                "AI Assistant: Hi there! I'm your AI helper. In a full implementation, I could answer questions about Aakash's work or help navigate the portfolio."
            );
        });
    }

    // Contact form submission
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Message sent!");
            e.target.reset();
        });
    }
});

// Handle window resize
window.addEventListener("resize", handleResize);

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
    cleanupThreeJS();
    if (vantaEffect) vantaEffect.destroy();
});