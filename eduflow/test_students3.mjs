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
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: 'dashboard.png' });
const studentsLink = await page.$('a[href="/students"]');
await studentsLink.click();
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: 'after_students_click.png' });
console.log('Done');
await browser.close();
