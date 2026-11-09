"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { updateInquiryStatusAction, updateWebsiteSettingsAction } from "@/actions/admissions";

export interface InquiryItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  courseInterest?: string | null;
  notes?: string | null;
  status: "NEW" | "CONTACTED" | "ENROLLED" | "REJECTED";
  createdAt: string;
}

export interface WebsiteSettingsData {
  heroHeadline?: string;
  heroSubhead?: string;
  heroImageUrl?: string;
  aboutText?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPublished?: boolean;
  subdomain?: string;
  instituteId?: string;
}

export function AdmissionsManagerClient({
  initialInquiries,
  initialSettings,
}: {
  initialInquiries: InquiryItem[];
  initialSettings: WebsiteSettingsData;
}) {
  const [activeTab, setActiveTab] = useState<"leads" | "website">("leads");
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [filter, setFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Website form state
  const [settings, setSettings] = useState<WebsiteSettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const newLeadsCount = inquiries.filter((i) => i.status === "NEW").length;

  const handleStatusChange = async (inquiryId: string, nextStatus: "NEW" | "CONTACTED" | "ENROLLED" | "REJECTED") => {
    setUpdatingId(inquiryId);
    try {
      await updateInquiryStatusAction(inquiryId, nextStatus);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status: nextStatus } : i))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update lead status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateWebsiteSettingsAction({
        hero_headline: settings.heroHeadline,
        hero_subhead: settings.heroSubhead,
        hero_image_url: settings.heroImageUrl,
        about_text: settings.aboutText,
        contact_phone: settings.contactPhone,
        contact_email: settings.contactEmail,
        is_published: settings.isPublished,
      });
      setSaveMessage("Website settings updated successfully!");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredInquiries = inquiries.filter((i) => {
    if (filter === "ALL") return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with Tabs and Live Website Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAECF0] pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "leads"
                ? "bg-[#0F6CBD] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon name="contacts" className="text-lg" />
            <span>Admission Inquiries</span>
            {newLeadsCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "leads" ? "bg-white text-[#0F6CBD]" : "bg-red-100 text-red-700"
                }`}
              >
                {newLeadsCount} New
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("website")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "website"
                ? "bg-[#0F6CBD] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon name="web" className="text-lg" />
            <span>Website Configuration</span>
          </button>
        </div>

        <Link
          href="/showcase"
          target="_blank"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#D0D5DD] rounded-lg hover:bg-slate-50 transition shadow-2xs"
        >
          <Icon name="open_in_new" className="text-[16px] text-[#0F6CBD]" />
          <span>View Public Institute Site</span>
        </Link>
      </div>

      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "NEW", "CONTACTED", "ENROLLED", "REJECTED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  filter === st
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-[#D0D5DD] hover:bg-slate-50"
                }`}
              >
                {st === "ALL" ? "All Inquiries" : st.charAt(0) + st.slice(1).toLowerCase()} (
                {st === "ALL" ? inquiries.length : inquiries.filter((x) => x.status === st).length})
              </button>
            ))}
          </div>

          {/* Inquiries Table */}
          <div className="overflow-hidden rounded-xl border border-[#EAECF0] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#EAECF0] text-xs font-semibold text-[#475467]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Phone / Contact</th>
                    <th className="py-3 px-4">Course of Interest</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {filteredInquiries.map((inq) => {
                    const statusStyles: Record<string, string> = {
                      NEW: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
                      CONTACTED: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
                      ENROLLED: "bg-[#ECFDF5] text-[#15803D] border-[#A7F3D0]",
                      REJECTED: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
                    };
                    return (
                      <tr key={inq.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {inq.name}
                          {inq.notes && (
                            <p className="text-xs text-[#667085] font-normal mt-0.5 line-clamp-1">
                              &ldquo;{inq.notes}&rdquo;
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <a
                            href={`tel:${inq.phone}`}
                            className="text-[#0F6CBD] hover:underline font-mono text-xs font-medium"
                          >
                            {inq.phone}
                          </a>
                          {inq.email && <p className="text-xs text-[#667085] mt-0.5">{inq.email}</p>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                          {inq.courseInterest || "General Admission"}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#475467] whitespace-nowrap">
                          {new Date(inq.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              statusStyles[inq.status] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          {inq.status === "NEW" && (
                            <button
                              type="button"
                              disabled={updatingId === inq.id}
                              onClick={() => handleStatusChange(inq.id, "CONTACTED")}
                              className="px-2.5 py-1 text-xs font-medium bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] rounded hover:bg-[#FFEDD5] transition"
                            >
                              Contacted
                            </button>
                          )}
                          {inq.status !== "ENROLLED" && (
                            <button
                              type="button"
                              disabled={updatingId === inq.id}
                              onClick={() => handleStatusChange(inq.id, "ENROLLED")}
                              className="px-2.5 py-1 text-xs font-medium bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0] rounded hover:bg-[#D1FAE5] transition"
                            >
                              Enroll
                            </button>
                          )}
                          {inq.status !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={updatingId === inq.id}
                              onClick={() => handleStatusChange(inq.id, "REJECTED")}
                              className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredInquiries.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Icon name="contacts" className="mx-auto text-3xl mb-2 text-slate-400" />
                        <p className="font-medium text-slate-700">No admission inquiries found</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Prospective students who submit inquiries on your public website will appear here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "website" && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-xl border border-[#EAECF0] p-6 shadow-xs space-y-6 max-w-3xl"
        >
          <div>
            <h2 className="font-semibold text-lg text-slate-900">Public Website Information</h2>
            <p className="text-xs text-[#667085] mt-1">
              Configure how your coaching centre appears on its dedicated public landing page.
            </p>
          </div>

          {saveMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg font-medium">
              {saveMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Headline</label>
              <input
                type="text"
                value={settings.heroHeadline || ""}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                placeholder="e.g. Master Your Academic Future with Apex Coaching"
                className="w-full h-10 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subtitle</label>
              <input
                type="text"
                value={settings.heroSubhead || ""}
                onChange={(e) => setSettings({ ...settings, heroSubhead: e.target.value })}
                placeholder="e.g. Expert faculty, disciplined batches, and proven results for SSC & HSC."
                className="w-full h-10 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hero Image URL (Campus / Classroom Photography)
              </label>
              <input
                type="text"
                value={settings.heroImageUrl || ""}
                onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                placeholder="/images/hero.png or external https:// image URL"
                className="w-full h-10 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About the Institute</label>
              <textarea
                rows={4}
                value={settings.aboutText || ""}
                onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                placeholder="Describe your coaching philosophy, achievements, and programs..."
                className="w-full rounded-md border border-[#D0D5DD] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Hotline / Phone</label>
                <input
                  type="text"
                  value={settings.contactPhone || ""}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full h-10 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ""}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="admissions@yourcoaching.com"
                  className="w-full h-10 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={settings.isPublished ?? true}
                onChange={(e) => setSettings({ ...settings, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[#0F6CBD] focus:ring-[#0F6CBD]"
              />
              <label htmlFor="isPublished" className="text-xs font-medium text-slate-700">
                Publish public website for prospective students
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EAECF0]">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0F6CBD] hover:bg-[#115EA3] rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? "Saving Settings…" : "Save Website Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
