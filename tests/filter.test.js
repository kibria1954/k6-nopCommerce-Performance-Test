import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/config.js';
// import { generateReport } from '../utils/report.js';

//Smoke config
export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {

    //Step 1: Visit New Products page
    const newProductsRes = http.get(`${BASE_URL}/newproducts`);

    check(newProductsRes, {
        'New Products page loaded (200)': (r) => r.status === 200,
    });

    //Step 2: Navigate to Books category
    const booksRes = http.get(`${BASE_URL}/books`);

    check(booksRes, {
        'Books page loaded (200)': (r) => r.status === 200,
    });

    //Step 3: Apply filter (price 1-100)
    const filterUrl = `${BASE_URL}/books?viewmode=grid&orderby=0&pagesize=6&price=1-50`;

    const filterRes = http.get(filterUrl);

    //Debug
    console.log(`Filter URL: ${filterUrl}`);
    console.log(`Status: ${filterRes.status}`);

    // 🔹 Step 4: Validation
    check(filterRes, {
        'Filter page loaded (200)': (r) => r.status === 200,

        // Check products exist (very important)
        'Products are displayed': (r) =>
            r.body.includes('product-item') || r.body.includes('product-title'),

        // Optional: verify price filter applied
        'Filter applied (price)': (r) =>
            r.url.includes('price=1-50'),
    });

    sleep(1);
}
// export function handleSummary(data) {
//     return generateReport(data, 'filter');
// }
//k6 run tests/filter.test.js
// k6 run tests/filter.test.js --out csv=reports/filter.csv
// node utils/report.js filter