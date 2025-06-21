// Navigation Bar Component
function renderNavbar() {
    return `
        <nav class="navbar">
            <div class="nav-container">
                <h1 class="logo"><a href="index.html">🛍️ Product Store</a></h1>
                <div class="nav-links">
                    <div id="user-profile" class="user-profile" style="display: none;"></div>
                    <div class="dropdown">
                        <a href="index.html" class="dropdown-toggle">Products</a>
                        <div class="dropdown-menu">
                            <a href="electronics.html">Electronics</a>
                            <a href="clothing.html">Clothing</a>
                            <a href="jewelry.html">Jewelry</a>
                            <a href="index.html">All Products</a>
                        </div>
                    </div>
                    <a href="wishlist.html">Wishlist (<span id="wishlist-count">0</span>)</a>
                    <a href="cart.html">Cart (<span id="cart-count">0</span>)</a>
                    <a href="orders.html">Orders (<span id="order-count">0</span>)</a>
                    <a href="profile.html" id="profile-link" style="display: none;">Profile</a>
                    <a href="settings.html" id="settings-link" style="display: none;">Settings</a>
                    <a href="login.html" id="auth-link">Login</a>
                </div>
            </div>
        </nav>
    `;
}

function renderBreadcrumbs(items) {
    const breadcrumbItems = items.map((item, index) => {
        if (index === items.length - 1) {
            return `<li>${item.name}</li>`;
        }
        return `<li><a href="${item.url}">${item.name}</a></li>`;
    }).join('');
    
    return `
        <nav class="breadcrumbs">
            <ul id="breadcrumb-list">
                ${breadcrumbItems}
            </ul>
        </nav>
    `;
}

function loadNavbar(breadcrumbs = []) {
    const navbar = renderNavbar();
    const breadcrumbsHtml = breadcrumbs.length > 0 ? renderBreadcrumbs(breadcrumbs) : '';
    
    document.body.insertAdjacentHTML('afterbegin', navbar + breadcrumbsHtml);
}

// Auto-load navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get breadcrumbs from page data attribute or default
    const breadcrumbData = document.body.getAttribute('data-breadcrumbs');
    const breadcrumbs = breadcrumbData ? JSON.parse(breadcrumbData) : [{ name: 'Home', url: 'index.html' }];
    loadNavbar(breadcrumbs);
    
    // Update auth link after navbar is loaded
    setTimeout(() => {
        if (typeof updateAuthLink === 'function') {
            updateAuthLink();
        }
    }, 100);
});