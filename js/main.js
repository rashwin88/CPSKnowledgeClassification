// Dummy data - will later come from API

const firstRow = document.getElementById('first-row');
const secondRow = document.getElementById('second-row');
const thirdRow = document.getElementById('third-row');
const fourthRow = document.getElementById('fourth-row');
const fifthRow = document.getElementById('fifth-row');
const sixthRow = document.getElementById('sixth-row');
const seventhRow = document.getElementById('seventh-row');
const leafRow = document.getElementById('leaf-row');

const booksPerPage = 10;
let currentBooks = [];
let currentPage = 1;
let currentCardId = '';
let currentTotalBooks = 0;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    return /barren|leaf/.test(String(type).toLowerCase());
}

async function fetchBooks(prefix, page = 1) {
    const from = (page - 1) * booksPerPage;
    const to = from + booksPerPage - 1;
    // Classification numbers store spaces as '-' so normalise before querying
    const sanitizedPrefix = prefix.replace(/\s+/g, '-');
    try {
        const { data, error } = await supabase
            .from('committed_records')
            .select('*')
            .like('classification_number', `${sanitizedPrefix}%`)
            .range(from, to);
        if (error) {
            console.error('Error fetching books:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching books:', err);
        return [];
    }
}

async function loadBooks(page = 1) {
    currentPage = page;
    currentBooks = await fetchBooks(currentCardId, currentPage);
    renderBooks();
}

const bookModal = document.getElementById('bookModal');
const bookModalBody = document.getElementById('bookModalBody');
const bookModalClose = document.getElementById('bookModalClose');

function openBookModal(book) {
    const formatField = (name) =>
        name
            .replace(/_/g, ' ')
            .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

    const html = Object.entries(book)
        .filter(([, value]) => value !== null && value !== undefined && value !== 'null' && value !== '')
        .map(
            ([key, value]) =>
                `<div class="field-name">${formatField(key)}</div><div class="field-value">${value}</div>`
        )
        .join('');

    bookModalBody.innerHTML = `<div class="book-details-grid">${html}</div>`;
    bookModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        bookModal.classList.add('active');
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
            <div class="book-card-left">${b.classification_number || ''}</div>
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

    displayBox.innerHTML = `📚 Books in selected category (<strong>${currentCardId}</strong>) : <span class="book-count">${currentTotalBooks}</span>` +
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
    const count = parseInt(card.getAttribute('data-total-books'), 10);
    currentTotalBooks = isNaN(count) ? 0 : count;
    currentPage = 1;
    loadBooks(currentPage);
}


function insertSoftHyphens(text) {
    // Add soft hyphens after logical break points (like capital letters or compound parts)
    return text.replace(/([a-zāīūṛṅñṭḍṇśṣ]+)/gi, '$1&shy;');
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
    const bookCount = 0;
    card.setAttribute('data-total-books', bookCount);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    innerHtml = `
      <div class="top">${data.id}</div>
      <div class="category" lang="en">${insertSoftHyphens(data.node_label)}</div>
      <div class="count">${bookCount}</div>
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

        if (isLeafType(card.getAttribute('data-node-type'))) {
            if (row == "first-row") {
                secondRow.innerHTML = '';
                thirdRow.innerHTML = '';
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
                leafRow.innerHTML = '';
            } else if (row == "second-row") {
                thirdRow.innerHTML = '';
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
            } else if (row == "third-row") {
                fourthRow.innerHTML = '';
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
            } else if (row == "fourth-row") {
                fifthRow.innerHTML = '';
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
            } else if (row == "fifth-row") {
                sixthRow.innerHTML = '';
                seventhRow.innerHTML = '';
            } else if (row == "sixth-row") {
                seventhRow.innerHTML = '';
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
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSecondRow(data || []);
        } else if (row === 'second-row') {
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderThirdRow(data || []);
        } else if (row === 'third-row') {
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderFourthRow(data || []);
        } else if (row === 'fourth-row') {
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderFifthRow(data || []);
        } else if (row === 'fifth-row') {
            seventhRow.innerHTML = '';
            leafRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSixthRow(data || []);
        } else if (row === 'sixth-row') {
            leafRow.innerHTML = '';
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
    const bookCount = getRandomInt(5, 50);
    card.setAttribute('data-total-books', bookCount);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    innerHtml = `
    <div class="card-left">
      <div class="card-title">${data.id}</div>
    </div>
    <div class="card-center">
      <div class="card-subtitle" lang="en">${insertSoftHyphens(data.node_label)}</div>
    </div>
    <div class="card-right">
      <div class="card-meta">${bookCount}</div>
    </div>
    `;

    card.innerHTML = innerHtml;

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


function renderLeafRow(childData) {
    leafRow.innerHTML = '';
    childData.forEach(data => {
        const card = createLeafCard(data, 'leaf-row');
        leafRow.appendChild(card);
    });
}
getTopLevelNodes().then(topLevelNodes => {
    console.log(topLevelNodes);
    renderFirstRow(topLevelNodes);
});
