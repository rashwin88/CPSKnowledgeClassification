// Dummy data - will later come from API

const firstRow = document.getElementById('first-row');
const secondRow = document.getElementById('second-row');
const thirdRow = document.getElementById('third-row');
const fourthRow = document.getElementById('fourth-row');
const fifthRow = document.getElementById('fifth-row');
const sixthRow = document.getElementById('sixth-row');
const seventhRow = document.getElementById('seventh-row');


function insertSoftHyphens(text) {
    // Add soft hyphens after logical break points (like capital letters or compound parts)
    return text.replace(/([a-zāīūṛṅñṭḍṇśṣ]+)/gi, '$1&shy;');
}

function updateBookDisplayBox(card) {
    const displayBox = document.getElementById("books-display");
    const totalBooks = parseInt(card.getAttribute('data-total-books'), 10).toLocaleString('en-IN');
    displayBox.innerHTML = `📚 Books in selected category (<strong>${card.getAttribute('data-id')}</strong>) : <span class="book-count">${totalBooks}</span>`;
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
    card.setAttribute('data-total-books', 0);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    innerHtml = `
      <div class="top">${data.id}</div>
      <div class="category" lang="en">${insertSoftHyphens(data.node_label)}</div>
      <div class="count">${card.getAttribute('data-total-books')}</div>
    `;

    card.innerHTML = innerHtml;

    // Add click handler to manage selection
    card.addEventListener('click', async () => {
        updateBookDisplayBox(card);
        //renderHierarchy(card);
        // Remove 'selected' from any other cards
        document.querySelectorAll(`#${row} .card.selected`).forEach(el => {
            el.classList.remove('selected');
        });

        // Add 'selected' to this card
        card.classList.add('selected');

        // Render the second row when the first row is clicked
        if (row === 'first-row') {
            thirdRow.innerHTML = '';
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSecondRow(data || []);
        } else if (row === 'second-row') {
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderThirdRow(data || []);
        } else if (row === 'third-row') {
            fifthRow.innerHTML = '';
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderFourthRow(data || []);
        } else if (row === 'fourth-row') {
            sixthRow.innerHTML = '';
            seventhRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderFifthRow(data || []);
        } else if (row === 'fifth-row') {
            seventhRow.innerHTML = '';
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSixthRow(data || []);
        } else if (row === 'sixth-row') {
            const data = await getAllChildren(card.getAttribute('data-id'));
            renderSeventhRow(data || []);
        }
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
getTopLevelNodes().then(topLevelNodes => {
    console.log(topLevelNodes);
    renderFirstRow(topLevelNodes);
});
