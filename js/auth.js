// Authentication functions
function register(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(user => user.email === email)) {
        return false;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Update auth link immediately after login
        setTimeout(() => updateAuthLink(), 100);
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    const userProfile = document.getElementById('user-profile');
    const profileLink = document.getElementById('profile-link');
    const settingsLink = document.getElementById('settings-link');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.onclick = logout;
        
        if (userProfile) {
            userProfile.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">👤</div>
                    <div class="user-details">
                        <span class="user-name">${currentUser.name}</span>
                        <span class="user-email">${currentUser.email}</span>
                    </div>
                </div>
            `;
            userProfile.style.display = 'flex';
            userProfile.onclick = function() {
                window.location.href = 'profile.html';
            };
            userProfile.style.cursor = 'pointer';
        }
        
        // Show profile and settings links when logged in
        if (profileLink) profileLink.style.display = 'inline-block';
        if (settingsLink) settingsLink.style.display = 'inline-block';
        
        // Update counts
        if (typeof updateOrderCount === 'function') {
            updateOrderCount();
        }
        if (typeof updateWishlistCount === 'function') {
            updateWishlistCount();
        }
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        authLink.onclick = null;
        
        if (userProfile) {
            userProfile.style.display = 'none';
        }
        
        // Hide profile and settings links when logged out
        if (profileLink) profileLink.style.display = 'none';
        if (settingsLink) settingsLink.style.display = 'none';
        
        // Reset counts
        const orderCount = document.getElementById('order-count');
        if (orderCount) orderCount.textContent = '0';
        
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount) wishlistCount.textContent = '0';
        
        const cartCount = document.getElementById('cart-count');
        if (cartCount) cartCount.textContent = '0';
    }
}