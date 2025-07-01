function updateLayout() {
    const sidebar = document.getElementById('sidebar');
    const collapsed = sidebar.classList.contains('collapsed');
    const left = collapsed ? '60px' : '182px';

    const topbar = document.querySelector('.topbar');
    if (topbar) {
        topbar.style.left = left;
        topbar.style.width = `calc(100% - ${left})`;
    }

    document.querySelectorAll('.content-container, .approvals-container')
        .forEach(el => {
            el.style.marginLeft = left;
            el.style.width = `calc(100% - ${left})`;
        });
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");

    const toggleBtn = sidebar.querySelector(".toggle-btn");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "»" : "«";

    updateLayout();
}

document.addEventListener('DOMContentLoaded', updateLayout);
