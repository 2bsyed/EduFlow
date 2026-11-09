"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function AdmissionInquiryForm({
  instituteId,
  courses,
}: {
  instituteId: string;
  courses?: { id: string; title: string; subject: string }[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [courseInterest, setCourseInterest] = useState(courses?.[0]?.title || "");
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Client BD phone check
    const cleaned = phone.replace(/[\s\-]/g, "");
    const bdRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;
    if (!bdRegex.test(cleaned)) {
      setErrorMsg("Please enter a valid Bangladesh mobile number (e.g. 01712345678)");
      setIsSubmitting(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/institutes/${instituteId}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleaned,
          email: email.trim() || null,
          course_interest: courseInterest || null,
          notes: notes.trim() || null,
          website_url_hp: honeypot || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Unable to submit inquiry. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-xl text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
          <Icon name="check_circle" className="text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Admission Inquiry Received!</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Thank you, <strong>{name}</strong>. Our admissions office has received your details and will call you at{" "}
          <strong className="text-slate-800">{phone}</strong> shortly with batch details and schedule.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setName("");
            setPhone("");
            setEmail("");
            setNotes("");
          }}
          className="text-xs font-semibold text-[#0F6CBD] hover:underline pt-2 block mx-auto"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/40 shadow-xl space-y-4"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">Apply for Admission</h3>
        <p className="text-xs text-slate-600 mt-1">
          Fill in your details below and our academic counseling team will contact you.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Honeypot field for anti-spam */}
      <input
        type="text"
        name="website_url_hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ display: "none" }}
      />

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Student Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tanvir Hasan"
            className="w-full h-10 rounded-lg border border-[#D0D5DD] px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Phone (BD) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full h-10 rounded-lg border border-[#D0D5DD] px-3.5 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full h-10 rounded-lg border border-[#D0D5DD] px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Course / Program
          </label>
          {courses && courses.length > 0 ? (
            <select
              value={courseInterest}
              onChange={(e) => setCourseInterest(e.target.value)}
              className="w-full h-10 rounded-lg border border-[#D0D5DD] px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
            >
              <option value="">Select a Program</option>
              {courses.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title} ({c.subject})
                </option>
              ))}
              <option value="Other">Other / General Academic Mentorship</option>
            </select>
          ) : (
            <input
              type="text"
              value={courseInterest}
              onChange={(e) => setCourseInterest(e.target.value)}
              placeholder="e.g. HSC 2026 Science Batch / Admission"
              className="w-full h-10 rounded-lg border border-[#D0D5DD] px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Questions or Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mention your school/college, preferred batch timings..."
            className="w-full rounded-lg border border-[#D0D5DD] p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-lg bg-[#0F6CBD] hover:bg-[#115EA3] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? (
          <span>Submitting Inquiry…</span>
        ) : (
          <>
            <span>Submit Admission Inquiry</span>
            <Icon name="arrow_forward" className="text-base" />
          </>
        )}
      </button>
    </form>
  );
}
