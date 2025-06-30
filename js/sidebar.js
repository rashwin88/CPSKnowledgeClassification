function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");

    const toggleBtn = sidebar.querySelector(".toggle-btn");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "»" : "«";

    const topbar = document.querySelector('.topbar');
    if (topbar) {
        if (sidebar.classList.contains('collapsed')) {
            topbar.style.left = '60px';
            topbar.style.width = 'calc(100% - 60px)';
        } else {
            topbar.style.left = '182px';
            topbar.style.width = 'calc(100% - 182px)';
        }
    }
}
