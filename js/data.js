
const supabase = window.supabase.createClient(
    'https://pbqlhafzqkdmtktkmuip.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicWxoYWZ6cWtkbXRrdGttdWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjE1OTIsImV4cCI6MjA1ODM5NzU5Mn0.T7z_dGQh2TimIEzLpxjf5hgEseefNQ7lYbcTtxJDHE4'
);

const TopLevelEndPoint = 'https://indian-knowledge-systems-api-production.up.railway.app/get-all-top-level-nodes';
const ChildrenEndPoint = 'https://indian-knowledge-systems-api-production.up.railway.app/get-all-children';

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
