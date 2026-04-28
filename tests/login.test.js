import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { BASE_URL, HEADERS } from '../config/config.js';
import { generateReport } from '../utils/report.js';

// Load CSV data (users)
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

// Smoke Test Config
export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {

    //Pick random user
    const user = users[Math.floor(Math.random() * users.length)];

    console.log(`\n👤 Testing user: ${user.email}`);

    //Step 1: GET login page (with returnUrl)
    const loginPage = http.get(`${BASE_URL}/login?returnUrl=%2F`);

    //Extract anti-forgery token (more accurate selector)
    const token = loginPage.html()
        .find('form input[name="__RequestVerificationToken"]')
        .first()
        .attr('value');

    console.log(`Token: ${token}`);

    //If token missing → stop early
    if (!token) {
        console.error('Token NOT found!');
        return;
    }

    //Step 2: Prepare login payload
    const payload = {
        Email: user.email,
        Password: user.password,
        RememberMe: 'false',
        __RequestVerificationToken: token,
    };

    const params = {
        headers: HEADERS,
        redirects: 0, // important for checking redirect
    };

    //Step 3: Send login request (IMPORTANT: include returnurl)
    const res = http.post(`${BASE_URL}/login?returnurl=%2F`, payload, params);

    //Debug logs
    console.log(`Status: ${res.status}`);
    console.log(`Redirect: ${res.headers['Location']}`);

    //Step 4: Validation checks
    const result = check(res, {
        'status is 302': (r) => r.status === 302,
        'redirect exists': (r) => !!r.headers['Location'],
        'redirect correct': (r) =>
            r.headers['Location'] &&
            (r.headers['Location'] === '/' || r.headers['Location'].includes('/customer')),
        'no login error message': (r) =>
            !r.body.includes('Login was unsuccessful'),
    });

    // Extra debug if failed
    if (!result) {
        console.error(`Login FAILED for ${user.email}`);
        console.error(`Body: ${res.body.substring(0, 200)}`);
    } else {
        console.log(`Login SUCCESS`);
    }

    //Pause (simulate real user)
    sleep(1);
}

export function handleSummary(data) {
    return generateReport(data, 'login');
}

// k6 run tests/login.test.js