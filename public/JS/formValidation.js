function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Name validation
    const nameInputs = form.querySelectorAll('input[name="fname"], input[name="lname"], input[name="name"]');
    nameInputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (/\d/.test(value)) {
                input.setCustomValidity('Name cannot contain numbers');
            } else if (value.length < 2) {
                input.setCustomValidity('Name must be at least 2 characters long');
            } else {
                input.setCustomValidity('');
            }
        });
    });

    // Email validation
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(e.target.value)) {
                emailInput.setCustomValidity('Please enter a valid email address');
            } else {
                emailInput.setCustomValidity('');
            }
        });
    }

    // Phone validation
    const phoneInput = form.querySelector('input[name="phoneNumber"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            phoneInput.value = value;
            if (value.length !== 10) {
                phoneInput.setCustomValidity('Phone number must be exactly 10 digits');
            } else {
                phoneInput.setCustomValidity('');
            }
        });
    }

    // Password validation
    const passwordInput = form.querySelector('input[name="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length < 5) {
                passwordInput.setCustomValidity('Password must be at least 5 characters long');
            } else {
                passwordInput.setCustomValidity('');
            }
        });
    }
}
