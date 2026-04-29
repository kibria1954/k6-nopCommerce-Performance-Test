import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { BASE_URL, HEADERS } from '../config/config.js';
// import { generateReport } from '../utils/report.js';

export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {

    let productId = null;
    let productToken = null;

    //LOGIN
    group('Login', function () {
        const loginPage = http.get(`${BASE_URL}/login?returnUrl=%2F`);

        const token = loginPage.html()
            .find('input[name="__RequestVerificationToken"]')
            .first()
            .attr('value');

        const payload = {
            Email: 'victoria_victoria@nopCommerce.com',
            Password: 'test',
            RememberMe: 'false',
            __RequestVerificationToken: token,
        };

        const res = http.post(`${BASE_URL}/login?returnUrl=%2F`, payload, {
            headers: HEADERS,
            redirects: 5,
        });

        check(res, {
            'login success': (r) =>
                r.status === 200 || r.status === 302,
        });
    });

    sleep(1);

    //PRODUCT PAGE
    group('Open Product', function () {

        const res = http.get(`${BASE_URL}/pride-and-prejudice`);

        const doc = res.html();

        productToken = doc
            .find('input[name="__RequestVerificationToken"]')
            .first()
            .attr('value');

        const input = doc.find('input[name^="addtocart_"]').first();
        const nameAttr = input.attr('name');

        if (!nameAttr) {
            console.error('add-to-cart input missing');
            return;
        }

        productId = nameAttr.match(/\d+/)[0];

        console.log(`Product ID: ${productId}`);
    });

    sleep(1);

    // ADD TO CART
    group('Add to Cart', function () {

        const url = `${BASE_URL}/addproducttocart/details/${productId}/1`;

        const payload = {
            [`addtocart_${productId}.EnteredQuantity`]: 1,
            __RequestVerificationToken: productToken,
        };

        const res = http.post(url, payload, {
            headers: HEADERS,
        });

        console.log(`Status: ${res.status}`);

        check(res, {
            'add to cart success': (r) =>
                r.status === 200 || r.status === 302,
        });
    });

    sleep(1);

    //CART
    group('Cart', function () {

        const res = http.get(`${BASE_URL}/cart`);

        check(res, {
            'cart page loaded': (r) => r.status === 200,
            'product in cart': (r) =>
                r.body.toLowerCase().includes('pride and prejudice'),
        });
    });

    sleep(1);
}
// export function handleSummary(data) {
//     return generateReport(data, 'addToCart');
// }

// k6 run tests/addToCart.test.js
// k6 run tests/addToCart.test.js --out csv=reports/addToCart.csv
// node utils/report.js addToCart