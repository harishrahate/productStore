// Cart functions
function addToCart(id, title, price, image) {
    
    const cartItems = getCartItems();
    const existingItem = cartItems.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ id, title, price, image, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
    showToast('Product added to cart!', 'success');
}

function removeFromCart(id) {
    const cartItems = getCartItems().filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
    displayCartItems();
}

function updateQuantity(id, quantity) {
    const cartItems = getCartItems();
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
        item.quantity = Math.max(1, quantity);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartCount();
        displayCartItems();
        validateCurrentCoupon();
    }
}

function getCartItems() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function clearCart() {
    localStorage.removeItem('cart');
    removeCoupon();
    updateCartCount();
}

function validateCurrentCoupon() {
    const appliedCoupon = getAppliedCoupon();
    if (appliedCoupon) {
        const totals = calculateCartTotals();
        const validation = validateCoupon(appliedCoupon.code, totals.subtotal);
        if (!validation.valid) {
            removeCoupon();
            showCouponMessage(validation.message, 'error');
            updateCartTotals();
        }
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const items = getCartItems();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartItems = getCartItems();
    
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        updateCartTotals();
        return;
    }
    
    cartItemsContainer.innerHTML = cartItems.map(item => {
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p>${item.price}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    updateCartTotals();
}

function updateCartTotals() {
    const totals = calculateCartTotals();
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const discountElement = document.getElementById('cart-discount');
    const totalElement = document.getElementById('cart-total');
    const discountRow = document.getElementById('discount-row');
    const discountCode = document.getElementById('discount-code');
    
    if (subtotalElement) subtotalElement.textContent = totals.subtotal.toFixed(2);
    if (totalElement) totalElement.textContent = totals.total.toFixed(2);
    
    if (totals.appliedCoupon && totals.discount > 0) {
        if (discountElement) discountElement.textContent = totals.discount.toFixed(2);
        if (discountCode) discountCode.textContent = totals.appliedCoupon.code || '';
        if (discountRow) discountRow.style.display = 'flex';
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }
}