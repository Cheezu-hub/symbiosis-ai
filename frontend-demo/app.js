/**
 * SymbioTech - App JavaScript
 * Handles page loading, counter animations, and interactive elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Page Loader
    // ==========================================
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(() => loader.remove(), 500);
        }, 900);
    }

    // ==========================================
    // Counter Animation (Intersection Observer)
    // ==========================================
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 1500;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easedProgress * target);
            
            el.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCounter);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ==========================================
    // Fade-in-up Animation Observer
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-in-up');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        fadeObserver.observe(el);
    });

    // ==========================================
    // Distance Slider (Marketplace Page)
    // ==========================================
    const distanceSlider = document.getElementById('distance-slider');
    const distanceValue = document.getElementById('distance-value');
    if (distanceSlider && distanceValue) {
        distanceSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            distanceValue.textContent = val >= 100 ? '100+ km' : `${val} km`;
        });
    }

    // ==========================================
    // Search Input Focus Animation
    // ==========================================
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('ring-1', 'ring-primary/30', 'rounded-full');
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('ring-1', 'ring-primary/30', 'rounded-full');
        });
    }

    // ==========================================
    // Notification Badge Click
    // ==========================================
    const notifBtn = document.getElementById('btn-notifications');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            const badge = notifBtn.querySelector('.bg-error');
            if (badge) {
                badge.style.transition = 'opacity 0.3s, transform 0.3s';
                badge.style.opacity = '0';
                badge.style.transform = 'scale(0)';
                setTimeout(() => badge.remove(), 300);
            }
        });
    }

    // ==========================================
    // Active Nav Highlight on Current Page
    // ==========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('aside nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('text-[#58e077]', 'bg-[#282a2c]', 'rounded-r-lg', 'border-l-4', 'border-[#58e077]');
            link.classList.remove('opacity-60', 'hover:opacity-100', 'hover:bg-[#333537]');
        }
    });

    // ==========================================
    // Table Row Hover Ripple Effect
    // ==========================================
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transition = 'background-color 0.3s ease';
        });
    });

    // ==========================================
    // Card Click Feedback
    // ==========================================
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });

    // ==========================================
    // Sustainability Ring Animation (Dashboard)
    // ==========================================
    const ringCircle = document.querySelector('.progress-ring-circle');
    if (ringCircle) {
        const ringObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    ringCircle.style.animationPlayState = 'running';
                    ringObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        ringCircle.style.animationPlayState = 'paused';
        ringObserver.observe(ringCircle);
    }

    // ==========================================
    // Keyboard Navigation Enhancement
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const search = document.getElementById('search-input');
            if (search) search.focus();
        }
    });

    // ==========================================
    // Smooth Page Transitions
    // ==========================================
    const internalLinks = document.querySelectorAll('a[href$=".html"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.2s ease';
                setTimeout(() => {
                    window.location.href = href;
                }, 200);
            }
        });
    });

    // ==========================================
    // Floating Action Button Tooltips
    // ==========================================
    const fabButtons = document.querySelectorAll('.glass-panel button');
    fabButtons.forEach(btn => {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            const text = icon.textContent.trim();
            const labels = {
                'map': 'Network Map',
                'analytics': 'Analytics View'
            };
            if (labels[text]) {
                btn.setAttribute('title', labels[text]);
            }
        }
    });

    // ==========================================
    // Console welcome message
    // ==========================================
    console.log(
        '%c⚡ SymbioTech Industrial Command %c v1.0 ',
        'background: linear-gradient(135deg, #58e077, #2ebd59); color: #002108; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
        'background: #1a1c1e; color: #e2e2e5; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
});
