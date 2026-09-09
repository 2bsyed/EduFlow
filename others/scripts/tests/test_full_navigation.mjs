import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/Users/syed/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', headless: 'new' });
const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

try {
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'owner@eduflow.bd');
    await page.type('input[name="password"]', 'password123');
    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
    ]);

    const pagesToVisit = [
        '/dashboard',
        '/students',
        '/batches',
        '/attendance',
        '/fees',
        '/results',
        '/expenses',
        '/settings'
    ];

    for (const p of pagesToVisit) {
        console.log(`Navigating to ${p}...`);
        await page.goto(`http://localhost:3000${p}`);
        await new Promise(r => setTimeout(r, 1000));
        
        const pageError = await page.evaluate(() => {
            const err = document.querySelector('.bg-error-container');
            if (err && err.innerText.includes('Application Exception')) return 'Exception found on page';
            
            // Check if standard sidebar links exist
            const links = Array.from(document.querySelectorAll('aside nav a')).map(a => a.innerText.trim());
            return links.length >= 8 ? `Sidebar intact (${links.length} items)` : `Sidebar broken (${links.length} items: ${links.join(', ')})`;
        });
        
        console.log(`${p} status: ${pageError}`);
    }
} catch (e) {
    console.error("Test failed:", e);
} finally {
    await browser.close();
}
