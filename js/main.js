// Dummy data - will later come from API

const firstRow = document.getElementById('first-row');
const secondRow = document.getElementById('second-row');
const thirdRow = document.getElementById('third-row');
const fourthRow = document.getElementById('fourth-row');
const fifthRow = document.getElementById('fifth-row');

function updateBookDisplayBox(categoryCode) {
    const displayBox = document.getElementById("books-display");
    displayBox.innerHTML = `📚 Books in selected category (${categoryCode}</strong>)`;
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
    card.style.backgroundColor = data.color;
    let innerHtml = '';
    if (row === 'first-row') {
        innerHtml = `
      <div class="top">${data.code}</div>
      <div class="category">${data.entry_name}</div>
      <div class="count">--</div>
    `;
    } else if (row === 'second-row') {
        innerHtml = `
      <div class="top">${data.code}</div>
      <div class="category">${data.entry_name}</div>
      <div class="count">--</div>
    `;
    } else if (row === 'third-row') {
        innerHtml = `
      <div class="top">${data.code}</div>
      <div class="category">${data.entry_name}</div>
      <div class="count">--</div>
    `;
    } else if (row === 'fourth-row') {
        innerHtml = `
      <div class="top">${data.code}</div>
      <div class="category">${data.entry_name}</div>
      <div class="count">--</div>
    `;
    } else if (row === 'fifth-row') {
        innerHtml = `
      <div class="top">${data.code}</div>
      <div class="category">${data.entry_name}</div>
      <div class="count">--</div>
    `;
    }

    card.innerHTML = innerHtml;

    // Add click handler to manage selection
    card.addEventListener('click', async () => {
        updateBookDisplayBox(card.getAttribute('data-category-code'));
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
