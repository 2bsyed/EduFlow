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
await new Promise(r => setTimeout(r, 2000));
const elements = await page.$$('a[href="/students"]');
console.log('Found elements:', elements.length);
if (elements.length > 0) {
    // try clicking the visible one
    for (let el of elements) {
        const isVisible = await el.isIntersectingViewport();
        console.log('is visible:', isVisible);
        if (isVisible) {
            await el.click();
            console.log('clicked!');
            break;
        }
    }
}
await new Promise(r => setTimeout(r, 2000));
const text = await page.evaluate(() => document.body.innerText);
console.log(text.substring(0, 500));
await browser.close();
