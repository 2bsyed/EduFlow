import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Icon } from "@/components/ui/Icon";

export default function MarketingLandingPage() {
  const tHero = useTranslations("Hero");
  const tBenefits = useTranslations("Benefits");
  const tHow = useTranslations("HowItWorks");
  const tTestimonials = useTranslations("Testimonials");
  const tPricing = useTranslations("Pricing");
  const tCta = useTranslations("FinalCta");
  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <div className="bg-background text-on-background min-h-screen font-sans antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary">
      {/* SECTION 1: TOP NAVBAR & HERO SECTION */}
      <header className="bg-surface dark:bg-surface-container-highest w-full sticky top-0 z-50 border-b border-outline-variant shadow-sm">
        <nav className="flex justify-between items-center h-20 px-margin max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Icon name="school" className="text-primary text-[28px]" />
            <span className="font-h3 text-h3 font-bold text-primary tracking-tight">EduFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-gutter">
            <a href="#features" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              {tNav("features")}
            </a>
            <a href="#how-it-works" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              How It Works
            </a>
            <a href="#pricing" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              {tNav("pricing")}
            </a>
            <a href="#testimonials" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
              {tNav("about")}
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
                {tHero("trustedBadge")}
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
                <span>{tHero("startTrial")}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
              <Link
                href="/demo"
                className="bg-surface-container-lowest text-primary-container border border-primary-container font-label-md text-label-md px-lg py-md rounded-lg hover:bg-surface-container-low transition-colors whitespace-nowrap inline-flex items-center gap-2"
              >
                <Icon name="play_circle" className="text-[20px]" />
                <span>{tHero("watchDemo")}</span>
              </Link>
            </div>

            <p className="font-caption text-caption text-outline">
              {tHero("guarantee")}
            </p>

            <div className="mt-lg pt-lg border-t border-outline-variant flex flex-col gap-md">
              <span className="font-caption text-caption text-on-surface-variant">
                {tHero("usedBy")}
              </span>
              <div className="flex flex-wrap items-center gap-lg opacity-75">
                <span className="font-h4 text-h4 text-on-surface font-semibold">Ideal Coaching</span>
                <span className="font-h4 text-h4 text-on-surface font-semibold">Success Academy</span>
                <span className="font-h4 text-h4 text-on-surface font-semibold">Udvash Care</span>
                <span className="font-h4 text-h4 text-on-surface font-semibold">Retina Medical</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Placeholder Block */}
          <div className="md:col-span-5 relative mt-xl md:mt-0">
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-outline-variant bg-gradient-to-br from-primary-container/10 via-surface-container-lowest to-surface-container-low aspect-[4/5] md:aspect-[4/4.5] flex items-center justify-center p-lg">
              {/* Styled Placeholder Representation */}
              <div className="w-full h-full rounded-lg border-2 border-dashed border-outline-variant/60 flex flex-col items-center justify-center p-md text-center bg-surface-container-lowest/70 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center text-primary mb-md">
                  <Icon name="school" className="text-[44px]" />
                </div>
                <h3 className="font-h4 text-h4 text-on-surface mb-xs">Coaching Center Manager</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                  Real-time analytics dashboard & daily attendance tracker
                </p>
              </div>

              {/* Floating UI Widget Element */}
              <div className="absolute bottom-6 -left-4 md:-left-8 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant p-md flex flex-col gap-xs max-w-[220px]">
                <div className="flex items-center gap-sm">
                  <div className="bg-secondary-container rounded-full p-xs flex items-center justify-center text-secondary">
                    <Icon name="trending_up" className="text-[16px]" />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-medium">
                    {tHero("attendanceRate")}
                  </span>
                </div>
                <div className="flex items-end gap-md">
                  <span className="font-h3 text-h3 text-on-surface font-bold">94%</span>
                  <span className="font-caption text-caption text-secondary flex items-center mb-1 font-semibold">
                    <Icon name="arrow_upward" className="text-[12px]" /> 2.1%
                  </span>
                </div>
                <div className="w-full h-6 mt-xs flex items-end gap-1">
                  <div className="w-1/6 bg-surface-container h-1/3 rounded-t-sm"></div>
                  <div className="w-1/6 bg-surface-container h-1/2 rounded-t-sm"></div>
                  <div className="w-1/6 bg-surface-container h-2/3 rounded-t-sm"></div>
                  <div className="w-1/6 bg-surface-container h-1/2 rounded-t-sm"></div>
                  <div className="w-1/6 bg-surface-container h-3/4 rounded-t-sm"></div>
                  <div className="w-1/6 bg-secondary h-full rounded-t-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST BAR & BENEFITS GRID */}
      <section id="features" className="py-lg border-b border-outline-variant/30 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            <div className="flex flex-col items-center justify-center text-center p-sm">
              <Icon name="groups" className="text-outline mb-xs text-3xl" />
              <p className="font-h3 text-h3 text-on-surface">500+</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{tBenefits("trustStudents")}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-sm">
              <Icon name="payments" className="text-outline mb-xs text-3xl" />
              <p className="font-h3 text-h3 text-on-surface">৳ Lakhs</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{tBenefits("trustFees")}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-sm">
              <Icon name="dns" className="text-outline mb-xs text-3xl" />
              <p className="font-h3 text-h3 text-on-surface">99.9%</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{tBenefits("trustUptime")}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-sm">
              <Icon name="language" className="text-outline mb-xs text-3xl" />
              <p className="font-h3 text-h3 text-on-surface">Bangla + English</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{tBenefits("trustSupport")}</p>
            </div>
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
                <Icon name="sms" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">{tBenefits("smsTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{tBenefits("smsDesc")}</p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-md group-hover:scale-105 transition-transform text-on-surface">
                <Icon name="bar_chart" className="text-[24px]" />
              </div>
              <h3 className="font-h4 text-h4 text-on-surface mb-xs">{tBenefits("reportsTitle")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{tBenefits("reportsDesc")}</p>
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

      {/* DASHBOARD BROWSER MOCKUP SHOWCASE */}
      <section className="py-xxl px-margin w-full bg-surface-container-low/40 overflow-hidden border-t border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xl">
            <h2 className="font-h1 text-h1 text-on-surface md:font-h1 font-h1-mobile">
              {tHow("showcaseTitle")}
            </h2>
            <p className="mt-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {tHow("showcaseSubhead")}
            </p>
          </div>

          {/* Mockup Browser Window */}
          <div className="mt-xl mx-auto max-w-5xl rounded-xl bg-surface border border-outline-variant shadow-xl overflow-hidden flex flex-col">
            <div className="bg-surface-container-lowest border-b border-outline-variant h-12 flex items-center px-md gap-sm">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error-container border border-error/20"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim border border-tertiary/20"></div>
                <div className="w-3 h-3 rounded-full bg-secondary-fixed border border-secondary/20"></div>
              </div>
              <div className="flex-1 ml-lg">
                <div className="bg-surface-container-low h-6 rounded-md w-1/2 max-w-md border border-outline-variant/50 flex items-center px-sm mx-auto">
                  <Icon name="lock" className="text-[14px] text-on-surface-variant/50 mr-2" />
                  <span className="font-caption text-caption text-on-surface-variant/70">app.eduflow.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Content Grid */}
            <div className="bg-surface-bright flex-1 p-lg md:p-xl grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
                <div className="bg-surface p-md rounded-lg border border-outline-variant/50 shadow-sm flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                    <Icon name="account_balance_wallet" className="text-[18px] text-secondary" />
                    {tHow("totalRevenue")}
                  </span>
                  <span className="font-h2 text-h2 text-on-surface mt-sm font-bold">৳ 2.4L</span>
                  <span className="font-caption text-caption text-secondary mt-xs flex items-center gap-1 font-semibold">
                    <Icon name="trending_up" className="text-[14px]" /> +12.5% this month
                  </span>
                </div>

                <div className="bg-surface p-md rounded-lg border border-outline-variant/50 shadow-sm flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                    <Icon name="check_circle" className="text-[18px] text-primary" />
                    {tHow("attendanceRate")}
                  </span>
                  <span className="font-h2 text-h2 text-on-surface mt-sm font-bold">94%</span>
                  <span className="font-caption text-caption text-secondary mt-xs flex items-center gap-1 font-semibold">
                    <Icon name="trending_up" className="text-[14px]" /> +2% vs last week
                  </span>
                </div>

                <div className="bg-surface p-md rounded-lg border border-outline-variant/50 shadow-sm flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                    <Icon name="pending_actions" className="text-[18px] text-error" />
                    {tHow("pendingFees")}
                  </span>
                  <span className="font-h2 text-h2 text-error mt-sm font-bold">৳ 45K</span>
                  <span className="font-caption text-caption text-error mt-xs flex items-center gap-1 font-semibold">
                    <Icon name="warning" className="text-[14px]" /> 15 students pending
                  </span>
                </div>

                <div className="bg-surface p-md rounded-lg border border-outline-variant/50 shadow-sm flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
                    <Icon name="groups" className="text-[18px] text-tertiary" />
                    {tHow("activeStudents")}
                  </span>
                  <span className="font-h2 text-h2 text-on-surface mt-sm font-bold">342</span>
                  <span className="font-caption text-caption text-secondary mt-xs flex items-center gap-1 font-semibold">
                    <Icon name="trending_up" className="text-[14px]" /> +8 new admissions
                  </span>
                </div>
              </div>

              {/* Chart & Activity */}
              <div className="md:col-span-3 bg-surface p-lg rounded-lg border border-outline-variant/50 shadow-sm flex flex-col min-h-[260px]">
                <h3 className="font-h4 text-h4 text-on-surface mb-lg flex justify-between items-center">
                  <span>{tHow("studentGrowth")}</span>
                  <Icon name="more_horiz" className="text-on-surface-variant" />
                </h3>
                <div className="flex-1 relative flex items-end justify-between pt-lg border-b border-l border-outline-variant/30 pl-sm pb-sm">
                  <div className="w-full h-full flex items-end justify-around px-md">
                    <div className="w-8 bg-primary-container/20 rounded-t-sm h-[40%]"></div>
                    <div className="w-8 bg-primary-container/40 rounded-t-sm h-[55%]"></div>
                    <div className="w-8 bg-primary-container/60 rounded-t-sm h-[70%]"></div>
                    <div className="w-8 bg-primary-container/80 rounded-t-sm h-[85%]"></div>
                    <div className="w-8 bg-primary-container rounded-t-sm h-[95%]"></div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 bg-surface p-lg rounded-lg border border-outline-variant/50 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-h4 text-h4 text-on-surface mb-md">{tHow("recentActivity")}</h3>
                  <div className="flex flex-col gap-md text-left">
                    <div className="flex items-start gap-sm">
                      <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                        <Icon name="payments" className="text-[14px]" />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface line-clamp-1">{tHow("feeCollected")}</p>
                        <p className="font-caption text-caption text-on-surface-variant">2 mins ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-sm">
                      <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <Icon name="person_add" className="text-[14px]" />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface line-clamp-1">{tHow("newAdmission")}</p>
                        <p className="font-caption text-caption text-on-surface-variant">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="mt-md text-primary font-label-md text-label-md hover:underline w-full text-center cursor-pointer">
                  {tHow("viewAll")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-xxl md:py-24 bg-surface-container-low px-margin border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xl">
            <h2 className="font-h2 text-h2 text-on-background mb-sm">{tTestimonials("title")}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              {tTestimonials("subhead")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Testimonial Card 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="flex gap-1 mb-md text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Icon name="star" key={i} className="text-[20px]" />
                ))}
              </div>
              <blockquote className="font-body-md text-body-md text-on-surface flex-grow mb-lg italic">
                "{tTestimonials("quote1")}"
              </blockquote>
              <div className="flex items-center gap-md pt-md border-t border-surface-variant mt-auto">
                {/* Styled Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-primary-container/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  RI
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-background font-semibold">{tTestimonials("author1Name")}</p>
                  <p className="font-caption text-caption text-on-surface-variant">{tTestimonials("author1Role")}</p>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="flex gap-1 mb-md text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Icon name="star" key={i} className="text-[20px]" />
                ))}
              </div>
              <blockquote className="font-body-md text-body-md text-on-surface flex-grow mb-lg italic">
                "{tTestimonials("quote2")}"
              </blockquote>
              <div className="flex items-center gap-md pt-md border-t border-surface-variant mt-auto">
                {/* Styled Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-secondary-container/30 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-lg shrink-0">
                  NJ
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-background font-semibold">{tTestimonials("author2Name")}</p>
                  <p className="font-caption text-caption text-on-surface-variant">{tTestimonials("author2Role")}</p>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="flex gap-1 mb-md text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Icon name="star" key={i} className="text-[20px]" />
                ))}
              </div>
              <blockquote className="font-body-md text-body-md text-on-surface flex-grow mb-lg italic">
                "{tTestimonials("quote3")}"
              </blockquote>
              <div className="flex items-center gap-md pt-md border-t border-surface-variant mt-auto">
                {/* Styled Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed-dim/30 border border-tertiary/20 flex items-center justify-center text-tertiary font-bold text-lg shrink-0">
                  TA
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-background font-semibold">{tTestimonials("author3Name")}</p>
                  <p className="font-caption text-caption text-on-surface-variant">{tTestimonials("author3Role")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRICING SECTION */}
      <section id="pricing" className="py-xxl px-margin relative overflow-hidden bg-background">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-center text-center mb-xl">
          <h1 className="font-h1 text-h1 text-on-background mb-sm">{tPricing("title")}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{tPricing("subhead")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-7xl w-full mx-auto relative z-10">
          {/* Starter Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col hover:shadow-lg transition-shadow duration-300 relative group">
            <div className="mb-lg">
              <h2 className="font-h3 text-h3 text-on-background mb-xs">{tPricing("starterTitle")}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">{tPricing("starterSubhead")}</p>
              <div className="flex items-baseline gap-xs">
                <span className="font-h2 text-h2 text-on-background">{tPricing("starterPrice")}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{tPricing("perMonth")}</span>
              </div>
              <p className="font-label-md text-label-md text-primary mt-sm bg-surface-container-low inline-block px-sm py-xs rounded-full">
                {tPricing("starterCap")}
              </p>
            </div>
            <ul className="flex flex-col gap-md mb-xl flex-grow text-left">
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Digital Attendance
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Basic Fee Tracking
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                SMS Notifications
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Bangla Support
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full text-center border-2 border-primary-container text-primary-container hover:bg-primary-container hover:text-on-primary transition-colors duration-200 font-label-md text-label-md py-md rounded-lg mt-auto block"
            >
              {tPricing("startTrial")}
            </Link>
          </div>

          {/* Growth Card (Most Popular) */}
          <div className="bg-surface-container-lowest border-2 border-primary-container rounded-xl p-lg flex flex-col shadow-xl md:-mt-md md:mb-md relative z-20 transform transition-transform duration-300 hover:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary font-label-md text-label-md px-md py-xs rounded-full shadow-sm whitespace-nowrap">
              {tPricing("mostPopular")}
            </div>
            <div className="mb-lg mt-sm">
              <h2 className="font-h3 text-h3 text-on-background mb-xs">{tPricing("growthTitle")}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">{tPricing("growthSubhead")}</p>
              <div className="flex items-baseline gap-xs">
                <span className="font-h2 text-h2 text-on-background">{tPricing("growthPrice")}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{tPricing("perMonth")}</span>
              </div>
              <p className="font-label-md text-label-md text-primary mt-sm bg-surface-container-low inline-block px-sm py-xs rounded-full">
                {tPricing("growthCap")}
              </p>
            </div>
            <ul className="flex flex-col gap-md mb-xl flex-grow text-left">
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background font-medium">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Everything in Starter
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Results & Report Cards
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                bKash & Nagad Integration
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Advanced Analytics
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full text-center bg-primary-container text-on-primary hover:bg-primary transition-colors duration-200 font-label-md text-label-md py-md rounded-lg shadow-md mt-auto block"
            >
              {tPricing("startTrial")}
            </Link>
          </div>

          {/* Pro Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col hover:shadow-lg transition-shadow duration-300 relative group">
            <div className="mb-lg">
              <h2 className="font-h3 text-h3 text-on-background mb-xs">{tPricing("proTitle")}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">{tPricing("proSubhead")}</p>
              <div className="flex items-baseline gap-xs">
                <span className="font-h2 text-h2 text-on-background">{tPricing("proPrice")}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{tPricing("perMonth")}</span>
              </div>
              <p className="font-label-md text-label-md text-primary mt-sm bg-surface-container-low inline-block px-sm py-xs rounded-full">
                {tPricing("proCap")}
              </p>
            </div>
            <ul className="flex flex-col gap-md mb-xl flex-grow text-left">
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background font-medium">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Everything in Growth
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Multi-branch Management
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Staff Payroll
              </li>
              <li className="flex items-center gap-sm font-body-md text-body-md text-on-background">
                <Icon name="check_circle" className="text-secondary text-[20px]" />
                Priority Support
              </li>
            </ul>
            <Link
              href="/register"
              className="w-full text-center border-2 border-primary-container text-primary-container hover:bg-primary-container hover:text-on-primary transition-colors duration-200 font-label-md text-label-md py-md rounded-lg mt-auto block"
            >
              {tPricing("startTrial")}
            </Link>
          </div>
        </div>

        <div className="mt-xl text-center flex items-center justify-center gap-sm bg-surface-container-low px-lg py-md rounded-full shadow-sm max-w-3xl w-full mx-auto">
          <Icon name="info" className="text-primary" />
          <p className="font-body-md text-body-md text-on-surface-variant">{tPricing("guarantee")}</p>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA & MULTI-COLUMN FOOTER */}
      <section className="bg-primary-container text-on-primary py-xxl px-margin">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="font-h2 text-h2 text-on-primary mb-md">
            {tCta("title")}
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary opacity-90 mb-xl max-w-2xl">
            {tCta("subhead")}
          </p>
          <Link
            href="/register"
            className="bg-surface-container-lowest text-primary-container hover:bg-surface-container-low transition-colors duration-200 font-label-md text-label-md px-xl py-md rounded-lg shadow-sm mb-md inline-flex items-center gap-sm"
          >
            <span>{tCta("button")}</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </Link>
          <p className="font-caption text-caption text-on-primary opacity-80">
            {tCta("note")}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin py-xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter text-left">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-md">
            <Link href="/" className="font-h3 text-h3 font-bold text-primary">
              EduFlow
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
              {tFooter("brandDesc")}
            </p>
            <div className="flex gap-md mt-sm text-on-surface-variant">
              <Icon name="qr_code_2" className="text-[22px]" />
              <Icon name="mail" className="text-[22px]" />
            </div>
          </div>

          {/* Product Column */}
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-md">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{tFooter("product")}</h4>
            <ul className="flex flex-col gap-sm">
              <li><a href="#features" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("features")}</a></li>
              <li><a href="#pricing" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("pricing")}</a></li>
              <li><Link href="/demo" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("demo")}</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-md">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{tFooter("company")}</h4>
            <ul className="flex flex-col gap-sm">
              <li><a href="#testimonials" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("about")}</a></li>
              <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("contact")}</a></li>
              <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("blog")}</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-md">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold">{tFooter("support")}</h4>
            <ul className="flex flex-col gap-sm">
              <li><a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">{tFooter("helpCenter")}</a></li>
              <li className="flex items-center gap-sm">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Language:</span>
                <LanguageToggle />
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-sm font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors">
                  <Icon name="chat" className="text-[18px]" />
                  {tFooter("whatsapp")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-margin py-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
          <p className="font-caption text-caption text-on-surface-variant">
            {tFooter("copyright")}
          </p>
          <div className="flex gap-lg font-caption text-caption text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">{tFooter("privacy")}</a>
            <a href="#" className="hover:text-primary transition-colors">{tFooter("terms")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
