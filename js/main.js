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

const formModal = document.getElementById('formModal');
const cardNumberInput = document.getElementById('cardNumber');
const cardForm = document.getElementById('cardForm');
const modalCloseBtn = document.getElementById('modalClose');

function openFormModal(id) {
    cardNumberInput.value = id;
    formModal.classList.add('active');
    formModal.classList.remove('hidden');
}

function closeFormModal() {
    formModal.classList.remove('active');
    formModal.classList.add('hidden');
}

cardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    closeFormModal();
    alert('Dummy form submitted');
});

modalCloseBtn.addEventListener('click', closeFormModal);
formModal.addEventListener('click', (e) => {
    if (e.target === formModal) {
        closeFormModal();
    }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomBooks(count) {
    const titles = [
        'Legends of Bharat',
        'Tales of the Mauryas',
        'Journey through Vedic Lands',
        'Mysteries of Mohenjo-daro',
        'Sages of the Upanishads',
        'Chronicles of Ashoka',
        'Ramayana Retold',
        'Saga of the Gupta Dynasty',
        'Wisdom of Chanakya',
        'Secrets of Nalanda',
        'Echoes of Harappa',
        'Bhagavata Lore',
        'Indus Scripts Revealed',
        'Epic of Kurukshetra',
        'Sanskrit Poetics Unveiled',
        'Rise of Magadha',
        'Legends of Vijayanagara',
        'Classics of Tamil Sangam',
        'Ancient Astronomy of India',
        'Myths of the Himalayas'
    ];
    const authors = [
        'A. Sharma',
        'B. Gupta',
        'C. Iyer',
        'D. Singh',
        'E. Banerjee',
        'F. Reddy',
        'G. Pillai',
        'H. Varma'
    ];
    const books = [];
    for (let i = 0; i < count; i++) {
        const title = `${titles[i % titles.length]} ${Math.floor(i / titles.length) + 1}`;
        const author = authors[i % authors.length];
        const classification = `CLS-${getRandomInt(100, 999)}.${getRandomInt(0, 9)}`;
        const year = 1950 + (i % 70);
        books.push({ title, author, classification, year });
    }
    return books;
}

function renderBooks() {
    const displayBox = document.getElementById('books-display');
    const totalBooks = currentBooks.length;
    const totalPages = Math.max(1, Math.ceil(totalBooks / booksPerPage));
    const start = (currentPage - 1) * booksPerPage;
    const visible = currentBooks.slice(start, start + booksPerPage);
    const listHtml = visible.map(b => `
        <li class="book-card">
            <div class="book-title">${b.title}</div>
            <div class="book-author">Author: ${b.author}</div>
            <div class="book-classification">Classification: ${b.classification}</div>
            <div class="book-year">Year: ${b.year}</div>
        </li>`).join('');

    displayBox.innerHTML = `📚 Books in selected category (<strong>${currentCardId}</strong>) : <span class="book-count">${totalBooks}</span>` +
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
                renderBooks();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderBooks();
            }
        });
    }
}

function displayBooksForCard(card) {
    currentCardId = card.getAttribute('data-id');
    const count = parseInt(card.getAttribute('data-total-books'), 10);
    currentBooks = generateRandomBooks(count);
    currentPage = 1;
    renderBooks();
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
    card.setAttribute('data-node-type', data.type);
    const bookCount = getRandomInt(5, 50);
    card.setAttribute('data-total-books', bookCount);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    innerHtml = `
      <div class="top">${data.id}</div>
      <div class="category" lang="en">${insertSoftHyphens(data.node_label)}</div>
      <div class="count">${bookCount}</div>
      <div class="add-icon">+</div>
    `;

    card.innerHTML = innerHtml;
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

        if (card.getAttribute('data-node-type') === 'barren') {
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
    card.setAttribute('data-node-type', data.type);
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
    <div class="add-icon">+</div>
    `;

    card.innerHTML = innerHtml;
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
