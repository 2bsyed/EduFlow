import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const server = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: 'ignore'
});

setTimeout(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Marketing Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/syed/.gemini/antigravity/brain/4ae289c3-5d58-4712-9a36-1d5f9f66a294/logo_marketing_desktop.png' });
  
  // Marketing Mobile
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/syed/.gemini/antigravity/brain/4ae289c3-5d58-4712-9a36-1d5f9f66a294/logo_marketing_mobile.png' });
  
  // Login Page Desktop
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/syed/.gemini/antigravity/brain/4ae289c3-5d58-4712-9a36-1d5f9f66a294/logo_login_desktop.png' });

  // Owner Dashboard Desktop
  // Login first
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('#email', 'owner@eduflow.bd');
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/syed/.gemini/antigravity/brain/4ae289c3-5d58-4712-9a36-1d5f9f66a294/logo_owner_dashboard_desktop.png' });

  // Owner Dashboard Mobile
  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/syed/.gemini/antigravity/brain/4ae289c3-5d58-4712-9a36-1d5f9f66a294/logo_owner_dashboard_mobile.png' });

  await browser.close();
  process.kill(-server.pid);
  console.log("Screenshots captured successfully.");
}, 5000);
