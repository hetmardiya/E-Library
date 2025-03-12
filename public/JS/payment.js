// This file handles the payment processing logic, including form validation and submission.

document.addEventListener("DOMContentLoaded", function () {
    const paymentForm = document.getElementById("paymentForm");
    const cardNumberInput = document.getElementById("cardNumber");
    const expiryDateInput = document.getElementById("expiryDate");
    const cvvInput = document.getElementById("cvv");
    const errorMessage = document.getElementById("errorMessage");

    paymentForm.addEventListener("submit", function (event) {
        event.preventDefault();
        errorMessage.textContent = ""; // Clear previous error messages

        const cardNumber = cardNumberInput.value;
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value;

        if (!validateCardNumber(cardNumber)) {
            errorMessage.textContent = "Invalid card number.";
            return;
        }

        if (!validateExpiryDate(expiryDate)) {
            errorMessage.textContent = "Invalid expiry date.";
            return;
        }

        if (!validateCVV(cvv)) {
            errorMessage.textContent = "Invalid CVV.";
            return;
        }

        // Proceed with payment processing
        processPayment(cardNumber, expiryDate, cvv);
    });

    function validateCardNumber(cardNumber) {
        // Simple validation for card number (length and digits)
        return /^\d{16}$/.test(cardNumber);
    }

    function validateExpiryDate(expiryDate) {
        // Simple validation for expiry date (MM/YY format)
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate);
    }

    function validateCVV(cvv) {
        // Simple validation for CVV (3 digits)
        return /^\d{3}$/.test(cvv);
    }

    function processPayment(cardNumber, expiryDate, cvv) {
        // Simulate payment processing
        console.log("Processing payment...");
        console.log("Card Number:", cardNumber);
        console.log("Expiry Date:", expiryDate);
        console.log("CVV:", cvv);

        // Here you would typically send the payment details to your server
        // and handle the response accordingly.
        alert("Payment processed successfully!");
    }
});