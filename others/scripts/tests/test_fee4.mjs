import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/Users/syed/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', headless: 'new' });
const page = await browser.newPage();
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
        await b.click();
        break;
    }
}
await new Promise(r => setTimeout(r, 1000));
const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => i.outerHTML));
console.log('inputs:', inputs);
await browser.close();
