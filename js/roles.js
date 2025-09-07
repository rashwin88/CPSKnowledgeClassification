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

    function updateUserBadge(role) {
        const usernameSpan = document.querySelector('.username');
        if (!usernameSpan) return;
        let meta = usernameSpan.nextElementSibling;
        if (!meta || !meta.classList || !meta.classList.contains('user-meta')) {
            meta = document.createElement('div');
            meta.className = 'user-meta';
            const badge = document.createElement('span');
            badge.className = 'role-badge';
            meta.appendChild(badge);
            usernameSpan.insertAdjacentElement('afterend', meta);
        }
        const badgeEl = meta.querySelector('.role-badge');
        if (badgeEl) {
            badgeEl.textContent = `${role}`;
            badgeEl.classList.remove('admin', 'editor', 'reader');
            badgeEl.classList.add(role);
        }
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
        updateUserBadge(role);
        hideLinks(role);
        guardPages(role);
    });
})();


