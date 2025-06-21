// Footer Component
function renderFooter() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('currentUser') !== null;
    
    // Account section links based on login status
    const accountLinks = isLoggedIn ? 
        `<ul>
            <li><a href="profile.html">Profile</a></li>
            <li><a href="settings.html">Settings</a></li>
            <li><a href="orders.html">Orders</a></li>
            <li><a href="#" id="footer-logout">Logout</a></li>
        </ul>` : 
        `<ul>
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Register</a></li>
        </ul>`;

    return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>🛍️ Product Store</h4>
                    <p>Your one-stop shop for quality products at great prices.</p>
                    <div class="social-icons">
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="cart.html">Cart</a></li>
                        ${isLoggedIn ? `<li><a href="wishlist.html">Wishlist</a></li>` : ''}
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Account</h4>
                    ${accountLinks}
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Returns</a></li>
                        <li><a href="#">Shipping</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Product Store. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
            </div>
        </footer>
    `;
}

function loadFooter() {
    document.body.insertAdjacentHTML('beforeend', renderFooter());
    
    // Add event listener for logout link
    const logoutLink = document.getElementById('footer-logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

// Auto-load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);