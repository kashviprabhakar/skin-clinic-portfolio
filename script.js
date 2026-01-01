// GlowSkin Clinic - Multi-Page Complete Script
// Supports Products + Services carts with LocalStorage sync [web:1][web:12][web:18][web:19][web:21]

let productCart = JSON.parse(localStorage.getItem('skinClinicCart')) || [];
let serviceCart = JSON.parse(localStorage.getItem('skinClinicServices')) || [];

// DOM Elements (for cart.html and feedback.html)
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutSection = document.getElementById('checkout');
const checkoutForm = document.getElementById('checkoutForm');
const feedbackForm = document.getElementById('feedbackForm');

// Initialize on pages that need it
document.addEventListener('DOMContentLoaded', function() {
    // Only run on pages with these elements (cart.html, feedback.html)
    if (cartItems && cartCount && cartTotal) {
        updateCombinedCart();
        setupCartEvents();
    }
    if (feedbackForm) {
        setupFeedbackForm();
    }
});

// COMBINED CART - Products + Services
function updateCombinedCart() {
    const allItems = [...productCart, ...serviceCart];
    
    if (cartItems) {
        cartItems.innerHTML = allItems.length ? allItems.map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid #ecf0f1;">
                <div style="display:flex;align-items:center;">
                    <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;margin-right:1rem;">
                    <div>
                        <div style="font-weight:500;">${item.name}</div>
                        <small style="color:#666;">x${item.quantity}</small>
                    </div>
                </div>
                <div style="text-align:right;">
                    <strong style="color:#e91e63;">₹${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
            </div>
        `).join('') : '<p style="text-align:center;color:#666;padding:2rem;">Your cart is empty</p>';
    }

    const totalItems = allItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = `Total: ₹${totalPrice.toLocaleString()}`;
    
    if (checkoutBtn) checkoutBtn.style.display = totalItems > 0 ? 'block' : 'none';
    if (checkoutSection) checkoutSection.style.display = totalItems > 0 ? 'block' : 'none';
}

// Cart Event Listeners
function setupCartEvents() {
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            document.querySelector('#cart')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const orderSummary = {
                name: document.getElementById('customerName')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                address: document.getElementById('address')?.value || '',
                products: productCart,
                services: serviceCart,
                total: productCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
                       serviceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                timestamp: new Date().toLocaleString('en-IN')
            };
            
            // Save complete order
            let orders = JSON.parse(localStorage.getItem('skinClinicOrders')) || [];
            orders.push(orderSummary);
            localStorage.setItem('skinClinicOrders', JSON.stringify(orders));
            
            alert('Order confirmed! Cash on Delivery. Team will contact you soon.');
            
            // Clear carts
            productCart = [];
            serviceCart = [];
            localStorage.setItem('skinClinicCart', JSON.stringify(productCart));
            localStorage.setItem('skinClinicServices', JSON.stringify(serviceCart));
            updateCombinedCart();
            checkoutForm.reset();
        });
    }
}

// Feedback Form with Mobile Number (feedback.html)
function setupFeedbackForm() {
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const feedbackData = {
                name: document.getElementById('fbName').value,
                mobile: document.getElementById('fbMobile').value,
                email: document.getElementById('fbEmail')?.value || '',
                service: document.getElementById('fbService').value,
                rating: document.getElementById('fbRating').value,
                feedback: document.getElementById('fbFeedback').value,
                date: new Date().toLocaleString('en-IN')
            };

            // Save feedback
            let feedbacks = JSON.parse(localStorage.getItem('skinClinicFeedbacks')) || [];
            feedbacks.push(feedbackData);
            localStorage.setItem('skinClinicFeedbacks', JSON.stringify(feedbacks));

            // CSV Export (Excel/Notepad ready)
            const csvHeaders = ['Name', 'Mobile', 'Email', 'Service', 'Rating', 'Feedback', 'Date'];
            const csvRow = [
                feedbackData.name,
                feedbackData.mobile,
                feedbackData.email,
                feedbackData.service,
                feedbackData.rating,
                `"${feedbackData.feedback.replace(/"/g, '""')}"`,
                feedbackData.date
            ];
            
            const csvContent = [csvHeaders.join(','), csvRow.join(',')].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GlowSkin_Feedback_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            alert('Thank you! Feedback saved & CSV downloaded.');
            feedbackForm.reset();
        });
    }
}

// Global Functions (used by inline onclick in products/services pages)
window.changeQty = function(id, delta) {
    const input = document.getElementById(`qty-${id}`);
    let qty = parseInt(input.value) + delta;
    input.value = Math.max(0, qty);
};

window.updateQty = function(id, qty) {
    document.getElementById(`qty-${id}`).value = Math.max(0, parseInt(qty) || 0);
};

window.addToCart = function(productId) {
    const product = window.products?.find(p => p.id === productId); // products defined in products.html
    const qtyInput = document.getElementById(`qty-${productId}`);
    const qty = parseInt(qtyInput.value);
    
    if (qty > 0 && product) {
        const existing = productCart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += qty;
        } else {
            productCart.push({ ...product, quantity: qty });
        }
        localStorage.setItem('skinClinicCart', JSON.stringify(productCart));
        qtyInput.value = 0;
        event.target.textContent = 'Added!';
        event.target.style.background = '#4caf50';
        setTimeout(() => {
            event.target.textContent = 'Add to Cart';
            event.target.style.background = '#e91e63';
        }, 1500);
    }
};

window.changeServiceQty = function(id, delta) {
    const input = document.getElementById(`service-qty-${id}`);
    let qty = parseInt(input.value) + delta;
    input.value = Math.max(0, qty);
};

window.updateServiceQty = function(id, qty) {
    document.getElementById(`service-qty-${id}`).value = Math.max(0, parseInt(qty) || 0);
};

window.bookService = function(serviceId) {
    const service = window.services?.find(s => s.id === serviceId); // services defined in services.html
    const qtyInput = document.getElementById(`service-qty-${serviceId}`);
    const qty = parseInt(qtyInput.value);
    
    if (qty > 0 && service) {
        const existing = serviceCart.find(item => item.id === serviceId);
        if (existing) {
            existing.quantity += qty;
        } else {
            serviceCart.push({ ...service, quantity: qty });
        }
        localStorage.setItem('skinClinicServices', JSON.stringify(serviceCart));
        qtyInput.value = 0;
        event.target.textContent = 'Booked!';
        event.target.classList.add('booked');
        setTimeout(() => {
            event.target.textContent = 'Book Service';
            event.target.classList.remove('booked');
        }, 1500);
        alert(`${qty} sessions booked!`);
    }
};

// Export for global access
window.productCart = productCart;
window.serviceCart = serviceCart;
window.updateCombinedCart = updateCombinedCart;
