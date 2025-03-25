// Dummy data - will later come from API

const firstRow = document.getElementById('first-row');
const secondRow = document.getElementById('second-row');
const thirdRow = document.getElementById('third-row');
const fourthRow = document.getElementById('fourth-row');
const fifthRow = document.getElementById('fifth-row');

function insertSoftHyphens(text) {
    // Add soft hyphens after logical break points (like capital letters or compound parts)
    return text.replace(/([a-zāīūṛṅñṭḍṇśṣ]+)/gi, '$1&shy;');
}

async function updateBookDisplayBox(categoryCode) {
    const displayBox = document.getElementById("books-display");
    const codeSpecificData = await getCodeSpecificData(categoryCode);
    displayBox.innerHTML = `📚 Books in selected category (<strong>${categoryCode}</strong>) : <span class="book-count">[${codeSpecificData.total_books}]</span>`;
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
    card.setAttribute('data-top-level-node', data.top_level_node);
    card.setAttribute('data-first-level-node', data.first_level_node);
    card.setAttribute('data-second-level-node', data.second_level_node);
    card.setAttribute('data-third-level-node', data.third_level_node);
    card.setAttribute('data-fourth-level-node', data.fourth_level_node);
    card.setAttribute('data-category-code', data.code);
    card.setAttribute('data-entry-name', data.entry_name);
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    // Update inner html for each card to show the category code, category name, and total books
    innerHtml = `
      <div class="top">${data.code}</div>
      <div class="category" lang="en">${insertSoftHyphens(data.entry_name)}</div>
      <div class="count">${data.total_books}</div>
    `;

    card.innerHTML = innerHtml;

    // Add click handler to manage selection
    card.addEventListener('click', async () => {
        updateBookDisplayBox(card.getAttribute('data-category-code'));
        renderHierarchy(card);
        // Remove 'selected' from any other cards
        document.querySelectorAll(`#${row} .card.selected`).forEach(el => {
            el.classList.remove('selected');
        });

        // Add 'selected' to this card
        card.classList.add('selected');

        // Render the second row when the first row is clicked
        const topLevelAttribute = card.getAttribute('data-top-level-node');
        const firstLevelAttribute = card.getAttribute('data-first-level-node');
        const secondLevelAttribute = card.getAttribute('data-second-level-node');
        const thirdLevelAttribute = card.getAttribute('data-third-level-node');
        const fourthLevelAttribute = card.getAttribute('data-fourth-level-node');
        console.log(topLevelAttribute, firstLevelAttribute, secondLevelAttribute, thirdLevelAttribute, fourthLevelAttribute);
        if (row === 'first-row') {
            thirdRow.innerHTML = '';
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            const data = await getFirstLevelNodes(topLevelAttribute);
            renderSecondRow(data || []);
        } else if (row === 'second-row') {
            fourthRow.innerHTML = '';
            fifthRow.innerHTML = '';
            const data = await getSecondLevelNodes(topLevelAttribute, firstLevelAttribute);
            renderThirdRow(data || []);
        } else if (row === 'third-row') {
            fifthRow.innerHTML = '';
            const data = await getThirdLevelNodes(topLevelAttribute, firstLevelAttribute, secondLevelAttribute);
            renderFourthRow(data || []);
        } else if (row === 'fourth-row') {
            const data = await getFourthLevelNodes(topLevelAttribute, firstLevelAttribute, secondLevelAttribute, thirdLevelAttribute);
            renderFifthRow(data || []);
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

getTopLevelNodes().then(topLevelNodes => {
    console.log(topLevelNodes);
    renderFirstRow(topLevelNodes);
});
