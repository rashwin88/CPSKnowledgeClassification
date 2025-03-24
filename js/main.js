// Dummy data - will later come from API
const TopLevelList = [{
    number: 0,
    category: "Computer science, information & general works",
    count: "242,235",
    icon: "https://cdn-icons-png.flaticon.com/512/471/471664.png",
    color: "#e6e1e1",
    children: [
        { number: '0.1', category: "AI", count: "120,000", icon: "🤖", color: "#dcdcdc" },
        { number: '0.2', category: "Cybersecurity", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 1,
    category: "Philosophy & psychology",
    count: "255,350",
    icon: "https://cdn-icons-png.flaticon.com/512/117/117471.png",
    color: "#e6e1e1",
    children: [
        { number: '1.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { number: '1.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 2,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '2.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { number: '2.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 3,
    category: "Philosophy & psychology",
    count: "255,350",
    icon: "https://cdn-icons-png.flaticon.com/512/117/117471.png",
    color: "#e6e1e1",
    children: [
        { number: '3.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { number: '3.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
    ]
},
{
    number: 4,
    category: "Religion",
    count: "648,457",
    icon: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
    color: "#e6e1e1",
    children: [
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" },
        { number: '4.1', category: "Ethics", count: "100,000", icon: "🤖", color: "#dcdcdc" },
        { id: '4.2', category: "Psychology", count: "60,000", icon: "🛡️", color: "#f2f2f2" }
    ]
}];

const firstRow = document.getElementById('first-row');
const secondRow = document.getElementById('second-row');

function createCard(data, row) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundColor = data.color;
    card.innerHTML = `
      <div class="top">${data.number}</div>
      <div class="category">${data.category}</div>
      <div class="count">${data.count}</div>
      <img class="info-icon" src="${data.icon}" alt="Info Icon" />
    `;

    // Add click handler to manage selection
    card.addEventListener('click', () => {
        // Remove 'selected' from any other cards
        document.querySelectorAll(`#${row} .card.selected`).forEach(el => {
            el.classList.remove('selected');
        });

        // Add 'selected' to this card
        card.classList.add('selected');

        // Render the second row when the first row is clicked
        if (row === 'first-row') {
            renderSecondRow(data.children || []);
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




renderFirstRow(TopLevelList);