// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update auth link and user profile
    updateAuthLink();
    
    // Load user profile data
    loadUserProfile();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load user stats
    loadUserStats();
    
    // Initialize password strength meter
    initPasswordStrengthMeter();
    
    // Initialize toggle password visibility
    initPasswordToggle();
    
    // Initialize profile edit functionality
    initProfileEdit();
    
    // Initialize notification preferences
    initNotificationPreferences();
    
    // Add animation to stats cards
    animateStatsCards();
});

// Load user profile data
function loadUserProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Please log in to access your profile', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Set profile name and email
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Set member since date (using current year as placeholder)
    const currentYear = new Date().getFullYear();
    document.getElementById('member-since').textContent = currentYear;
    
    // Load additional profile data if available
    const profileData = JSON.parse(localStorage.getItem(`profile_${currentUser.email}`) || '{}');
    
    // Populate form fields
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('edit-phone').value = profileData.phone || '';
    document.getElementById('edit-address').value = profileData.address || '';
    
    // Populate view fields
    document.getElementById('view-name').textContent = currentUser.name;
    document.getElementById('view-email').textContent = currentUser.email;
    document.getElementById('view-phone').textContent = profileData.phone || 'Not provided';
    document.getElementById('view-address').textContent = profileData.address || 'Not provided';
    
    // Load profile image if available
    if (profileData.avatar) {
        document.getElementById('default-avatar').style.display = 'none';
        const avatarImage = document.getElementById('avatar-image');
        avatarImage.src = profileData.avatar;
        avatarImage.style.display = 'block';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Password form submission
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
    
    // New password input for strength meter
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Save notification preferences
    const notificationToggles = document.querySelectorAll('.notification-option input[type="checkbox"]');
    notificationToggles.forEach(toggle => {
        toggle.addEventListener('change', saveNotificationPreferences);
    });
    
    // Avatar upload
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
}

// Update user profile
function updateProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const name = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const address = document.getElementById('edit-address').value.trim();
    
    if (!name || !email) {
        showToast('Name and email are required', 'error');
        return;
    }
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        // Check if email is being changed and if it's already in use
        if (email !== currentUser.email && users.some(u => u.email === email)) {
            showToast('Email is already in use', 'error');
            return;
        }
        
        users[userIndex].name = name;
        users[userIndex].email = email;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user
        currentUser.name = name;
        currentUser.email = email;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Get existing profile data to preserve avatar if it exists
        const existingProfileData = JSON.parse(localStorage.getItem(`profile_${currentUser.email}`) || '{}');
        
        // Save additional profile data
        const profileData = {
            phone,
            address,
            avatar: existingProfileData.avatar || null
        };
        localStorage.setItem(`profile_${email}`, JSON.stringify(profileData));
        
        // Update displayed name and email
        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-email').textContent = email;
        document.getElementById('view-name').textContent = name;
        document.getElementById('view-email').textContent = email;
        document.getElementById('view-phone').textContent = phone || 'Not provided';
        document.getElementById('view-address').textContent = address || 'Not provided';
        
        showToast('Profile updated successfully', 'success');
        
        // Update auth link to reflect name change
        updateAuthLink();
        
        // Switch back to view mode
        toggleProfileEdit(false);
    } else {
        showToast('User not found', 'error');
    }
}

// Change user password
function changePassword() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('All password fields are required', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    // Check password strength
    const strength = calculatePasswordStrength(newPassword);
    if (strength < 2) {
        showToast('Please choose a stronger password', 'error');
        return;
    }
    
    // Verify current password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email && u.password === currentPassword);
    
    if (userIndex !== -1) {
        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
        // Reset password strength meter
        updatePasswordStrength();
        
        showToast('Password changed successfully', 'success');
    } else {
        showToast('Current password is incorrect', 'error');
    }
}

// Load user stats
function loadUserStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get orders
    const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    const userOrders = orders.filter(order => order.userId === currentUser.email);
    
    // Total orders
    document.getElementById('total-orders').textContent = userOrders.length;
    
    // Total spent
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('total-spent').textContent = `$${totalSpent.toFixed(2)}`;
    
    // Wishlist items
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    document.getElementById('wishlist-items').textContent = wishlist.length;
}

// Initialize password strength meter
function initPasswordStrengthMeter() {
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
}

// Update password strength meter
function updatePasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    
    if (!password) {
        strengthBar.style.width = '0';
        strengthBar.style.backgroundColor = '#e9ecef';
        strengthText.textContent = 'Password strength';
        return;
    }
    
    const strength = calculatePasswordStrength(password);
    
    // Update strength bar
    strengthBar.style.width = `${(strength / 4) * 100}%`;
    
    // Update color and text based on strength
    if (strength === 0) {
        strengthBar.style.backgroundColor = '#e74c3c';
        strengthText.textContent = 'Very weak';
    } else if (strength === 1) {
        strengthBar.style.backgroundColor = '#e67e22';
        strengthText.textContent = 'Weak';
    } else if (strength === 2) {
        strengthBar.style.backgroundColor = '#f1c40f';
        strengthText.textContent = 'Medium';
    } else if (strength === 3) {
        strengthBar.style.backgroundColor = '#2ecc71';
        strengthText.textContent = 'Strong';
    } else {
        strengthBar.style.backgroundColor = '#27ae60';
        strengthText.textContent = 'Very strong';
    }
}

// Calculate password strength (0-4)
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    
    // Contains numbers
    if (/\d/.test(password)) strength += 1;
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
}

// Initialize toggle password visibility
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Initialize profile edit functionality
function initProfileEdit() {
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit');
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            toggleProfileEdit(true);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            toggleProfileEdit(false);
        });
    }
}

// Toggle profile edit mode
function toggleProfileEdit(showEdit) {
    const viewSection = document.getElementById('profile-view');
    const editForm = document.getElementById('profile-form');
    
    if (showEdit) {
        viewSection.style.display = 'none';
        editForm.style.display = 'grid';
    } else {
        viewSection.style.display = 'grid';
        editForm.style.display = 'none';
    }
}

// Initialize notification preferences
function initNotificationPreferences() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Load saved preferences or set defaults
    const preferences = JSON.parse(localStorage.getItem(`notifications_${currentUser.email}`) || '{}');
    
    // Set toggle states
    document.getElementById('order-notifications').checked = preferences.orders !== false; // Default to true
    document.getElementById('promo-notifications').checked = preferences.promos !== false; // Default to true
    document.getElementById('recommendation-notifications').checked = preferences.recommendations === true; // Default to false
}

// Save notification preferences
function saveNotificationPreferences() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const preferences = {
        orders: document.getElementById('order-notifications').checked,
        promos: document.getElementById('promo-notifications').checked,
        recommendations: document.getElementById('recommendation-notifications').checked
    };
    
    localStorage.setItem(`notifications_${currentUser.email}`, JSON.stringify(preferences));
    showToast('Notification preferences saved', 'success');
}

// Animate stats cards
function animateStatsCards() {
    const cards = document.querySelectorAll('.stat-card');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Display the image
        const defaultAvatar = document.getElementById('default-avatar');
        const avatarImage = document.getElementById('avatar-image');
        
        defaultAvatar.style.display = 'none';
        avatarImage.src = e.target.result;
        avatarImage.style.display = 'block';
        
        // Save the image to profile data
        saveAvatarToProfile(e.target.result);
    };
    
    reader.readAsDataURL(file);
}

// Save avatar to profile data
function saveAvatarToProfile(avatarData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get existing profile data
    const profileData = JSON.parse(localStorage.getItem(`profile_${currentUser.email}`) || '{}');
    
    // Add avatar data
    profileData.avatar = avatarData;
    
    // Save updated profile data
    localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(profileData));
    
    showToast('Profile picture updated successfully', 'success');
}