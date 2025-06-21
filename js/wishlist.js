// Wishlist functions
function addToWishlist(id, title, price, image) {
    if (!getCurrentUser()) {
        showToast('Please login to add to wishlist', 'error');
        // Store the product info to add to wishlist after login
        sessionStorage.setItem('pendingWishlistItem', JSON.stringify({id, title, price, image}));
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    
    const wishlist = getWishlistItems();
    const existingItem = wishlist.find(item => item.id === id);
    
    if (existingItem) {
        showToast('Already in wishlist', 'info');
        return;
    }
    
    wishlist.push({ id, title, price, image });
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showToast('Added to wishlist!', 'success');
    updateWishlistCount();
    // Update auth link in case it wasn't updated
    updateAuthLink();
}

function removeFromWishlist(id) {
    const wishlist = getWishlistItems().filter(item => item.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showToast('Removed from wishlist', 'info');
    updateWishlistCount();
    if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistItems();
    }
}

function getWishlistItems() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount && getCurrentUser()) {
        wishlistCount.textContent = getWishlistItems().length;
    } else if (wishlistCount) {
        wishlistCount.style.display = 'none';
    }
}

function isInWishlist(id) {
    return getWishlistItems().some(item => item.id === id);
}

function displayWishlistItems() {
    const wishlistContainer = document.getElementById('wishlist-items');
    const wishlistItems = getWishlistItems();
    
    if (wishlistItems.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty</p>';
        return;
    }
    
    wishlistContainer.innerHTML = wishlistItems.map(item => `
        <div class="product-card">
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title.substring(0, 50)}${item.title.length > 50 ? '...' : ''}</h3>
            <p class="price">$${item.price}</p>
            <button onclick="addToCart(${item.id}, '${item.title.replace(/'/g, "\\'")}', ${item.price}, '${item.image}')" class="btn-primary">Add to Cart</button>
            <button onclick="removeFromWishlist(${item.id})" class="btn-secondary">Remove</button>
            <br><br>
            <a href="product.html?id=${item.id}" class="btn-primary" style="text-decoration: none; display: inline-block;">View Details</a>
        </div>
    `).join('');
}