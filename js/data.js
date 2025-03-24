let classificationData = [];

async function loadClassificationData() {
    const response = await fetch("/assets/hierarchy.json");
    classificationData = await response.json();
}

function getTopLevelNodes() {
    return classificationData.filter((node) => node.top_level_node === null);
}

function getTopLevelNodes() {
    return classificationData.filter(d =>
        d.top_level_node !== null &&
        d.first_level_node === null &
        d.second_level_node === null &&
        d.third_level_node === null &&
        d.fourth_level_node === null
    );
}

function getFirstLevelNodes(topCode) {
    return classificationData.filter(d =>
        d.top_level_node === topCode &&
        d.first_level_node !== null &&
        d.second_level_node === null &&
        d.third_level_node === null &&
        d.fourth_level_node === null
    );
}


function getSecondLevelNodes(topCode, firstLevel) {
    return classificationData.filter(d =>
        d.top_level_node === topCode &&
        d.first_level_node === firstLevel &&
        d.second_level_node !== null &&
        d.third_level_node === null &&
        d.fourth_level_node === null
    );
}

/**
 * Returns third-level children.
 */
function getThirdLevelNodes(topCode, firstLevel, secondLevel) {
    return classificationData.filter(d =>
        d.top_level_node === topCode &&
        d.first_level_node === firstLevel &&
        d.second_level_node === secondLevel &&
        d.third_level_node !== null &&
        d.fourth_level_node === null
    );
}

/**
 * Returns fourth-level children.
 */
function getFourthLevelNodes(topCode, firstLevel, secondLevel, thirdLevel) {
    return classificationData.filter(d =>
        d.top_level_node === topCode &&
        d.first_level_node === firstLevel &&
        d.second_level_node === secondLevel &&
        d.third_level_node === thirdLevel &&
        d.fourth_level_node !== null
    );
}


