// Global country selection
let selectedCountry = 'us';

// Country selection function
const selectCountry = (country) => {
    selectedCountry = country;
    
    // Update UI
    document.querySelectorAll('.country-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-country="${country}"]`).classList.add('active');
    
    // Update form fields based on country
    updateFormForCountry(country);
};

const updateFormForCountry = (country) => {
    const isCanadian = country === 'ca';
    
    // Update labels and visibility
    document.getElementById('fromRoutingLabel').textContent = isCanadian ? 'Bank Code' : 'Routing Number';
    document.getElementById('toRoutingLabel').textContent = isCanadian ? 'Bank Code' : 'Routing Number';
    
    // Show/hide Canadian routing fields
    document.getElementById('fromCanadianRouting').style.display = isCanadian ? 'block' : 'none';
    document.getElementById('toCanadianRouting').style.display = isCanadian ? 'block' : 'none';
    
    // Show/hide US routing fields
    document.getElementById('fromRouting').style.display = isCanadian ? 'none' : 'block';
    document.getElementById('toRouting').style.display = isCanadian ? 'none' : 'block';
    
    // Update currency symbol and max amounts
    const amountLabel = document.querySelector('label[for="amount"]');
    amountLabel.textContent = isCanadian ? 'Amount (CAD $)' : 'Amount (USD $)';
    
    // Update account number max length for Canadian format
    const accountFields = ['fromAccount', 'toAccount'];
    accountFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.maxLength = isCanadian ? 12 : 17;
        field.placeholder = isCanadian ? '123456789012' : '1234567890123456';
    });
    
    // Clear form when switching countries
    document.getElementById('transferForm').reset();
};

// Utility functions for validation
const validateAccountNumber = (accountNumber, country = selectedCountry) => {
    // Remove any spaces or dashes
    const cleaned = accountNumber.replace(/[\s-]/g, '');
    
    if (country === 'ca') {
        // Canadian account numbers are typically 7-12 digits
        return /^\d{7,12}$/.test(cleaned);
    } else {
        // US account numbers are typically 8-17 digits
        return /^\d{8,17}$/.test(cleaned);
    }
};

const validateRoutingNumber = (routingNumber, country = selectedCountry) => {
    if (country === 'ca') {
        return true; // For Canadian, we validate institution and transit separately
    }
    
    // US ABA routing number validation
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

const validateCanadianInstitution = (institutionNumber) => {
    const cleaned = institutionNumber.replace(/[\s-]/g, '');
    // Must be exactly 3 digits
    return /^\d{3}$/.test(cleaned);
};

const validateCanadianTransit = (transitNumber) => {
    const cleaned = transitNumber.replace(/[\s-]/g, '');
    // Must be exactly 5 digits
    return /^\d{5}$/.test(cleaned);
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
    
    // Add Canadian routing data if applicable
    if (selectedCountry === 'ca') {
        formData.fromInstitution = document.getElementById('fromInstitution').value;
        formData.fromTransit = document.getElementById('fromTransit').value;
        formData.toInstitution = document.getElementById('toInstitution').value;
        formData.toTransit = document.getElementById('toTransit').value;
    }
    
    // Validate all fields
    let hasErrors = false;
    
    // Account number validation
    if (!validateAccountNumber(formData.fromAccount)) {
        const digits = selectedCountry === 'ca' ? '7-12' : '8-17';
        showError(document.getElementById('fromAccount'), `Invalid account number (${digits} digits required)`);
        hasErrors = true;
    }
    
    if (!validateAccountNumber(formData.toAccount)) {
        const digits = selectedCountry === 'ca' ? '7-12' : '8-17';
        showError(document.getElementById('toAccount'), `Invalid account number (${digits} digits required)`);
        hasErrors = true;
    }
    
    // Routing validation based on country
    if (selectedCountry === 'ca') {
        // Validate Canadian institution and transit numbers
        if (!validateCanadianInstitution(formData.fromInstitution)) {
            showError(document.getElementById('fromInstitution'), 'Invalid institution number (3 digits required)');
            hasErrors = true;
        }
        if (!validateCanadianTransit(formData.fromTransit)) {
            showError(document.getElementById('fromTransit'), 'Invalid transit number (5 digits required)');
            hasErrors = true;
        }
        if (!validateCanadianInstitution(formData.toInstitution)) {
            showError(document.getElementById('toInstitution'), 'Invalid institution number (3 digits required)');
            hasErrors = true;
        }
        if (!validateCanadianTransit(formData.toTransit)) {
            showError(document.getElementById('toTransit'), 'Invalid transit number (5 digits required)');
            hasErrors = true;
        }
    } else {
        // Validate US routing numbers
        if (!validateRoutingNumber(formData.fromRouting)) {
            showError(document.getElementById('fromRouting'), 'Invalid routing number');
            hasErrors = true;
        }
        if (!validateRoutingNumber(formData.toRouting)) {
            showError(document.getElementById('toRouting'), 'Invalid routing number');
            hasErrors = true;
        }
    }
    
    // Amount validation
    if (!validateAmount(formData.amount)) {
        showError(document.getElementById('amount'), 'Invalid amount');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return false;
    }
    
    // If validation passes, you would typically send this data to your server
    const currency = selectedCountry === 'ca' ? 'CAD' : 'USD';
    const country = selectedCountry === 'ca' ? 'Canada' : 'United States';
    alert(`${country} ${currency} transfer initiated successfully!`);
    document.getElementById('transferForm').reset();
    return false;
};
