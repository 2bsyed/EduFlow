const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[type="email"]', 'kamrul@eduflow.bd');
    await page.fill('input[type="password"]', 'password123'); // trying standard password
    await page.click('button[type="submit"]');
    
    // wait for network idle instead of strict url
    await page.waitForLoadState('networkidle');
    console.log("Current URL after login:", page.url());
    
    // 2. Go to results page and check dropdown
    console.log("Navigating to /results...");
    await page.goto('http://localhost:3000/results');
    await page.waitForLoadState('networkidle');
    
    const options = await page.$$eval('select', selects => {
        const batchSelect = selects[0];
        if (!batchSelect) return [];
        return Array.from(batchSelect.options).map(opt => ({
            value: opt.value,
            text: opt.textContent.trim()
        }));
    });
    
    console.log("Dropdown options found:", options.map(o => o.text).join(", "));
    
    const batchB_ID = "cmsx1082a000erl1uzuhokugo"; // Class 12 - Physics Revision
    const hasBatchB = options.some(opt => opt.value === batchB_ID);
    console.log(`STEP 2: Does Batch B appear in dropdown? ${hasBatchB ? 'YES (FAIL)' : 'NO (PASS)'}`);

    // 3. Direct URL to results page with Batch B
    console.log(`Navigating to /results?batchId=${batchB_ID}...`);
    await page.goto(`http://localhost:3000/results?batchId=${batchB_ID}`);
    await page.waitForLoadState('networkidle');
    
    const bodyText3 = await page.textContent('body');
    const isBlocked3 = bodyText3.includes('Unauthorized access') || bodyText3.includes('not assigned to this batch') || bodyText3.includes('Batch not found');
    console.log(`STEP 3: Is direct access blocked on /results? ${isBlocked3 ? 'YES (PASS)' : 'NO (FAIL)'}`);

    // 4. Direct URL to report card for a student in Batch B
    const studentB_ID = "cmsx1082g0016rl1ubdufuadx";
    const examName = "First Term 2024";
    console.log(`Navigating to /results/report-card/${studentB_ID}/${encodeURIComponent(examName)}...`);
    await page.goto(`http://localhost:3000/results/report-card/${studentB_ID}/${encodeURIComponent(examName)}`);
    await page.waitForLoadState('networkidle');

    const bodyText4 = await page.textContent('body');
    const isBlocked4 = bodyText4.includes('Unauthorized access') || bodyText4.includes('not assigned to this batch') || bodyText4.includes('not found') || bodyText4.includes('Unauthorized');
    console.log(`STEP 4: Is direct access blocked on report-card? ${isBlocked4 ? 'YES (PASS)' : 'NO (FAIL)'}`);

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await browser.close();
  }
})();
