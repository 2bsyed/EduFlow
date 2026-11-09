"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  updateTeacherAction,
  toggleTeacherStatusAction,
  resetTeacherPasswordAction,
} from "@/actions/teachers";

export interface TeacherItem {
  id: string;
  subject: string;
  phone?: string | null;
  batchCount: number;
  isActive?: boolean;
  user: {
    name: string;
    email?: string | null;
    isActive?: boolean;
  };
}

export function TeacherDirectoryClient({ initialTeachers }: { initialTeachers: TeacherItem[] }) {
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [pwTeacher, setPwTeacher] = useState<TeacherItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openEdit = (teacher: TeacherItem) => {
    setEditingTeacher(teacher);
    setEditName(teacher.user.name);
    setEditSubject(teacher.subject);
    setEditPhone(teacher.phone || "");
    setActionError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setIsUpdating(true);
    setActionError(null);
    try {
      await updateTeacherAction(editingTeacher.id, {
        name: editName,
        subject: editSubject,
        phone: editPhone || null,
      });
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editingTeacher.id
            ? {
                ...t,
                subject: editSubject,
                phone: editPhone || null,
                user: { ...t.user, name: editName },
              }
            : t
        )
      );
      setEditingTeacher(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update teacher");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (teacher: TeacherItem) => {
    const currentActive = teacher.isActive ?? teacher.user.isActive ?? true;
    const nextActive = !currentActive;
    try {
      await toggleTeacherStatusAction(teacher.id, nextActive);
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === teacher.id
            ? { ...t, isActive: nextActive, user: { ...t.user, isActive: nextActive } }
            : t
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to change teacher status");
    }
  };

  const openPasswordReset = (teacher: TeacherItem) => {
    setPwTeacher(teacher);
    // Generate readable secure password
    const rand = Math.random().toString(36).slice(-6);
    setNewPassword(`Teach@${rand.toUpperCase()}!`);
    setPwSuccess(false);
    setActionError(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTeacher) return;
    setIsResetting(true);
    setActionError(null);
    try {
      await resetTeacherPasswordAction(pwTeacher.id, newPassword);
      setPwSuccess(true);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-[#dce1e9] bg-white shadow-[0_1px_3px_rgba(16,24,40,.06)]">
        <div className="border-b border-[#e6eaf0] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Teacher Directory</h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Active and registered faculty accounts in your coaching center.
            </p>
          </div>
          <span className="text-xs bg-[#f2f4f7] px-2.5 py-1 rounded-full font-medium text-slate-700">
            {teachers.length} {teachers.length === 1 ? "Teacher" : "Teachers"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#f8f9fa] text-xs font-semibold text-[#475467] border-b border-[#eaecf0]">
              <tr>
                <th className="px-5 py-3">Teacher</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Batches</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaecf0]">
              {teachers.map((teacher) => {
                const isActive = teacher.isActive ?? teacher.user.isActive ?? true;
                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#EFF6FF] text-[#1570EF] font-semibold text-xs flex items-center justify-center shrink-0">
                          {teacher.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 leading-tight">{teacher.user.name}</p>
                          <p className="text-xs text-[#667085]">{teacher.user.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{teacher.subject}</td>
                    <td className="px-5 py-3.5 text-[#475467]">{teacher.phone || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0f4f8] text-[#344054]">
                        {teacher.batchCount} {teacher.batchCount === 1 ? "batch" : "batches"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-medium text-[#15803D] border border-[#A7F3D0]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#12B76A]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#4B5563] border border-[#E5E7EB]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(teacher)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#D0D5DD] rounded hover:bg-slate-50 transition"
                      >
                        <Icon name="edit" className="text-[14px] text-slate-500" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openPasswordReset(teacher)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#D0D5DD] rounded hover:bg-slate-50 transition"
                      >
                        <Icon name="lock_reset" className="text-[14px] text-slate-500" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(teacher)}
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded transition ${
                          isActive
                            ? "text-red-700 hover:bg-red-50 border border-red-200"
                            : "text-green-700 hover:bg-green-50 border border-green-200"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!teachers.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#697586]">
                    <Icon name="person" className="mb-2 block text-3xl mx-auto text-slate-400" />
                    No teacher accounts yet. Add teachers using the form above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#EAECF0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <h3 className="font-semibold text-lg text-slate-900">Edit Teacher Profile</h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            {actionError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{actionError}</p>}
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Specialization</label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-9 rounded-md border border-[#D0D5DD] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  placeholder="017XXXXXXXX"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAECF0]">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-[#D0D5DD] rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F6CBD] hover:bg-[#115EA3] rounded-md disabled:opacity-50"
                >
                  {isUpdating ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {pwTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#EAECF0] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <h3 className="font-semibold text-lg text-slate-900">Reset Teacher Password</h3>
              <button
                onClick={() => setPwTeacher(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            {actionError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{actionError}</p>}
            {pwSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <p className="font-medium">Password Reset Successfully!</p>
                  <p className="text-xs mt-1 text-green-700">
                    The password for <strong>{pwTeacher.user.name}</strong> has been updated.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New Temporary Password:</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={newPassword}
                      className="w-full h-9 bg-slate-50 border border-[#D0D5DD] rounded px-3 text-sm font-mono text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(newPassword);
                        alert("Password copied to clipboard!");
                      }}
                      className="px-3 py-2 text-xs bg-[#0F6CBD] text-white rounded hover:bg-[#115EA3] shrink-0 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setPwTeacher(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 border border-[#D0D5DD] rounded hover:bg-slate-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Set a new password for <strong>{pwTeacher.user.name}</strong> ({pwTeacher.user.email}).
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9 rounded-md border border-[#D0D5DD] px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                  <p className="text-[11px] text-[#667085] mt-1">
                    Minimum 8 characters. Share this securely with the teacher.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#EAECF0]">
                  <button
                    type="button"
                    onClick={() => setPwTeacher(null)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-[#D0D5DD] rounded-md hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0F6CBD] hover:bg-[#115EA3] rounded-md disabled:opacity-50"
                  >
                    {isResetting ? "Updating…" : "Confirm Password Reset"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
