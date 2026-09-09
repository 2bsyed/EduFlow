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
await page.click('button:has-text("Record Payment")');
await new Promise(r => setTimeout(r, 500));
await page.select('select', await page.$eval('select option:nth-child(2)', el => el.value));
await page.type('input[type="number"]', '500');
await page.click('button[type="submit"][form="record-payment-form"]');
await new Promise(r => setTimeout(r, 2000));
const text = await page.evaluate(() => document.body.innerText);
const serverError = await page.evaluate(() => {
    const err = document.querySelector('.bg-error-container');
    return err ? err.innerText : 'No error displayed';
});
console.log('Error banner:', serverError);
await browser.close();
