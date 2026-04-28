import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { BASE_URL } from '../config/config.js';
import { generateReport } from '../utils/report.js';

//Load CSV
const searchData = new SharedArray('search data', function () {
    return open('../data/search.csv')
        .split('\n')
        .slice(1)
        .map(row => row.trim())
        .filter(q => q);
});

export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {

    const query = searchData[Math.floor(Math.random() * searchData.length)];
    const encodedQuery = encodeURIComponent(query);

    const searchUrl = `${BASE_URL}/search?q=${encodedQuery}`;

    console.log(`Searching: ${query}`);

    //allow redirect (important)
    const res = http.get(searchUrl, {
        redirects: 5,
    });

    console.log(`Final URL: ${res.url}`);
    console.log(`Status: ${res.status}`);

    //Detect type
    const isSearchPage = res.url.includes('/search');
    const isProductPage = res.url.includes('/product');

    //Validation
    check(res, {
        'status is 200': (r) => r.status === 200,

        // Case 1: Search results page
        'search results displayed (if search page)': (r) => {
            if (isSearchPage) {
                return (
                    r.body.includes('product-item') ||
                    r.body.includes('No products were found')
                );
            }
            return true;
        },

        // Case 2: Product page
        'product page displayed (if redirected)': (r) => {
            if (isProductPage) {
                return (
                    r.body.includes('product-title') ||
                    r.body.includes('product-name')
                );
            }
            return true;
        },

        // Strong relevance check
        'query keyword found in results': (r) => {
            // extract keywords (ignore small words)
            const keywords = query
                .toLowerCase()
                .split(' ')
                .filter(w => w.length > 3);

            // extract product titles from HTML
            const titles = r.html().find('.product-title').text().toLowerCase();

            // if no titles found, skip check (avoid false fail)
            if (!titles) {
                // if search page but no titles → must be "no result"
                return r.body.includes('No products were found');
            }

            return keywords.every(word => titles.includes(word));
        },
    });

    //Debug if failure
    if (res.status !== 200) {
        console.error(`Search failed for: ${query}`);
    }

    sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
    return generateReport(data, 'search');
}

//k6 run tests/search.test.js