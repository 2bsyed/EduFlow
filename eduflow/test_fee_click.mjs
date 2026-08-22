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
await page.goto('http://localhost:3000/fees');
await new Promise(r => setTimeout(r, 2000));
const buttons = await page.$$('button');
for (let b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('Record Payment')) {
        console.log('Found button, clicking via evaluate...');
        await page.evaluate(el => el.click(), b);
        break;
    }
}
await new Promise(r => setTimeout(r, 1000));
const modalHTML = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0.z-50');
    return modal ? modal.outerHTML : 'No modal found';
});
console.log('Modal HTML:', modalHTML.substring(0, 300));
await browser.close();
