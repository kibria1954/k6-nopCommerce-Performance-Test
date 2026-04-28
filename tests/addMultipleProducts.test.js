import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { BASE_URL, HEADERS } from '../config/config.js';
import { generateReport } from '../utils/report.js';

// =========================
// LOAD USERS
// =========================
const users = new SharedArray('users', function () {
    return open('../data/users.csv')
        .split('\n')
        .slice(1)
        .map(row => {
            const [email, password] = row.split(',');
            return { email: email?.trim(), password: password?.trim() };
        })
        .filter(u => u.email && u.password);
});

// =========================
// LOAD PRODUCTS (exclude gift cards)
// =========================
const allProducts = new SharedArray('products', function () {
    return open('../data/products.csv')
        .split('\n')
        .slice(1)
        .map(row => row.trim())
        .filter(p => p && !p.toLowerCase().includes('gift'));
});

export const options = {
    vus: 1,
    duration: '30s',
};

// Fix: Clear cart using the correct endpoint (/cart) with updatecart parameter
function clearCart() {
    // 1. Get cart page to extract token and item IDs
    const cartPage = http.get(`${BASE_URL}/cart`);
    const doc = cartPage.html();

    // 2. Extract anti-forgery token
    const token = doc.find('input[name="__RequestVerificationToken"]').val();
    if (!token) {
        console.error('Cannot clear cart: token missing');
        return false;
    }

    // 3. Find all "removefromcart" checkboxes (value = cart item ID)
    const removeInputs = doc.find('input[name="removefromcart"]');
    if (removeInputs.size() === 0) {
        console.log('Cart already empty');
        return true;
    }

    // 4. Build payload for the update cart form
    const payload = {
        __RequestVerificationToken: token,
        updatecart: 'Update shopping cart',
    };

    // Add each cart item ID as a separate removefromcart field
    for (let i = 0; i < removeInputs.size(); i++) {
        const cartItemId = removeInputs.eq(i).attr('value');
        payload[`removefromcart`] = payload[`removefromcart`] || [];
        payload[`removefromcart`].push(cartItemId);
    }

    // 5. POST to /cart (standard update cart endpoint)
    const removeRes = http.post(`${BASE_URL}/cart`, payload, { headers: HEADERS });

    if (removeRes.status === 200 || removeRes.status === 302) {
        console.log(`Cart cleared (removed ${removeInputs.size()} items)`);
        return true;
    } else {
        console.error(`Clear cart failed, status: ${removeRes.status}`);
        return false;
    }
}

export default function () {
    // =========================
    // LOGIN
    // =========================
    const user = users[Math.floor(Math.random() * users.length)];
    console.log(`\n Login user: ${user.email}`);

    const loginPage = http.get(`${BASE_URL}/login?returnUrl=%2F`);
    const loginToken = loginPage.html()
        .find('input[name="__RequestVerificationToken"]')
        .first()
        .attr('value');

    const loginRes = http.post(`${BASE_URL}/login?returnUrl=%2F`, {
        Email: user.email,
        Password: user.password,
        RememberMe: 'false',
        __RequestVerificationToken: loginToken,
    }, {
        headers: HEADERS,
        redirects: 5,
    });

    check(loginRes, { 'login success': (r) => r.status === 200 || r.status === 302 });

    sleep(1);

    // =========================
    // CLEAR CART (fixed)
    // =========================
    const cleared = clearCart();

    // Verify cart is empty
    const cartAfterClear = http.get(`${BASE_URL}/cart`);
    const isEmpty = cartAfterClear.body.includes('Your Shopping Cart is empty!');
    console.log(`Cart empty after clear: ${isEmpty}`);
    check(cartAfterClear, { 'cart is empty after clear': () => isEmpty });

    // If clearing failed, we still proceed but the test may have leftovers
    sleep(1);

    // =========================
    // RANDOM PRODUCTS (2 or 3)
    // =========================
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
    let addedProducts = [];

    // =========================
    // ADD EACH PRODUCT
    // =========================
    for (let i = 0; i < selectedProducts.length; i++) {
        const query = selectedProducts[i];
        console.log(`\n Searching: ${query}`);

        const searchRes = http.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
            redirects: 5,
        });

        const doc = searchRes.html();
        let productLink = doc.find('.product-title a').first().attr('href');

        if (!productLink && searchRes.url.includes(BASE_URL)) {
            productLink = searchRes.url.replace(BASE_URL, '');
        }

        if (!productLink) {
            console.error(`Product not found: ${query}`);
            continue;
        }

        const fullUrl = `${BASE_URL}${productLink}`;
        console.log(`Product URL: ${fullUrl}`);

        const productRes = http.get(fullUrl);
        const productDoc = productRes.html();

        const token = productDoc.find('input[name="__RequestVerificationToken"]').first().attr('value');
        if (!token) {
            console.error(`Token missing for ${query}`);
            continue;
        }

        const addToCartInput = productDoc.find('input[name^="addtocart_"]').first();
        const nameAttr = addToCartInput.attr('name');
        if (!nameAttr) {
            console.error(`add-to-cart input not found for ${query}`);
            continue;
        }

        const productId = nameAttr.match(/\d+/)[0];
        console.log(`Product ID: ${productId}`);

        const addPayload = {
            [`addtocart_${productId}.EnteredQuantity`]: 1,
            __RequestVerificationToken: token,
        };

        const addRes = http.post(
            `${BASE_URL}/addproducttocart/details/${productId}/1`,
            addPayload,
            { headers: HEADERS }
        );

        console.log(`Add status: ${addRes.status}`);

        let addSuccess = false;
        try {
            const json = JSON.parse(addRes.body);
            addSuccess = json.success === true;
        } catch (e) {
            addSuccess = addRes.status === 200 || addRes.status === 302;
        }

        if (addSuccess) {
            addedProducts.push(query);
            console.log(`Added: ${query}`);
        } else {
            console.error(`Failed to add: ${query}`);
        }

        sleep(1);
    }

    // =========================
    // VERIFY CART CONTENTS
    // =========================
    const cartRes = http.get(`${BASE_URL}/cart`);
    check(cartRes, { 'cart page loaded': (r) => r.status === 200 });

    const body = cartRes.body.toLowerCase();

    for (let i = 0; i < addedProducts.length; i++) {
        const product = addedProducts[i].toLowerCase();
        const found = body.includes(product) || body.includes(product.replace('$', ''));
        check(cartRes, {
            [`product in cart: ${product}`]: () => found,
        });
        console.log(`"${product}" in cart: ${found}`);
    }

    sleep(Math.random() * 2 + 1);
}
export function handleSummary(data) {
    return generateReport(data, 'addMultipleProducts');
}

// k6 run tests/addMultipleProducts.test.js