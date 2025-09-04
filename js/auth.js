document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signin-form');
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const rememberEl = document.getElementById('remember');
    const googleBtn = document.getElementById('google-btn');

    // Restore remembered email
    const savedEmail = localStorage.getItem('cpsik_email');
    if (savedEmail) {
        emailEl.value = savedEmail;
    }

    // Simple demo redirect if already signed in
    const signedIn = sessionStorage.getItem('cpsik_signed_in');
    if (signedIn === 'true') {
        // user previously authenticated in this tab
        // keep them moving
        window.location.replace('home.html');
        return;
    }

    function showError(message) {
        alert(message);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (emailEl.value || '').trim();
        const password = (passwordEl.value || '').trim();

        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        // Basic client-side validation
        const emailOk = /.+@.+\..+/.test(email);
        if (!emailOk) {
            showError('Please enter a valid email address.');
            return;
        }

        // This is a static site demo: treat any credentials as valid
        if (rememberEl.checked) {
            localStorage.setItem('cpsik_email', email);
        } else {
            localStorage.removeItem('cpsik_email');
        }
        sessionStorage.setItem('cpsik_signed_in', 'true');
        window.location.href = 'home.html';
    });

    googleBtn.addEventListener('click', () => {
        // Placeholder for OAuth; for now, just proceed
        sessionStorage.setItem('cpsik_signed_in', 'true');
        window.location.href = 'home.html';
    });
});


