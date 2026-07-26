"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, StudentFormValues } from "@/lib/validations/student";
import { createOrUpdateStudentAction } from "@/app/actions/students";
import { Icon } from "@/components/ui/Icon";

interface BatchOption {
  id: string;
  name: string;
}

interface StudentFormSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  batches: BatchOption[];
  editingStudent?: {
    id: string;
    fullName: string;
    rollNo: string;
    email?: string | null;
    phone?: string | null;
    guardianName: string;
    guardianPhone: string;
    address?: string | null;
    batchId: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    photoUrl?: string | null;
  } | null;
}

export function StudentFormSidePanel({
  isOpen,
  onClose,
  batches,
  editingStudent,
}: StudentFormSidePanelProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: "",
      rollNo: "",
      email: "",
      phone: "",
      guardianName: "",
      guardianPhone: "",
      address: "",
      batchId: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (editingStudent) {
      reset({
        id: editingStudent.id,
        fullName: editingStudent.fullName,
        rollNo: editingStudent.rollNo,
        email: editingStudent.email || "",
        phone: editingStudent.phone || "",
        guardianName: editingStudent.guardianName,
        guardianPhone: editingStudent.guardianPhone,
        address: editingStudent.address || "",
        batchId: editingStudent.batchId,
        status: editingStudent.status,
      });
      setPhotoPreview(editingStudent.photoUrl || null);
    } else {
      reset({
        fullName: "",
        rollNo: `ROLL-${Math.floor(10000 + Math.random() * 90000)}`,
        email: "",
        phone: "",
        guardianName: "",
        guardianPhone: "",
        address: "",
        batchId: batches.length > 0 ? batches[0].id : "",
        status: "ACTIVE",
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setServerError(null);
  }, [editingStudent, batches, reset, isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    if (values.id) formData.append("id", values.id);
    formData.append("fullName", values.fullName);
    formData.append("rollNo", values.rollNo);
    if (values.email) formData.append("email", values.email);
    if (values.phone) formData.append("phone", values.phone);
    formData.append("guardianName", values.guardianName);
    formData.append("guardianPhone", values.guardianPhone);
    if (values.address) formData.append("address", values.address);
    formData.append("batchId", values.batchId);
    formData.append("status", values.status);
    if (editingStudent?.photoUrl) {
      formData.append("existingPhotoUrl", editingStudent.photoUrl);
    }
    if (photoFile) {
      formData.append("photoFile", photoFile);
    }

    const res = await createOrUpdateStudentAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setServerError(res.error || "Failed to save student");
    }
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="h-full w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col border-l border-outline-variant animate-in slide-in-from-right duration-300">
        {/* Panel Header */}
        <div className="flex items-center justify-between p-lg border-b border-outline-variant bg-surface-container-lowest shrink-0">
          <div>
            <h2 className="font-h3 text-h3 text-on-surface font-semibold">
              {editingStudent ? "Edit Student" : "Add Student"}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {editingStudent ? "Update student details" : "Enter details for new enrollment"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Panel Body / Form */}
        <div className="flex-1 overflow-y-auto p-lg bg-surface space-y-6">
          {serverError && (
            <div className="p-md bg-error-container text-on-error-container rounded-lg font-body-sm">
              {serverError}
            </div>
          )}

          <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <label className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-surface-variant border-2 border-dashed border-outline hover:border-primary transition-colors flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Student Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="add_a_photo" className="text-outline group-hover:text-primary text-3xl" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <span className="font-caption text-caption text-on-surface-variant">
                Upload Student Photo
              </span>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  {...register("fullName")}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                  placeholder="e.g. Syed Ahsan"
                  type="text"
                />
                {errors.fullName && (
                  <span className="font-caption text-caption text-error">
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Roll Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="rollNo">
                    Roll Number *
                  </label>
                  <input
                    {...register("rollNo")}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                    placeholder="e.g. 10452"
                    type="text"
                  />
                  {errors.rollNo && (
                    <span className="font-caption text-caption text-error">
                      {errors.rollNo.message}
                    </span>
                  )}
                </div>

                {/* Batch Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="batchId">
                    Batch *
                  </label>
                  <div className="relative">
                    <select
                      {...register("batchId")}
                      className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="" disabled>
                        Select batch
                      </option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]"
                    />
                  </div>
                  {errors.batchId && (
                    <span className="font-caption text-caption text-error">
                      {errors.batchId.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Student Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                  Student Email (Optional)
                </label>
                <input
                  {...register("email")}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                  placeholder="student@example.com"
                  type="email"
                />
                {errors.email && (
                  <span className="font-caption text-caption text-error">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Guardian Info Section */}
              <div className="pt-2">
                <h3 className="font-h4 text-h4 text-on-surface mb-4 font-semibold">
                  Guardian Information
                </h3>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface"
                      htmlFor="guardianName"
                    >
                      Guardian Name *
                    </label>
                    <input
                      {...register("guardianName")}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                      placeholder="Primary contact name"
                      type="text"
                    />
                    {errors.guardianName && (
                      <span className="font-caption text-caption text-error">
                        {errors.guardianName.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface"
                      htmlFor="guardianPhone"
                    >
                      Contact Number *
                    </label>
                    <div className="relative">
                      <Icon
                        name="call"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                      />
                      <input
                        {...register("guardianPhone")}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
                        placeholder="+880 1711-000000"
                        type="tel"
                      />
                    </div>
                    {errors.guardianPhone && (
                      <span className="font-caption text-caption text-error">
                        {errors.guardianPhone.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface"
                      htmlFor="address"
                    >
                      Residential Address
                    </label>
                    <textarea
                      {...register("address")}
                      rows={3}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline resize-none"
                      placeholder="Enter full address..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Panel Footer / Actions */}
        <div className="p-lg border-t border-outline-variant bg-surface-container-lowest shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent hover:border-outline-variant cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary-container/90 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
