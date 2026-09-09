import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to login page...");
  await page.goto('http://localhost:3000/login');
  
  console.log("Filling credentials...");
  await page.fill('input[name="email"]', 'owner@eduflow.bd');
  await page.fill('input[name="password"]', 'password123');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  
  console.log("Current URL:", page.url());
  const errorText = await page.locator('.text-red-500').textContent().catch(() => null);
  if (errorText) {
    console.log("Login Error:", errorText);
  }
  
  await browser.close();
})();
