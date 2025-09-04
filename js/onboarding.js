(function () {
    const steps = [
        {
            title: 'Explore the knowledge tree',
            text: 'Click cards to drill down into categories and subcategories.'
        },
        {
            title: 'Search across the library',
            text: 'Use the search box to find books by title, author, or code.'
        },
        {
            title: 'View and manage records',
            text: 'Open a card to see books; add entries or edit metadata inline.'
        }
    ];

    const modal = document.getElementById('onboardModal');
    if (!modal) return;
    const titleEl = document.getElementById('onboardTitle');
    const textEl = document.getElementById('onboardText');
    const nextBtn = document.getElementById('onboardNext');
    const skipBtn = document.getElementById('onboardSkip');
    const closeBtn = document.getElementById('onboardClose');
    const dots = modal.querySelectorAll('.onboard-steps .dot');

    let idx = 0;

    function render() {
        const step = steps[idx];
        titleEl.textContent = step.title;
        textEl.textContent = step.text;
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        nextBtn.textContent = idx === steps.length - 1 ? 'Get started' : 'Next';
    }

    function show() {
        modal.classList.remove('hidden');
        requestAnimationFrame(() => modal.classList.add('active'));
    }

    function hide() {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 200);
    }

    function complete() {
        try { localStorage.setItem('cpsik_onboard_v1', 'done'); } catch (e) { }
        hide();
    }

    nextBtn.addEventListener('click', () => {
        if (idx < steps.length - 1) {
            idx += 1;
            render();
        } else {
            complete();
        }
    });

    skipBtn.addEventListener('click', complete);
    closeBtn.addEventListener('click', complete);
    modal.addEventListener('click', (e) => { if (e.target === modal) complete(); });

    document.addEventListener('DOMContentLoaded', () => {
        const seen = localStorage.getItem('cpsik_onboard_v1');
        if (!seen) {
            idx = 0;
            render();
            setTimeout(show, 250);
        }
    });
})();


