function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");

    const toggleBtn = sidebar.querySelector(".toggle-btn");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "»" : "«";
}
