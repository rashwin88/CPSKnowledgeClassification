// Simple role utilities and UI gating
(function () {
    function getRole() {
        const role = sessionStorage.getItem('cpsik_role') || 'reader';
        if (!sessionStorage.getItem('cpsik_role')) {
            sessionStorage.setItem('cpsik_role', 'reader');
        }
        return role;
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
        document.querySelectorAll('a.menu-link').forEach(link => {
            const req = (link.getAttribute('data-role') || '').trim();
            if (!req) return; // visible to all by default
            const reqRoles = req.split(/\s+/);
            link.style.display = reqRoles.includes(role) ? '' : 'none';
        });
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


