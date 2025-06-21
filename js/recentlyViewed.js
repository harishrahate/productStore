// Recently Viewed Products System
function addToRecentlyViewed(product) {
    let recentlyViewed = getRecentlyViewed();
    
    // Remove if already exists to avoid duplicates
    recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
    
    // Add to beginning of array
    recentlyViewed.unshift({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        viewedAt: new Date().toISOString()
    });
    
    // Keep only last 8 items
    recentlyViewed = recentlyViewed.slice(0, 8);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

function getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
}

function displayRecentlyViewed(containerId, limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const recentlyViewed = getRecentlyViewed().slice(0, limit);
    
    if (recentlyViewed.length === 0) {
        container.innerHTML = '<div class="empty-recent"><span>👁️</span><p>No recently viewed products</p></div>';
        return;
    }
    
    container.innerHTML = recentlyViewed.map((product, index) => `
        <div class="recent-card" style="animation-delay: ${index * 0.1}s">
            <div class="recent-badge">Recently Viewed</div>
            <div class="recent-image">
                <img src="${product.image}" alt="${product.title}">
                <div class="recent-overlay">
                    <button onclick="addToWishlist(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="recent-action wishlist ${isInWishlist(product.id) ? 'active' : ''}">♥</button>
                    <a href="product.html?id=${product.id}" class="recent-action view">👁️</a>
                </div>
            </div>
            <div class="recent-info">
                <h4>${product.title.substring(0, 40)}${product.title.length > 40 ? '...' : ''}</h4>
                <div class="recent-price">${product.price}</div>
                <button onclick="addToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="recent-cart-btn">🛒 Add to Cart</button>
            </div>
        </div>
    `).join('');
}