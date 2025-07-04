function updateLayout() {
    const sidebar = document.getElementById('sidebar');
    const collapsed = sidebar.classList.contains('collapsed');
    const left = collapsed ? '66px' : '200px';

    const topbar = document.querySelector('.topbar');
    const topHeight = topbar ? `${topbar.offsetHeight}px` : '0px';

    document.querySelectorAll('.content-container, .approvals-container')
        .forEach(el => {
            el.style.marginLeft = left;
            el.style.width = `calc(100% - ${left})`;
            el.style.marginTop = topHeight;
            el.style.height = `calc(100vh - ${topHeight})`;
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
window.addEventListener('load', updateLayout);
window.addEventListener('resize', updateLayout);
