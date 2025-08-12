// Profile page functionality

document.addEventListener('DOMContentLoaded', function() {
    (async () => {
        const authed = await checkAuthentication();
        if (!authed) return; // redirected
        await loadUserProfile();
        initializeProfileHandlers();
    })();
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch('/api/me', { credentials: 'include' });
        if (!response.ok) {
            // User not authenticated, redirect to login
            window.location.href = '/login.html';
            return false;
        }
        // Ensure JSON response
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            window.location.href = '/login.html';
            return false;
        }
        // Cache user info to avoid a second request
        const data = await response.json();
        window.__ME = data.user;
        return true;
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        // Use cached user from checkAuthentication if available
        let user = window.__ME;
        if (!user) {
            const response = await fetch('/api/me', { credentials: 'include' });
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to load profile');
            }
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error('Unexpected response');
            }
            const data = await response.json();
            user = data.user;
        }

        // Update profile display
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-company').textContent = user.company || 'No company specified';

        // Generate avatar initials
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        document.getElementById('avatar').textContent = initials;

        // Populate edit form
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-company').value = user.company || '';

    } catch (error) {
        console.error('Failed to load profile:', error);
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('Failed to load profile information', 'error');
        }
    }
}

// Initialize event handlers
function initializeProfileHandlers() {
    // Edit profile button
    document.getElementById('edit-profile-btn').addEventListener('click', function() {
        document.getElementById('edit-profile-form').style.display = 'block';
        document.getElementById('change-password-form').style.display = 'none';
    });

    // Change password button
    document.getElementById('change-password-btn').addEventListener('click', function() {
        document.getElementById('change-password-form').style.display = 'block';
        document.getElementById('edit-profile-form').style.display = 'none';
    });

    // Cancel edit profile
    document.getElementById('cancel-edit-btn').addEventListener('click', function() {
        document.getElementById('edit-profile-form').style.display = 'none';
        loadUserProfile(); // Reload original data
    });

    // Cancel change password
    document.getElementById('cancel-password-btn').addEventListener('click', function() {
        document.getElementById('change-password-form').style.display = 'none';
        document.getElementById('password-form').reset();
    });

    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);

    // Password form submission
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');

    if (!name || !email) {
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('Name and email are required', 'error');
        }
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        submitButton.innerHTML = '<span class="spinner"></span> Saving...';
        submitButton.disabled = true;

        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, company })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Profile updated successfully', 'success');
            }
            document.getElementById('edit-profile-form').style.display = 'none';
            loadUserProfile(); // Reload updated data
        } else {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification(data.message || 'Failed to update profile', 'error');
            }
        }
    } catch (error) {
        console.error('Profile update failed:', error);
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('Failed to update profile', 'error');
        }
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!currentPassword || !newPassword || !confirmPassword) {
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('All password fields are required', 'error');
        }
        return;
    }

    if (newPassword !== confirmPassword) {
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('New passwords do not match', 'error');
        }
        return;
    }

    if (newPassword.length < 6) {
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('New password must be at least 6 characters long', 'error');
        }
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        submitButton.innerHTML = '<span class="spinner"></span> Changing...';
        submitButton.disabled = true;

        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Password changed successfully', 'success');
            }
            document.getElementById('change-password-form').style.display = 'none';
            document.getElementById('password-form').reset();
        } else {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification(data.message || 'Failed to change password', 'error');
            }
        }
    } catch (error) {
        console.error('Password change failed:', error);
        if (window.SachiApp && window.SachiApp.showNotification) {
            window.SachiApp.showNotification('Failed to change password', 'error');
        }
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();

    try {
    const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            if (window.SachiApp && window.SachiApp.showNotification) {
                window.SachiApp.showNotification('Logged out successfully', 'success');
            }
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            // Even if logout fails on server, clear local state
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout failed:', error);
        // Even if logout fails, redirect to login
        window.location.href = '/';
    }
}
