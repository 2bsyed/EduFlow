import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Icon } from "@/components/ui/Icon";
import { BackendWarmup } from "@/components/common/BackendWarmup";

export default function MarketingLandingPage() {
  const tHero = useTranslations("Hero");
  const tBenefits = useTranslations("Benefits");
  const tHow = useTranslations("HowItWorks");
  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <div className="bg-background text-on-background min-h-screen font-sans antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary">
      <BackendWarmup />
      {/* SECTION 1: TOP NAVBAR & HERO SECTION */}
      <header className="bg-surface dark:bg-surface-container-highest w-full sticky top-0 z-50 border-b border-outline-variant shadow-sm">
        <nav className="flex justify-between items-center h-20 px-margin max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} priority className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-gutter">
            <a href="#features" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              {tNav("features")}
            </a>
            <a href="#how-it-works" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              How It Works
            </a>
            <a href="#capabilities" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              Capabilities
            </a>
            <a href="#features" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              Product
            </a>
          </div>

          <div className="flex items-center gap-md">
            <LanguageToggle />
            <Link
              href="/login"
              className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm"
            >
              {tNav("login")}
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-surface-container-lowest bg-pattern pt-xxl pb-xxl md:pt-20 md:pb-28 px-margin border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          {/* Left Content */}
          <div className="md:col-span-7 flex flex-col gap-lg z-10">
            <div className="inline-flex items-center gap-sm bg-surface-container-low border border-outline-variant rounded-full px-md py-xs w-max">
              <Icon name="verified" className="text-[18px] text-secondary" />
              <span className="font-label-md text-label-md text-on-surface-variant">
                EduFlow institute management
              </span>
            </div>

            <div className="flex flex-col gap-md">
              <h1 className="font-h1-mobile text-h1-mobile md:font-h1 md:text-h1 text-primary-container tracking-tight">
                {tHero("headline")}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">
                {tHero("subhead")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center mt-sm">
              <Link
                href="/register"
                className="bg-primary-container text-on-primary font-label-md text-label-md px-lg py-md rounded-lg shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap inline-flex items-center gap-2"
              >
                <span>Create institute account</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
              <Link
                href="/#features"
                className="bg-surface-container-lowest text-primary-container border border-primary-container font-label-md text-label-md px-lg py-md rounded-lg hover:bg-surface-container-low transition-colors whitespace-nowrap inline-flex items-center gap-2"
              >
                <Icon name="arrow_downward" className="text-[20px]" />
                <span>Explore features</span>
              </Link>
            </div>

          </div>

          {/* Right Hero Image Block */}
          <div className="md:col-span-5 relative mt-xl md:mt-0">
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-outline-variant bg-gradient-to-br from-primary-container/10 via-surface-container-lowest to-surface-container-low aspect-[4/5] md:aspect-[4/4.5] flex items-center justify-center">
              <Image
                src="/images/hero.png"
                alt="Coaching center owner reviewing EduFlow dashboard on a tablet"
                width={600}
                height={500}
                priority
                className="w-full h-full object-cover rounded-xl"
              />

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRODUCT CAPABILITIES */}
      <section id="features" className="py-xl border-b border-outline-variant/30 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {[
              { icon: "groups", label: "Student and teacher records" },
              { icon: "calendar_today", label: "Batch attendance" },
              { icon: "payments", label: "Manual fee tracking" },
              { icon: "grade", label: "Results and report cards" },
            ].map((item) => <div key={item.label} className="flex flex-col items-center justify-center gap-sm p-sm text-center text-on-surface-variant">
              <Icon name={item.icon} className="text-3xl" />
              <span className="font-body-sm text-body-sm">{item.label}</span>
            </div>)}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-xxl bg-surface">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="text-center mb-xl">
            <h2 className="font-h2 text-h2 text-on-surface mb-sm">{tBenefits("title")}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {tBenefits("subhead")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {/* Benefit 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-primary-fixed">
                <Icon name="how_to_reg" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">{tBenefits("attendanceTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{tBenefits("attendanceDesc")}</p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-secondary-fixed">
                <Icon name="account_balance_wallet" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">{tBenefits("feesTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{tBenefits("feesDesc")}</p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-tertiary-fixed">
                <Icon name="assignment" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">{tBenefits("resultsTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{tBenefits("resultsDesc")}</p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-error-container">
                <Icon name="receipt_long" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">Student records</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Maintain student profiles and export the directory as CSV.</p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-surface">
                <Icon name="bar_chart" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">Institute expenses</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Record and review expenses entered by the institute owner.</p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-surface-variant">
                <Icon name="translate" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">{tBenefits("i18nTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{tBenefits("i18nDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS SHOWCASE */}
      <section id="how-it-works" className="py-xxl px-margin max-w-7xl mx-auto border-t border-outline-variant/30">
        <div className="text-center mb-xl">
          <h2 className="font-h1 text-h1 text-on-surface md:font-h1 font-h1-mobile">
            {tHow("title")}
          </h2>
          <p className="mt-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            {tHow("subhead")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mt-xxl relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-outline-variant z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-surface p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-md border-4 border-surface shadow-sm relative text-primary">
              <span className="absolute top-0 right-0 -mt-2 -mr-2 font-h4 text-h4 text-primary bg-surface-container w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                01
              </span>
              <Icon name="group_add" className="text-4xl" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">{tHow("step1Title")}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{tHow("step1Desc")}</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-surface p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-md border-4 border-surface shadow-sm relative text-primary">
              <span className="absolute top-0 right-0 -mt-2 -mr-2 font-h4 text-h4 text-primary bg-surface-container w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                02
              </span>
              <Icon name="edit_calendar" className="text-4xl" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">{tHow("step2Title")}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{tHow("step2Desc")}</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-surface p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-md border-4 border-surface shadow-sm relative text-primary">
              <span className="absolute top-0 right-0 -mt-2 -mr-2 font-h4 text-h4 text-primary bg-surface-container w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                03
              </span>
              <Icon name="dashboard" className="text-4xl" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">{tHow("step3Title")}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{tHow("step3Desc")}</p>
          </div>
        </div>
      </section>

      {/* Product overview */}
      <section className="py-xxl px-margin w-full bg-surface-container-low/40 overflow-hidden border-t border-b border-outline-variant/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-h1 text-h1 text-on-surface">Institute records in one workspace</h2>
          <p className="mt-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">The dashboard summarizes records your institute has entered, including attendance, batches, fees and students.</p>
          <div className="mt-xl grid gap-md sm:grid-cols-2 lg:grid-cols-4">
            {[['groups', 'Student directory'], ['calendar_today', 'Batch attendance'], ['payments', 'Manual fee records'], ['grade', 'Exam results']].map(([icon, label]) => <div key={label} className="flex items-center gap-sm rounded-lg border border-outline-variant bg-surface p-lg text-left"><Icon name={icon} className="text-primary text-2xl" /><span className="font-label-md text-label-md text-on-surface">{label}</span></div>)}
          </div>
        </div>
      </section>

      {/* SECTION 5: CURRENT PRODUCT CAPABILITIES */}
      <section id="capabilities" className="py-xxl px-margin bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-xl text-center">
            <h2 className="font-h1 text-h1 text-on-background mb-sm">The daily tools institutes need</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Manage academic records and institute operations from one workspace.</p>
          </div>
          <div className="grid gap-lg md:grid-cols-3">
            {[
              { title: "Academic records", items: ["Students and teacher directory", "Batches and attendance", "Exam results and report cards"] },
              { title: "Fees and expenses", items: ["Record payments manually", "Track pending fees and receipts", "Log institute expenses"] },
              { title: "Institute operations", items: ["Role-based owner, teacher and student views", "Notices for institute or assigned batches", "Export student records to CSV"] },
            ].map((group) => <article key={group.title} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
              <h3 className="font-h3 text-h3 font-semibold text-on-background">{group.title}</h3>
              <ul className="mt-md space-y-sm">{group.items.map((item) => <li key={item} className="flex items-start gap-sm font-body-md text-body-md text-on-surface"><Icon name="check_circle" className="mt-0.5 text-secondary text-[20px]" />{item}</li>)}</ul>
            </article>)}
          </div>
          <p className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant">Payment gateways, automated messaging, payroll and multi-branch tools are not part of this version.</p>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA & MULTI-COLUMN FOOTER */}
      <section className="bg-primary-container text-on-primary py-xxl px-margin">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="font-h2 text-h2 text-on-primary mb-md">Start managing your institute in one place</h2>
          <p className="font-body-lg text-body-lg text-on-primary opacity-90 mb-xl max-w-2xl">
            Create an owner account, add teachers and students, then manage day-to-day academic and fee records.
          </p>
          <Link
            href="/register"
            className="bg-surface-container-lowest text-primary-container hover:bg-surface-container-low transition-colors duration-200 font-label-md text-label-md px-xl py-md rounded-lg shadow-sm mb-md inline-flex items-center gap-sm"
          >
            <span>Create institute account</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </Link>
          <p className="font-caption text-caption text-on-primary opacity-80">
            Manual fee recording is available. Payment processing and automated messaging are not connected.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin py-xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter text-left">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-md">
            <Link href="/">
              <Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} className="h-9 w-auto object-contain" />
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">An operations workspace for coaching institutes and learning centers.</p>
          </div>

          {/* Product Column */}
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-md">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{tFooter("product")}</h4>
            <ul className="flex flex-col gap-sm">
              <li><a href="#features" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("features")}</a></li>
              <li><a href="#capabilities" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Capabilities</a></li>
              <li><Link href="/register" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Create an institute account</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-md">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">About EduFlow</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Tools for student records, attendance, fees, results, and institute notices.</p>
          </div>

          {/* Support Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-md">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">Language</h4>
            <ul className="flex flex-col gap-sm">
              <li className="flex items-center gap-sm">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Choose display language:</span>
                <LanguageToggle />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-margin py-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-caption text-caption text-on-surface-variant">
            {tFooter("copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
