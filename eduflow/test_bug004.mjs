import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer-core';

const prisma = new PrismaClient();

async function runTest() {
  console.log("Fetching test data from database...");
  const kamrulUser = await prisma.user.findUnique({ where: { email: 'kamrul@eduflow.bd' }, include: { teacher: true } });
  const farhanaUser = await prisma.user.findUnique({ where: { email: 'farhana@eduflow.bd' }, include: { teacher: true } });

  const kamrulBatch = await prisma.batch.findFirst({ where: { teacherId: kamrulUser.teacher.id } });
  const farhanaBatch = await prisma.batch.findFirst({ where: { teacherId: farhanaUser.teacher.id } });

  console.log(`Kamrul's Batch: ${kamrulBatch.name} (${kamrulBatch.id})`);
  console.log(`Farhana's Batch: ${farhanaBatch.name} (${farhanaBatch.id})`);

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: "new"
  });
  
  const page = await browser.newPage();
  
  console.log("Logging in as Kamrul...");
  await page.goto('http://localhost:3000/login');
  await page.type('input[type="email"]', 'kamrul@eduflow.bd');
  await page.type('input[type="password"]', 'password123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);

  console.log("Navigating to Results Page...");
  await page.goto('http://localhost:3000/results');
  await page.waitForSelector('main');
  
  const pageText = await page.evaluate(() => document.body.innerText);
  
  if (pageText.includes(kamrulBatch.name)) {
    console.log("✅ Kamrul's batch is visible.");
  } else {
    console.error("❌ Kamrul's batch is NOT visible!");
    console.log("INITIAL PAGE TEXT:", pageText);
  }

  if (pageText.includes(farhanaBatch.name)) {
    console.error("❌ UI Leak: Farhana's batch is visible in the dropdown!");
  } else {
    console.log("✅ UI Secured: Farhana's batch is NOT visible in the dropdown.");
  }

  console.log("Attempting direct URL access to Farhana's batch...");
  const directUrl = `http://localhost:3000/results?batchId=${farhanaBatch.id}`;
  await page.goto(directUrl);
  await page.waitForSelector('.p-margin', { timeout: 5000 }).catch(() => {});

  const directPageText = await page.evaluate(() => document.body.innerText);
  
  if (directPageText.includes("Unauthorized access: You are not assigned to this batch.")) {
    console.log("✅ Server Secured: Direct URL access correctly rejected!");
  } else {
    console.error("❌ Server Leak: Direct URL access allowed!");
    console.log("DIRECT URL PAGE TEXT:", directPageText);
  }

  await browser.close();
  await prisma.$disconnect();
}

runTest().catch(console.error);
