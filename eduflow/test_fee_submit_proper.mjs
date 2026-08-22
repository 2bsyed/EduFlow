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

await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (let b of buttons) {
        if (b.innerText.includes('Record Payment')) {
            b.click();
            break;
        }
    }
});
await new Promise(r => setTimeout(r, 1000));

await page.evaluate(() => {
    const select = document.querySelector('select');
    select.value = select.options[1].value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    
    const amountInput = document.querySelector('input[type="number"]');
    amountInput.value = '500';
    // For React 16+ controlled inputs, need to call the native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(amountInput, '500');
    amountInput.dispatchEvent(new Event('input', { bubbles: true }));
});
await new Promise(r => setTimeout(r, 500));

await page.evaluate(() => {
    const formButton = document.querySelector('button[type="submit"][form="record-payment-form"]');
    formButton.click();
});
await new Promise(r => setTimeout(r, 2000));

const serverError = await page.evaluate(() => {
    const errs = Array.from(document.querySelectorAll('.bg-error-container'));
    return errs.map(e => e.innerText);
});
console.log('Error banners:', serverError);
await browser.close();
