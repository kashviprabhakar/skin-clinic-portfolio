// Improved Feedback Form Validation
function validateFeedbackForm() {
    const name = document.getElementById('fbName').value.trim();
    const mobile = document.getElementById('fbMobile').value.trim();
    const email = document.getElementById('fbEmail').value.trim();

    // JavaScript Regular Expressions (Fixed)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberPattern = /^[6-9]\d{9}$/; // 10-digit Indian mobile
    const namePattern = /^[a-zA-Z\s]{2,30}$/; // Letters only, 2-30 chars

    // Clear previous errors
    clearValidationErrors();

    let isValid = true;

    // Name validation
    if (!namePattern.test(name)) {
        showError('fbName', 'Name should contain only letters (2-30 characters)');
        isValid = false;
    }

    // Mobile validation (10-digit Indian number)
    if (!numberPattern.test(mobile)) {
        showError('fbMobile', 'Enter valid 10-digit mobile number (starts with 6-9)');
        isValid = false;
    }

    // Email validation (optional)
    if (email && !emailPattern.test(email)) {
        showError('fbEmail', 'Enter valid email address');
        isValid = false;
    }

    // Required fields
    if (!document.getElementById('fbService').value.trim()) {
        showError('fbService', 'Service is required');
        isValid = false;
    }
    if (!document.getElementById('fbRating').value) {
        showError('fbRating', 'Rating is required');
        isValid = false;
    }
    if (!document.getElementById('fbFeedback').value.trim()) {
        showError('fbFeedback', 'Feedback is required');
        isValid = false;
    }

    return isValid;
}

// Helper functions for error display
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorDiv = field.parentNode.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #e91e63; font-size: 0.85rem; margin-top: 0.3rem;';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    field.style.borderColor = '#e91e63';
}

function clearValidationErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
    document.querySelectorAll('#fbName, #fbMobile, #fbEmail, #fbService, #fbRating, #fbFeedback')
        .forEach(field => field.style.borderColor = '#ecf0f1');
}

// Updated feedback form submission
if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Run validation
        if (!validateFeedbackForm()) {
            return; // Stop if validation fails
        }

        // Original CSV export code continues here...
        const feedbackData = {
            name: document.getElementById('fbName').value,
            mobile: document.getElementById('fbMobile').value,
            email: document.getElementById('fbEmail')?.value || '',
            service: document.getElementById('fbService').value,
            rating: document.getElementById('fbRating').value,
            feedback: document.getElementById('fbFeedback').value,
            date: new Date().toLocaleString('en-IN')
        };

        // Save and CSV export (your existing code)...
        let feedbacks = JSON.parse(localStorage.getItem('skinClinicFeedbacks')) || [];
        feedbacks.push(feedbackData);
        localStorage.setItem('skinClinicFeedbacks', JSON.stringify(feedbacks));

        // CSV Export
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

        alert('✅ Thank you! Feedback saved & CSV downloaded.');
        feedbackForm.reset();
    });
}
