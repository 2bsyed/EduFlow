import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const REPORT_FILE = path.resolve("others/docs/reports/qa_audit_live_report.json");

async function runAudit() {
  console.log("=================================================");
  console.log("  EDULFLOW LIVE QA AUDIT SUITE");
  console.log("  Browser: Google Chrome (Desktop & Mobile)");
  console.log("  Timestamp:", new Date().toISOString());
  console.log("=================================================\n");

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const report = {
    timestamp: new Date().toISOString(),
    browser: "Google Chrome",
    environment: {
      frontend: BASE_URL,
      backend: "http://localhost:8000",
      nodeVersion: process.version,
    },
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
    roles: {},
    mobileResponsive: {},
    interactiveTests: {},
    securityBoundaryTests: {},
    consoleErrors: [],
    pageErrors: [],
  };

  function recordResult(category, testName, passed, details = {}, isWarning = false) {
    report.summary.totalTests++;
    if (passed) {
      report.summary.passed++;
    } else if (isWarning) {
      report.summary.warnings++;
    } else {
      report.summary.failed++;
    }

    if (!report[category]) report[category] = {};
    report[category][testName] = {
      passed,
      status: passed ? "PASSED" : isWarning ? "WARNING" : "FAILED",
      ...details,
    };
    const tag = passed ? "[PASS]" : isWarning ? "[WARN]" : "[FAIL]";
    console.log(`${tag} ${category} -> ${testName}: ${details.message || ""}`);
  }

  // Helper to test a list of routes for an authenticated page
  async function auditRoleRoutes(page, roleName, routes, consoleErrorsCollector, pageErrorsCollector) {
    for (const route of routes) {
      const errCountBefore = consoleErrorsCollector.length;
      const pageErrCountBefore = pageErrorsCollector.length;

      try {
        const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 20000 });
        const status = resp ? resp.status() : null;
        const currentUrl = page.url();
        const content = await page.content();
        const hasException =
          content.includes("Application error") ||
          content.includes("Unhandled Runtime Error") ||
          content.includes("Application Exception") ||
          content.includes("Internal Server Error");
        const title = await page.title();

        const newConsoleErrors = consoleErrorsCollector.slice(errCountBefore);
        const newPageErrors = pageErrorsCollector.slice(pageErrCountBefore);

        // Filter out benign font/css external network logs if any
        const relevantConsoleErrors = newConsoleErrors.filter(
          (e) => !e.text.includes("favicon") && !e.text.includes("manifest")
        );

        const passed = status === 200 && !hasException && newPageErrors.length === 0;

        recordResult("roles", `${roleName}_route_${route.replace(/\//g, "_")}`, passed, {
          role: roleName,
          route,
          status,
          currentUrl,
          title,
          hasException,
          consoleErrors: relevantConsoleErrors.map((e) => e.text),
          pageErrors: newPageErrors.map((e) => e.error),
          message: `HTTP ${status}, ${relevantConsoleErrors.length} console errors, ${newPageErrors.length} page errors`,
        });
      } catch (err) {
        recordResult("roles", `${roleName}_route_${route.replace(/\//g, "_")}`, false, {
          role: roleName,
          route,
          message: `Navigation error: ${err.message}`,
        });
      }
    }
  }

  // ==========================================
  // 1. OWNER ROLE AUDIT
  // ==========================================
  console.log("\n--- [1/6] Auditing Role: OWNER (owner@eduflow.bd) ---");
  const ownerContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const ownerPage = await ownerContext.newPage();
  const ownerConsoleErrors = [];
  const ownerPageErrors = [];

  ownerPage.on("console", (msg) => {
    if (msg.type() === "error") {
      ownerConsoleErrors.push({ url: ownerPage.url(), text: msg.text() });
    }
  });
  ownerPage.on("pageerror", (err) => {
    ownerPageErrors.push({ url: ownerPage.url(), error: err.message, stack: err.stack });
  });

  try {
    await ownerPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await ownerPage.fill("input#email", "owner@eduflow.bd");
    await ownerPage.fill("input#password", "password123");
    await ownerPage.click('button[type="submit"]');
    await ownerPage.waitForURL("**/dashboard", { timeout: 15000 });
    recordResult("roles", "owner_login", true, { message: "Owner authenticated and landed on /dashboard" });
  } catch (err) {
    recordResult("roles", "owner_login", false, { message: `Login failed: ${err.message}` });
  }

  const ownerRoutes = [
    "/dashboard",
    "/students",
    "/batches",
    "/attendance",
    "/fees",
    "/results",
    "/expenses",
    "/notices",
    "/settings",
    "/settings/language",
  ];

  await auditRoleRoutes(ownerPage, "owner", ownerRoutes, ownerConsoleErrors, ownerPageErrors);

  // ==========================================
  // 2. TEACHER ROLE AUDIT
  // ==========================================
  console.log("\n--- [2/6] Auditing Role: TEACHER (kamrul@eduflow.bd) ---");
  const teacherContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const teacherPage = await teacherContext.newPage();
  const teacherConsoleErrors = [];
  const teacherPageErrors = [];

  teacherPage.on("console", (msg) => {
    if (msg.type() === "error") {
      teacherConsoleErrors.push({ url: teacherPage.url(), text: msg.text() });
    }
  });
  teacherPage.on("pageerror", (err) => {
    teacherPageErrors.push({ url: teacherPage.url(), error: err.message });
  });

  try {
    await teacherPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await teacherPage.fill("input#email", "kamrul@eduflow.bd");
    await teacherPage.fill("input#password", "password123");
    await teacherPage.click('button[type="submit"]');
    await teacherPage.waitForURL("**/teacher", { timeout: 15000 });
    recordResult("roles", "teacher_login", true, { message: "Teacher authenticated and landed on /teacher" });
  } catch (err) {
    recordResult("roles", "teacher_login", false, { message: `Login failed: ${err.message}` });
  }

  const teacherRoutes = [
    "/teacher",
    "/teacher/batches",
    "/attendance",
    "/results",
    "/teacher/timetable",
    "/teacher/profile",
  ];

  await auditRoleRoutes(teacherPage, "teacher", teacherRoutes, teacherConsoleErrors, teacherPageErrors);

  // ==========================================
  // 3. STUDENT ROLE AUDIT
  // ==========================================
  console.log("\n--- [3/6] Auditing Role: STUDENT (student1@eduflow.bd) ---");
  const studentContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const studentPage = await studentContext.newPage();
  const studentConsoleErrors = [];
  const studentPageErrors = [];

  studentPage.on("console", (msg) => {
    if (msg.type() === "error") {
      studentConsoleErrors.push({ url: studentPage.url(), text: msg.text() });
    }
  });
  studentPage.on("pageerror", (err) => {
    studentPageErrors.push({ url: studentPage.url(), error: err.message });
  });

  try {
    await studentPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await studentPage.fill("input#email", "student1@eduflow.bd");
    await studentPage.fill("input#password", "password123");
    await studentPage.click('button[type="submit"]');
    await studentPage.waitForURL("**/student", { timeout: 15000 });
    recordResult("roles", "student_login", true, { message: "Student authenticated and landed on /student" });
  } catch (err) {
    recordResult("roles", "student_login", false, { message: `Login failed: ${err.message}` });
  }

  const studentRoutes = [
    "/student",
    "/student/attendance",
    "/student/fees",
    "/student/results",
    "/student/notices",
    "/student/timetable",
  ];

  await auditRoleRoutes(studentPage, "student", studentRoutes, studentConsoleErrors, studentPageErrors);

  // ==========================================
  // 4. MOBILE VIEWPORT AUDIT (375x667)
  // ==========================================
  console.log("\n--- [4/6] Auditing Mobile Viewport (375x667) on /fees and /students ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Login as owner on mobile
  await mobilePage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await mobilePage.fill("input#email", "owner@eduflow.bd");
  await mobilePage.fill("input#password", "password123");
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL("**/dashboard", { timeout: 15000 });

  for (const route of ["/fees", "/students"]) {
    try {
      await mobilePage.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 15000 });

      const overflowMetrics = await mobilePage.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const viewportWidth = window.innerWidth;
        const documentWidth = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth
        );

        // Check if there are scrollable table wrappers
        const tableScrollContainers = document.querySelectorAll(".overflow-x-auto, [class*='overflow-x']");

        // Inspect elements breaking viewport width outside of overflow-x containers
        const uncontainedBreaks = [];
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth + 2) {
            const scrollParent = el.closest(".overflow-x-auto, [class*='overflow-x']");
            if (!scrollParent) {
              uncontainedBreaks.push({
                tag: el.tagName.toLowerCase(),
                className: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 60),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
              });
            }
          }
        }

        return {
          viewportWidth,
          documentWidth,
          hasWindowHorizontalOverflow: documentWidth > viewportWidth,
          uncontainedBreakCount: uncontainedBreaks.length,
          uncontainedSample: uncontainedBreaks.slice(0, 3),
          tableScrollContainersCount: tableScrollContainers.length,
        };
      });

      const passed = overflowMetrics.uncontainedBreakCount === 0 || !overflowMetrics.hasWindowHorizontalOverflow;
      recordResult("mobileResponsive", `mobile_${route.replace(/\//g, "_")}`, passed, {
        viewport: "375x667",
        route,
        ...overflowMetrics,
        message: `Window: ${overflowMetrics.viewportWidth}px, Doc: ${overflowMetrics.documentWidth}px. Uncontained breaks: ${overflowMetrics.uncontainedBreakCount}. Table scroll containers: ${overflowMetrics.tableScrollContainersCount}`,
      }, overflowMetrics.uncontainedBreakCount > 0);
    } catch (err) {
      recordResult("mobileResponsive", `mobile_${route.replace(/\//g, "_")}`, false, {
        route,
        message: `Mobile test error: ${err.message}`,
      });
    }
  }

  // ==========================================
  // 5. INTERACTIVE ACTIONS AUDIT
  // ==========================================
  console.log("\n--- [5/6] Auditing Interactive User Operations ---");

  // 1. Language Toggle
  try {
    await ownerPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    const toggleBtn = ownerPage.locator('button[aria-label="Toggle language"]').first();
    const btnTextBefore = (await toggleBtn.innerText()).trim();

    await toggleBtn.click();
    await ownerPage.waitForTimeout(1000);
    const btnTextAfter = (await toggleBtn.innerText()).trim();
    const cookies = await ownerContext.cookies();
    const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");

    const toggledToBn = btnTextBefore !== btnTextAfter || (localeCookie && localeCookie.value === "bn");

    // Toggle back to English to keep test environment consistent
    await toggleBtn.click();
    await ownerPage.waitForTimeout(1000);
    const cookiesAfter = await ownerContext.cookies();
    const localeCookieAfter = cookiesAfter.find((c) => c.name === "NEXT_LOCALE");

    const toggledBack = localeCookieAfter?.value === "en";

    recordResult("interactiveTests", "language_toggle_cycle", toggledToBn && toggledBack, {
      toggledToBn,
      toggledBack,
      localeSequence: [localeCookie?.value, localeCookieAfter?.value],
      message: `Toggled EN -> BN (${localeCookie?.value}) -> EN (${localeCookieAfter?.value})`,
    });
  } catch (err) {
    recordResult("interactiveTests", "language_toggle_cycle", false, { message: `Toggle error: ${err.message}` });
  }

  // 2. Filter change on /students (Search & Reset)
  try {
    await ownerPage.goto(`${BASE_URL}/students`, { waitUntil: "networkidle" });
    const countBefore = await ownerPage.locator("table tbody tr").count();

    // Fill table search input inside main
    const tableSearch = ownerPage.locator("main input[type='text']").first();
    await tableSearch.fill("Aisha");
    await ownerPage.waitForTimeout(600);

    const countFiltered = await ownerPage.locator("table tbody tr").count();
    const tableText = await ownerPage.locator("table tbody").innerText();

    // Reset search
    await tableSearch.fill("");
    await ownerPage.waitForTimeout(400);
    const countRestored = await ownerPage.locator("table tbody tr").count();

    const passed = countFiltered === 1 && tableText.includes("Aisha") && countRestored === countBefore;
    recordResult("interactiveTests", "students_search_filter_and_reset", passed, {
      countBefore,
      countFiltered,
      countRestored,
      tableContainsMatch: tableText.includes("Aisha"),
      message: `Initial rows: ${countBefore}, Filtered rows: ${countFiltered}, Restored rows: ${countRestored}`,
    });
  } catch (err) {
    recordResult("interactiveTests", "students_search_filter_and_reset", false, { message: `Search error: ${err.message}` });
  }

  // 3. Status tab filter on /fees
  try {
    await ownerPage.goto(`${BASE_URL}/fees`, { waitUntil: "networkidle" });
    const paidTab = ownerPage.locator('button:has-text("Paid"), div:has-text("Paid")').filter({ hasText: /^Paid/ }).first();
    await paidTab.click();
    await ownerPage.waitForTimeout(500);

    const dueTab = ownerPage.locator('button:has-text("Due"), div:has-text("Due")').filter({ hasText: /^Due/ }).first();
    await dueTab.click();
    await ownerPage.waitForTimeout(500);

    const allTab = ownerPage.locator('button:has-text("All"), div:has-text("All")').filter({ hasText: /^All/ }).first();
    await allTab.click();
    await ownerPage.waitForTimeout(500);

    recordResult("interactiveTests", "fees_status_tab_filters", true, {
      message: "Successfully navigated between Paid, Due, and All status tabs",
    });
  } catch (err) {
    recordResult("interactiveTests", "fees_status_tab_filters", false, { message: `Filter error: ${err.message}` });
  }

  // 4. Modal Trigger: Record Payment Modal on /fees
  try {
    await ownerPage.goto(`${BASE_URL}/fees`, { waitUntil: "networkidle" });
    const recordPaymentBtn = ownerPage.locator('button:has-text("Record Payment")').first();
    await recordPaymentBtn.click();
    await ownerPage.waitForTimeout(500);

    const modalVisible = await ownerPage.locator('h3:has-text("Record Payment"), h2:has-text("Record Payment")').first().isVisible();
    const studentSelect = await ownerPage.locator('select').first().isVisible();
    const amountInput = await ownerPage.locator('input[type="number"], input[name="amount"]').first().isVisible();

    // Close modal via close button
    const closeBtn = ownerPage.locator('button[aria-label="Close modal"]').first();
    await closeBtn.click();
    await ownerPage.waitForTimeout(400);

    const modalClosed = !(await ownerPage.locator('h3:has-text("Record Payment"), h2:has-text("Record Payment")').first().isVisible());

    const passed = modalVisible && studentSelect && amountInput && modalClosed;
    recordResult("interactiveTests", "modal_record_payment_trigger", passed, {
      modalOpened: modalVisible,
      formFieldsRendered: studentSelect && amountInput,
      modalClosed,
      message: `Modal opened: ${modalVisible}, Inputs rendered: ${studentSelect && amountInput}, Closed cleanly: ${modalClosed}`,
    });
  } catch (err) {
    recordResult("interactiveTests", "modal_record_payment_trigger", false, { message: `Modal error: ${err.message}` });
  }

  // 5. Drawer / Panel Trigger: Add Student Side Panel on /students
  try {
    await ownerPage.goto(`${BASE_URL}/students`, { waitUntil: "networkidle" });
    const addStudentBtn = ownerPage.locator('button:has-text("Add Student")').first();
    await addStudentBtn.click();
    await ownerPage.waitForTimeout(600);

    const panelVisible = await ownerPage.locator('h2:has-text("Add Student")').first().isVisible();
    const fullNameInput = await ownerPage.locator('input[name="fullName"]').first().isVisible();

    // Close panel using Cancel button in panel footer
    const cancelBtn = ownerPage.locator('div.fixed.inset-0 button:has-text("Cancel")').first();
    await cancelBtn.click();
    await ownerPage.waitForTimeout(400);

    const panelClosed = !(await ownerPage.locator('h2:has-text("Add Student")').first().isVisible());

    const passed = panelVisible && fullNameInput && panelClosed;
    recordResult("interactiveTests", "panel_add_student_trigger", passed, {
      panelOpened: panelVisible,
      fullNameInputRendered: fullNameInput,
      panelClosed,
      message: `Side panel opened: ${panelVisible}, Inputs rendered: ${fullNameInput}, Closed cleanly: ${panelClosed}`,
    });
  } catch (err) {
    recordResult("interactiveTests", "panel_add_student_trigger", false, { message: `Side panel error: ${err.message}` });
  }

  // ==========================================
  // 6. ROLE PERMISSION & BOUNDARY ENFORCEMENT
  // ==========================================
  console.log("\n--- [6/6] Auditing Multi-Tenant Role Boundary Enforcement ---");

  // 1. Teacher accessing owner-only /settings
  try {
    await teacherPage.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    const finalUrl = teacherPage.url();
    const passed = finalUrl.includes("/teacher") && !finalUrl.includes("/settings");
    recordResult("securityBoundaryTests", "teacher_access_settings_blocked", passed, {
      attempted: "/settings",
      finalUrl,
      message: `Teacher accessing /settings redirected to: ${finalUrl}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "teacher_access_settings_blocked", false, { message: err.message });
  }

  // 2. Teacher accessing owner-only /fees
  try {
    await teacherPage.goto(`${BASE_URL}/fees`, { waitUntil: "networkidle" });
    const finalUrl = teacherPage.url();
    const passed = finalUrl.includes("/teacher") && !finalUrl.includes("/fees");
    recordResult("securityBoundaryTests", "teacher_access_fees_blocked", passed, {
      attempted: "/fees",
      finalUrl,
      message: `Teacher accessing /fees redirected to: ${finalUrl}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "teacher_access_fees_blocked", false, { message: err.message });
  }

  // 3. Student accessing owner-only /dashboard
  try {
    await studentPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    const finalUrl = studentPage.url();
    const passed = finalUrl.includes("/student") && !finalUrl.includes("/dashboard");
    recordResult("securityBoundaryTests", "student_access_dashboard_blocked", passed, {
      attempted: "/dashboard",
      finalUrl,
      message: `Student accessing /dashboard redirected to: ${finalUrl}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "student_access_dashboard_blocked", false, { message: err.message });
  }

  // 4. Student accessing owner-only /fees
  try {
    await studentPage.goto(`${BASE_URL}/fees`, { waitUntil: "networkidle" });
    const finalUrl = studentPage.url();
    const passed = finalUrl.includes("/student") && !finalUrl.endsWith("/fees");
    recordResult("securityBoundaryTests", "student_access_owner_fees_blocked", passed, {
      attempted: "/fees",
      finalUrl,
      message: `Student accessing /fees redirected to: ${finalUrl}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "student_access_owner_fees_blocked", false, { message: err.message });
  }

  // 5. Student accessing owner /expenses
  try {
    await studentPage.goto(`${BASE_URL}/expenses`, { waitUntil: "networkidle" });
    const finalUrl = studentPage.url();
    const content = await studentPage.content();
    const hasUnauthorized = content.includes("Unauthorized") || finalUrl.includes("/student");
    recordResult("securityBoundaryTests", "student_access_expenses_boundary", hasUnauthorized, {
      attempted: "/expenses",
      finalUrl,
      hasUnauthorized,
      message: `Student accessing /expenses -> final URL: ${finalUrl}, Unauthorized prompt: ${hasUnauthorized}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "student_access_expenses_boundary", false, { message: err.message });
  }

  // 6. Student accessing owner /batches
  try {
    await studentPage.goto(`${BASE_URL}/batches`, { waitUntil: "networkidle" });
    const finalUrl = studentPage.url();
    const content = await studentPage.content();
    const hasUnauthorized = content.includes("Unauthorized") || finalUrl.includes("/student");
    recordResult("securityBoundaryTests", "student_access_batches_boundary", hasUnauthorized, {
      attempted: "/batches",
      finalUrl,
      hasUnauthorized,
      message: `Student accessing /batches -> final URL: ${finalUrl}, Unauthorized prompt: ${hasUnauthorized}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "student_access_batches_boundary", false, { message: err.message });
  }

  // 7. Unauthenticated visitor accessing /dashboard
  const anonContext = await browser.newContext();
  const anonPage = await anonContext.newPage();
  try {
    await anonPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    const finalUrl = anonPage.url();
    const passed = finalUrl.includes("/login");
    recordResult("securityBoundaryTests", "unauthenticated_dashboard_redirects_login", passed, {
      attempted: "/dashboard",
      finalUrl,
      message: `Unauthenticated access to /dashboard redirected to: ${finalUrl}`,
    });
  } catch (err) {
    recordResult("securityBoundaryTests", "unauthenticated_dashboard_redirects_login", false, { message: err.message });
  }

  // Compile global console & page errors
  report.consoleErrors = [
    ...ownerConsoleErrors.map((e) => ({ role: "owner", ...e })),
    ...teacherConsoleErrors.map((e) => ({ role: "teacher", ...e })),
    ...studentConsoleErrors.map((e) => ({ role: "student", ...e })),
  ];
  report.pageErrors = [
    ...ownerPageErrors.map((e) => ({ role: "owner", ...e })),
    ...teacherPageErrors.map((e) => ({ role: "teacher", ...e })),
    ...studentPageErrors.map((e) => ({ role: "student", ...e })),
  ];

  await browser.close();

  // Save report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log("\n=================================================");
  console.log(`  QA Audit Completed Successfully!`);
  console.log(`  Total Tests : ${report.summary.totalTests}`);
  console.log(`  Passed      : ${report.summary.passed}`);
  console.log(`  Warnings    : ${report.summary.warnings}`);
  console.log(`  Failed      : ${report.summary.failed}`);
  console.log(`  Report File : ${REPORT_FILE}`);
  console.log("=================================================\n");
}

runAudit().catch((err) => {
  console.error("Fatal audit execution error:", err);
  process.exit(1);
});
