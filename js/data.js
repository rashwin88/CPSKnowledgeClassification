
const supabase = window.supabase.createClient(
    'https://pbqlhafzqkdmtktkmuip.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicWxoYWZ6cWtkbXRrdGttdWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjE1OTIsImV4cCI6MjA1ODM5NzU5Mn0.T7z_dGQh2TimIEzLpxjf5hgEseefNQ7lYbcTtxJDHE4'
);


const hierarchyCache = {
    top: null,
    first: {},     // key: top
    second: {},    // key: top_first
    third: {},     // key: top_first_second
    fourth: {}
};

const codeSpecificCache = {
    cache: [],
    addToCache: function (code, data) {
        if (this.cache.length >= 20) {
            this.cache.pop();
        }
        this.cache.unshift({ code, data });
    },
    getFromCache: function (code) {
        return this.cache.find(item => item.code === code);
    }
};

// Get code specific data from supabase
// Looks at the cache first, if not found, gets from supabase and adds to cache
async function getCodeSpecificData(code) {
    const cachedData = codeSpecificCache.getFromCache(code);
    if (cachedData) return cachedData;

    const { data, error } = await supabase
        .from('hierarchy_details')
        .select('*')
        .eq('code', code);

    if (error) {
        console.error(`Supabase error (code specific - ${code}):`, error.message);
        return [];
    }

    let selectedData = data[0];

    codeSpecificCache.addToCache(code, selectedData);
    return selectedData;
};

async function getTopLevelNodes() {
    if (hierarchyCache.top) return hierarchyCache.top;
    const { data, error } = await supabase
        .from('hierarchy_details')
        .select('*')
        .is('first_level_node', null)
        .is('second_level_node', null)
        .is('third_level_node', null)
        .is('fourth_level_node', null)
        .order('code', { ascending: true });


    if (error) {
        console.error('Supabase error (top):', error.message);
        return [];
    }


    hierarchyCache.top = data;
    return data;
}

async function getFirstLevelNodes(top) {
    if (hierarchyCache.first[top]) return hierarchyCache.first[top];

    const { data, error } = await supabase
        .from('hierarchy_details')
        .select('*')
        .eq('top_level_node', top)
        .not('first_level_node', 'is', null)
        .is('second_level_node', null)
        .is('third_level_node', null)
        .is('fourth_level_node', null);

    if (error) {
        console.error(`Supabase error (first - ${top}):`, error.message);
        return [];
    }

    hierarchyCache.first[top] = data;
    return data;
}

async function getSecondLevelNodes(top, first) {
    const key = `${top}_${first}`;
    if (hierarchyCache.second[key]) return hierarchyCache.second[key];

    const { data, error } = await supabase
        .from('hierarchy_details')
        .select('*')
        .eq('top_level_node', top)
        .eq('first_level_node', first)
        .not('second_level_node', 'is', null)
        .is('third_level_node', null)
        .is('fourth_level_node', null);

    if (error) {
        console.error(`Supabase error (second - ${key}):`, error.message);
        return [];
    }

    hierarchyCache.second[key] = data;
    return data;
}

async function getThirdLevelNodes(top, first, second) {
    const key = `${top}_${first}_${second}`;
    if (hierarchyCache.third[key]) return hierarchyCache.third[key];

    const { data, error } = await supabase
        .from('hierarchy_details')
        .select('*')
        .eq('top_level_node', top)
        .eq('first_level_node', first)
        .eq('second_level_node', second)
        .not('third_level_node', 'is', null)
        .is('fourth_level_node', null);

    if (error) {
        console.error(`Supabase error (third - ${key}):`, error.message);
        return [];
    }

    hierarchyCache.third[key] = data;
    return data;
}

async function getFourthLevelNodes(top, first, second, third) {
    const key = `${top}_${first}_${second}_${third}`;
    if (hierarchyCache.fourth[key]) return hierarchyCache.fourth[key];

    const { data, error } = await supabase
        .from('hierarchy_details')
        .select('*')
        .eq('top_level_node', top)
        .eq('first_level_node', first)
        .eq('second_level_node', second)
        .eq('third_level_node', third)
        .not('fourth_level_node', 'is', null);

    if (error) {
        console.error(`Supabase error (fourth - ${key}):`, error.message);
        return [];
    }

    hierarchyCache.fourth[key] = data;
    return data;
}
