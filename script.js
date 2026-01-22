// GlowSkin Clinic - Multi-Page Complete Script
// Supports Products + Services carts with LocalStorage sync

let productCart = JSON.parse(localStorage.getItem('skinClinicCart')) || [];
let serviceCart = JSON.parse(localStorage.getItem('skinClinicServices')) || [];

// DOM Elements (for cart.html and other pages)
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutSection = document.getElementById('checkout');
const checkoutForm = document.getElementById('checkoutForm');
const feedbackForm = document.getElementById('feedbackForm');

// --- GST support ---
const GST_RATE = 0.18; // 18% GST — change to required rate

function calculateTotals() {
    const subtotal = productCart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
        + serviceCart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const gst = Math.round((subtotal * GST_RATE) * 100) / 100; // two decimal rounding
    const total = Math.round((subtotal + gst) * 100) / 100;
    return { subtotal, gst, total };
}
// --- end GST support ---

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

// Update combined cart (items + totals)
function updateCombinedCart() {
    renderCartItems();
    renderCartTotals();
}

// Render cart items (products + services) into #cartItems
function renderCartItems() {
    if (!cartItems) return;
    if (productCart.length === 0 && serviceCart.length === 0) {
        cartItems.innerHTML = `<div class="empty-cart">Your cart is empty. Browse products and services to add items.</div>`;
        return;
    }

    let html = '';
    if (productCart.length) {
        html += '<h3>Products</h3>';
        productCart.forEach((item, idx) => {
            html += `
            <div class="cart-item" data-type="product" data-id="${item.id}">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <div>₹${Number(item.price).toFixed(2)} × ${item.quantity} = ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="decrease-qty" data-index="${idx}">-</button>
                    <span class="qty">${item.quantity}</span>
                    <button class="increase-qty" data-index="${idx}">+</button>
                    <button class="remove-item" data-type="product" data-index="${idx}">Remove</button>
                </div>
            </div>`;
        });
    }

    if (serviceCart.length) {
        html += '<h3>Services</h3>';
        serviceCart.forEach((item, idx) => {
            html += `
            <div class="cart-item" data-type="service" data-id="${item.id}">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <div>₹${Number(item.price).toFixed(2)} × ${item.quantity} = ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="decrease-svc-qty" data-index="${idx}">-</button>
                    <span class="qty">${item.quantity}</span>
                    <button class="increase-svc-qty" data-index="${idx}">+</button>
                    <button class="remove-item" data-type="service" data-index="${idx}">Remove</button>
                </div>
            </div>`;
        });
    }

    cartItems.innerHTML = html;

    // Attach listeners for inline controls
    cartItems.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.target.dataset.index);
            productCart[i].quantity = Number(productCart[i].quantity) + 1;
            saveCarts();
            updateCombinedCart();
        });
    });
    cartItems.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.target.dataset.index);
            productCart[i].quantity = Math.max(0, Number(productCart[i].quantity) - 1);
            if (productCart[i].quantity === 0) productCart.splice(i, 1);
            saveCarts();
            updateCombinedCart();
        });
    });
    cartItems.querySelectorAll('.increase-svc-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.target.dataset.index);
            serviceCart[i].quantity = Number(serviceCart[i].quantity) + 1;
            saveCarts();
            updateCombinedCart();
        });
    });
    cartItems.querySelectorAll('.decrease-svc-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.target.dataset.index);
            serviceCart[i].quantity = Math.max(0, Number(serviceCart[i].quantity) - 1);
            if (serviceCart[i].quantity === 0) serviceCart.splice(i, 1);
            saveCarts();
            updateCombinedCart();
        });
    });
    cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const i = Number(e.target.dataset.index);
            const type = e.target.dataset.type;
            if (type === 'product') productCart.splice(i, 1);
            else serviceCart.splice(i, 1);
            saveCarts();
            updateCombinedCart();
        });
    });
}

// Render subtotal, GST and total into #cartTotal
function renderCartTotals() {
    if (!cartTotal) return;
    const totals = calculateTotals();
    cartTotal.innerHTML = `
        <div>Subtotal: ₹${totals.subtotal.toFixed(2)}</div>
        <div>GST (${(GST_RATE * 100).toFixed(0)}%): ₹${totals.gst.toFixed(2)}</div>
        <div class="cart-grand-total"><strong>Total: ₹${totals.total.toFixed(2)}</strong></div>
    `;
    const count = productCart.reduce((s, i) => s + Number(i.quantity), 0) + serviceCart.reduce((s, i) => s + Number(i.quantity), 0);
    if (cartCount) cartCount.textContent = count;
}

// Save carts to localStorage
function saveCarts() {
    localStorage.setItem('skinClinicCart', JSON.stringify(productCart));
    localStorage.setItem('skinClinicServices', JSON.stringify(serviceCart));
}

// Setup checkout and some page event listeners
function setupCartEvents() {
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            document.querySelector('#cart')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const totals = calculateTotals();

            const orderSummary = {
                name: document.getElementById('customerName')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                address: document.getElementById('address')?.value || '',
                products: productCart,
                services: serviceCart,
                subtotal: totals.subtotal,
                gst: totals.gst,
                total: totals.total,
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
            saveCarts();
            updateCombinedCart();
            checkoutForm.reset();
        });
    }
}

// Feedback form setup (existing behavior preserved)
function setupFeedbackForm() {
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

        const csvContent = `${csvHeaders.join(',')}\n${csvRow.join(',')}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        feedbackForm.reset();
        alert('Thank you for your feedback!');
    });
}

// Functions used on products/services pages (unchanged logic, but keep totals updated)
window.changeServiceQty = function(id, delta) {
    const input = document.getElementById(`service-qty-${id}`);
    if (!input) return;
    let qty = parseInt(input.value) + delta;
    input.value = Math.max(0, qty);
};

window.updateServiceQty = function(id, qty) {
    const input = document.getElementById(`service-qty-${id}`);
    if (!input) return;
    input.value = Math.max(0, parseInt(qty) || 0);
};

window.bookService = function(serviceId) {
    const service = window.services?.find(s => s.id === serviceId); // services defined in services.html
    const qtyInput = document.getElementById(`service-qty-${serviceId}`);
    const qty = parseInt(qtyInput?.value) || 0;
    
    if (qty > 0 && service) {
        const existing = serviceCart.find(item => item.id === serviceId);
        if (existing) {
            existing.quantity += qty;
        } else {
            serviceCart.push({ ...service, quantity: qty });
        }
        saveCarts();
        qtyInput.value = 0;
        const btn = event?.target;
        if (btn) {
            btn.textContent = 'Booked!';
            btn.classList.add('booked');
            setTimeout(() => {
                btn.textContent = 'Book Service';
                btn.classList.remove('booked');
            }, 1500);
        }
        alert(`${qty} sessions booked!`);
        updateCombinedCart();
    }
};

window.addToCart = function(id) {
    const product = window.products?.find(p => p.id === id);
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput?.value) || 0;
    if (qty > 0 && product) {
        const existing = productCart.find(item => item.id === id);
        if (existing) existing.quantity += qty;
        else productCart.push({ ...product, quantity: qty });
        saveCarts();
        qtyInput.value = 0;
        const btn = event?.target;
        if (btn) {
            const original = btn.textContent;
            btn.textContent = 'Added! ✓';
            btn.classList.add('added');
            setTimeout(() => { btn.textContent = original; btn.classList.remove('added'); }, 1500);
        }
        updateCombinedCart();
    } else alert('Please select quantity!');
};

// Export for global access
window.productCart = productCart;
window.serviceCart = serviceCart;
window.updateCombinedCart = updateCombinedCart;
