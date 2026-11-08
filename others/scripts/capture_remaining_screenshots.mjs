import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve("docs/project-dossier/assets");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function safeScreenshot(page, filename) {
  const targetPath = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(targetPath)) {
    console.log(`Already exists: ${filename}`);
    return;
  }
  try {
    await page.screenshot({ path: targetPath, timeout: 15000 });
    console.log(`Captured ${filename}`);
  } catch (err) {
    console.warn(`Timeout waiting for screenshot ${filename}, retrying with evaluate/shorter timeout: ${err.message}`);
    try {
      await page.screenshot({ path: targetPath, timeout: 5000 });
      console.log(`Captured ${filename}`);
    } catch (e2) {
      console.error(`FAILED to capture ${filename}: ${e2.message}`);
    }
  }
}

async function safeGoto(page, url, waitMs = 1500) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(waitMs);
  } catch (err) {
    console.warn(`Navigation warning for ${url}: ${err.message}`);
    await page.waitForTimeout(waitMs);
  }
}

async function captureRemaining() {
  console.log("Launching browser for remaining screenshot capture...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const desktopViewport = { width: 1440, height: 1000 };
  const mobileViewport = { width: 390, height: 844 };

  // TEACHER SCREENS
  console.log("\n[1/2] Capturing Teacher Screens (kamrul@eduflow.bd)...");
  const teacherContext = await browser.newContext({ viewport: desktopViewport });
  const teacherPage = await teacherContext.newPage();
  await safeGoto(teacherPage, `${BASE_URL}/login`);
  await teacherPage.fill("input#email", "kamrul@eduflow.bd");
  await teacherPage.fill("input#password", "password123");
  await teacherPage.click('button[type="submit"]');
  await teacherPage.waitForURL("**/teacher", { timeout: 15000 });
  await teacherPage.waitForTimeout(1500);

  await safeScreenshot(teacherPage, "teacher-dashboard-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/batches`);
  await safeScreenshot(teacherPage, "teacher-batches-list-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/batches/cmsx10829000crl1u8t2v9ps6`);
  await safeScreenshot(teacherPage, "teacher-batch-details-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/attendance`);
  await safeScreenshot(teacherPage, "teacher-attendance-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/results`);
  await safeScreenshot(teacherPage, "teacher-results-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/notices`);
  await safeScreenshot(teacherPage, "teacher-notices-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/timetable`);
  await safeScreenshot(teacherPage, "teacher-timetable-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/profile`);
  await safeScreenshot(teacherPage, "teacher-profile-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/fees`);
  await safeScreenshot(teacherPage, "security-teacher-redirect-fees-desktop.png");

  await teacherContext.close();

  // STUDENT SCREENS
  console.log("\n[2/2] Capturing Student Screens (student1@eduflow.bd)...");
  const studentContext = await browser.newContext({ viewport: desktopViewport });
  const studentPage = await studentContext.newPage();
  await safeGoto(studentPage, `${BASE_URL}/login`);
  await studentPage.fill("input#email", "student1@eduflow.bd");
  await studentPage.fill("input#password", "password123");
  await studentPage.click('button[type="submit"]');
  await studentPage.waitForURL("**/student", { timeout: 15000 });
  await studentPage.waitForTimeout(1500);

  await safeScreenshot(studentPage, "student-dashboard-desktop.png");

  const studentMobileContext = await browser.newContext({ viewport: mobileViewport, isMobile: true });
  const studentMobilePage = await studentMobileContext.newPage();
  await safeGoto(studentMobilePage, `${BASE_URL}/login`);
  await studentMobilePage.fill("input#email", "student1@eduflow.bd");
  await studentMobilePage.fill("input#password", "password123");
  await studentMobilePage.click('button[type="submit"]');
  await studentMobilePage.waitForURL("**/student", { timeout: 15000 });
  await studentMobilePage.waitForTimeout(1500);
  await safeScreenshot(studentMobilePage, "student-dashboard-mobile.png");

  await safeGoto(studentPage, `${BASE_URL}/student/attendance`);
  await safeScreenshot(studentPage, "student-attendance-desktop.png");

  await safeGoto(studentMobilePage, `${BASE_URL}/student/attendance`);
  await safeScreenshot(studentMobilePage, "student-attendance-mobile.png");

  await safeGoto(studentPage, `${BASE_URL}/student/fees`);
  await safeScreenshot(studentPage, "student-fees-desktop.png");

  await safeGoto(studentMobilePage, `${BASE_URL}/student/fees`);
  await safeScreenshot(studentMobilePage, "student-fees-mobile.png");

  await safeGoto(studentPage, `${BASE_URL}/student/results`);
  await safeScreenshot(studentPage, "student-results-desktop.png");

  await safeGoto(studentPage, `${BASE_URL}/student/timetable`);
  await safeScreenshot(studentPage, "student-timetable-desktop.png");

  await safeGoto(studentPage, `${BASE_URL}/student/notices`);
  await safeScreenshot(studentPage, "student-notices-desktop.png");

  await studentContext.close();
  await studentMobileContext.close();

  await browser.close();
  console.log("\nAll remaining screenshots successfully captured!");
}

captureRemaining().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
