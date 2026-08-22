"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { assignStudentToBatchAction } from "@/app/actions/batches";

interface StudentOption {
  id: string;
  fullName: string;
  rollNo: string;
}

interface BatchOption {
  id: string;
  name: string;
  subject?: string | null;
}

interface AssignStudentClientProps {
  students: StudentOption[];
  batches: BatchOption[];
}

export function AssignStudentClient({ students, batches }: AssignStudentClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(lowerQuery) ||
        s.rollNo.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
      <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
        <Icon name="person_add" className="text-secondary text-[20px]" />
        <span>Assign Student to Batch</span>
      </h3>

      <form action={assignStudentToBatchAction} className="space-y-md">
        <div className="relative" ref={dropdownRef}>
          <label className="font-label-md text-label-md text-on-surface block mb-xs">
            Select Student
          </label>
          
          {/* Hidden input to hold the actual value for the form submission */}
          <input 
            type="hidden" 
            name="studentId" 
            value={selectedStudent?.id || ""} 
            required 
          />

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none cursor-text pr-10"
              placeholder="Search by name or roll..."
              value={selectedStudent && !isDropdownOpen ? `${selectedStudent.fullName} (Roll: ${selectedStudent.rollNo})` : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedStudent(null); // Clear selection if user starts typing again
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
            />
            <Icon 
              name={isDropdownOpen ? "expand_less" : "expand_more"} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none" 
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="w-full text-left px-md py-sm font-body-sm text-body-sm hover:bg-surface-container transition-colors border-b border-outline-variant last:border-b-0 cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(s);
                      setSearchQuery("");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="font-medium text-on-surface">{s.fullName}</span>
                    <span className="text-on-surface-variant ml-2 text-caption">(Roll: {s.rollNo})</span>
                  </button>
                ))
              ) : (
                <div className="px-md py-sm text-on-surface-variant text-body-sm text-center">
                  No students found
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="font-label-md text-label-md text-on-surface block mb-xs">
            Select Target Batch
          </label>
          <select
            name="batchId"
            required
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none cursor-pointer"
          >
            <option value="">-- Choose Batch --</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.subject || "General"})
              </option>
            ))}
          </select>
        </div>

        <div className="pt-sm">
          <button
            type="submit"
            className="w-full bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-on-secondary font-label-md text-label-md py-sm px-md rounded-lg shadow-sm transition-colors font-semibold flex items-center justify-center gap-xs cursor-pointer"
          >
            <Icon name="assignment_ind" className="text-[18px]" />
            <span>Enroll Student</span>
          </button>
        </div>
      </form>
    </div>
  );
}
