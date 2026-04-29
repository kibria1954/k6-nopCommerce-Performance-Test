# 🚀 K6 Performance Testing – nopCommerce

This project demonstrates **end-to-end performance testing** using **K6** on a nopCommerce application.

🔗 **Base URL:** http://localhost:8047/
🧪 Tool Used: **K6 (Grafana Labs)**

---

# 📌 Project Overview

This repository covers **real user scenarios** for nopCommerce, including:

* 🔐 User Login
* 🔎 Product Search
* 📂 Navigation
* 📄 Pagination
* 🎯 Apply Filters
* 🛒 Add to Cart (Single & Multiple Products)

👉 The goal is to simulate **real user behavior** and validate both:

* ✔ Functionality
* ✔ Performance

---

# 📁 Project Structure

```
K6-nopCommerce-Task/
│
├── config/
│   └── config.js          # Base URL & headers
│
├── data/
│   ├── users.csv          # Login users
│   ├── products.csv       # Product names
│   └── search.csv         # Search queries
│
├── tests/
│   ├── login.test.js
│   ├── filter.test.js
│   ├── navigation.test.js
│   ├── pagination.test.js
│   ├── search.test.js
│   ├── addToCart.test.js
│   └── addMultipleProducts.test.js
│
├── utils/
│   └── report.js          # HTML report generator
│
├── reports/               # Generated HTML reports
│
└── README.md
```

---

# ⚙️ Prerequisites

* Install **K6**
  👉 https://k6.io/docs/get-started/installation/

* Ensure nopCommerce is running locally:

```
http://localhost:8047/
```

---

# ▶️ How to Run Tests

Run any test using:

```bash
k6 run tests/login.test.js
k6 run tests/login.test.js --out csv=reports/login.csv
node utils/report.js login
```

# 📊 HTML Report Generation

Each test generates a detailed HTML report.

📁 Output location:

```
k6 run tests/login.test.js --out csv=reports/login.csv
node utils/report.js login
/reports/<test-name>.html
```

👉 Open in browser to view:

* ✔ Response time
* ✔ Checks pass/fail
* ✔ Request metrics
* ✔ Performance graphs

---

# 🧪 Test Scenarios

## 🔐 1. Login

* Visit login page
* Submit credentials
* Validate successful login

---

## 🔎 2. Product Search

* Search using CSV data
* Handle:

  * Search results page
  * Direct product page
* Validate relevant results

---

## 🎯 3. Apply Filter

* Navigate to category
* Apply price filters
* Validate filtered results

---

## 🧭 4. Navigation

* Visit multiple categories
* Validate page loads (status 200)

---

## 📄 5. Pagination

* Navigate through product pages
* Validate content updates

---

## 🛒 6. Add Single Product

* Login user
* Open product page
* Add to cart
* Validate cart

---

## 📦 7. Add Multiple Products (CSV Driven)

* Random user login
* Clear cart
* Loop through products
* Add multiple items
* Validate all products in cart

---

# ⚡ K6 Configuration Example

```javascript
export const options = {
    vus: 1,
    duration: '10s',
};
```

* **vus** → virtual users
* **duration** → test execution time

---

# 📈 Performance Test Types (Supported)

You can easily extend tests for:

| Test Type   | Example              |
| ----------- | -------------------- |
| Smoke Test  | 1 VU, short duration |
| Load Test   | Moderate VUs         |
| Stress Test | High VUs             |
| Spike Test  | Sudden traffic       |
| Soak Test   | Long duration        |
| Breakpoint  | Find system limit    |

---

# 💡 Key Features

✔ CSV-driven test data
✔ Dynamic product handling
✔ Anti-forgery token support
✔ Session-based login
✔ Real user flow simulation
✔ HTML reporting
✔ Clean and modular structure

---

# ⚠️ Best Practices Used

* ✔ Used `sleep()` for realistic pacing
* ✔ Used `check()` for validations
* ✔ Handled redirects properly
* ✔ Extracted tokens dynamically
* ✔ Clean separation of config, data, and tests

---

# 📊 Advanced HTML Report Dashboard
After running a test, K6 outputs a CSV summary file inside the reports/ folder (e.g., reports/addMultipleProducts.csv).
You then generate a professional, interactive dashboard using the provided report.js utility.

# 🧰 Generate the Dashboard
bash
node utils/report.js <test-name>
Example:

bash
node utils/report.js addMultipleProducts
This will create:

text
reports/addMultipleProducts.html
# 🔥 Dashboard Features (Grafana‑like)
Feature	Description
Time‑series Chart	Shows average response time (ms) over the whole test duration (per second).
Interactive Table	Sort, search, and filter by any column (Group, URL, P95, etc.).
Threshold Badges	Color‑coded status based on P95 latency:
✅ Green (<200ms)
⚠️ Orange (<500ms)
❌ Red (≥500ms)
Sparklines	Hover over the “Trend” column to see the last 10 response times.
Dark / Light Mode	One‑click theme toggle (Grafana‑style).
Export to CSV	Download the table data as a CSV file for further analysis.
Responsive Design	Works perfectly on desktop, tablet, and mobile.
💡 The dashboard uses Chart.js, jQuery DataTables, and CDN fonts – no extra installation required.

# 📈 Example Metrics You’ll See
Count of requests per endpoint

Min / Median / Max / Mean response time

P95 & P99 percentiles

Overall stats: total requests, unique endpoints, average latency, worst P99


---

# 🚀 Future Improvements

* Add Checkout flow (Billing + Payment)
* Integrate with Grafana Dashboard
* CI/CD integration (GitHub Actions)
* Run with multiple VUs for load testing

---

# 👨‍💻 Author

**Md Ashadul Kibria**
QA Engineer | Performance Testing Enthusiast

---

# ⭐ Final Note

This project demonstrates **real-world performance testing workflow** using K6 on an eCommerce platform.

👉 Suitable for:

* QA Engineers
* Automation Engineers
* Performance Testing Beginners

---
