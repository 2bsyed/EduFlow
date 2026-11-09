import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { AdmissionInquiryForm } from "@/components/public/AdmissionInquiryForm";

export const dynamic = "force-dynamic";

export default async function InstituteShowcasePage() {
  // Fetch default or first institute showcase data
  const data = await fetchApi("/api/v1/institutes/public/inst-1").catch(() => null) || {
    id: "inst-1",
    name: "Apex Coaching & Academic Care",
    code: "APEX-BD",
    subdomain: "apex",
    phone: "01712-345678",
    email: "admissions@apexcoaching.bd",
    address: "House 14, Road 5, Dhanmondi, Dhaka 1205",
    logoUrl: "/images/eduflow-logo.png",
    heroHeadline: "Shaping Academic Excellence & Future Leaders",
    heroSubhead: "Bangladesh's premier coaching center for SSC, HSC, and University Admission prep with disciplined batches and expert mentors.",
    heroImageUrl: "/images/hero.png",
    aboutText: "Founded with a passion for educational mentorship, we provide rigorous coaching combined with weekly model tests, personal progress tracking, and supportive classroom guidance.",
    isPublished: true,
    courses: [
      { id: "c1", title: "HSC 2026 Academic Batch", subject: "Physics & Chemistry", schedule: "Sun, Tue, Thu 10:00 AM", monthlyFee: 3500 },
      { id: "c2", title: "SSC 2025 Comprehensive", subject: "General & Higher Math", schedule: "Mon, Wed, Fri 04:00 PM", monthlyFee: 2800 },
      { id: "c3", title: "Medical & BUET Admission Care", subject: "Biology & Mathematics", schedule: "Daily Intensive", monthlyFee: 4500 },
    ],
    faculty: [
      { id: "f1", name: "Dr. Anwar Hossain", subject: "Senior Physics Faculty" },
      { id: "f2", name: "Ms. Farzana Rahman", subject: "Higher Mathematics" },
      { id: "f3", name: "Mr. Tanvir Hasan", subject: "Chemistry & Biology" },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#0F6CBD] selection:text-white">
      {/* 1. GLASS-BLUR TRANSLUCENT TOP NAVIGATION */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Institute Name */}
          <Link href="#home" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F6CBD] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {data.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base md:text-lg tracking-tight block leading-tight">
                {data.name}
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Official Institute Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-[#0F6CBD] transition">About</a>
            <a href="#courses" className="hover:text-[#0F6CBD] transition">Courses</a>
            <a href="#faculty" className="hover:text-[#0F6CBD] transition">Faculty</a>
            <a href="#results" className="hover:text-[#0F6CBD] transition">Results</a>
            <a href="#gallery" className="hover:text-[#0F6CBD] transition">Campus</a>
            <a href="#admissions" className="text-[#0F6CBD] font-semibold hover:underline">Admission</a>
            <a href="#contact" className="hover:text-[#0F6CBD] transition">Contact</a>
          </nav>

          {/* Right Action: Login to ERP */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F6CBD] hover:bg-[#115EA3] text-white shadow-sm transition"
            >
              <Icon name="login" className="text-[16px]" />
              <span>Student / Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC HERO SECTION WITH GLASS ACCENTS */}
      <section id="home" className="relative min-h-[600px] lg:min-h-[720px] flex items-center bg-slate-950 overflow-hidden">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={data.heroImageUrl || "/images/hero.png"}
            alt="Campus Architecture & Classroom"
            fill
            priority
            className="object-cover object-center opacity-40 filter saturate-120 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span>Admissions Open for 2026 Batches</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              {data.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              {data.heroSubhead}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#admissions"
                className="px-6 py-3.5 rounded-xl bg-[#0F6CBD] hover:bg-[#115EA3] text-white font-semibold text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                <span>Apply for Admission</span>
                <Icon name="arrow_forward" className="text-lg" />
              </a>
              <a
                href="#courses"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm backdrop-blur-md transition inline-flex items-center gap-2"
              >
                <Icon name="menu_book" className="text-lg text-slate-300" />
                <span>Explore Programs</span>
              </a>
            </div>

            {/* Compact Stat Badge Panel over hero */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/15 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Board Pass Rate</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">40+</p>
                <p className="text-xs text-slate-400 mt-0.5">Model Tests / Year</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">1:15</p>
                <p className="text-xs text-slate-400 mt-0.5">Teacher Ratio</p>
              </div>
            </div>
          </div>

          {/* Right Hero Form */}
          <div className="lg:col-span-5">
            <AdmissionInquiryForm instituteId={data.id} courses={data.courses} />
          </div>
        </div>
      </section>

      {/* 3. ABOUT OUR INSTITUTE */}
      <section id="about" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[#0F6CBD] text-xs font-bold uppercase tracking-wider">
              <Icon name="verified" className="text-base" />
              <span>About Our Institution</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              A Proven Tradition of Academic Distinction
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {data.aboutText}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="flex items-start gap-2.5">
                <Icon name="check_circle" className="text-[#0F6CBD] text-xl shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-700">Small batches for individual focus</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="check_circle" className="text-[#0F6CBD] text-xl shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-700">Weekly OMR & Written Model Tests</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="check_circle" className="text-[#0F6CBD] text-xl shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-700">Bi-lingual study materials</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="check_circle" className="text-[#0F6CBD] text-xl shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-700">Online attendance & report cards</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 border border-slate-200">
            <Image
              src="/images/hero.png"
              alt="Classroom and learning environment"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4. COURSES & PROGRAMS */}
      <section id="courses" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6CBD]">Academic Programs</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Structured Batches Designed for Success
            </h2>
            <p className="text-slate-600 text-sm">
              Carefully curated curriculum and routine aligned with NCTB and competitive admission standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.courses.map((course: any, idx: number) => (
              <div
                key={course.id || idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-[#0F6CBD]/40 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                      {course.subject}
                    </span>
                    <span className="font-bold text-base text-slate-900 font-mono">
                      ৳ {Number(course.monthlyFee).toLocaleString("en-BD")}
                      <span className="text-xs font-normal text-slate-500">/mo</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Icon name="schedule" className="text-base text-slate-400" />
                    <span>{course.schedule}</span>
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <a
                    href="#admissions"
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-center block bg-slate-900 hover:bg-[#0F6CBD] text-white transition"
                  >
                    Enroll in this Batch
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DISTINGUISHED FACULTY */}
      <section id="faculty" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6CBD]">Our Mentors</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Learn from Leading Educators
            </h2>
            <p className="text-slate-600 text-sm">
              Our faculty members bring years of coaching expertise and passionate dedication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {data.faculty.map((f: any, idx: number) => (
              <div
                key={f.id || idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-xs"
              >
                <div className="h-20 w-20 rounded-full bg-[#EFF6FF] text-[#0F6CBD] text-2xl font-bold flex items-center justify-center mx-auto border-2 border-white shadow-sm">
                  {f.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{f.name}</h3>
                  <p className="text-xs text-[#0F6CBD] font-medium">{f.subject}</p>
                </div>
                <p className="text-xs text-slate-500">
                  Dedicated to conceptual clarity, problem solving, and patient doubt clearing.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ACADEMIC RESULTS */}
      <section id="results" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6CBD]">Hall of Fame</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Our Students&apos; Outstanding Achievements
            </h2>
            <p className="text-slate-600 text-sm">
              Celebrating our top performers in national board exams and university entrance tests.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F6CBD]">85+</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">GPA 5.00 in HSC</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F6CBD]">120+</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">GPA 5.00 in SSC</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F6CBD]">34</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Medical College Admissions</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0F6CBD]">48</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Engineering / BUET Seats</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAMPUS LIFE & GALLERY */}
      <section id="gallery" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6CBD]">Gallery</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Life at Our Campus
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image src="/images/hero.png" alt="Classroom Discussion" fill className="object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-medium">Smart Interactive Classrooms</span>
              </div>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image src="/images/hero.png" alt="Library & Study Hall" fill className="object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-medium">Quiet Self-Study & Resource Hall</span>
              </div>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image src="/images/hero.png" alt="Model Test Hall" fill className="object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-medium">Weekly Standardized Exam Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ADMISSIONS & CONTACT */}
      <section id="admissions" className="py-24 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6CBD]">Take the Next Step</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Join {data.name} Today
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Seats in each batch are strictly limited to ensure personal student care. Apply online to reserve your seat.
            </p>
          </div>

          <AdmissionInquiryForm instituteId={data.id} courses={data.courses} />
        </div>
      </section>

      {/* 9. POLISHED FOOTER */}
      <footer id="contact" className="bg-slate-950 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-white">{data.name}</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering students across Bangladesh with structured coaching, experienced faculty, and dependable academic guidance.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <h5 className="font-semibold text-white uppercase tracking-wider">Campus Location</h5>
            <p className="flex items-start gap-2">
              <Icon name="location_on" className="text-base text-[#0F6CBD] shrink-0" />
              <span>{data.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="call" className="text-base text-[#0F6CBD] shrink-0" />
              <a href={`tel:${data.phone}`} className="hover:underline">{data.phone}</a>
            </p>
            <p className="flex items-center gap-2">
              <Icon name="email" className="text-base text-[#0F6CBD] shrink-0" />
              <a href={`mailto:${data.email}`} className="hover:underline">{data.email}</a>
            </p>
          </div>

          <div className="space-y-3 text-xs text-slate-400 md:text-right">
            <h5 className="font-semibold text-white uppercase tracking-wider">Portal Access</h5>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition"
            >
              Sign In to ERP Portal
            </Link>
            <p className="text-[11px] text-slate-500 pt-2">
              Powered by EduFlow Institute Management SaaS
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {data.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
