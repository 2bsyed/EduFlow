import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    executablePath: '/Users/syed/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' 
  });
  
  const issues = [];
  
  const accounts = [
    { role: 'Owner', email: 'owner@eduflow.bd', password: 'password123', homePath: '/dashboard' },
    { role: 'Teacher', email: 'kamrul@eduflow.bd', password: 'password123', homePath: '/teacher' },
    { role: 'Student', email: 'student1@eduflow.bd', password: 'password123', homePath: '/student' }
  ];

  for (const acc of accounts) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Listen for console errors
    page.on('pageerror', err => {
      issues.push({ role: acc.role, path: page.url(), type: 'JS Error', detail: err.message });
    });

    console.log(`\n--- Testing ${acc.role} ---`);
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', acc.email);
    await page.type('input[name="password"]', acc.password);
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);

    await new Promise(r => setTimeout(r, 2000));
    
    const currentUrl = new URL(page.url()).pathname;
    if (currentUrl !== acc.homePath) {
      issues.push({ role: acc.role, path: currentUrl, type: 'Login Redirect Failure', detail: `Expected ${acc.homePath}, got ${currentUrl}` });
      console.log(`❌ Login redirect failed for ${acc.role}. Expected ${acc.homePath}, got ${currentUrl}`);
    } else {
      console.log(`✅ Logged in as ${acc.role} at ${currentUrl}`);
    }

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `audit_screenshot_${acc.role.toLowerCase()}_home.png` });
    const sidebarLinks = await page.$$eval('a[href]', links => {
      return Array.from(new Set(links.map(a => a.getAttribute('href')))).filter(href => href.startsWith('/'));
    });
    
    console.log(`Found ${sidebarLinks.length} sidebar links:`, sidebarLinks);

    for (const link of sidebarLinks) {
      if (link === '#' || link.includes('api/auth')) continue;
      console.log(`Navigating to ${link}...`);
      await page.goto(`http://localhost:3000${link}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1000));
      
      const pageText = await page.evaluate(() => document.body.innerText);
      const pageHtml = await page.evaluate(() => document.body.innerHTML);
      
      if (pageText.includes('Application Exception')) {
        issues.push({ role: acc.role, path: link, type: 'Application Exception', detail: 'Found "Application Exception" on page.' });
        console.log(`❌ Application Exception at ${link}`);
      }
      
      if (pageHtml.includes('&lt;img') || pageHtml.includes('&lt;image') || pageHtml.match(/<img[^>]*>[\s\S]*<\/img>/)) {
        // Just check if we see literal `<img` text rendered on screen which means raw tags.
        // Actually if it's text, it would be in pageText as "<img"
      }
      if (pageText.includes('<img') || pageText.includes('alt=')) {
         issues.push({ role: acc.role, path: link, type: 'Bug-005 (Raw Img)', detail: 'Raw image tag text found on page.' });
         console.log(`❌ Bug-005 present at ${link}`);
      }

      if (pageText.includes('i18n.') || pageText.match(/_[A-Z_]+_LABEL/)) {
         issues.push({ role: acc.role, path: link, type: 'Bug-006 (Translation)', detail: 'Missing translation found on page.' });
         console.log(`❌ Bug-006 present at ${link}`);
      }

      // Check for tables
      const hasTable = await page.$('table');
      if (hasTable) {
        // check mobile layout
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(r => setTimeout(r, 500));
        const tableOverflows = await page.evaluate(() => {
          const table = document.querySelector('table');
          if (!table) return false;
          // check if parent or table overflows viewport width
          return table.getBoundingClientRect().width > window.innerWidth;
        });
        if (tableOverflows) {
          issues.push({ role: acc.role, path: link, type: 'Bug-007 (Mobile Table)', detail: 'Table overflows on mobile viewport.' });
          console.log(`❌ Bug-007 present at ${link}`);
        }
        // reset viewport
        await page.setViewport({ width: 1280, height: 800 });
      }
    }
    
    // Check Role-Based Redirects
    if (acc.role === 'Student') {
      console.log('Testing Student role redirect...');
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
      const afterRedirectUrl = new URL(page.url()).pathname;
      if (afterRedirectUrl !== '/student') {
         issues.push({ role: acc.role, path: '/dashboard', type: 'Role Redirect Failure', detail: `Student was not redirected from /dashboard to /student, ended up at ${afterRedirectUrl}` });
         console.log(`❌ Student redirect failed. Ended up at ${afterRedirectUrl}`);
      } else {
         console.log('✅ Student redirect works.');
      }
    }
    
    if (acc.role === 'Teacher') {
      console.log('Testing Teacher role redirect...');
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
      const afterRedirectUrl = new URL(page.url()).pathname;
      if (afterRedirectUrl !== '/teacher') {
         issues.push({ role: acc.role, path: '/dashboard', type: 'Role Redirect Failure', detail: `Teacher was not redirected from /dashboard to /teacher, ended up at ${afterRedirectUrl}` });
         console.log(`❌ Teacher redirect failed. Ended up at ${afterRedirectUrl}`);
      } else {
         console.log('✅ Teacher redirect works.');
      }
    }
    
    if (acc.role === 'Owner') {
      console.log('Testing Owner role redirect...');
      await page.goto('http://localhost:3000/teacher', { waitUntil: 'networkidle0' });
      const afterRedirectUrl = new URL(page.url()).pathname;
      if (afterRedirectUrl !== '/dashboard') {
         issues.push({ role: acc.role, path: '/teacher', type: 'Role Redirect Failure', detail: `Owner was not redirected from /teacher to /dashboard, ended up at ${afterRedirectUrl}` });
         console.log(`❌ Owner redirect failed. Ended up at ${afterRedirectUrl}`);
      } else {
         console.log('✅ Owner redirect works.');
      }
    }

    await context.close();
  }
  
  await browser.close();
  
  fs.writeFileSync('audit_results.json', JSON.stringify(issues, null, 2));
  console.log('\n--- Audit Complete ---');
}

run().catch(console.error);
