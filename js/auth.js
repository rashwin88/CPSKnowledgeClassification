document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signin-form');
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const rememberEl = document.getElementById('remember');
    const googleBtn = document.getElementById('google-btn');
    const continueReader = document.getElementById('continue-reader');

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

        // Admin backdoor
        if (email === 'cpsadmin@cpsindia.org' && password === 'cpsadmin2025@') {
            if (rememberEl.checked) {
                localStorage.setItem('cpsik_email', email);
            } else {
                localStorage.removeItem('cpsik_email');
            }
            sessionStorage.setItem('cpsik_signed_in', 'true');
            sessionStorage.setItem('cpsik_role', 'admin');
            window.location.href = 'home.html';
            return;
        }

        // Default non-admin login acts as editor for now
        if (rememberEl.checked) {
            localStorage.setItem('cpsik_email', email);
        } else {
            localStorage.removeItem('cpsik_email');
        }
        sessionStorage.setItem('cpsik_signed_in', 'true');
        sessionStorage.setItem('cpsik_role', 'editor');
        window.location.href = 'home.html';
    });

    googleBtn.addEventListener('click', () => {
        // Placeholder for OAuth; for now, just proceed
        sessionStorage.setItem('cpsik_signed_in', 'true');
        sessionStorage.setItem('cpsik_role', 'editor');
        window.location.href = 'home.html';
    });

    if (continueReader) {
        continueReader.addEventListener('click', (e) => {
            // Ensure reader role is set before navigation (link still works)
            sessionStorage.setItem('cpsik_signed_in', 'true');
            sessionStorage.setItem('cpsik_role', 'reader');
        });
    }
});


