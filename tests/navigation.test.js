import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/config.js';
// import { generateReport } from '../utils/report.js';

// Config
export const options = {
    vus: 1,
    duration: '10s',
};

// Category list
const categories = [
    '/electronics',
    '/apparel',
    '/digital-downloads',
    '/books',
    '/computers',
    '/jewelry',
    '/gift-cards'
];

export default function () {

    //Step 1: Visit homepage
    const homeRes = http.get(`${BASE_URL}/`);

    check(homeRes, {
        'Homepage loaded (200)': (r) => r.status === 200,
    });

    //Step 2: Random navigation (6–7 pages)
    const shuffled = categories.sort(() => 0.5 - Math.random());

    const selectedCategories = shuffled.slice(0, 6);

    for (let i = 0; i < selectedCategories.length; i++) {

        const url = `${BASE_URL}${selectedCategories[i]}`;

        const res = http.get(url);

        console.log(`Visiting: ${url}`);
        console.log(`Status: ${res.status}`);

        //Step 3: Validation
        check(res, {
            'Page loaded (200)': (r) => r.status === 200,

            // Content validation (important)
            'Page has content': (r) =>
                r.body.includes('product-item') ||
                r.body.includes('category-grid') ||
                r.body.includes('page-title'),
        });

        //Think time (real user behavior)
        sleep(Math.random() * 2 + 1);
    }
}

// export function handleSummary(data) {
//     return generateReport(data, 'navigation');
// }

//k6 run tests/navigation.test.js
// k6 run tests/navigation.test.js --out csv=reports/navigation.csv
// node utils/report.js navigation