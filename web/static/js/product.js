// Product page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDemoVideo();
    initializeFeatureAnimations();
    initializeRealtimeDashboard();
    initializeAIInsights();
    initializePredictionChart();
});

function initializeDemoVideo() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (!videoPlaceholder) return;
    
    videoPlaceholder.addEventListener('click', function() {
        // In a real application, this would open a video modal or redirect to video
        const playButton = this.querySelector('.play-button');
        
        // Animate play button
        playButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            playButton.style.transform = 'scale(1.1)';
        }, 100);
        
        setTimeout(() => {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Demo video is coming soon! Contact us for a live demo.', 'success');
            }
        }, 200);
    });
}

function initializeFeatureAnimations() {
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const featureSection = entry.target;
                
                // Animate feature text
                const featureText = featureSection.querySelector('.feature-text');
                if (featureText) {
                    featureText.style.opacity = '0';
                    featureText.style.transform = 'translateX(-30px)';
                    
                    setTimeout(() => {
                        featureText.style.transition = 'all 0.6s ease-out';
                        featureText.style.opacity = '1';
                        featureText.style.transform = 'translateX(0)';
                    }, 100);
                }
                
                // Animate feature visual
                const featureVisual = featureSection.querySelector('.feature-visual');
                if (featureVisual) {
                    featureVisual.style.opacity = '0';
                    featureVisual.style.transform = 'translateX(30px)';
                    
                    setTimeout(() => {
                        featureVisual.style.transition = 'all 0.6s ease-out';
                        featureVisual.style.opacity = '1';
                        featureVisual.style.transform = 'translateX(0)';
                    }, 200);
                }
                
                observer.unobserve(featureSection);
            }
        });
    }, observerOptions);
    
    const featureSections = document.querySelectorAll('.feature-section');
    featureSections.forEach(section => {
        observer.observe(section);
    });
}

function initializeRealtimeDashboard() {
    const realtimeDashboard = document.querySelector('.realtime-dashboard');
    if (!realtimeDashboard) return;
    
    // Animate the counting metric
    const countingElement = realtimeDashboard.querySelector('.counting');
    if (countingElement) {
        const target = parseInt(countingElement.getAttribute('data-target')) || 1247;
        animateCounter(countingElement, target, 2000);
    }
    
    // Simulate real-time updates
    setInterval(() => {
        if (countingElement) {
            const currentValue = parseInt(countingElement.textContent);
            const newValue = currentValue + Math.floor(Math.random() * 20) - 10;
            const clampedValue = Math.max(1000, Math.min(2000, newValue));
            
            countingElement.style.transition = 'all 0.3s ease';
            countingElement.style.transform = 'scale(1.1)';
            countingElement.textContent = clampedValue;
            
            setTimeout(() => {
                countingElement.style.transform = 'scale(1)';
            }, 150);
        }
    }, 3000);
}

function initializeAIInsights() {
    const insightsList = document.querySelector('.insights-list');
    if (!insightsList) return;
    
    const insights = [
        {
            type: 'anomaly',
            icon: 'fas fa-exclamation-triangle',
            title: 'Anomaly Detected',
            description: 'Traffic spike 340% above normal in Region A',
            time: '2 minutes ago'
        },
        {
            type: 'trend',
            icon: 'fas fa-chart-line',
            title: 'Trend Identified',
            description: 'User engagement increased 23% after UI update',
            time: '15 minutes ago'
        },
        {
            type: 'prediction',
            icon: 'fas fa-crystal-ball',
            title: 'Prediction Alert',
            description: 'Revenue likely to exceed target by 15% this quarter',
            time: '1 hour ago'
        },
        {
            type: 'optimization',
            icon: 'fas fa-lightbulb',
            title: 'Optimization Suggestion',
            description: 'Consider A/B testing new checkout flow',
            time: '2 hours ago'
        },
        {
            type: 'alert',
            icon: 'fas fa-bell',
            title: 'Performance Alert',
            description: 'Server response time improved by 45ms',
            time: '3 hours ago'
        }
    ];
    
    let currentInsightIndex = 0;
    
    // Simulate new insights appearing
    setInterval(() => {
        const currentInsights = insightsList.querySelectorAll('.insight-item');
        
        // Remove oldest insight if we have 3 or more
        if (currentInsights.length >= 3) {
            const oldestInsight = currentInsights[currentInsights.length - 1];
            oldestInsight.style.opacity = '0';
            oldestInsight.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                oldestInsight.remove();
            }, 300);
        }
        
        // Add new insight at the top
        const newInsight = insights[currentInsightIndex % insights.length];
        const insightElement = createInsightElement(newInsight);
        
        insightElement.style.opacity = '0';
        insightElement.style.transform = 'translateX(-100%)';
        
        insightsList.insertBefore(insightElement, insightsList.firstChild);
        
        setTimeout(() => {
            insightElement.style.transition = 'all 0.3s ease';
            insightElement.style.opacity = '1';
            insightElement.style.transform = 'translateX(0)';
        }, 50);
        
        currentInsightIndex++;
    }, 8000);
}

function createInsightElement(insight) {
    const element = document.createElement('div');
    element.className = 'insight-item';
    element.innerHTML = `
        <div class="insight-icon ${insight.type}">
            <i class="${insight.icon}"></i>
        </div>
        <div class="insight-content">
            <h4>${insight.title}</h4>
            <p>${insight.description}</p>
            <span class="insight-time">Just now</span>
        </div>
    `;
    return element;
}

function initializePredictionChart() {
    const predictionChart = document.querySelector('.prediction-chart');
    if (!predictionChart) return;
    
    const controls = predictionChart.querySelectorAll('.control');
    const chartArea = predictionChart.querySelector('.chart-area');
    
    controls.forEach(control => {
        control.addEventListener('click', function() {
            // Remove active class from all controls
            controls.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked control
            this.classList.add('active');
            
            // Animate chart update
            if (chartArea) {
                chartArea.style.opacity = '0.5';
                chartArea.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    chartArea.style.transition = 'all 0.3s ease';
                    chartArea.style.opacity = '1';
                    chartArea.style.transform = 'scale(1)';
                }, 200);
            }
            
            // Show notification about the time period change
            const period = this.textContent;
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification(`Forecast updated for ${period} period`, 'success');
            }
        });
    });
}

function animateCounter(element, target, duration) {
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

// Initialize integration hover effects
document.addEventListener('DOMContentLoaded', function() {
    const integrationItems = document.querySelectorAll('.integration-item');
    
    integrationItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
});

// Security feature interactions
document.addEventListener('DOMContentLoaded', function() {
    const securityFeatures = document.querySelectorAll('.security-feature');
    
    securityFeatures.forEach((feature, index) => {
        feature.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.security-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
            }
        });
        
        feature.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.security-icon');
            if (icon) {
                icon.style.transform = '';
                icon.style.boxShadow = '';
            }
        });
        
        // Stagger animation on page load
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            feature.style.transition = 'all 0.6s ease-out';
            feature.style.opacity = '1';
            feature.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
});

// Add scroll-triggered animations for metrics
function initializeMetricsAnimation() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const metrics = entry.target.querySelectorAll('.metric-value');
                metrics.forEach((metric, index) => {
                    setTimeout(() => {
                        metric.style.animation = 'pulse 0.6s ease-out';
                    }, index * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const metricsContainers = document.querySelectorAll('.metrics-row, .metrics-grid');
    metricsContainers.forEach(container => {
        observer.observe(container);
    });
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', function() {
    initializeMetricsAnimation();
    
    // Add CSS animation for pulse effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); color: var(--primary-color); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other files
window.SachiProduct = {
    animateCounter,
    createInsightElement
};
