// Coupon management system
const COUPONS = {
    'SAVE10': { discount: 10, type: 'percentage', minAmount: 50 },
    'SAVE20': { discount: 20, type: 'percentage', minAmount: 100 },
    'FLAT50': { discount: 50, type: 'fixed', minAmount: 200 },
    'WELCOME': { discount: 15, type: 'percentage', minAmount: 0 },
    'NEWUSER': { discount: 25, type: 'fixed', minAmount: 75 }
};

function validateCoupon(code, cartTotal) {
    const coupon = COUPONS[code.toUpperCase()];
    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' };
    }
    
    if (cartTotal < coupon.minAmount) {
        return { 
            valid: false, 
            message: `Minimum order amount $${coupon.minAmount} required` 
        };
    }
    
    return { valid: true, coupon };
}

function calculateDiscount(coupon, amount) {
    if (coupon.type === 'percentage') {
        return (amount * coupon.discount) / 100;
    } else {
        return Math.min(coupon.discount, amount);
    }
}

function getAppliedCoupon() {
    return JSON.parse(localStorage.getItem('appliedCoupon') || 'null');
}

function setAppliedCoupon(coupon) {
    localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
}

function removeCoupon() {
    localStorage.removeItem('appliedCoupon');
}

function calculateCartTotals() {
    const cartItems = getCartItems();
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const appliedCoupon = getAppliedCoupon();
    let discount = 0;
    
    if (appliedCoupon && subtotal >= appliedCoupon.minAmount) {
        discount = calculateDiscount(appliedCoupon, subtotal);
    }
    
    const total = subtotal - discount;
    
    return {
        subtotal: subtotal,
        discount: discount,
        total: Math.max(0, total),
        appliedCoupon: appliedCoupon
    };
}