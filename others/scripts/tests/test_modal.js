const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/students?action=new');
  await page.waitForTimeout(2000); // Wait for modal to render
  const modalBox = await page.$('.fixed.inset-0 > div');
  if (modalBox) {
    const box = await modalBox.boundingBox();
    console.log("Modal Box:", box);
    
    // Check background color
    const bg = await modalBox.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log("Modal BG:", bg);
    
    const className = await modalBox.getAttribute('class');
    console.log("Modal classes:", className);
  } else {
    console.log("Modal not found");
  }
  
  const buttons = await page.$$eval('.fixed.inset-0 button', btns => btns.map(b => b.textContent));
  console.log("Buttons in modal:", buttons);

  await browser.close();
})();
