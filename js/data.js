
const supabase = window.supabase.createClient(
    'https://pbqlhafzqkdmtktkmuip.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicWxoYWZ6cWtkbXRrdGttdWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjE1OTIsImV4cCI6MjA1ODM5NzU5Mn0.T7z_dGQh2TimIEzLpxjf5hgEseefNQ7lYbcTtxJDHE4'
);

const TopLevelEndPoint = 'https://indian-knowledge-systems-api-production.up.railway.app/get-all-top-level-nodes';
const ChildrenEndPoint = 'https://indian-knowledge-systems-api-production.up.railway.app/get-all-children';

const hierarchyCache = {
    top: null,
    levels: {}
};


async function getTopLevelNodes() {
    if (hierarchyCache.top) return hierarchyCache.top;
    const response = await fetch(TopLevelEndPoint);
    if (!response.ok) {
        console.error('Failed to fetch top level nodes:', response.statusText);
        return [];
    }
    const data = await response.json();

    hierarchyCache.top = data;
    console.log(data);
    return data;
}

async function getAllChildren(id) {
    // Check if id is a key in the hierarchyCache 
    if (hierarchyCache.levels[id]) return hierarchyCache.levels[id];
    const response = await fetch(`${ChildrenEndPoint}/?id=${id}`);
    if (!response.ok) {
        console.error('Failed to fetch children:', response.statusText);
        return [];
    }
    const data = await response.json();
    hierarchyCache.levels[id] = data;
    return data;
}
