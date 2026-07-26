"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { StudentFormSidePanel } from "@/components/students/StudentFormSidePanel";

export interface StudentItem {
  id: string;
  fullName: string;
  rollNo: string;
  email?: string | null;
  phone?: string | null;
  guardianName: string;
  guardianPhone: string;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  photoUrl?: string | null;
  batchId: string;
  batchName: string;
  feeStatus: "Paid" | "Due" | "Overdue";
  attendancePct: number;
}

export interface BatchItem {
  id: string;
  name: string;
}

interface StudentTableClientProps {
  students: StudentItem[];
  batches: BatchItem[];
}

export function StudentTableClient({ students, batches }: StudentTableClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        !searchTerm ||
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.guardianPhone.includes(searchTerm) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesBatch = !selectedBatch || student.batchId === selectedBatch;
      const matchesStatus =
        !selectedStatus ||
        student.status.toLowerCase() === selectedStatus.toLowerCase() ||
        student.feeStatus.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [students, searchTerm, selectedBatch, selectedStatus]);

  // Paginated Results
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (student: StudentItem) => {
    setEditingStudent(student);
    setIsPanelOpen(true);
  };

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Students</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Manage and view all enrolled students.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-[#173bab] transition-colors flex items-center gap-xs shadow-sm cursor-pointer"
        >
          <Icon name="add" className="text-[18px]" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md mb-lg shadow-sm flex flex-wrap gap-md items-center justify-between">
        {/* Search */}
        <div className="flex flex-1 min-w-[220px] max-w-md relative">
          <Icon
            name="search"
            className="absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]"
          />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-[36px] pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
            placeholder="Search students by name, roll no, or phone..."
            type="text"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex gap-md">
          {/* Batch Filter */}
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg pl-md pr-xl py-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Icon
              name="arrow_drop_down"
              className="absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg pl-md pr-xl py-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paid">Paid</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
              <option value="inactive">Inactive</option>
            </select>
            <Icon
              name="arrow_drop_down"
              className="absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                <th className="py-sm px-md font-medium">Student</th>
                <th className="py-sm px-md font-medium">Roll No</th>
                <th className="py-sm px-md font-medium">Batch</th>
                <th className="py-sm px-md font-medium">Guardian Contact</th>
                <th className="py-sm px-md font-medium">Fee Status</th>
                <th className="py-sm px-md font-medium">Attendance</th>
                <th className="py-sm px-md font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-body-sm">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-xl text-center text-on-surface-variant">
                    No student records match your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const initials = student.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  let feeBadgeClass = "bg-[#e6f4ea] text-[#137333]";
                  if (student.feeStatus === "Due") feeBadgeClass = "bg-[#fef7e0] text-[#b06000]";
                  if (student.feeStatus === "Overdue") feeBadgeClass = "bg-[#fce8e6] text-[#c5221f]";

                  let attBarClass = "bg-secondary";
                  if (student.attendancePct < 80 && student.attendancePct >= 60)
                    attBarClass = "bg-[#fbbc04]";
                  if (student.attendancePct < 60) attBarClass = "bg-error";

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-outline-variant hover:bg-surface-container transition-colors group"
                    >
                      <td className="py-md px-md">
                        <div className="flex items-center gap-md">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container text-on-primary flex items-center justify-center font-bold text-caption shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-on-surface">{student.fullName}</p>
                            <p className="text-caption text-on-surface-variant">
                              {student.email || "No email provided"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-md px-md text-on-surface-variant">{student.rollNo}</td>
                      <td className="py-md px-md text-on-surface-variant">{student.batchName}</td>
                      <td className="py-md px-md text-on-surface-variant">
                        {student.guardianPhone}
                      </td>
                      <td className="py-md px-md">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-caption font-medium ${feeBadgeClass}`}
                        >
                          {student.feeStatus}
                        </span>
                      </td>
                      <td className="py-md px-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${attBarClass}`}
                              style={{ width: `${student.attendancePct}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-caption ${
                              student.attendancePct < 60
                                ? "text-error font-medium"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {student.attendancePct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-md px-md text-right">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="text-on-surface-variant hover:text-primary transition-colors p-xs rounded hover:bg-surface-container-high opacity-80 group-hover:opacity-100 cursor-pointer"
                          title="Edit Student"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="border-t border-outline-variant p-md flex items-center justify-between bg-surface-container-lowest">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Showing {totalItems > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + pageSize, totalItems)} of {totalItems} students
          </span>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-xs rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icon name="chevron_left" className="text-[20px]" />
            </button>
            <span className="font-body-sm text-body-sm px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-xs rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icon name="chevron_right" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel Modal Component */}
      <StudentFormSidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        batches={batches}
        editingStudent={editingStudent}
      />
    </div>
  );
}
