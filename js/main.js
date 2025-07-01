// Dummy data - will later come from API

const firstRow = document.getElementById('first-row');
const secondRow = document.getElementById('second-row');
const thirdRow = document.getElementById('third-row');
const fourthRow = document.getElementById('fourth-row');
const fifthRow = document.getElementById('fifth-row');
const sixthRow = document.getElementById('sixth-row');
const seventhRow = document.getElementById('seventh-row');
const leafRow = document.getElementById('leaf-row');
const barrenRow = document.getElementById('barren-row');

const booksPerPage = 10;
let currentBooks = [];
let currentPage = 1;
let currentCardId = '';
let currentQueryId = '';
let currentDisplayId = '';
let currentTotalBooks = 0;

// Cache objects to avoid repeat Supabase requests
const searchCache = {};
let booksCache = {};

let hyphenationEnabled = false;

const formModal = document.getElementById('formModal');
const modalCloseBtn = document.getElementById('modalClose');

function openFormModal(id) {
    if (window.renderForm) {
        window.renderForm(id);
    }
    formModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        formModal.classList.add('active');
    });
}

function closeFormModal() {
    formModal.classList.remove('active');
    if (window.unmountForm) {
        window.unmountForm();
    }
    setTimeout(() => formModal.classList.add('hidden'), 300);
}


modalCloseBtn.addEventListener('click', closeFormModal);
formModal.addEventListener('click', (e) => {
    if (e.target === formModal) {
        closeFormModal();
    }
});

function isLeafType(type) {
    if (!type) return false;
    return String(type).toLowerCase().trim().includes('leaf');
}

function isBarrenType(type) {
    if (!type) return false;
    return String(type).toLowerCase().trim().includes('barren');
}

function formatDisplayId(id) {
    if (!id) return '';
    return id.replace(/#.*?#/, '').replace(/-/g, ' ');
}

async function fetchBooks(prefix, page = 1) {
    const from = (page - 1) * booksPerPage;
    const to = from + booksPerPage - 1;
    // Classification numbers store spaces as '-' so normalise before querying
    const sanitizedPrefix = prefix.replace(/\s+/g, '-');
    const cacheKey = `${sanitizedPrefix}:${page}`;
    if (booksCache[cacheKey]) {
        return booksCache[cacheKey];
    }
    try {
        const { data, error } = await supabase
            .from('committed_records')
            .select('*')
            .like('classification_number', `${sanitizedPrefix}%`)
            .range(from, to);
        if (error) {
            console.error('Error fetching books:', error);
            booksCache[cacheKey] = [];
        } else {
            booksCache[cacheKey] = data || [];
        }
    } catch (err) {
        console.error('Unexpected error fetching books:', err);
        booksCache[cacheKey] = [];
    }
    return booksCache[cacheKey];
}

async function loadBooks(page = 1) {
    currentPage = page;
    currentBooks = await fetchBooks(currentQueryId || currentCardId, currentPage);
    renderBooks();
}

const bookModal = document.getElementById('bookModal');
const bookModalBody = document.getElementById('bookModalBody');
const bookModalClose = document.getElementById('bookModalClose');

function openBookModal(book) {
    if (window.renderEditForm) {
        window.renderEditForm(book);
    }
    formModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        formModal.classList.add('active');
    });
}

function closeBookModal() {
    bookModal.classList.remove('active');
    setTimeout(() => bookModal.classList.add('hidden'), 300);
}

bookModalClose.addEventListener('click', closeBookModal);
bookModal.addEventListener('click', (e) => {
    if (e.target === bookModal) {
        closeBookModal();
    }
});

function renderBooks() {
    const displayBox = document.getElementById('books-display');
    const totalPages = Math.max(1, Math.ceil(currentTotalBooks / booksPerPage));
    const listHtml = currentBooks.map((b, i) => `
        <li class="book-card" data-index="${i}">
            <div class="book-card-left">${formatDisplayId(b.classification_number || '')}</div>
            <div class="book-card-right">
                <div class="book-card-header">${b.title || b.book_title || b.name || 'Untitled'}</div>
                ${b.main_author && b.main_author !== 'null'
                    ? `<div class="book-author">Main author: ${b.main_author}</div>`
                    : (b.author || b.authors || b.primary_author
                        ? `<div class="book-author">Main author: ${b.author || b.authors || b.primary_author}</div>`
                        : '')}
                ${b.first_author && b.first_author !== 'null' ? `<div class="book-author">First author: ${b.first_author}</div>` : ''}
                ${b.second_author && b.second_author !== 'null' ? `<div class="book-author">Second author: ${b.second_author}</div>` : ''}
                ${b.language && b.language !== 'null' ? `<div class="book-language">Language: ${b.language}</div>` : ''}
                ${b.language_note && b.language_note !== 'null' ? `<div class="book-language-note">Language note: ${b.language_note}</div>` : ''}
                ${b.pages || b.page_count ? `<div class="book-pages">Pages: ${b.pages || b.page_count}</div>` : ''}
                ${b.year || b.publication_year ? `<div class="book-year">Year: ${b.year || b.publication_year}</div>` : ''}
            </div>
        </li>`).join('');

    displayBox.innerHTML = `📚 Books in selected category (<strong>${currentDisplayId}</strong>) : <span class="book-count">${currentTotalBooks}</span>` +
        `<ul class="book-list">${listHtml}</ul>` +
        `<div class="pagination"><button id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>` +
        `<span>${currentPage} / ${totalPages}</span>` +
        `<button id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button></div>`;

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadBooks(currentPage);
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadBooks(currentPage);
            }
        });
    }

    document.querySelectorAll('.book-card').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            if (!isNaN(idx) && currentBooks[idx]) {
                openBookModal(currentBooks[idx]);
            }
        });
    });
}

function displayBooksForCard(card) {
    currentCardId = card.getAttribute('data-id');
    currentDisplayId = formatDisplayId(currentCardId);
    currentQueryId = currentCardId.replace(/#.*?#/, '');
    booksCache = {}; // reset cache when changing selection
    const count = parseInt(card.getAttribute('data-total-books'), 10);
    currentTotalBooks = isNaN(count) ? 0 : count;
    currentPage = 1;
    loadBooks(currentPage);
}


function hyphenateDevanagari(word) {
    const vowels = /[\u0904-\u0914\u0960-\u0961\u0972-\u0977]/;
    const matras = /[\u093E-\u094C\u0962-\u0963]/;
    const consonants = /[\u0915-\u0939\u0958-\u095F\u0978-\u097F]/;
    const virama = '\u094D';
    let result = '';
    for (let i = 0; i < word.length; i++) {
        const ch = word[i];
        result += ch;
        if (i < word.length - 1) {
            const next = word[i + 1];
            if (ch === virama) continue;
            if (matras.test(ch) || vowels.test(ch) || (consonants.test(ch) && next !== virama)) {
                result += '&shy;';
            }
        }
    }
    return result;
}

function insertSoftHyphens(text) {
    const noHyphen = ['studies', 'puranas', 'purana', 'history'];
    const custom = {
        'Mahabharata': 'Maha&shy;bha&shy;ra&shy;ta',
        'Ramayana': 'Ra&shy;ma&shy;ya&shy;na',
        'Bhagavad': 'Bha&shy;ga&shy;vad',
        'Gita': 'Gi&shy;ta',
        'Karnataka': 'Kar&shy;na&shy;ta&shy;ka',
        'Tamil': 'Ta&shy;mil',
        'Telangana': 'Te&shy;lan&shy;ga&shy;na',
        'Andhra': 'An&shy;dhra',
        'Pradesh': 'Pra&shy;desh'
    };
    return text.split(/(\s+)/).map(part => {
        const word = part.trim();
        if (!word) return part;
        const lower = word.toLowerCase();
        if (noHyphen.includes(lower)) return part;
        if (custom[word]) return custom[word];
        // Only hyphenate Latin words
        if (/^[A-Za-z]+$/.test(word)) {
            return word.replace(/([aeiouāīūṛṝḷḹeou])([bcdfghjklmnpqrstvwxyz])/gi, '$1&shy;$2');
        }
        return part;
    }).join('');
}


function updateCardHyphenation(card) {
    const labelEl = card.querySelector('.category') || card.querySelector('.card-subtitle');
    const original = card.getAttribute('data-label-original');
    if (!labelEl || !original) return;
    if (hyphenationEnabled) {
        labelEl.innerHTML = insertSoftHyphens(original);
    } else {
        labelEl.textContent = original;
    }
}

function updateHyphenation() {
    document.body.classList.toggle('no-hyphenation', !hyphenationEnabled);
    document.querySelectorAll('.card').forEach(updateCardHyphenation);
    document.querySelectorAll('.horizontal-card').forEach(updateCardHyphenation);
}


async function renderHierarchy(entry) {
    const container = document.getElementById('hierarchy-display');
    container.innerHTML = ''; // Clear previous

    const levels = [];

    if (entry.getAttribute('data-top-level-node') !== 'null') {
        const topLevelNode = await getTopLevelNodes().
            then(nodes => nodes.find(node => node.top_level_node === entry.getAttribute('data-top-level-node')));
        levels.push({
            label: entry.getAttribute('data-top-level-node'),
            level: 0,
            entry_name: topLevelNode?.entry_name || '[Unclaimed]'
        });
    }
    if (entry.getAttribute('data-first-level-node') !== 'null') {
        const firstLevelNode = await getFirstLevelNodes(entry.getAttribute('data-top-level-node')).
            then(nodes => nodes.find(node => node.first_level_node === entry.getAttribute('data-first-level-node')));
        levels.push({
            label: `${entry.getAttribute('data-top-level-node')}.${entry.getAttribute('data-first-level-node')}`,
            level: 1,
            entry_name: firstLevelNode?.entry_name || '[Unclaimed]'
        });
    }
    if (entry.getAttribute('data-second-level-node') !== 'null') {
        const secondLevelNode = await getSecondLevelNodes(entry.getAttribute('data-top-level-node'), entry.getAttribute('data-first-level-node')).
            then(nodes => nodes.find(node => node.second_level_node === entry.getAttribute('data-second-level-node')));
        levels.push({
            label: `${entry.getAttribute('data-top-level-node')}.${entry.getAttribute('data-first-level-node')}${entry.getAttribute('data-second-level-node')}`,
            level: 2,
            entry_name: secondLevelNode?.entry_name || '[Unclaimed]'
        });
    }
    if (entry.getAttribute('data-third-level-node') !== 'null') {
        const thirdLevelNode = await getThirdLevelNodes(entry.getAttribute('data-top-level-node'), entry.getAttribute('data-first-level-node'), entry.getAttribute('data-second-level-node')).
            then(nodes => nodes.find(node => node.third_level_node === entry.getAttribute('data-third-level-node')));
        levels.push({
            label: `${entry.getAttribute('data-top-level-node')}.${entry.getAttribute('data-first-level-node')}${entry.getAttribute('data-second-level-node')}${entry.getAttribute('data-third-level-node')}`,
            level: 3,
            entry_name: thirdLevelNode?.entry_name || '[Unclaimed]'
        });
    }
    if (entry.getAttribute('data-fourth-level-node') !== 'null') {
        const fourthLevelNode = await getFourthLevelNodes(entry.getAttribute('data-top-level-node'), entry.getAttribute('data-first-level-node'), entry.getAttribute('data-second-level-node'), entry.getAttribute('data-third-level-node')).
            then(nodes => nodes.find(node => node.fourth_level_node === entry.getAttribute('data-fourth-level-node')));
        levels.push({
            label: `${entry.getAttribute('data-top-level-node')}.${entry.getAttribute('data-first-level-node')}${entry.getAttribute('data-second-level-node')}${entry.getAttribute('data-third-level-node')}${entry.getAttribute('data-fourth-level-node')}`,
            level: 4,
            entry_name: fourthLevelNode?.entry_name || '[Unclaimed]'
        });
    }

    levels.forEach((item, index) => {
        if (item.label !== null) {
            const label = index === levels.length - 1 ? entry.entry_name : '[Unclaimed]';
            const div = document.createElement('div');
            div.className = `level indent-${item.level}`;
            div.innerHTML = `↳ <strong>${item.label}</strong> ${item.entry_name}`;
            container.appendChild(div);
        }
    });
    console.log(levels);
}

function createCard(data, row) {
    const card = document.createElement('div');
    card.className = 'card';
    // Set card attributes
    card.setAttribute('data-node-level', data.node_level);
    card.setAttribute('data-node-label', data.node_label);
    card.setAttribute('data-id', data.id);
    const nodeType = data.type || data.node_type || '';
    card.setAttribute('data-node-type', nodeType);
    card.setAttribute('data-label-original', data.node_label);
    const bookCount = 0;
    card.setAttribute('data-total-books', bookCount);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    const label = hyphenationEnabled ? insertSoftHyphens(data.node_label) : data.node_label;
    innerHtml = `
      <div class="top">${formatDisplayId(data.id)}</div>
      <div class="category" lang="en">${label}</div>
      <div class="count">${bookCount}</div>
      <div class="add-icon">+</div>
    `;

    card.innerHTML = innerHtml;
    // Fetch actual count asynchronously and update when received
    getBookCount(data.id).then(count => {
        card.setAttribute('data-total-books', count);
        const countEl = card.querySelector('.count');
        if (countEl) {
            countEl.textContent = count;
        }
    });
    const addIcon = card.querySelector('.add-icon');
    addIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        openFormModal(data.id);
    });

    // Add click handler to manage selection
    card.addEventListener('click', async () => {
        displayBooksForCard(card);
        //renderHierarchy(card);
        // Remove 'selected' from any other cards
        document.querySelectorAll(`#${row} .card.selected`).forEach(el => {
            el.classList.remove('selected');
        });

        // Add 'selected' to this card
        card.classList.add('selected');

        const nodeType = card.getAttribute('data-node-type');
        if (isBarrenType(nodeType)) {
            if (row == "first-row") {
                secondRow.innerHTML = '';
                thirdRow.innerHTML = '';
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                leafRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "second-row") {
                thirdRow.innerHTML = '';
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "third-row") {
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "fourth-row") {
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "fifth-row") {
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "sixth-row") {
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            }
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderBarrenRow(data || []);
        }
        else if (isLeafType(nodeType)) {
            if (row == "first-row") {
                secondRow.innerHTML = '';
                thirdRow.innerHTML = '';
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                leafRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "second-row") {
                thirdRow.innerHTML = '';
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "third-row") {
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "fourth-row") {
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "fifth-row") {
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            } else if (row == "sixth-row") {
                seventhRow.innerHTML = '';
                barrenRow.innerHTML = '';
            }
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderLeafRow(data || []);
        }
        // Render the second row when the first row is clicked
        else if (row === 'first-row') {
            thirdRow.innerHTML = '';
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            barrenRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSecondRow(data || []);
        } else if (row === 'second-row') {
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            barrenRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderThirdRow(data || []);
        } else if (row === 'third-row') {
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            barrenRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderFourthRow(data || []);
        } else if (row === 'fourth-row') {
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            barrenRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderFifthRow(data || []);
        } else if (row === 'fifth-row') {
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            barrenRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSixthRow(data || []);
        } else if (row === 'sixth-row') {
            leafRow.innerHTML = '';
            barrenRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSeventhRow(data || []);
        }
    });

    return card;

}


function createLeafCard(data, row) {
    const card = document.createElement('div');
    card.className = 'horizontal-card';
    // Set card attributes
    card.setAttribute('data-node-level', data.node_level);
    card.setAttribute('data-node-label', data.node_label);
    card.setAttribute('data-id', data.id);
    const leafType = data.type || data.node_type || '';
    card.setAttribute('data-node-type', leafType);
    card.setAttribute('data-label-original', data.node_label);
    const bookCount = 0;
    card.setAttribute('data-total-books', bookCount);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    const label = hyphenationEnabled ? insertSoftHyphens(data.node_label) : data.node_label;
    innerHtml = `
    <div class="card-left">
      <div class="card-title">${formatDisplayId(data.id)}</div>
    </div>
    <div class="card-center">
      <div class="card-subtitle" lang="en">${label}</div>
    </div>
    <div class="card-right">
      <div class="card-meta">${bookCount}</div>
      <div class="add-icon">+</div>
    </div>
    `;

    card.innerHTML = innerHtml;
    // Fetch count asynchronously
    getBookCount(data.id).then(count => {
        card.setAttribute('data-total-books', count);
        const countEl = card.querySelector('.card-meta');
        if (countEl) {
            countEl.textContent = count;
        }
    });
    const addIcon = card.querySelector('.add-icon');
    addIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        openFormModal(data.id);
    });

    // Add click handler to manage selection
    card.addEventListener('click', async () => {
        displayBooksForCard(card);
        //renderHierarchy(card);
        // Remove 'selected' from any other cards
        document.querySelectorAll(`#${row} .horizontal-card.selected`).forEach(el => {
            el.classList.remove('selected');
        });

        // Add 'selected' to this card
        card.classList.add('selected');
    });

    return card;

}


function renderFirstRow(dataList) {
    dataList.forEach(data => {
        const card = createCard(data, 'first-row');
        firstRow.appendChild(card);
    });
}

function renderSecondRow(childData) {
    // Clear previous
    secondRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'second-row');
        secondRow.appendChild(card);
    });
}

function renderThirdRow(childData) {
    // Clear previous
    thirdRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'third-row');
        thirdRow.appendChild(card);
    });
}

function renderFourthRow(childData) {
    // Clear previous
    fourthRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'fourth-row');
        fourthRow.appendChild(card);
    });
}

function renderFifthRow(childData) {
    // Clear previous
    fifthRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'fifth-row');
        fifthRow.appendChild(card);
    });
}

function renderSixthRow(childData) {
    // Clear previous
    sixthRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'sixth-row');
        sixthRow.appendChild(card);
    });
}

function renderSeventhRow(childData) {
    // Clear previous
    seventhRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'seventh-row');
        seventhRow.appendChild(card);
    });
}

function renderBarrenRow(childData) {
    barrenRow.innerHTML = '';
    childData.forEach(data => {
        const card = createCard(data, 'barren-row');
        barrenRow.appendChild(card);
    });
}


function renderLeafRow(childData) {
    leafRow.innerHTML = '';
    childData.forEach(data => {
        const card = createLeafCard(data, 'leaf-row');
        leafRow.appendChild(card);
    });
}

function selectCard(card, row) {
    document.querySelectorAll(`#${row} .card.selected`).forEach(el => {
        el.classList.remove('selected');
    });
    if (card) {
        card.classList.add('selected');
    }
}

function selectHorizontalCard(card, row) {
    document.querySelectorAll(`#${row} .horizontal-card.selected`).forEach(el => {
        el.classList.remove('selected');
    });
    if (card) {
        card.classList.add('selected');
    }
}
if (window.loadAllNodes) {
    window.loadAllNodes();
}
getTopLevelNodes().then(topLevelNodes => {
    console.log(topLevelNodes);
    renderFirstRow(topLevelNodes);
});

// --- Search functionality ---
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('search-suggestions');
let searchResults = [];
let searchDebounce = null;

function highlightTerm(text, term) {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'ig');
    return text.replace(regex, (m) => `<span class="search-highlight">${m}</span>`);
}

function getPrefixesFromCode(code) {
    if (!code) return [];
    code = code.replace(/#.*?#/, '').replace(/-/g, ' ').trim();
    const spaceIndex = code.indexOf(' ');
    if (spaceIndex !== -1) {
        code = code.slice(0, spaceIndex);
    }
    const [top, rest = ''] = code.split('.');
    const prefixes = [top];
    let prefix = top;
    for (let i = 0; i < rest.length; i++) {
        prefix = i === 0 ? `${prefix}.${rest[i]}` : `${prefix}${rest[i]}`;
        prefixes.push(prefix);
    }
    return prefixes;
}

function buildPrefixesFromParents(parents, code) {
    if (!Array.isArray(parents) || parents.length === 0) {
        return getPrefixesFromCode(code);
    }
    const base = parents[0];
    const prefixes = [base];
    let prefix = base;
    for (let i = 1; i < parents.length; i++) {
        const digit = parents[i];
        prefix = i === 1 ? `${prefix}.${digit}` : `${prefix}${digit}`;
        prefixes.push(prefix);
    }
    const cleaned = code.replace(/#.*?#/, '').replace(/-/g, ' ').trim();
    if (!prefixes.includes(cleaned)) {
        prefixes.push(cleaned);
    }
    return prefixes;
}

function clearLowerRows(startIndex) {
    const rowEls = [firstRow, secondRow, thirdRow, fourthRow, fifthRow, sixthRow, seventhRow];
    for (let i = startIndex + 1; i < rowEls.length; i++) {
        rowEls[i].innerHTML = '';
    }
    leafRow.innerHTML = '';
    barrenRow.innerHTML = '';
}

async function expandToClassification(code) {
    let prefixes = [];
    const parents = await (window.getNodeParents ? window.getNodeParents(code) : null);
    if (parents) {
        prefixes = buildPrefixesFromParents(parents, code);
    } else {
        prefixes = getPrefixesFromCode(code);
    }
    if (!prefixes.length) return;
    const rows = ['first-row', 'second-row', 'third-row', 'fourth-row', 'fifth-row', 'sixth-row', 'seventh-row'];
    const renderFns = [null, renderSecondRow, renderThirdRow, renderFourthRow, renderFifthRow, renderSixthRow, renderSeventhRow];
    let parent = null;

    // Preload all missing levels concurrently
    const fetchPromises = prefixes.map((p, i) => {
        const row = rows[i];
        const card = document.querySelector(`#${row} .card[data-id='${p}']`);
        if (!card && i > 0) {
            return getAllChildren(prefixes[i - 1]).then(children => ({ idx: i, children }));
        }
        return Promise.resolve(null);
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(res => {
        if (res && renderFns[res.idx]) {
            renderFns[res.idx](res.children || []);
        }
    });

    for (let i = 0; i < prefixes.length && i < rows.length; i++) {
        const row = rows[i];
        const card = document.querySelector(`#${row} .card[data-id='${prefixes[i]}']`);
        if (card) {
            selectCard(card, row);
            parent = prefixes[i];
        } else {
            break;
        }
    }

    clearLowerRows(prefixes.length - 1);

    const finalId = code.replace(/#.*?#/, '');
    const leaf = document.querySelector(`#leaf-row .horizontal-card[data-id='${finalId}']`);
    if (leaf) {
        selectHorizontalCard(leaf, 'leaf-row');
    } else {
        const barren = document.querySelector(`#barren-row .card[data-id='${finalId}']`);
        if (barren) {
            selectCard(barren, 'barren-row');
        }
    }
}

function displaySingleBook(book) {
    currentBooks = [book];
    currentTotalBooks = 1;
    currentPage = 1;
    currentDisplayId = formatDisplayId(book.classification_number || '');
    renderBooks();
}

async function searchRecords(term) {
    if (!term) {
        suggestionsBox.classList.add('hidden');
        suggestionsBox.innerHTML = '';
        return;
    }
    try {
        if (searchCache[term]) {
            searchResults = searchCache[term];
        } else {
            const { data, error } = await supabase
                .from('committed_records')
                .select('*')
                .or(
                    `title.ilike.%${term}%,subtitle.ilike.%${term}%,main_author.ilike.%${term}%,second_author.ilike.%${term}%,third_author.ilike.%${term}%`
                )
                .limit(10);
            if (error) {
                console.error('Search error:', error);
                return;
            }
            searchResults = data || [];
            searchCache[term] = searchResults;
        }
        suggestionsBox.innerHTML = searchResults.map((r, i) => {
            const title = r.title || r.book_title || r.name || 'Untitled';
            const subtitle = r.subtitle ? `: ${r.subtitle}` : '';
            const code = formatDisplayId(r.classification_number || '');
            const author = r.main_author || r.author || r.authors || r.primary_author || '';
            const displayCode = highlightTerm(code, term);
            const displayHeader = highlightTerm(`${title}${subtitle}`, term);
            const displayAuthor = author ? highlightTerm(`Main author: ${author}`, term) : '';
            const displayFirst = r.first_author && r.first_author !== 'null'
                ? highlightTerm(`First author: ${r.first_author}`, term) : '';
            const displaySecond = r.second_author && r.second_author !== 'null'
                ? highlightTerm(`Second author: ${r.second_author}`, term) : '';
            const displayLang = r.language && r.language !== 'null'
                ? highlightTerm(`Language: ${r.language}`, term) : '';
            const displayLangNote = r.language_note && r.language_note !== 'null'
                ? highlightTerm(`Language note: ${r.language_note}`, term) : '';
            const displayPages = (r.pages || r.page_count)
                ? highlightTerm(`Pages: ${r.pages || r.page_count}`, term) : '';
            const displayYear = (r.year || r.publication_year)
                ? highlightTerm(`Year: ${r.year || r.publication_year}`, term) : '';
            return `
                <div class="suggestion-item book-card" data-idx="${i}" data-code="${r.classification_number}">
                    <div class="book-card-left">${displayCode}</div>
                    <div class="book-card-right">
                        <div class="book-card-header">${displayHeader}</div>
                        ${displayAuthor ? `<div class="book-author">${displayAuthor}</div>` : ''}
                        ${displayFirst ? `<div class="book-author">${displayFirst}</div>` : ''}
                        ${displaySecond ? `<div class="book-author">${displaySecond}</div>` : ''}
                        ${displayLang ? `<div class="book-language">${displayLang}</div>` : ''}
                        ${displayLangNote ? `<div class="book-language-note">${displayLangNote}</div>` : ''}
                        ${displayPages ? `<div class="book-pages">${displayPages}</div>` : ''}
                        ${displayYear ? `<div class="book-year">${displayYear}</div>` : ''}
                    </div>
                </div>`;
        }).join('');
        suggestionsBox.classList.remove('hidden');
        // Preload parent paths for faster expansion
        searchResults.forEach(r => {
            if (window.getNodeParents) {
                window.getNodeParents(r.classification_number);
            }
        });
    } catch (err) {
        console.error('Search failed:', err);
    }
}

searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim();
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => searchRecords(term), 300);
});

suggestionsBox.addEventListener('click', async (e) => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;
    const idx = parseInt(item.getAttribute('data-idx'), 10);
    const record = searchResults[idx];
    suggestionsBox.classList.add('hidden');
    suggestionsBox.innerHTML = '';
    searchInput.value = '';
    if (record) {
        await expandToClassification(record.classification_number);
        displaySingleBook(record);
        const bookSection = document.getElementById('books-display');
        if (bookSection) {
            bookSection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const card = bookSection.querySelector('.book-card');
                if (card) {
                    card.classList.add('pop-animate');
                    card.addEventListener('animationend', () => {
                        card.classList.remove('pop-animate');
                    }, { once: true });
                }
            }, 600);
        }
    }
});

const settingsIcon = document.getElementById('settings-icon');
const settingsModal = document.getElementById('settings-modal');
const hyphenToggle = document.getElementById('hyphenation-toggle');
const darkToggle = document.getElementById('dark-mode-toggle');

settingsIcon.addEventListener('click', () => {
    settingsModal.classList.toggle('hidden');
});

hyphenToggle.addEventListener('change', () => {
    hyphenationEnabled = hyphenToggle.checked;
    updateHyphenation();
});

darkToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkToggle.checked);
});

document.addEventListener('DOMContentLoaded', () => {
    updateHyphenation();
    if (darkToggle.checked) {
        document.body.classList.add('dark-mode');
    }
});
