import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/Users/syed/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', headless: 'new' });
const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
await page.goto('http://localhost:3000/login');
await page.type('input[name="email"]', 'owner@eduflow.bd');
await page.type('input[name="password"]', 'password123');
await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
]);
console.log('Navigated to dashboard. Now going direct to /students');
const res = await page.goto('http://localhost:3000/students');
console.log('Status code:', res.status());
const text = await page.evaluate(() => document.body.innerText);
console.log(text.substring(0, 500));
await browser.close();
