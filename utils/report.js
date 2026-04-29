// const fs = require('fs');

// const fileName = process.argv[2];

// if (!fileName) {
//     console.error('❌ Provide file name: node report.js login');
//     process.exit(1);
// }

// const INPUT = `./reports/${fileName}.csv`;
// const OUTPUT = `./reports/${fileName}.html`;

// // ---------- Helpers ----------
// function percentile(arr, p) {
//     const sorted = [...arr].sort((a, b) => a - b);
//     const index = Math.ceil((p / 100) * sorted.length) - 1;
//     return sorted[index] || 0;
// }

// function format(ms) {
//     if (ms < 1000) return ms.toFixed(1) + ' ms';
//     return (ms / 1000).toFixed(2) + ' s';
// }

// // Derive a logical group from the URL when the CSV group is empty
// function getGroupFromUrl(urlString) {
//     try {
//         const url = new URL(urlString);
//         const path = url.pathname; // e.g., "/login", "/api/users"
//         const parts = path.split('/').filter(p => p.length > 0);
//         if (parts.length > 0) {
//             return parts[0]; // first path segment (e.g., "login")
//         }
//         return "root";
//     } catch (e) {
//         return "unknown";
//     }
// }

// // ---------- Read CSV ----------
// const raw = fs.readFileSync(INPUT, 'utf-8').split('\n');

// // ---------- Parse ----------
// const urlMap = {};

// raw.forEach(line => {
//     // Only process http_req_duration rows
//     if (!line.includes('http_req_duration')) return;

//     const cols = line.split(',');
//     const duration = parseFloat(cols[2]);   // metric_value
//     const url = cols[16];                   // url column
//     let group = cols[7];                    // group column (may be empty)

//     if (!url || isNaN(duration)) return;

//     // If group is missing (empty string), derive from URL
//     if (!group || group.trim() === '') {
//         group = getGroupFromUrl(url);
//     }

//     // Clean URL: lowercase, remove query parameters
//     const cleanUrl = url.toLowerCase().split('?')[0];

//     const key = `${group}||${cleanUrl}`;

//     if (!urlMap[key]) {
//         urlMap[key] = {
//             group: group,
//             url: cleanUrl,
//             times: []
//         };
//     }

//     urlMap[key].times.push(duration);
// });

// // ---------- Build Table ----------
// let rows = '';

// for (const key in urlMap) {
//     const item = urlMap[key];
//     const times = item.times;

//     const count = times.length;
//     const min = Math.min(...times);
//     const max = Math.max(...times);
//     const mean = times.reduce((a, b) => a + b, 0) / count;

//     const sorted = [...times].sort((a, b) => a - b);
//     const median = sorted[Math.floor(count / 2)];

//     const p95 = percentile(times, 95);
//     const p99 = percentile(times, 99);

//     rows += `
//         <tr>
//             <td>${item.group}</td>
//             <td>${item.url}</td>
//             <td>${count}</td>
//             <td>${format(min)}</td>
//             <td>${format(median)}</td>
//             <td>${format(max)}</td>
//             <td>${format(mean)}</td>
//             <td>${format(p95)}</td>
//             <td>${format(p99)}</td>
//         </tr>
//     `;
// }

// // ---------- HTML ----------
// const html = `
// <html>
// <head>
//     <title>${fileName} Report</title>
//     <style>
//         body { font-family: Arial; padding: 20px; }
//         table { border-collapse: collapse; width: 100%; }
//         th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
//         th { background: #333; color: white; }
//         tr:nth-child(even) { background: #f2f2f2; }
//     </style>
// </head>
// <body>
//     <h2>K6 ${fileName} Performance Report</h2>
//     <table>
//         <tr>
//             <th>Group</th>
//             <th>URL</th>
//             <th>Count</th>
//             <th>Min</th>
//             <th>Median</th>
//             <th>Max</th>
//             <th>Mean</th>
//             <th>P95</th>
//             <th>P99</th>
//         </tr>
//         ${rows}
//     </table>
// </body>
// </html>
// `;

// fs.writeFileSync(OUTPUT, html);

// console.log(`✅ Report Generated: ${fileName}.html`);

// const fs = require('fs');

// const fileName = process.argv[2];

// if (!fileName) {
//     console.error('❌ Provide file name: node report.js login');
//     process.exit(1);
// }

// const INPUT = `./reports/${fileName}.csv`;
// const OUTPUT = `./reports/${fileName}.html`;

// // ---------- Helpers ----------
// function percentile(arr, p) {
//     const sorted = [...arr].sort((a, b) => a - b);
//     const index = Math.ceil((p / 100) * sorted.length) - 1;
//     return sorted[index] || 0;
// }

// function format(ms) {
//     if (typeof ms !== 'number' || isNaN(ms)) return '0.0 ms';
//     if (ms < 1000) return ms.toFixed(1) + ' ms';
//     return (ms / 1000).toFixed(2) + ' s';
// }

// // Derive a logical group from the URL when the CSV group is empty
// function getGroupFromUrl(urlString) {
//     try {
//         const url = new URL(urlString);
//         const path = url.pathname;
//         const parts = path.split('/').filter(p => p.length > 0);
//         if (parts.length > 0) return parts[0];
//         return "root";
//     } catch (e) {
//         return "unknown";
//     }
// }

// // ---------- Read CSV ----------
// const raw = fs.readFileSync(INPUT, 'utf-8').split('\n');

// // ---------- Parse ----------
// const urlMap = {};

// raw.forEach(line => {
//     if (!line.includes('http_req_duration')) return;

//     const cols = line.split(',');
//     const duration = parseFloat(cols[2]);
//     const url = cols[16];
//     let group = cols[7];

//     if (!url || isNaN(duration)) return;

//     if (!group || group.trim() === '') {
//         group = getGroupFromUrl(url);
//     }

//     const cleanUrl = url.toLowerCase().split('?')[0];
//     const key = `${group}||${cleanUrl}`;

//     if (!urlMap[key]) {
//         urlMap[key] = { group, url: cleanUrl, times: [] };
//     }
//     urlMap[key].times.push(duration);
// });

// // ---------- Build table rows and collect stats ----------
// let rows = '';
// let totalRequests = 0;
// let totalDurationSum = 0;

// for (const key in urlMap) {
//     const item = urlMap[key];
//     const times = item.times;

//     const count = times.length;
//     const min = Math.min(...times);
//     const max = Math.max(...times);
//     const mean = times.reduce((a, b) => a + b, 0) / count;
//     const sorted = [...times].sort((a, b) => a - b);
//     const median = sorted[Math.floor(count / 2)];
//     const p95 = percentile(times, 95);
//     const p99 = percentile(times, 99);

//     totalRequests += count;
//     totalDurationSum += mean * count;

//     rows += `
//         <tr>
//             <td data-label="Group">${escapeHtml(item.group)}</td>
//             <td data-label="URL">${escapeHtml(item.url)}</td>
//             <td data-label="Count">${count}</td>
//             <td data-label="Min">${format(min)}</td>
//             <td data-label="Median">${format(median)}</td>
//             <td data-label="Max">${format(max)}</td>
//             <td data-label="Mean">${format(mean)}</td>
//             <td data-label="P95">${format(p95)}</td>
//             <td data-label="P99">${format(p99)}</td>
//         </tr>
//     `;
// }

// // ✅ FIXED: overallAvg is a number, not a string
// const overallAvg = totalRequests ? (totalDurationSum / totalRequests) : 0;

// // Helper to escape HTML special characters
// function escapeHtml(str) {
//     return String(str).replace(/[&<>]/g, function(m) {
//         if (m === '&') return '&amp;';
//         if (m === '<') return '&lt;';
//         if (m === '>') return '&gt;';
//         return m;
//     }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
//         return c;
//     });
// }

// // ---------- Modern HTML with design ----------
// const html = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>K6 Report – ${escapeHtml(fileName)}</title>
//     <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet">
//     <style>
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }

//         body {
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
//             background: linear-gradient(135deg, #f5f7fc 0%, #eef2f6 100%);
//             padding: 2rem 1.5rem;
//             color: #1a2c3e;
//         }

//         .container {
//             max-width: 1400px;
//             margin: 0 auto;
//         }

//         /* Header Card */
//         .header-card {
//             background: white;
//             border-radius: 28px;
//             box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
//             padding: 2rem 2rem 1.8rem;
//             margin-bottom: 2rem;
//             transition: all 0.2s ease;
//         }

//         h1 {
//             font-size: 2.2rem;
//             font-weight: 700;
//             background: linear-gradient(135deg, #1e3c72, #2b4c8a);
//             background-clip: text;
//             -webkit-background-clip: text;
//             color: transparent;
//             letter-spacing: -0.01em;
//             margin-bottom: 0.5rem;
//         }

//         .subtitle {
//             color: #5b6e8c;
//             font-size: 0.95rem;
//             border-left: 3px solid #3b82f6;
//             padding-left: 1rem;
//             margin-top: 0.25rem;
//         }

//         /* Stats Grid */
//         .stats-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//             gap: 1.2rem;
//             margin-top: 2rem;
//         }

//         .stat-card {
//             background: #f8fafd;
//             border-radius: 20px;
//             padding: 1.2rem 1rem;
//             text-align: center;
//             transition: transform 0.2s, box-shadow 0.2s;
//             border: 1px solid rgba(59, 130, 246, 0.1);
//         }

//         .stat-card:hover {
//             transform: translateY(-3px);
//             box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
//             background: white;
//         }

//         .stat-label {
//             font-size: 0.8rem;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//             font-weight: 600;
//             color: #4b6b8f;
//             margin-bottom: 0.5rem;
//         }

//         .stat-value {
//             font-size: 2.2rem;
//             font-weight: 800;
//             color: #1e3c72;
//             line-height: 1.2;
//         }

//         .stat-unit {
//             font-size: 0.9rem;
//             font-weight: 500;
//             color: #6c86a3;
//         }

//         /* Table Wrapper */
//         .table-wrapper {
//             background: white;
//             border-radius: 24px;
//             box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
//             overflow-x: auto;
//             padding: 0.5px;
//         }

//         table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 0.9rem;
//             min-width: 800px;
//         }

//         th {
//             background: #1e2f41;
//             color: white;
//             font-weight: 600;
//             padding: 1rem 1rem;
//             font-size: 0.85rem;
//             letter-spacing: 0.3px;
//             text-transform: uppercase;
//             text-align: center;
//         }

//         th:first-child { border-top-left-radius: 20px; }
//         th:last-child { border-top-right-radius: 20px; }

//         td {
//             padding: 0.9rem 1rem;
//             border-bottom: 1px solid #e9edf2;
//             text-align: center;
//             color: #1f2f41;
//         }

//         tr:hover {
//             background: #f1f6fe;
//             transition: 0.1s;
//         }

//         tbody tr:nth-child(even) {
//             background-color: #fafcff;
//         }

//         @media (max-width: 768px) {
//             body {
//                 padding: 1rem;
//             }
//             .stat-value {
//                 font-size: 1.6rem;
//             }
//             table, thead, tbody, th, td, tr {
//                 display: block;
//             }
//             thead {
//                 display: none;
//             }
//             tr {
//                 margin-bottom: 1rem;
//                 border: 1px solid #e2e8f0;
//                 border-radius: 16px;
//                 background: white;
//                 padding: 0.5rem 0;
//             }
//             td {
//                 display: flex;
//                 justify-content: space-between;
//                 align-items: center;
//                 text-align: right;
//                 padding: 0.6rem 1rem;
//                 border-bottom: 1px solid #edf2f7;
//             }
//             td:last-child {
//                 border-bottom: none;
//             }
//             td::before {
//                 content: attr(data-label);
//                 font-weight: 600;
//                 text-align: left;
//                 color: #2c4f7a;
//                 font-size: 0.8rem;
//                 text-transform: uppercase;
//                 letter-spacing: 0.3px;
//             }
//         }

//         .footer {
//             text-align: center;
//             margin-top: 2rem;
//             font-size: 0.75rem;
//             color: #7b8ea8;
//             border-top: 1px solid #dce3ec;
//             padding-top: 1.5rem;
//         }
//     </style>
// </head>
// <body>
// <div class="container">
//     <div class="header-card">
//         <h1>📊 K6 Performance Report</h1>
//         <div class="subtitle">Test scenario: <strong>${escapeHtml(fileName)}</strong> · Generated on ${new Date().toLocaleString()}</div>
        
//         <div class="stats-grid">
//             <div class="stat-card">
//                 <div class="stat-label">Total Requests</div>
//                 <div class="stat-value">${totalRequests}</div>
//                 <div class="stat-unit">calls</div>
//             </div>
//             <div class="stat-card">
//                 <div class="stat-label">Unique Endpoints</div>
//                 <div class="stat-value">${Object.keys(urlMap).length}</div>
//                 <div class="stat-unit">URLs</div>
//             </div>
//             <div class="stat-card">
//                 <div class="stat-label">Overall Avg Response</div>
//                 <div class="stat-value">${format(overallAvg)}</div>
//                 <div class="stat-unit">mean</div>
//             </div>
//             <div class="stat-card">
//                 <div class="stat-label">Worst P99</div>
//                 <div class="stat-value">${format(Math.max(...Object.values(urlMap).map(i => percentile(i.times, 99))))}</div>
//                 <div class="stat-unit">peak latency</div>
//             </div>
//         </div>
//     </div>

//     <div class="table-wrapper">
//         <table>
//             <thead>
//                 <tr>
//                     <th>Group</th>
//                     <th>URL</th>
//                     <th>Count</th>
//                     <th>Min</th>
//                     <th>Median</th>
//                     <th>Max</th>
//                     <th>Mean</th>
//                     <th>P95</th>
//                     <th>P99</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 ${rows}
//             </tbody>
//         </table>
//     </div>
//     <div class="footer">
//         ⚡ Report generated using k6-custom-reporter · Latency values are in milliseconds (ms)
//     </div>
// </div>
// </body>
// </html>`;

// fs.writeFileSync(OUTPUT, html);
// console.log(`✅ Beautiful report generated: ${OUTPUT}`);
const fs = require('fs');

const fileName = process.argv[2];

if (!fileName) {
    console.error('❌ Provide file name: node report.js login');
    process.exit(1);
}

const INPUT = `./reports/${fileName}.csv`;
const OUTPUT = `./reports/${fileName}.html`;

// ---------- Helpers ----------
function percentile(arr, p) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
}

function format(ms) {
    if (typeof ms !== 'number' || isNaN(ms)) return '0.0 ms';
    if (ms < 1000) return ms.toFixed(1) + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
}

function getGroupFromUrl(urlString) {
    try {
        const url = new URL(urlString);
        const path = url.pathname;
        const parts = path.split('/').filter(p => p.length > 0);
        if (parts.length > 0) return parts[0];
        return "root";
    } catch (e) {
        return "unknown";
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ---------- Read CSV ----------
const raw = fs.readFileSync(INPUT, 'utf-8').split('\n');

// Data structures
const urlMap = {};            // key -> { group, url, times: [], timestamps: [] }
const timeSeries = {};        // timestamp (seconds) -> [durations]

raw.forEach(line => {
    if (!line.includes('http_req_duration')) return;

    const cols = line.split(',');
    const duration = parseFloat(cols[2]);   // metric_value
    const url = cols[16];
    let group = cols[7];
    const timestampRaw = parseFloat(cols[1]); // timestamp column
    const timestampSec = Math.floor(timestampRaw); // group by second

    if (!url || isNaN(duration)) return;

    if (!group || group.trim() === '') {
        group = getGroupFromUrl(url);
    }

    const cleanUrl = url.toLowerCase().split('?')[0];
    const key = `${group}||${cleanUrl}`;

    if (!urlMap[key]) {
        urlMap[key] = { group, url: cleanUrl, times: [], timestamps: [] };
    }
    urlMap[key].times.push(duration);
    urlMap[key].timestamps.push(timestampRaw);

    // For global time‑series
    if (!isNaN(timestampSec)) {
        if (!timeSeries[timestampSec]) timeSeries[timestampSec] = [];
        timeSeries[timestampSec].push(duration);
    }
});

// Prepare time‑series data for chart (sorted by timestamp)
const timeLabels = Object.keys(timeSeries).sort((a,b) => a - b);
const avgLatencyPerSec = timeLabels.map(ts => {
    const durations = timeSeries[ts];
    const avg = durations.reduce((a,b) => a + b, 0) / durations.length;
    return avg;
});

// Build table rows + data for sparklines and thresholds
let tableRows = '';
const tableData = []; // for DataTables

for (const key in urlMap) {
    const item = urlMap[key];
    const times = item.times;
    const count = times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const mean = times.reduce((a,b) => a+b,0) / count;
    const sorted = [...times].sort((a,b) => a-b);
    const median = sorted[Math.floor(count/2)];
    const p95 = percentile(times, 95);
    const p99 = percentile(times, 99);

    // Determine threshold badge
    let badgeClass = 'badge-good';
    let badgeText = '✅ Good';
    if (p95 >= 500) {
        badgeClass = 'badge-bad';
        badgeText = '❌ Bad (P95 ≥500ms)';
    } else if (p95 >= 200) {
        badgeClass = 'badge-warning';
        badgeText = '⚠️ Warning (P95 ≥200ms)';
    }

    // Sparkline data: last 10 points (or less) for mini chart
    const sparkData = times.slice(-10);

    tableRows += `
        <tr data-group="${escapeHtml(item.group)}" data-url="${escapeHtml(item.url)}">
            <td>${escapeHtml(item.group)}</td>
            <td>${escapeHtml(item.url)}</td>
            <td>${count}</td>
            <td>${format(min)}</td>
            <td>${format(median)}</td>
            <td>${format(max)}</td>
            <td>${format(mean)}</td>
            <td>${format(p95)}</td>
            <td>${format(p99)}</td>
            <td><span class="${badgeClass}">${badgeText}</span></td>
            <td class="sparkline-cell" data-spark="${sparkData.join(',')}">📈</td>
        </tr>
    `;

    tableData.push({
        group: item.group,
        url: item.url,
        count,
        min: format(min),
        median: format(median),
        max: format(max),
        mean: format(mean),
        p95: format(p95),
        p99: format(p99),
        badge: badgeText,
        spark: sparkData
    });
}

// Overall stats
let totalRequests = 0;
let totalDurationSum = 0;
for (const key in urlMap) {
    const times = urlMap[key].times;
    totalRequests += times.length;
    totalDurationSum += times.reduce((a,b)=>a+b,0);
}
const overallAvg = totalRequests ? totalDurationSum / totalRequests : 0;
const worstP99 = Math.max(...Object.values(urlMap).map(i => percentile(i.times, 99)));

// ---------- Generate HTML with advanced features ----------
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Advanced Dashboard – ${escapeHtml(fileName)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/jquery.dataTables.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        :root {
            --bg-gradient-start: #f5f7fc;
            --bg-gradient-end: #eef2f6;
            --card-bg: white;
            --text-primary: #1a2c3e;
            --text-secondary: #5b6e8c;
            --border-color: #e9edf2;
            --table-header-bg: #1e2f41;
            --table-header-text: white;
            --row-hover: #f1f6fe;
            --badge-good-bg: #d1fae5;
            --badge-good-text: #065f46;
            --badge-warning-bg: #fed7aa;
            --badge-warning-text: #9b2c1d;
            --badge-bad-bg: #fee2e2;
            --badge-bad-text: #991b1b;
        }
        body.dark {
            --bg-gradient-start: #121826;
            --bg-gradient-end: #0f141f;
            --card-bg: #1e293b;
            --text-primary: #e2e8f0;
            --text-secondary: #94a3b8;
            --border-color: #334155;
            --table-header-bg: #0f172a;
            --table-header-text: #cbd5e1;
            --row-hover: #334155;
            --badge-good-bg: #064e3b;
            --badge-good-text: #a7f3d0;
            --badge-warning-bg: #78350f;
            --badge-warning-text: #fed7aa;
            --badge-bad-bg: #7f1d1d;
            --badge-bad-text: #fecaca;
        }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
            padding: 2rem 1.5rem;
            color: var(--text-primary);
            transition: background 0.3s, color 0.3s;
        }
        .container {
            max-width: 1600px;
            margin: 0 auto;
        }
        .header-card {
            background: var(--card-bg);
            border-radius: 28px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
            padding: 2rem;
            margin-bottom: 2rem;
            transition: background 0.3s;
        }
        h1 {
            font-size: 2.2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        button {
            background: #3b82f6;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 40px;
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: 0.2s;
        }
        button:hover {
            background: #2563eb;
            transform: scale(1.02);
        }
        .dark-mode-btn {
            background: #475569;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .stat-card {
            background: rgba(59,130,246,0.05);
            border-radius: 20px;
            padding: 1rem;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            color: #3b82f6;
        }
        .chart-container {
            background: var(--card-bg);
            border-radius: 24px;
            padding: 1rem;
            margin-bottom: 2rem;
            transition: background 0.3s;
        }
        .table-wrapper {
            background: var(--card-bg);
            border-radius: 24px;
            padding: 1rem;
            overflow-x: auto;
        }
        table {
            width: 100%;
            font-size: 0.85rem;
        }
        th {
            background: var(--table-header-bg);
            color: var(--table-header-text);
            padding: 0.8rem;
        }
        td {
            padding: 0.7rem;
            border-bottom: 1px solid var(--border-color);
        }
        tr:hover {
            background: var(--row-hover);
        }
        .badge-good, .badge-warning, .badge-bad {
            padding: 0.2rem 0.6rem;
            border-radius: 40px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
        }
        .badge-good {
            background: var(--badge-good-bg);
            color: var(--badge-good-text);
        }
        .badge-warning {
            background: var(--badge-warning-bg);
            color: var(--badge-warning-text);
        }
        .badge-bad {
            background: var(--badge-bad-bg);
            color: var(--badge-bad-text);
        }
        .sparkline-cell {
            cursor: pointer;
            font-size: 1.2rem;
        }
        .footer {
            text-align: center;
            margin-top: 2rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
        }
        @media (max-width: 768px) {
            body { padding: 1rem; }
            .stat-value { font-size: 1.5rem; }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header-card">
        <h1>📈 K6 Performance Dashboard</h1>
        <div>Test: <strong>${escapeHtml(fileName)}</strong> · ${new Date().toLocaleString()}</div>
        <div class="toolbar">
            <button id="exportCsvBtn">📥 Export Table as CSV</button>
            <button id="darkModeToggle" class="dark-mode-btn">🌓 Dark/Light Mode</button>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Requests</div><div class="stat-value">${totalRequests}</div></div>
            <div class="stat-card"><div class="stat-label">Unique Endpoints</div><div class="stat-value">${Object.keys(urlMap).length}</div></div>
            <div class="stat-card"><div class="stat-label">Overall Avg Latency</div><div class="stat-value">${format(overallAvg)}</div></div>
            <div class="stat-card"><div class="stat-label">Worst P99</div><div class="stat-value">${format(worstP99)}</div></div>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="latencyChart" style="max-height: 300px; width:100%"></canvas>
    </div>

    <div class="table-wrapper">
        <table id="performanceTable" class="display" style="width:100%">
            <thead>
                <tr>
                    <th>Group</th><th>URL</th><th>Count</th><th>Min</th><th>Median</th><th>Max</th><th>Mean</th><th>P95</th><th>P99</th><th>Status</th><th>Trend (last 10)</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </div>
    <div class="footer">⚡ Advanced dashboard with time‑series, sparklines & thresholds | Data from k6 CSV</div>
</div>

<script>
    // Time-series chart
    const ctx = document.getElementById('latencyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ${JSON.stringify(timeLabels)},
            datasets: [{
                label: 'Avg Response Time (ms)',
                data: ${JSON.stringify(avgLatencyPerSec)},
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.05)',
                fill: true,
                tension: 0.3,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (ctx) => \`\${ctx.raw.toFixed(1)} ms\` } }
            },
            scales: { y: { title: { display: true, text: 'Latency (ms)' } } }
        }
    });

    // Initialize DataTables with search & sort
    $(document).ready(function() {
        const table = $('#performanceTable').DataTable({
            pageLength: 25,
            responsive: true,
            order: [[7, 'desc']], // sort by P95 desc
            columnDefs: [
                { orderable: false, targets: 10 } // sparkline column not sortable
            ]
        });

        // Sparkline tooltip on hover (show small chart)
        $('.sparkline-cell').each(function() {
            const sparkData = $(this).data('spark');
            if (sparkData && sparkData.length) {
                const values = sparkData.split(',').map(Number);
                const tooltipHtml = values.map(v => v.toFixed(1) + ' ms').join(' → ');
                $(this).attr('title', 'Trend: ' + tooltipHtml);
            }
        });
    });

    // Export table to CSV
    document.getElementById('exportCsvBtn').addEventListener('click', function() {
        let csv = [];
        const rows = document.querySelectorAll('#performanceTable tr');
        for (let row of rows) {
            const rowData = [];
            const cols = row.querySelectorAll('th, td');
            for (let col of cols) {
                let text = col.innerText;
                // Remove sparkline emoji
                if (col.classList && col.classList.contains('sparkline-cell')) text = '';
                rowData.push('"' + text.replace(/"/g, '""') + '"');
            }
            csv.push(rowData.join(','));
        }
        const blob = new Blob([csv.join('\\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '${fileName}_report.csv';
        link.click();
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });
</script>
</body>
</html>`;

fs.writeFileSync(OUTPUT, html);
console.log(`✅ Advanced dashboard generated: ${OUTPUT}`);