import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function generateReport(data, fileName) {
    return {
        [`reports/${fileName}.html`]: htmlReport(data),
    };
}