// Handle signout functionality
document.addEventListener('DOMContentLoaded', () => {
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', () => {
            // Clear all session data
            sessionStorage.removeItem('cpsik_signed_in');
            sessionStorage.removeItem('cpsik_role');

            // Optionally clear localStorage if needed
            // localStorage.removeItem('cpsik_email');

            // Redirect to signin page
            window.location.href = 'index.html';
        });
    }
});
