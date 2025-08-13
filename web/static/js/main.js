// Main JavaScript file for Sachi landing page

// Initialize the Sachi app object
window.SachiApp = {
        showNotification: function(message, type = 'info') {
                // Ensure toaster container exists (Basecoat toast container)
                let toaster = document.querySelector('.toaster');
                if (!toaster) {
                        toaster = document.createElement('div');
                        toaster.className = 'toaster';
                        toaster.setAttribute('data-align', 'end');
                        document.body.appendChild(toaster);
                }

                // Create toast element per Basecoat structure
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.setAttribute('role', 'status');
                toast.setAttribute('aria-live', 'polite');

                // Title by type
                const title = type === 'success' ? 'Success'
                                        : type === 'error' ? 'Error'
                                        : type === 'warning' ? 'Warning' : 'Notice';

                // Optional variant accent via inline border-left to hint type
                const accent = type === 'success' ? '142.1 70.6% 45.3%'
                                        : type === 'error' ? 'var(--destructive)'
                                        : type === 'warning' ? '40 100% 50%'
                                        : 'var(--ring)';

                toast.innerHTML = `
                    <div class="toast-content" style="border-left: 3px solid hsl(${accent});">
                        <section>
                            <h2>${title}</h2>
                            <p>${message}</p>
                        </section>
                    </div>
                `;

                toaster.appendChild(toast);

                // Auto-hide after 4 seconds
                const hide = () => {
                        if (!toast.isConnected) return;
                        toast.setAttribute('aria-hidden', 'true');
                        // Remove after transition
                        setTimeout(() => toast.remove(), 350);
                };

                setTimeout(hide, 4000);
        }
};

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation classes when elements come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all feature cards and testimonial cards
    const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .metric-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Form validation for registration/login pages
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
    
    console.log('Sachi landing page loaded successfully!');
});
