const filterButton = document.getElementById('filter-button');
const filterMenu = document.getElementById('status-options');
const statusChecks = document.querySelectorAll('#status-options input[type="checkbox"]');
const listEl = document.getElementById('submission-list');
const formContainer = document.getElementById('record-form');
const messageModal = document.getElementById('messageModal');
const messageText = document.getElementById('messageText');
const messageClose = document.getElementById('messageClose');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('search-suggestions');

let searchResults = [];
let searchDebounce = null;

function showMessage(text) {
    messageText.textContent = text;
    messageModal.classList.remove('hidden');
    requestAnimationFrame(() => messageModal.classList.add('active'));
}

function hideMessage() {
    messageModal.classList.remove('active');
    setTimeout(() => messageModal.classList.add('hidden'), 300);
}

messageClose.addEventListener('click', hideMessage);
messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) hideMessage();
});

let stagingRecords = [];
let selectedId = null;
let filteredRecords = [];

function sortRecords() {
    const val = sortSelect.value;
    stagingRecords.sort((a, b) => {
        const da = new Date(a.created_at);
        const db = new Date(b.created_at);
        return val === 'created_asc' ? da - db : db - da;
    });
}

function toTitleCase(str) {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function highlightTerm(text, term) {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'ig');
    return text.replace(regex, (m) => `<span class="search-highlight">${m}</span>`);
}

async function loadRecords(selectFirst = false) {
    try {
        const { data, error } = await supabase
            .from('staging_entries')
            .select('*');
        if (error) {
            console.error('Error loading records', error);
            return;
        }
        stagingRecords = data || [];
        sortRecords();
        applyFilter(selectFirst);
    } catch (err) {
        console.error('Unexpected error loading records', err);
    }
}

function applyFilter(selectFirst = false) {
    const statuses = Array.from(statusChecks)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    filteredRecords = stagingRecords.filter(r => statuses.includes(r.status));
    renderList(filteredRecords);
    if (selectFirst) {
        if (filteredRecords.length) {
            selectRecord(filteredRecords[0].id);
        } else {
            selectedId = null;
            formContainer.innerHTML = '';
        }
    }
}

function renderList(records) {
    listEl.innerHTML = '';
    records.forEach(rec => {
        const li = document.createElement('li');
        li.className = 'approvals-list-item';
        li.tabIndex = 0;
        li.setAttribute('role', 'option');
        li.setAttribute('data-id', rec.id);
        li.setAttribute('aria-selected', rec.id === selectedId ? 'true' : 'false');
        if (rec.id === selectedId) li.classList.add('selected');
        const created = new Date(rec.created_at).toLocaleDateString();
        li.innerHTML = `<div style="display:flex; justify-content:space-between; font-size:0.9em;">
            <span>${rec.classification_number || ''}</span>
            <span>${created}</span>
        </div>
        <div>${rec.title || ''}</div>
        <div style="text-align:right;">
            <span class="status-badge ${rec.status}">${rec.status}</span>
        </div>`;
        li.addEventListener('click', () => selectRecord(rec.id));
        li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRecord(rec.id); } });
        listEl.appendChild(li);
    });
}

async function selectRecord(id) {
    selectedId = id;
    applyFilter();
    const record = stagingRecords.find(r => r.id === id);
    if (!record) return;
    let existing = null;
    try {
        const { data } = await supabase
            .from('committed_records')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        existing = data || null;
    } catch (err) {
        console.error('Error fetching existing record', err);
    }
    renderDetail(record, existing);
}

function renderDetail(record, existing) {
    formContainer.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'approval-form';
    const fields = Object.keys(record).filter(k => !['id', 'status', 'created_at'].includes(k));
    fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'md-field';
        const label = document.createElement('label');
        label.textContent = toTitleCase(f);
        group.appendChild(label);
        if (existing) {
            const curr = document.createElement('div');
            curr.className = 'current-value';
            curr.textContent = 'Current: ' + (existing[f] || '');
            group.appendChild(curr);
        }
        const area = document.createElement('textarea');
        area.className = 'md-textarea';
        area.name = f;
        area.value = record[f] || '';
        area.rows = 2;
        area.addEventListener('input', (e) => { record[f] = e.target.value; updateDiff(area, existing ? existing[f] : null); });
        group.appendChild(area);
        if (existing && (existing[f] || '') !== (record[f] || '')) {
            group.classList.add('changed');
        }
        form.appendChild(group);
    });
    if (record.status === 'pending') {
        const actions = document.createElement('div');
        actions.className = 'action-buttons';
        const approveBtn = document.createElement('button');
        approveBtn.type = 'button';
        approveBtn.textContent = 'Approve';
        approveBtn.className = 'approve-btn';
        approveBtn.addEventListener('click', () => approveRecord(record));
        const rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.textContent = 'Reject';
        rejectBtn.className = 'reject-btn';
        rejectBtn.addEventListener('click', () => rejectRecord(record));
        actions.appendChild(approveBtn);
        actions.appendChild(rejectBtn);
        form.appendChild(actions);
    }
    formContainer.appendChild(form);
}

function updateDiff(textarea, current) {
    const group = textarea.parentElement;
    if (current !== undefined && (current || '') !== textarea.value) {
        group.classList.add('changed');
    } else {
        group.classList.remove('changed');
    }
}

function searchRecords(term) {
    if (!term) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.classList.add('hidden');
        searchResults = [];
        return;
    }
    term = term.toLowerCase();
    searchResults = filteredRecords.filter(r => {
        const title = r.title || '';
        const code = r.classification_number || '';
        const author = r.main_author || '';
        return title.toLowerCase().includes(term) ||
            code.toLowerCase().includes(term) ||
            author.toLowerCase().includes(term);
    }).slice(0, 10);
    suggestionsBox.innerHTML = searchResults.map((r, i) => {
        const title = r.title || '';
        const code = r.classification_number || '';
        const display = highlightTerm(`${code} ${title}`, term);
        return `<div class="suggestion-item" data-idx="${i}">${display}</div>`;
    }).join('');
    suggestionsBox.classList.toggle('hidden', searchResults.length === 0);
}

async function approveRecord(record) {
    try {
        await supabase.from('staging_entries').update({ status: 'approved' }).eq('id', record.id);
        const upsertData = { ...record };
        delete upsertData.status;
        delete upsertData.created_at;
        await supabase.from('committed_records').upsert(upsertData);
        record.status = 'approved';
        await loadRecords(true);
        showMessage('Record approved successfully');
    } catch (err) {
        console.error('Error approving record', err);
        showMessage('Error approving record');
    }
}

async function rejectRecord(record) {
    try {
        await supabase.from('staging_entries').update({ status: 'rejected' }).eq('id', record.id);
        record.status = 'rejected';
        await loadRecords(true);
        showMessage('Record rejected successfully');
    } catch (err) {
        console.error('Error rejecting record', err);
        showMessage('Error rejecting record');
    }
}

statusChecks.forEach(cb => cb.addEventListener('change', applyFilter));
sortSelect.addEventListener('change', () => { sortRecords(); applyFilter(); });
filterButton.addEventListener('click', () => {
    filterMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
    if (!filterMenu.contains(e.target) && e.target !== filterButton) {
        filterMenu.classList.add('hidden');
    }
});

searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim();
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => searchRecords(term), 200);
    searchInput.setAttribute('aria-expanded', term ? 'true' : 'false');
});

suggestionsBox.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;
    const idx = parseInt(item.getAttribute('data-idx'), 10);
    const record = searchResults[idx];
    suggestionsBox.classList.add('hidden');
    suggestionsBox.innerHTML = '';
    searchInput.value = '';
    searchInput.setAttribute('aria-expanded', 'false');
    if (record) {
        selectRecord(record.id);
    }
});
window.addEventListener('DOMContentLoaded', () => loadRecords(true));
