// Utility functions for validation
const validateAccountNumber = (accountNumber) => {
    // Remove any spaces or dashes
    const cleaned = accountNumber.replace(/[\s-]/g, '');
    // Check if it's numeric and between 8-17 digits
    return /^\d{8,17}$/.test(cleaned);
};

const validateRoutingNumber = (routingNumber) => {
    // Remove any spaces or dashes
    const cleaned = routingNumber.replace(/[\s-]/g, '');
    // Must be exactly 9 digits
    if (!/^\d{9}$/.test(cleaned)) return false;
    
    // Implement ABA routing number checksum validation
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const digit = parseInt(cleaned.charAt(i));
        if (i % 3 === 0) sum += digit * 3;
        else if (i % 3 === 1) sum += digit * 7;
        else sum += digit;
    }
    return sum % 10 === 0;
};

const validateAmount = (amount) => {
    const value = parseFloat(amount);
    return !isNaN(value) && value > 0 && value <= 100000; // Example max limit of $100,000
};

// Function to display error message
const showError = (input, message) => {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
};

// Function to clear error messages
const clearErrors = (input) => {
    input.classList.remove('error');
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
};

// Real-time validation for input fields
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
        clearErrors(e.target);
        
        switch(e.target.id) {
            case 'fromAccount':
            case 'toAccount':
                if (e.target.value && !validateAccountNumber(e.target.value)) {
                    showError(e.target, 'Please enter a valid account number (8-17 digits)');
                }
                break;
                
            case 'fromRouting':
            case 'toRouting':
                if (e.target.value && !validateRoutingNumber(e.target.value)) {
                    showError(e.target, 'Please enter a valid 9-digit routing number');
                }
                break;
                
            case 'amount':
                if (e.target.value && !validateAmount(e.target.value)) {
                    showError(e.target, 'Please enter a valid amount between $0.01 and $100,000');
                }
                break;
        }
    });
});

// Handle form submission
const handleSubmit = (event) => {
    event.preventDefault();
    
    // Clear all existing errors
    document.querySelectorAll('input').forEach(input => clearErrors(input));
    
    const formData = {
        fromAccount: document.getElementById('fromAccount').value,
        fromRouting: document.getElementById('fromRouting').value,
        toAccount: document.getElementById('toAccount').value,
        toRouting: document.getElementById('toRouting').value,
        amount: document.getElementById('amount').value,
        memo: document.getElementById('memo').value
    };
    
    // Validate all fields
    let hasErrors = false;
    
    if (!validateAccountNumber(formData.fromAccount)) {
        showError(document.getElementById('fromAccount'), 'Invalid account number');
        hasErrors = true;
    }
    
    if (!validateRoutingNumber(formData.fromRouting)) {
        showError(document.getElementById('fromRouting'), 'Invalid routing number');
        hasErrors = true;
    }
    
    if (!validateAccountNumber(formData.toAccount)) {
        showError(document.getElementById('toAccount'), 'Invalid account number');
        hasErrors = true;
    }
    
    if (!validateRoutingNumber(formData.toRouting)) {
        showError(document.getElementById('toRouting'), 'Invalid routing number');
        hasErrors = true;
    }
    
    if (!validateAmount(formData.amount)) {
        showError(document.getElementById('amount'), 'Invalid amount');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return false;
    }
    
    // If validation passes, you would typically send this data to your server
    // For demo purposes, we'll just show an alert
    alert('Transfer initiated successfully!');
    document.getElementById('transferForm').reset();
    return false;
};
