import puppeteer from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const browser = await puppeteer.launch({ headless: true, executablePath: '/Users/syed/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' });
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewport({ width: 1280, height: 800 });

  // Get credentials
  const teacherUser = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  const studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  
  const accounts = [
    { role: 'Owner', email: 'owner@eduflow.bd', password: 'password123' },
    { role: 'Teacher', email: teacherUser.email, password: 'password123' },
    { role: 'Student', email: studentUser.email, password: 'password123' }
  ];

  for (const acc of accounts) {
    console.log(`\n--- Auditing Role: ${acc.role} ---`);
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `screenshot_${acc.role.toLowerCase()}_login.png` });
    
    await page.type('input[name="email"]', acc.email);
    await page.type('input[name="password"]', acc.password);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(e => console.log('Navigation wait error:', e.message)),
      page.click('button[type="submit"]')
    ]);

    await new Promise(r => setTimeout(r, 2000)); // Give it a moment to render client-side fully
    await page.screenshot({ path: `screenshot_${acc.role.toLowerCase()}_dashboard.png` });
    console.log(`Dashboard URL: ${page.url()}`);
    
    // Check navigation links in the sidebar
    const navLinks = await page.$$eval('a[href]', links => links.map(a => ({ text: a.innerText.trim(), href: a.href })));
    console.log('Sidebar/Nav Links found:');
    for (const link of navLinks) {
      if (link.text && (link.href.includes('/owner/') || link.href.includes('/teacher/') || link.href.includes('/student/'))) {
        console.log(`  - ${link.text}: ${link.href}`);
      }
    }
    
    // Check top KPI cards or main sections
    const texts = await page.$$eval('h1, h2, h3', els => els.map(el => el.innerText.trim()));
    console.log('Main Headings found:', texts.filter(t => t.length > 0).slice(0, 10));

    // Try clicking the first sidebar link that is not the dashboard to see if it works
    const firstOtherLink = navLinks.find(l => l.text && l.href !== page.url() && (l.href.includes('/owner/') || l.href.includes('/teacher/') || l.href.includes('/student/')));
    if (firstOtherLink) {
      console.log(`Navigating to ${firstOtherLink.text}...`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
        page.goto(firstOtherLink.href)
      ]);
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: `screenshot_${acc.role.toLowerCase()}_${firstOtherLink.text.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png` });
      console.log(`Arrived at: ${page.url()}`);
    }

    // Logout
    console.log('Logging out...');
    await page.goto('http://localhost:3000/api/auth/signout', { waitUntil: 'networkidle0' });
    const logoutBtn = await page.$('button[type="submit"]');
    if (logoutBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
        logoutBtn.click()
      ]);
    }
  }

  await browser.close();
  await prisma.$disconnect();
}

run().catch(console.error);
