"use client";

import React, { useState, useActionState } from "react";
import Image from "next/image";
import { updateInstituteProfile } from "@/app/actions/settings";
import { Icon } from "@/components/ui/Icon";

interface InstituteProfileClientProps {
  institute: {
    id: string;
    name: string;
    address: string | null;
    subdomain: string | null;
    currency: string | null;
    timezone: string | null;
    logoUrl: string | null;
  };
}

export function InstituteProfileClient({ institute }: InstituteProfileClientProps) {
  const [state, formAction, isPending] = useActionState(updateInstituteProfile, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(institute.logoUrl);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  return (
    <div className="flex-1 max-w-3xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg lg:p-xl">
      <div className="mb-xl border-b border-outline-variant pb-md flex justify-between items-center">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface font-bold">Institute Profile</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Manage your institution's public details and configuration.
          </p>
        </div>
      </div>

      {state?.error && (
        <div className="mb-lg p-md rounded-lg bg-error-container text-on-error-container font-body-sm flex items-center gap-sm">
          <Icon name="error" className="text-[20px]" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="mb-lg p-md rounded-lg bg-secondary-container text-on-secondary-container font-body-sm flex items-center gap-sm font-semibold">
          <Icon name="check_circle" className="text-[20px]" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-xl">
        {/* Logo Upload */}
        <div className="flex items-start gap-lg">
          <div className="relative group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="logo-upload-input"
              onChange={handleLogoChange}
            />
            <label
              htmlFor="logo-upload-input"
              className="w-24 h-24 rounded-full bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant overflow-hidden group-hover:border-primary transition-colors cursor-pointer relative"
            >
              {logoPreview ? (
                <Image src={logoPreview} alt="Logo" fill unoptimized className="object-cover" />
              ) : (
                <>
                  <Icon name="domain" className="text-[32px] mb-1" />
                  <span className="font-caption text-caption">Upload</span>
                </>
              )}
            </label>
            <label
              htmlFor="logo-upload-input"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors cursor-pointer"
            >
              <Icon name="edit" className="text-sm" />
            </label>
          </div>
          <div className="flex-1 pt-2">
            <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-xs">
              Institute Logo
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Recommended size: 256x256px. Max file size: 2MB (JPG, PNG).
            </p>
          </div>
        </div>

        {/* Institute Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Name */}
          <div className="md:col-span-2 space-y-xs">
            <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="institute-name">
              Institute Name
            </label>
            <input
              id="institute-name"
              name="name"
              type="text"
              required
              defaultValue={institute.name}
              placeholder="Enter institute name"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2 space-y-xs">
            <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              defaultValue={institute.address || ""}
              placeholder="Enter full physical address"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
            />
          </div>

          {/* Subdomain */}
          <div className="md:col-span-2 space-y-xs">
            <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="subdomain">
              Subdomain
            </label>
            <div className="flex rounded-lg shadow-sm">
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                defaultValue={institute.subdomain || "eduflow-app"}
                placeholder="yourinstitute"
                className="flex-1 rounded-l-lg border border-outline-variant border-r-0 bg-surface-container-lowest px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow z-10"
              />
              <span className="inline-flex items-center rounded-r-lg border border-outline-variant border-l-0 bg-surface-container px-md font-body-md text-body-md text-on-surface-variant font-medium">
                .eduflow.app
              </span>
            </div>
            <p className="font-caption text-caption text-on-surface-variant mt-1">
              This will be your dedicated institute login portal URL. Must be unique.
            </p>
          </div>

          {/* Currency */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="currency">
              Base Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                name="currency"
                defaultValue={institute.currency || "BDT"}
                className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm pr-10 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
              >
                <option value="BDT">BDT - Bangladeshi Taka</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
              <Icon name="expand_more" className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]" />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="timezone">
              Timezone
            </label>
            <div className="relative">
              <select
                id="timezone"
                name="timezone"
                defaultValue={institute.timezone || "UTC+6"}
                className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm pr-10 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
              >
                <option value="UTC+6">UTC+6 (Dhaka)</option>
                <option value="UTC+5:30">UTC+5:30 (New Delhi)</option>
                <option value="UTC+0">UTC+0 (London)</option>
              </select>
              <Icon name="expand_more" className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-lg border-t border-outline-variant flex justify-end gap-md">
          <button
            type="button"
            className="px-lg py-sm rounded-lg font-label-md text-label-md font-semibold text-primary bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-lg py-sm rounded-lg font-label-md text-label-md font-semibold text-on-primary bg-primary hover:bg-primary-container focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Icon name="save" className="text-[18px]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
