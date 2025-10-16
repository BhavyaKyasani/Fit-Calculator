// Home page interactive features for Perfect Fit

document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
});

function initializeHomePage() {
    setupDemoTabs();
    setupInteractiveElements();
    addScrollEffects();
}

function setupDemoTabs() {
    const tabs = document.querySelectorAll('.tab');
    const demoItems = document.querySelectorAll('.demo-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all demo items
            demoItems.forEach(item => item.classList.remove('active'));

            // Show corresponding demo item
            const targetTab = tab.getAttribute('data-tab');
            const targetDemo = document.getElementById(`${targetTab}-demo`);
            if (targetDemo) {
                targetDemo.classList.add('active');
            }
        });
    });
}

function setupInteractiveElements() {
    // Hero animation
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        setTimeout(() => {
            heroSection.classList.add('animated');
        }, 500);
    }

    // Feature cards hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // CTA button hover effects
    const ctaButtons = document.querySelectorAll('.btn-primary-large');
    ctaButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });
}

function addScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections for scroll animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Simulate some dynamic content updates
function updateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        const increment = Math.ceil(currentValue / 50);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= currentValue) {
                current = currentValue;
                clearInterval(timer);
            }
            stat.textContent = current + (stat.textContent.includes('%') ? '%' :
                                         stat.textContent.includes('s') ? 's' : '');
        }, 30);
    });
}

// Add some interactive demo animations
function setupAIDemo() {
    const scanAnimation = document.querySelector('.scan-animation');
    if (scanAnimation) {
        setInterval(() => {
            const scanLine = scanAnimation.querySelector('.scan-line');
            if (scanLine) {
                scanLine.style.animation = 'none';
                setTimeout(() => {
                    scanLine.style.animation = 'scan 2s linear infinite';
                }, 100);
            }
        }, 5000);
    }
}

// Initialize everything
setTimeout(() => {
    updateStats();
    setupAIDemo();
}, 1000);
