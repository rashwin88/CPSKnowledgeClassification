
const supabase = window.supabase.createClient(
    'https://pbqlhafzqkdmtktkmuip.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicWxoYWZ6cWtkbXRrdGttdWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjE1OTIsImV4cCI6MjA1ODM5NzU5Mn0.T7z_dGQh2TimIEzLpxjf5hgEseefNQ7lYbcTtxJDHE4'
);

const TopLevelEndPoint = 'https://indian-knowledge-systems-api-production.up.railway.app/get-all-top-level-nodes';
const ChildrenEndPoint = 'https://indian-knowledge-systems-api-production.up.railway.app/get-all-children';

// Map of classification code to hierarchy entry.
// Populated on demand using the API endpoints.
window.hierarchyMap = {};

// Determine the parent code for a given classification number
function getParentCode(code) {
    const [top, rest] = code.split('.');
    if (!rest) return null;
    return rest.length === 1 ? top : `${top}.${rest.slice(0, -1)}`;
}

// Fetch a hierarchy entry for the given code using the API
// Results are cached in window.hierarchyMap
async function fetchHierarchyEntry(code) {
    if (window.hierarchyMap[code]) return window.hierarchyMap[code];

    let entry = null;
    if (!code.includes('.')) {
        const nodes = await getTopLevelNodes();
        entry = nodes.find(n => n.id === code || n.code === code || n.top_level_node === code);
    } else {
        const parent = getParentCode(code);
        if (parent) {
            const children = await getAllChildren(parent);
            entry = children.find(c => c.id === code || c.code === code);
        }
    }

    if (entry) {
        window.hierarchyMap[code] = entry;
    }
    return entry || null;
}

// Build a classification path string for a given code.
// Handles any depth by iteratively fetching each prefix from the API.
// Missing prefixes are still included so subjects show the full code path.
window.getClassificationPath = async function (code) {
    if (!code) return '';

    code = code.trim();
    const segments = [];

    // Split into numeric part and optional suffix (e.g. "042.5414 PEY")
    let numericPart = code;
    let suffix = '';
    const spaceMatch = code.match(/^(\S+)\s+(.+)/);
    if (spaceMatch) {
        numericPart = spaceMatch[1];
        suffix = spaceMatch[2];
    }

    const [topLevel, restDigits = ''] = numericPart.split('.');

    const topEntry = await fetchHierarchyEntry(topLevel);
    const topLabel = topEntry ? (topEntry.node_label || topEntry.entry_name || '') : '';
    segments.push(`${topLevel}${topLabel ? ' ' + topLabel : ''}`.trim());

    let prefix = topLevel;
    for (let i = 0; i < restDigits.length; i++) {
        const digit = restDigits[i];
        prefix = i === 0 ? `${prefix}.${digit}` : `${prefix}${digit}`;
        const entry = await fetchHierarchyEntry(prefix);
        const name = entry ? (entry.node_label || entry.entry_name || '') : '';
        const label = name ? `${prefix} ${name}` : prefix;
        segments.push(label.trim());
    }

    if (suffix) {
        const fullCode = `${numericPart} ${suffix}`;
        const entry = await fetchHierarchyEntry(fullCode);
        const name = entry ? (entry.node_label || entry.entry_name || '') : '';
        const label = name ? `${fullCode}#${name}#` : fullCode;
        segments.push(label.trim());
    }

    return segments.join(' / ');
};

function showLoader() {
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
}

const hierarchyCache = {
    top: null,
    levels: {}
};

// Cache of all nodes keyed by id
let allNodesCache = null;
let allNodesLoading = null;

// Cache for parent sequences of each node
const nodeParentsCache = {};

// Load the entire nodes table into cache for quick lookup
async function loadAllNodes() {
    if (allNodesCache) return allNodesCache;
    if (allNodesLoading) return allNodesLoading;
    allNodesLoading = (async () => {
        try {
            const { data, error } = await supabase
                .from('nodes')
                .select('id,node_parent_list');
            if (error) {
                console.error('Error loading nodes:', error);
                allNodesCache = {};
            } else {
                allNodesCache = {};
                (data || []).forEach(n => {
                    allNodesCache[n.id] = n;
                    if (n.node_parent_list) {
                        nodeParentsCache[n.id] = n.node_parent_list;
                    }
                });
            }
        } catch (err) {
            console.error('Unexpected error loading nodes:', err);
            allNodesCache = {};
        } finally {
            allNodesLoading = null;
        }
        return allNodesCache;
    })();
    return allNodesLoading;
}

// Expose loader
window.loadAllNodes = loadAllNodes;

// Cache for book counts by classification prefix
const bookCountCache = {};

// Fetch number of committed_records with classification_number starting with
// the given prefix. Uses caching to avoid duplicate requests.
async function getBookCount(prefix) {
    if (bookCountCache[prefix] !== undefined) {
        return bookCountCache[prefix];
    }
    // Replace spaces with dashes as classification numbers are stored using '-'
    const sanitizedPrefix = prefix.replace(/\s+/g, '-');
    try {
        const { count, error } = await supabase
            .from('committed_records')
            .select('*', { count: 'exact', head: true })
            .like('classification_number', `${sanitizedPrefix}%`);
        if (error) {
            console.error('Error fetching book count:', error);
            bookCountCache[prefix] = 0;
        } else {
            bookCountCache[prefix] = count || 0;
        }
    } catch (err) {
        console.error('Unexpected error fetching book count:', err);
        bookCountCache[prefix] = 0;
    }
    return bookCountCache[prefix];
}

// expose helper for other scripts
window.getBookCount = getBookCount;

// Fetch parent sequence for a classification number
// Results are cached in nodeParentsCache
async function getNodeParents(code) {
    if (!code) return null;
    code = code.replace(/#.*?#/, '').trim();
    if (nodeParentsCache[code]) {
        return nodeParentsCache[code];
    }
    await loadAllNodes();
    if (allNodesCache && allNodesCache[code]) {
        const parents = allNodesCache[code].node_parent_list || null;
        nodeParentsCache[code] = parents;
        return parents;
    }
    try {
        const { data, error } = await supabase
            .from('nodes')
            .select('node_parent_list')
            .eq('id', code)
            .maybeSingle();
        if (error) {
            console.error('Error fetching node parents:', error);
            return null;
        }
        const parents = data ? data.node_parent_list : null;
        nodeParentsCache[code] = parents;
        return parents;
    } catch (err) {
        console.error('Unexpected error fetching node parents:', err);
        return null;
    }
}

// Expose helper
window.getNodeParents = getNodeParents;


async function getTopLevelNodes() {
    showLoader();
    if (hierarchyCache.top) {
        hideLoader();
        return hierarchyCache.top;
    }
    const response = await fetch(TopLevelEndPoint);
    if (!response.ok) {
        console.error('Failed to fetch top level nodes:', response.statusText);
        return [];
    }
    const data = await response.json();

    hierarchyCache.top = data;
    console.log(data);
    hideLoader();
    return data;
}

async function getAllChildren(id) {
    showLoader();
    // Check if id is a key in the hierarchyCache 
    if (hierarchyCache.levels[id]) {
        hideLoader();
        return hierarchyCache.levels[id]
    }
    const response = await fetch(`${ChildrenEndPoint}?id=${id}`);
    if (!response.ok) {
        console.error('Failed to fetch children:', response.statusText);
        return [];
    }
    const data = await response.json();
    hierarchyCache.levels[id] = data;
    hideLoader();
    return data;
}

// Warm up node cache on load
loadAllNodes();
