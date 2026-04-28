import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/config.js';
import { generateReport } from '../utils/report.js';

export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {

    //Step 1: Visit New Products
    const newProductsRes = http.get(`${BASE_URL}/newproducts`);

    check(newProductsRes, {
        'New Products loaded': (r) => r.status === 200,
    });

    //Step 2: Navigate to Electronics → Cell Phones
    const electronicsRes = http.get(`${BASE_URL}/electronics`);

    check(electronicsRes, {
        'Electronics loaded': (r) => r.status === 200,
    });

    const cellPhonesUrl = `${BASE_URL}/cell-phones?viewmode=grid&orderby=0&pagesize=3`;

    const cellPhonesRes = http.get(cellPhonesUrl);

    check(cellPhonesRes, {
        'Cell Phones loaded (pagesize=3)': (r) => r.status === 200,
    });

    console.log(`Base URL: ${cellPhonesUrl}`);

    //Step 3: Random pagination (1–2 pages)
    const totalPagesToVisit = Math.floor(Math.random() * 2) + 1; // 1 or 2 pages

    let previousBody = cellPhonesRes.body;

    for (let i = 1; i <= totalPagesToVisit; i++) {

        const pageUrl = `${BASE_URL}/cell-phones?pagenumber=${i}&viewmode=grid&orderby=0&pagesize=3`;

        const res = http.get(pageUrl);

        console.log(`Visiting Page ${i}: ${pageUrl}`);
        console.log(`Status: ${res.status}`);

        //Step 4: Validation
        check(res, {
            'Page loaded (200)': (r) => r.status === 200,

            'Products displayed': (r) =>
                r.body.includes('product-item'),

            // Important: content should change between pages
            'Page content updated': (r) =>
                r.body !== previousBody,
        });

        previousBody = res.body;

        sleep(Math.random() * 2 + 1);
    }
}

export function handleSummary(data) {
    return generateReport(data, 'pagination');
}

//k6 run tests/pagination.test.js