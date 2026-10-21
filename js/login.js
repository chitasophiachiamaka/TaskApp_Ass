"use strict";

// ========================================
// TASKFLOW: LOGIN AND REGISTRATION
// Frontend demonstration only
// ========================================

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const authTitle = document.getElementById("auth-title");
const authDescription = document.getElementById("auth-description");
const authMessage = document.getElementById("auth-message");

const showRegisterButton = document.getElementById("show-register");
const showLoginButton = document.getElementById("show-login");
const forgotPasswordLink = document.getElementById("forgot-password");

// ========================================
// SWITCH BETWEEN LOGIN AND REGISTRATION
// ========================================

function showLogin() {
    loginForm.hidden = false;
    registerForm.hidden = true;

    authTitle.textContent = "Welcome back!";
    authDescription.textContent =
        "Log in to continue managing your tasks.";

    authMessage.textContent = "";
    loginForm.reset();

    loginForm.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
    });
}

function showRegister() {
    loginForm.hidden = true;
    registerForm.hidden = false;

    authTitle.textContent = "Create your account";
    authDescription.textContent =
        "Join TaskFlow and organize your work.";

    authMessage.textContent = "";
    registerForm.reset();

    registerForm.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
    });
}

showRegisterButton.addEventListener("click", showRegister);
showLoginButton.addEventListener("click", showLogin);

// ========================================
// HELPER: DISPLAY VALIDATION ERRORS
// ========================================

function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + "-error");

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors(form) {
    form.querySelectorAll(".error-message").forEach(error => {
        error.textContent = "";
    });

    authMessage.textContent = "";
}

// ========================================
// REGISTRATION FORM
// ========================================

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors(registerForm);

    const name = document.getElementById("register-name").value.trim();
    const emailInput = document.getElementById("register-email");
    const email = emailInput.value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword =
        document.getElementById("confirm-password").value;

    let isValid = true;

    if (name.length < 2) {
        showError("register-name", "Please enter your full name.");
        isValid = false;
    }

    if (!email || !emailInput.validity.valid) {
        showError("register-email", "Enter a valid email address.");
        isValid = false;
    }

    if (password.length < 8) {
        showError(
            "register-password",
            "Your password must contain at least 8 characters."
        );
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError("confirm-password", "The passwords do not match.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Frontend demonstration only.
    // This does not create or verify a real account.
    sessionStorage.setItem("taskflowLoggedIn", "true");

    // Correct destination after registration.
    window.location.href = "dashboard.html";
});

// ========================================
// LOGIN FORM
// ========================================

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors(loginForm);

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    if (!email || !emailInput.validity.valid) {
        showError("login-email", "Enter a valid email address.");
        isValid = false;
    }

    if (!password) {
        showError("login-password", "Please enter your password.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Demo session only — no actual account verification.
    sessionStorage.setItem("taskflowLoggedIn", "true");

    // Correct destination after login.
    window.location.href = "dashboard.html";
});

// ========================================
// FORGOT PASSWORD
// ========================================

forgotPasswordLink.addEventListener("click", function (event) {
    event.preventDefault();

    authMessage.textContent =
        "Password recovery will be available when authentication is connected.";

    authMessage.style.color = "#6548e8";
});
