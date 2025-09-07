// Simple role utilities and UI gating
(function () {
    function getRole() {
        return sessionStorage.getItem('cpsik_role') || 'reader';
    }

    function setBodyRoleClass(role) {
        document.body.classList.remove('role-admin', 'role-editor', 'role-reader');
        document.body.classList.add(`role-${role}`);
    }

    function updateRibbon(role) {
        const ribbon = document.getElementById('role-ribbon');
        if (!ribbon) return;
        ribbon.textContent = `Access: ${role.charAt(0).toUpperCase()}${role.slice(1)}`;
        ribbon.classList.remove('admin', 'editor', 'reader');
        ribbon.classList.add(role);
    }

    function hideLinks(role) {
        const approvalsLink = document.querySelector('a.menu-link[href="approvals.html"]');
        const dashboardLink = document.querySelector('a.menu-link[href="dashboard.html"]');
        if (role === 'reader') {
            if (approvalsLink) approvalsLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'none';
        } else if (role === 'editor') {
            if (approvalsLink) approvalsLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = '';
        } else {
            if (approvalsLink) approvalsLink.style.display = '';
            if (dashboardLink) dashboardLink.style.display = '';
        }
    }

    function guardPages(role) {
        const path = (location.pathname || '').toLowerCase();
        if (path.endsWith('/approvals.html') || path.endsWith('approvals.html')) {
            if (role !== 'admin') {
                location.replace('home.html');
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const role = getRole();
        setBodyRoleClass(role);
        updateRibbon(role);
        hideLinks(role);
        guardPages(role);
    });
})();


