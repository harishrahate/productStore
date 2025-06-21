// Order Management System
function createOrder(cartItems, totals) {
    const user = getCurrentUser();
    if (!user) return null;
    
    const order = {
        id: generateOrderId(),
        userId: user.email,
        items: cartItems.map(item => ({...item})),
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        appliedCoupon: totals.appliedCoupon,
        status: 'confirmed',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    saveOrder(order);
    return order;
}

function generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function saveOrder(order) {
    const allOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    allOrders.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(allOrders));
    updateOrderCount();
}

function getOrderHistory() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const allOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    return allOrders.filter(order => order.userId === user.email);
}

function getOrderById(orderId) {
    const orders = getOrderHistory();
    return orders.find(order => order.id === orderId);
}

function formatOrderDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getOrderStatusColor(status) {
    const colors = {
        'confirmed': '#3498db',
        'processing': '#f39c12',
        'shipped': '#9b59b6',
        'delivered': '#27ae60',
        'cancelled': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
}

// Update order count in header
function updateOrderCount() {
    const orderCount = document.getElementById('order-count');
    if (!orderCount) return;
    
    const user = getCurrentUser();
    if (!user) {
        orderCount.textContent = '0';
        return;
    }
    
    const orders = getOrderHistory();
    orderCount.textContent = orders.length;
}

function displayOrderHistory() {
    const container = document.getElementById('order-history-container');
    if (!container) return;
    
    const orders = getOrderHistory();
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <div class="empty-icon">📦</div>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet. Start shopping to see your order history here!</p>
                <a href="index.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map((order, index) => `
        <div class="order-card" style="animation-delay: ${index * 0.1}s">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${formatOrderDate(order.orderDate)}</p>
                </div>
                <div class="order-status" style="background-color: ${getOrderStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.slice(0, 3).map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="item-details">
                            <h4>${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}</h4>
                            <p>Qty: ${item.quantity} × $${item.price}</p>
                        </div>
                    </div>
                `).join('')}
                ${order.items.length > 3 ? `<p class="more-items">+${order.items.length - 3} more items</p>` : ''}
            </div>
            
            <div class="order-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                ${order.discount > 0 ? `
                    <div class="summary-row discount">
                        <span>Discount:</span>
                        <span>-$${order.discount.toFixed(2)}</span>
                    </div>
                ` : ''}
                <div class="summary-row total">
                    <span><strong>Total:</strong></span>
                    <span><strong>$${order.total.toFixed(2)}</strong></span>
                </div>
            </div>
            
            <div class="order-actions">
                <button onclick="reorderItems('${order.id}')" class="btn-secondary">Reorder</button>
                <button onclick="viewOrderDetails('${order.id}')" class="btn-primary">View Details</button>
            </div>
        </div>
    `).join('');
}

function reorderItems(orderId) {
    const order = getOrderById(orderId);
    if (!order) return;
    
    let addedCount = 0;
    order.items.forEach(item => {
        addToCart(item.id, item.title, item.price, item.image);
        addedCount += item.quantity;
    });
    
    showToast(`${addedCount} items added to cart!`, 'success');
    setTimeout(() => window.location.href = 'cart.html', 1000);
}

function viewOrderDetails(orderId) {
    const order = getOrderById(orderId);
    if (!order) return;
    
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Order Details - #${order.id}</h2>
                <span class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="order-status-badge" style="background-color: ${getOrderStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </div>
                <p><strong>Order Date:</strong> ${formatOrderDate(order.orderDate)}</p>
                <p><strong>Estimated Delivery:</strong> ${formatOrderDate(order.estimatedDelivery)}</p>
                
                <h3>Items Ordered:</h3>
                <div class="modal-items">
                    ${order.items.map(item => `
                        <div class="modal-item">
                            <img src="${item.image}" alt="${item.title}">
                            <div>
                                <h4>${item.title}</h4>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: $${item.price} each</p>
                                <p><strong>Subtotal: $${(item.quantity * item.price).toFixed(2)}</strong></p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal.toFixed(2)}</span>
                    </div>
                    ${order.discount > 0 ? `
                        <div class="summary-row">
                            <span>Discount (${order.appliedCoupon?.code || ''}):</span>
                            <span>-$${order.discount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span><strong>Total Paid:</strong></span>
                        <span><strong>$${order.total.toFixed(2)}</strong></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Initialize order count when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateOrderCount();
});