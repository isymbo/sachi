// Pricing page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializePricingToggle();
    initializeFAQ();
    initializePlanSelection();
    animateCounters();
});

function initializePricingToggle() {
    const toggle = document.getElementById('pricing-toggle');
    if (!toggle) return;
    
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');
    const monthlyBilling = document.querySelectorAll('.monthly-billing');
    const annualBilling = document.querySelectorAll('.annual-billing');
    
    toggle.addEventListener('change', function() {
        const isAnnual = this.checked;
        
        // Animate price changes
        monthlyPrices.forEach((price, index) => {
            const annualPrice = annualPrices[index];
            
            if (isAnnual) {
                // Fade out monthly, fade in annual
                price.style.opacity = '0';
                price.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    price.style.display = 'none';
                    annualPrice.style.display = 'inline';
                    annualPrice.style.opacity = '0';
                    annualPrice.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        annualPrice.style.opacity = '1';
                        annualPrice.style.transform = 'scale(1)';
                    }, 50);
                }, 150);
            } else {
                // Fade out annual, fade in monthly
                annualPrice.style.opacity = '0';
                annualPrice.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    annualPrice.style.display = 'none';
                    price.style.display = 'inline';
                    price.style.opacity = '0';
                    price.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        price.style.opacity = '1';
                        price.style.transform = 'scale(1)';
                    }, 50);
                }, 150);
            }
        });
        
        // Update billing notes
        monthlyBilling.forEach((billing, index) => {
            const annualBillingNote = annualBilling[index];
            
            if (isAnnual) {
                billing.style.display = 'none';
                annualBillingNote.style.display = 'inline';
            } else {
                billing.style.display = 'inline';
                annualBillingNote.style.display = 'none';
            }
        });
        
        // Add animation to pricing cards
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach((card, index) => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 100 + (index * 50));
        });
    });
    
    // Initialize with monthly view
    annualPrices.forEach(price => {
        price.style.display = 'none';
    });
    
    annualBilling.forEach(billing => {
        billing.style.display = 'none';
    });
}

function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = '0';
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = '0';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

function initializePlanSelection() {
    const planButtons = document.querySelectorAll('.pricing-card .btn');
    
    planButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const card = this.closest('.pricing-card');
            const planName = card.querySelector('.plan-name').textContent.toLowerCase();
            const isAnnual = document.getElementById('pricing-toggle').checked;
            
            // Store selected plan info
            const planInfo = {
                name: planName,
                billing: isAnnual ? 'annual' : 'monthly',
                timestamp: Date.now()
            };
            
            sessionStorage.setItem('selectedPlan', JSON.stringify(planInfo));
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // If it's a "Contact Sales" button, show contact form
            if (this.textContent.includes('Contact Sales')) {
                e.preventDefault();
                scrollToContactForm();
            }
        });
    });
}

function scrollToContactForm() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Highlight the contact form
        const contactForm = contactSection.querySelector('.contact-form');
        if (contactForm) {
            contactForm.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
            setTimeout(() => {
                contactForm.style.boxShadow = '';
            }, 2000);
        }
    }
}

function animateCounters() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('[data-target]');
                counters.forEach(counter => {
                    animateCounter(counter);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.story-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Contact form handling for sales inquiries
const salesForm = document.querySelector('.sales-form');
if (salesForm) {
    salesForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'company'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Please fill in all required fields.', 'error');
            }
            return;
        }
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        submitButton.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Thank you! Our sales team will contact you within 24 hours.', 'success');
            }
            
            // Reset form
            this.reset();
            
        } catch (error) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Something went wrong. Please try again.', 'error');
            }
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Add hover effects to pricing cards
document.addEventListener('DOMContentLoaded', function() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('featured')) {
                this.style.transform = 'scale(1.05)';
            } else {
                this.style.transform = '';
            }
        });
    });
});

// Pricing calculator (for future enhancement)
function calculatePricing(events, users, plan = 'professional') {
    const pricingMatrix = {
        starter: { base: 29, eventsIncluded: 10000, usersIncluded: 3 },
        professional: { base: 99, eventsIncluded: 100000, usersIncluded: 10 },
        enterprise: { base: 299, eventsIncluded: Infinity, usersIncluded: Infinity }
    };
    
    const planData = pricingMatrix[plan];
    if (!planData) return null;
    
    let totalPrice = planData.base;
    
    // Add extra events cost (if applicable)
    if (events > planData.eventsIncluded && planData.eventsIncluded !== Infinity) {
        const extraEvents = events - planData.eventsIncluded;
        const eventTiers = [
            { max: 50000, price: 0.001 },
            { max: 200000, price: 0.0008 },
            { max: Infinity, price: 0.0005 }
        ];
        
        let remainingEvents = extraEvents;
        for (const tier of eventTiers) {
            const eventsInTier = Math.min(remainingEvents, tier.max);
            totalPrice += eventsInTier * tier.price;
            remainingEvents -= eventsInTier;
            if (remainingEvents <= 0) break;
        }
    }
    
    // Add extra users cost (if applicable)
    if (users > planData.usersIncluded && planData.usersIncluded !== Infinity) {
        const extraUsers = users - planData.usersIncluded;
        totalPrice += extraUsers * 15; // $15 per additional user
    }
    
    return Math.round(totalPrice);
}

// Export for use in other files
window.SachiPricing = {
    calculatePricing,
    scrollToContactForm
};
