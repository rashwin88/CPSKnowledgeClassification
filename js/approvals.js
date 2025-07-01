const filterButton = document.getElementById('filter-button');
const filterMenu = document.getElementById('status-options');
const statusChecks = document.querySelectorAll('#status-options input[type="checkbox"]');
const listEl = document.getElementById('submission-list');
const formContainer = document.getElementById('record-form');
const messageModal = document.getElementById('messageModal');
const messageText = document.getElementById('messageText');
const messageClose = document.getElementById('messageClose');

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

function toTitleCase(str) {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function loadRecords() {
    try {
        const { data, error } = await supabase
            .from('staging_entries')
            .select('*');
        if (error) {
            console.error('Error loading records', error);
            return;
        }
        stagingRecords = data || [];
        applyFilter();
    } catch (err) {
        console.error('Unexpected error loading records', err);
    }
}

function applyFilter() {
    const statuses = Array.from(statusChecks)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    const filtered = stagingRecords.filter(r => statuses.includes(r.status));
    renderList(filtered);
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
    const fields = Object.keys(record).filter(k => !['id','status','created_at'].includes(k));
    fields.forEach(f => {
        const group = document.createElement('div');
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
        area.name = f;
        area.value = record[f] || '';
        area.rows = 2;
        area.addEventListener('input', (e)=>{ record[f] = e.target.value; updateDiff(area, existing ? existing[f] : null); });
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

async function approveRecord(record) {
    try {
        await supabase.from('staging_entries').update({ status: 'approved' }).eq('id', record.id);
        const upsertData = { ...record };
        delete upsertData.status;
        delete upsertData.created_at;
        await supabase.from('committed_records').upsert(upsertData);
        record.status = 'approved';
        applyFilter();
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
        applyFilter();
        showMessage('Record rejected successfully');
    } catch (err) {
        console.error('Error rejecting record', err);
        showMessage('Error rejecting record');
    }
}

statusChecks.forEach(cb => cb.addEventListener('change', applyFilter));
filterButton.addEventListener('click', () => {
    filterMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e) => {
    if (!filterMenu.contains(e.target) && e.target !== filterButton) {
        filterMenu.classList.add('hidden');
    }
});
window.addEventListener('DOMContentLoaded', loadRecords);
