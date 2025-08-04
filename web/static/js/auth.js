// Authentication page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggle();
    initializePasswordValidation();
    initializeForgotPassword();
    initializeSocialAuth();
});

function initializePasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentNode.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

function initializePasswordValidation() {
    const passwordInput = document.querySelector('input[name="password"]');
    if (!passwordInput) return;
    
    const requirements = {
        length: document.getElementById('length-req'),
        uppercase: document.getElementById('uppercase-req'),
        number: document.getElementById('number-req')
    };
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        // Length requirement
        if (requirements.length) {
            if (password.length >= 8) {
                requirements.length.classList.add('valid');
                requirements.length.querySelector('i').className = 'fas fa-check';
            } else {
                requirements.length.classList.remove('valid');
                requirements.length.querySelector('i').className = 'fas fa-times';
            }
        }
        
        // Uppercase requirement
        if (requirements.uppercase) {
            if (/[A-Z]/.test(password)) {
                requirements.uppercase.classList.add('valid');
                requirements.uppercase.querySelector('i').className = 'fas fa-check';
            } else {
                requirements.uppercase.classList.remove('valid');
                requirements.uppercase.querySelector('i').className = 'fas fa-times';
            }
        }
        
        // Number requirement
        if (requirements.number) {
            if (/\d/.test(password)) {
                requirements.number.classList.add('valid');
                requirements.number.querySelector('i').className = 'fas fa-check';
            } else {
                requirements.number.classList.remove('valid');
                requirements.number.querySelector('i').className = 'fas fa-times';
            }
        }
    });
}

function initializeForgotPassword() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const modal = document.getElementById('forgot-password-modal');
    const closeButton = document.getElementById('modal-close');
    const cancelButton = document.getElementById('cancel-reset');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    if (!forgotPasswordLink || !modal) return;
    
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        forgotPasswordForm.reset();
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
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
                    window.SachiApp.showNotification('Password reset link sent to your email!', 'success');
                }
                
                closeModal();
                
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
}

function initializeSocialAuth() {
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const provider = this.classList.contains('google-btn') ? 'Google' : 'Microsoft';
            
            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = `<span class="spinner"></span> Connecting to ${provider}...`;
            this.disabled = true;
            
            // Simulate OAuth flow
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
                
                if (window.SachiApp && window.SachiApp.showNotification) {
                    window.SachiApp.showNotification(`${provider} authentication is coming soon!`, 'success');
                }
            }, 1500);
        });
    });
}

// Login form handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        // Basic validation
        if (!email || !password) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Please fill in all required fields.', 'error');
            }
            return;
        }
        
        const submitButton = this.querySelector('.auth-submit');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.innerHTML = '<span class="spinner"></span> Signing In...';
        submitButton.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful login
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Welcome back! Redirecting to dashboard...', 'success');
            }
            
            // Store remember me preference
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Simulate redirect to dashboard
            setTimeout(() => {
                window.location.href = '#dashboard'; // In real app, this would be the dashboard URL
            }, 1500);
            
        } catch (error) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Invalid email or password. Please try again.', 'error');
            }
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Register form handling
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'email', 'company', 'job_title', 'company_size', 'password'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Please fill in all required fields.', 'error');
            }
            return;
        }
        
        // Check if terms are agreed
        if (!data.terms) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Please agree to the Terms of Service and Privacy Policy.', 'error');
            }
            return;
        }
        
        // Validate password requirements
        const password = data.password;
        if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Password must meet all requirements.', 'error');
            }
            return;
        }
        
        const submitButton = this.querySelector('.auth-submit');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.innerHTML = '<span class="spinner"></span> Creating Account...';
        submitButton.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Simulate successful registration
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Account created successfully! Welcome to Sachi!', 'success');
            }
            
            // Simulate redirect to onboarding or dashboard
            setTimeout(() => {
                window.location.href = '#onboarding'; // In real app, this would be the onboarding URL
            }, 1500);
            
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

// Auto-fill email from URL parameter (for referral links)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const plan = urlParams.get('plan');
    
    if (email) {
        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = email;
        }
    }
    
    if (plan) {
        // Store selected plan for later use
        sessionStorage.setItem('selectedPlan', plan);
    }
});
