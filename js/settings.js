// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update auth link and user profile
    updateAuthLink();
    
    // Update counts
    updateCartCount();
    updateWishlistCount();
    updateOrderCount();
    
    // Initialize settings navigation
    initSettingsNav();
    
    // Load user settings if available
    loadUserSettings();
    
    // Add event listeners for settings forms
    setupEventListeners();
});

// Initialize settings navigation
function initSettingsNav() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Skip if it's the profile link
            if (this.getAttribute('href') === 'profile.html') {
                return;
            }
            
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section, hide others
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

// Load user settings from localStorage
function loadUserSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Please log in to access your settings', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Load settings from localStorage or use defaults
    const userSettings = JSON.parse(localStorage.getItem(`settings_${currentUser.email}`) || '{}');
    
    // Apply notification settings
    if (userSettings.notifications) {
        const notifSettings = userSettings.notifications;
        document.querySelector('#notifications input[name="order-updates"]').checked = notifSettings.orderUpdates ?? true;
        document.querySelector('#notifications input[name="promotions"]').checked = notifSettings.promotions ?? true;
        document.querySelector('#notifications input[name="recommendations"]').checked = notifSettings.recommendations ?? false;
        document.querySelector('#notifications input[name="email-notifications"]').checked = notifSettings.emailNotifications ?? true;
    }
    
    // Apply privacy settings
    if (userSettings.privacy) {
        const privacySettings = userSettings.privacy;
        document.querySelector('#privacy select[name="profile-visibility"]').value = privacySettings.profileVisibility || 'friends';
        document.querySelector('#privacy input[name="search-visibility"]').checked = privacySettings.searchVisibility ?? false;
        document.querySelector('#privacy input[name="data-collection"]').checked = privacySettings.dataCollection ?? true;
    }
    
    // Apply appearance settings
    if (userSettings.appearance) {
        const appearanceSettings = userSettings.appearance;
        const themeInputs = document.querySelectorAll('#appearance input[name="theme"]');
        const themeValue = appearanceSettings.theme || 'light';
        
        themeInputs.forEach(input => {
            if (input.value === themeValue) {
                input.checked = true;
            }
        });
        
        document.querySelector('#appearance input[name="font-size"]').value = appearanceSettings.fontSize || 3;
    }
}

// Setup event listeners for settings forms
function setupEventListeners() {
    // Notification preferences form
    const notificationForm = document.querySelector('#notifications .settings-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNotificationSettings();
        });
    }
    
    // Privacy settings form
    const privacyForm = document.querySelector('#privacy .settings-form');
    if (privacyForm) {
        privacyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePrivacySettings();
        });
    }
    
    // Appearance settings form
    const appearanceForm = document.querySelector('#appearance .settings-form');
    if (appearanceForm) {
        appearanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAppearanceSettings();
        });
    }
    
    // Add payment method button
    const addPaymentBtn = document.querySelector('.add-payment-btn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', function() {
            showToast('Payment method functionality coming soon!', 'info');
        });
    }
    
    // Add address button
    const addAddressBtn = document.querySelector('.add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            showToast('Address management functionality coming soon!', 'info');
        });
    }
    
    // Payment card action buttons
    const paymentActionBtns = document.querySelectorAll('.card-actions button');
    paymentActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Payment method management coming soon!', 'info');
        });
    });
    
    // Address card action buttons
    const addressActionBtns = document.querySelectorAll('.address-actions button');
    addressActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Address management coming soon!', 'info');
        });
    });
}

// Save notification settings
function saveNotificationSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userSettings = JSON.parse(localStorage.getItem(`settings_${currentUser.email}`) || '{}');
    
    userSettings.notifications = {
        orderUpdates: document.querySelector('#notifications input[name="order-updates"]').checked,
        promotions: document.querySelector('#notifications input[name="promotions"]').checked,
        recommendations: document.querySelector('#notifications input[name="recommendations"]').checked,
        emailNotifications: document.querySelector('#notifications input[name="email-notifications"]').checked
    };
    
    localStorage.setItem(`settings_${currentUser.email}`, JSON.stringify(userSettings));
    showToast('Notification preferences saved!', 'success');
}

// Save privacy settings
function savePrivacySettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userSettings = JSON.parse(localStorage.getItem(`settings_${currentUser.email}`) || '{}');
    
    userSettings.privacy = {
        profileVisibility: document.querySelector('#privacy select[name="profile-visibility"]').value,
        searchVisibility: document.querySelector('#privacy input[name="search-visibility"]').checked,
        dataCollection: document.querySelector('#privacy input[name="data-collection"]').checked
    };
    
    localStorage.setItem(`settings_${currentUser.email}`, JSON.stringify(userSettings));
    showToast('Privacy settings updated!', 'success');
}

// Save appearance settings
function saveAppearanceSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userSettings = JSON.parse(localStorage.getItem(`settings_${currentUser.email}`) || '{}');
    
    const themeInputs = document.querySelectorAll('#appearance input[name="theme"]');
    let selectedTheme = 'light';
    
    themeInputs.forEach(input => {
        if (input.checked) {
            selectedTheme = input.value;
        }
    });
    
    userSettings.appearance = {
        theme: selectedTheme,
        fontSize: document.querySelector('#appearance input[name="font-size"]').value
    };
    
    localStorage.setItem(`settings_${currentUser.email}`, JSON.stringify(userSettings));
    showToast('Appearance settings saved!', 'success');
    
    // Apply theme changes
    applyTheme(selectedTheme);
}

// Apply theme changes
function applyTheme(theme) {
    // This would be implemented to change the site theme
    // For now, just show a toast
    showToast(`Theme changed to ${theme}!`, 'info');
}