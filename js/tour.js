(function () {
  const steps = [
    { selector: '.logo-container img', title: 'Welcome', text: 'This is the CPS Knowledge explorer.' },
    { selector: '#search-container', title: 'Search', text: 'Find books by title, author, or code.' },
    { selector: '#first-row', title: 'Categories', text: 'Click cards to drill down and see more.' },
    { selector: '#books-display', title: 'Books', text: 'Selected category’s books appear here.' }
  ];

  const helpBtn = document.getElementById('helpTourBtn');
  if (!helpBtn) return;

  // Create spotlight and tooltip elements
  const overlay = document.createElement('div');
  overlay.className = 'tour-overlay hidden';
  overlay.innerHTML = '<div class="tour-backdrop"></div><div class="tour-tooltip"><h3></h3><p></p><div class="tour-actions"><button class="tour-prev">Back</button><div class="tour-dots"></div><button class="tour-next">Next</button></div></div>';
  document.body.appendChild(overlay);

  const tooltip = overlay.querySelector('.tour-tooltip');
  const titleEl = tooltip.querySelector('h3');
  const textEl = tooltip.querySelector('p');
  const dotsEl = tooltip.querySelector('.tour-dots');
  const nextBtn = tooltip.querySelector('.tour-next');
  const prevBtn = tooltip.querySelector('.tour-prev');

  let idx = 0;

  function positionTooltip(target) {
    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.top - tooltip.offsetHeight - 12;
    const left = Math.max(16, Math.min(window.scrollX + rect.left, window.scrollX + document.body.clientWidth - tooltip.offsetWidth - 16));
    tooltip.style.top = `${Math.max(16, top)}px`;
    tooltip.style.left = `${left}px`;
  }

  function highlight(target) {
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('active'));
    const dots = steps.map((_, i) => `<span class="dot${i === idx ? ' active' : ''}"></span>`).join('');
    dotsEl.innerHTML = dots;
    titleEl.textContent = steps[idx].title;
    textEl.textContent = steps[idx].text;
    positionTooltip(target);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showStep() {
    const step = steps[idx];
    const target = document.querySelector(step.selector);
    if (!target) { end(); return; }
    highlight(target);
  }

  function next() { if (idx < steps.length - 1) { idx++; showStep(); } else { end(); } }
  function prev() { if (idx > 0) { idx--; showStep(); } }
  function end() { overlay.classList.remove('active'); setTimeout(() => overlay.classList.add('hidden'), 200); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  overlay.addEventListener('click', (e) => { if (e.target === overlay.querySelector('.tour-backdrop')) end(); });
  window.addEventListener('resize', () => { const step = steps[idx]; const t = document.querySelector(step.selector); if (t) positionTooltip(t); });

  helpBtn.addEventListener('click', () => { idx = 0; showStep(); });
})();


