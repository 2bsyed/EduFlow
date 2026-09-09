import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/Users/syed/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', headless: 'new' });
const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
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
        await page.evaluate(el => el.click(), b);
        break;
    }
}
await new Promise(r => setTimeout(r, 1000));
const selects = await page.$$('select');
if (selects.length > 0) {
    const secondOptionVal = await page.evaluate(s => s.options[1].value, selects[0]);
    await page.select('select', secondOptionVal);
}
await page.type('input[type="number"]', '500');
const formButton = await page.$('button[type="submit"][form="record-payment-form"]');
await page.evaluate(el => el.click(), formButton);
await new Promise(r => setTimeout(r, 2000));
const errors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.bg-error-container')).map(el => el.innerText);
});
console.log('Error banners:', errors);
await browser.close();
