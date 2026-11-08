import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve("docs/project-dossier/assets");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function safeGoto(page, url, waitMs = 1500) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(waitMs);
  } catch (err) {
    console.warn(`Navigation warning for ${url}: ${err.message}`);
    await page.waitForTimeout(waitMs);
  }
}

async function capture() {
  console.log("Launching browser for screenshot capture...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const desktopViewport = { width: 1440, height: 1000 };
  const mobileViewport = { width: 390, height: 844 };

  // 1. PUBLIC SCREENS
  console.log("\n[1/4] Capturing Public Screens...");
  const pubDesktop = await browser.newPage({ viewport: desktopViewport });
  await safeGoto(pubDesktop, `${BASE_URL}/`);
  await pubDesktop.screenshot({ path: path.join(OUTPUT_DIR, "public-landing-desktop.png") });
  console.log("Captured public-landing-desktop.png");

  const pubMobile = await browser.newPage({ viewport: mobileViewport, isMobile: true });
  await safeGoto(pubMobile, `${BASE_URL}/`);
  await pubMobile.screenshot({ path: path.join(OUTPUT_DIR, "public-landing-mobile.png") });
  console.log("Captured public-landing-mobile.png");

  await safeGoto(pubDesktop, `${BASE_URL}/login`);
  await pubDesktop.screenshot({ path: path.join(OUTPUT_DIR, "public-login-desktop.png") });
  console.log("Captured public-login-desktop.png");

  await safeGoto(pubMobile, `${BASE_URL}/login`);
  await pubMobile.screenshot({ path: path.join(OUTPUT_DIR, "public-login-mobile.png") });
  console.log("Captured public-login-mobile.png");

  await safeGoto(pubDesktop, `${BASE_URL}/register`);
  await pubDesktop.screenshot({ path: path.join(OUTPUT_DIR, "public-register-desktop.png") });
  console.log("Captured public-register-desktop.png");

  await safeGoto(pubDesktop, `${BASE_URL}/demo`);
  await pubDesktop.screenshot({ path: path.join(OUTPUT_DIR, "public-demo-desktop.png") });
  console.log("Captured public-demo-desktop.png");

  await pubDesktop.close();
  await pubMobile.close();

  // 2. OWNER SCREENS
  console.log("\n[2/4] Capturing Owner Screens (owner@eduflow.bd)...");
  const ownerContext = await browser.newContext({ viewport: desktopViewport });
  const ownerPage = await ownerContext.newPage();
  await safeGoto(ownerPage, `${BASE_URL}/login`);
  await ownerPage.fill("input#email", "owner@eduflow.bd");
  await ownerPage.fill("input#password", "password123");
  await ownerPage.click('button[type="submit"]');
  await ownerPage.waitForURL("**/dashboard", { timeout: 15000 });
  await ownerPage.waitForTimeout(1500);

  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-dashboard-desktop.png") });
  console.log("Captured owner-dashboard-desktop.png");

  // Toggle to Bangla on dashboard
  try {
    const toggleBtn = ownerPage.locator('button[aria-label="Toggle language"]').first();
    await toggleBtn.click();
    await ownerPage.waitForTimeout(1000);
    await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-dashboard-bangla-desktop.png") });
    console.log("Captured owner-dashboard-bangla-desktop.png");
    // Toggle back to English
    await toggleBtn.click();
    await ownerPage.waitForTimeout(1000);
  } catch (e) {
    console.warn("Could not capture Bangla dashboard:", e.message);
  }

  // Owner Mobile Dashboard
  const ownerMobileContext = await browser.newContext({ viewport: mobileViewport, isMobile: true });
  const ownerMobilePage = await ownerMobileContext.newPage();
  await safeGoto(ownerMobilePage, `${BASE_URL}/login`);
  await ownerMobilePage.fill("input#email", "owner@eduflow.bd");
  await ownerMobilePage.fill("input#password", "password123");
  await ownerMobilePage.click('button[type="submit"]');
  await ownerMobilePage.waitForURL("**/dashboard", { timeout: 15000 });
  await ownerMobilePage.waitForTimeout(1500);
  await ownerMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "owner-dashboard-mobile.png") });
  console.log("Captured owner-dashboard-mobile.png");

  // Students List
  await safeGoto(ownerPage, `${BASE_URL}/students`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-students-list-desktop.png") });
  console.log("Captured owner-students-list-desktop.png");

  await safeGoto(ownerMobilePage, `${BASE_URL}/students`);
  await ownerMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "owner-students-list-mobile.png") });
  console.log("Captured owner-students-list-mobile.png");

  // Add Student Side Panel
  try {
    const addStudentBtn = ownerPage.locator('button:has-text("Add Student")').first();
    await addStudentBtn.click();
    await ownerPage.waitForTimeout(800);
    await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-student-add-panel-desktop.png") });
    console.log("Captured owner-student-add-panel-desktop.png");
    const cancelBtn = ownerPage.locator('div.fixed.inset-0 button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await ownerPage.waitForTimeout(400);
    }
  } catch (e) {
    console.warn("Could not capture student add panel:", e.message);
  }

  // Batches
  await safeGoto(ownerPage, `${BASE_URL}/batches`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-batches-list-desktop.png") });
  console.log("Captured owner-batches-list-desktop.png");

  // Attendance
  await safeGoto(ownerPage, `${BASE_URL}/attendance`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-attendance-marking-desktop.png") });
  console.log("Captured owner-attendance-marking-desktop.png");

  await safeGoto(ownerMobilePage, `${BASE_URL}/attendance`);
  await ownerMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "owner-attendance-marking-mobile.png") });
  console.log("Captured owner-attendance-marking-mobile.png");

  // Fees
  await safeGoto(ownerPage, `${BASE_URL}/fees`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-fees-list-desktop.png") });
  console.log("Captured owner-fees-list-desktop.png");

  await safeGoto(ownerMobilePage, `${BASE_URL}/fees`);
  await ownerMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "owner-fees-list-mobile.png") });
  console.log("Captured owner-fees-list-mobile.png");

  // Record Payment Modal
  try {
    const recordPaymentBtn = ownerPage.locator('button:has-text("Record Payment")').first();
    await recordPaymentBtn.click();
    await ownerPage.waitForTimeout(600);
    await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-record-payment-modal-desktop.png") });
    console.log("Captured owner-record-payment-modal-desktop.png");
    const closeBtn = ownerPage.locator('button[aria-label="Close modal"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await ownerPage.waitForTimeout(400);
    }
  } catch (e) {
    console.warn("Could not capture record payment modal:", e.message);
  }

  // Expenses
  await safeGoto(ownerPage, `${BASE_URL}/expenses`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-expenses-list-desktop.png") });
  console.log("Captured owner-expenses-list-desktop.png");

  // Results
  await safeGoto(ownerPage, `${BASE_URL}/results`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-results-entry-desktop.png") });
  console.log("Captured owner-results-entry-desktop.png");

  // Report card view
  await safeGoto(ownerPage, `${BASE_URL}/results/report-card/cmsx1082b000irl1upt270dht/First-Term-2024`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-report-card-view-desktop.png") });
  console.log("Captured owner-report-card-view-desktop.png");

  // Notices
  await safeGoto(ownerPage, `${BASE_URL}/notices`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-notices-management-desktop.png") });
  console.log("Captured owner-notices-management-desktop.png");

  // Settings
  await safeGoto(ownerPage, `${BASE_URL}/settings`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-settings-profile-desktop.png") });
  console.log("Captured owner-settings-profile-desktop.png");

  await safeGoto(ownerPage, `${BASE_URL}/settings/language`);
  await ownerPage.screenshot({ path: path.join(OUTPUT_DIR, "owner-settings-language-desktop.png") });
  console.log("Captured owner-settings-language-desktop.png");

  await ownerContext.close();
  await ownerMobileContext.close();

  // 3. TEACHER SCREENS
  console.log("\n[3/4] Capturing Teacher Screens (kamrul@eduflow.bd)...");
  const teacherContext = await browser.newContext({ viewport: desktopViewport });
  const teacherPage = await teacherContext.newPage();
  await safeGoto(teacherPage, `${BASE_URL}/login`);
  await teacherPage.fill("input#email", "kamrul@eduflow.bd");
  await teacherPage.fill("input#password", "password123");
  await teacherPage.click('button[type="submit"]');
  await teacherPage.waitForURL("**/teacher", { timeout: 15000 });
  await teacherPage.waitForTimeout(1500);

  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-dashboard-desktop.png") });
  console.log("Captured teacher-dashboard-desktop.png");

  const teacherMobileContext = await browser.newContext({ viewport: mobileViewport, isMobile: true });
  const teacherMobilePage = await teacherMobileContext.newPage();
  await safeGoto(teacherMobilePage, `${BASE_URL}/login`);
  await teacherMobilePage.fill("input#email", "kamrul@eduflow.bd");
  await teacherMobilePage.fill("input#password", "password123");
  await teacherMobilePage.click('button[type="submit"]');
  await teacherMobilePage.waitForURL("**/teacher", { timeout: 15000 });
  await teacherMobilePage.waitForTimeout(1500);
  await teacherMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-dashboard-mobile.png") });
  console.log("Captured teacher-dashboard-mobile.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/batches`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-batches-list-desktop.png") });
  console.log("Captured teacher-batches-list-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/batches/cmsx10829000crl1u8t2v9ps6`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-batch-details-desktop.png") });
  console.log("Captured teacher-batch-details-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/attendance`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-attendance-desktop.png") });
  console.log("Captured teacher-attendance-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/results`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-results-desktop.png") });
  console.log("Captured teacher-results-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/notices`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-notices-desktop.png") });
  console.log("Captured teacher-notices-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/timetable`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-timetable-desktop.png") });
  console.log("Captured teacher-timetable-desktop.png");

  await safeGoto(teacherPage, `${BASE_URL}/teacher/profile`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "teacher-profile-desktop.png") });
  console.log("Captured teacher-profile-desktop.png");

  // Security test screen: teacher attempting /fees
  await safeGoto(teacherPage, `${BASE_URL}/fees`);
  await teacherPage.screenshot({ path: path.join(OUTPUT_DIR, "security-teacher-redirect-fees-desktop.png") });
  console.log("Captured security-teacher-redirect-fees-desktop.png");

  await teacherContext.close();
  await teacherMobileContext.close();

  // 4. STUDENT SCREENS
  console.log("\n[4/4] Capturing Student Screens (student1@eduflow.bd)...");
  const studentContext = await browser.newContext({ viewport: desktopViewport });
  const studentPage = await studentContext.newPage();
  await safeGoto(studentPage, `${BASE_URL}/login`);
  await studentPage.fill("input#email", "student1@eduflow.bd");
  await studentPage.fill("input#password", "password123");
  await studentPage.click('button[type="submit"]');
  await studentPage.waitForURL("**/student", { timeout: 15000 });
  await studentPage.waitForTimeout(1500);

  await studentPage.screenshot({ path: path.join(OUTPUT_DIR, "student-dashboard-desktop.png") });
  console.log("Captured student-dashboard-desktop.png");

  const studentMobileContext = await browser.newContext({ viewport: mobileViewport, isMobile: true });
  const studentMobilePage = await studentMobileContext.newPage();
  await safeGoto(studentMobilePage, `${BASE_URL}/login`);
  await studentMobilePage.fill("input#email", "student1@eduflow.bd");
  await studentMobilePage.fill("input#password", "password123");
  await studentMobilePage.click('button[type="submit"]');
  await studentMobilePage.waitForURL("**/student", { timeout: 15000 });
  await studentMobilePage.waitForTimeout(1500);
  await studentMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "student-dashboard-mobile.png") });
  console.log("Captured student-dashboard-mobile.png");

  await safeGoto(studentPage, `${BASE_URL}/student/attendance`);
  await studentPage.screenshot({ path: path.join(OUTPUT_DIR, "student-attendance-desktop.png") });
  console.log("Captured student-attendance-desktop.png");

  await safeGoto(studentMobilePage, `${BASE_URL}/student/attendance`);
  await studentMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "student-attendance-mobile.png") });
  console.log("Captured student-attendance-mobile.png");

  await safeGoto(studentPage, `${BASE_URL}/student/fees`);
  await studentPage.screenshot({ path: path.join(OUTPUT_DIR, "student-fees-desktop.png") });
  console.log("Captured student-fees-desktop.png");

  await safeGoto(studentMobilePage, `${BASE_URL}/student/fees`);
  await studentMobilePage.screenshot({ path: path.join(OUTPUT_DIR, "student-fees-mobile.png") });
  console.log("Captured student-fees-mobile.png");

  await safeGoto(studentPage, `${BASE_URL}/student/results`);
  await studentPage.screenshot({ path: path.join(OUTPUT_DIR, "student-results-desktop.png") });
  console.log("Captured student-results-desktop.png");

  await safeGoto(studentPage, `${BASE_URL}/student/timetable`);
  await studentPage.screenshot({ path: path.join(OUTPUT_DIR, "student-timetable-desktop.png") });
  console.log("Captured student-timetable-desktop.png");

  await safeGoto(studentPage, `${BASE_URL}/student/notices`);
  await studentPage.screenshot({ path: path.join(OUTPUT_DIR, "student-notices-desktop.png") });
  console.log("Captured student-notices-desktop.png");

  await studentContext.close();
  await studentMobileContext.close();

  await browser.close();
  console.log("\nAll screenshots successfully captured in docs/project-dossier/assets!");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
