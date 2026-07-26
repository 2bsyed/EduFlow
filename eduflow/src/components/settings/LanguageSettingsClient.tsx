"use client";

import React, { useState, useActionState } from "react";
import { updateInstituteLanguage } from "@/app/actions/settings";
import { Icon } from "@/components/ui/Icon";

interface LanguageSettingsClientProps {
  currentLanguage: string;
}

export function LanguageSettingsClient({ currentLanguage }: LanguageSettingsClientProps) {
  const [selectedLang, setSelectedLang] = useState<string>(currentLanguage || "en");
  const [state, formAction, isPending] = useActionState(updateInstituteLanguage, null);

  return (
    <div className="flex-1 w-full bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg lg:p-xl flex flex-col">
      <div className="mb-lg border-b border-outline-variant pb-md">
        <h2 className="font-h3 text-h3 text-on-background mb-xs font-bold">Language Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Choose your preferred default interface language for the dashboard.
        </p>
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

      <form action={formAction} className="flex-1 flex flex-col">
        <input type="hidden" name="language" value={selectedLang} />

        {/* Interface Language Selection */}
        <div className="mb-xl">
          <h3 className="font-label-md text-label-md text-on-background mb-md font-semibold">
            Interface Language
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {/* Option: English */}
            <label
              onClick={() => setSelectedLang("en")}
              className={`relative flex flex-col p-lg border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                selectedLang === "en"
                  ? "border-primary bg-primary-fixed-dim bg-opacity-20"
                  : "border-transparent hover:border-outline-variant bg-surface hover:bg-surface-container-low"
              }`}
            >
              <div className="flex justify-between items-start mb-md">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-h4 text-h4 font-bold">
                  EN
                </div>
                <Icon
                  name="check_circle"
                  className={
                    selectedLang === "en"
                      ? "text-primary bg-surface-container-lowest rounded-full"
                      : "text-transparent"
                  }
                />
              </div>
              <span className="font-h4 text-h4 text-on-background mb-xs font-bold">English</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Standard US English interface
              </span>
            </label>

            {/* Option: Bangla */}
            <label
              onClick={() => setSelectedLang("bn")}
              className={`relative flex flex-col p-lg border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                selectedLang === "bn"
                  ? "border-primary bg-primary-fixed-dim bg-opacity-20"
                  : "border-transparent hover:border-outline-variant bg-surface hover:bg-surface-container-low"
              }`}
            >
              <div className="flex justify-between items-start mb-md">
                <div className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-h4 text-h4 font-bold">
                  BN
                </div>
                <Icon
                  name="check_circle"
                  className={
                    selectedLang === "bn"
                      ? "text-primary bg-surface-container-lowest rounded-full"
                      : "text-transparent"
                  }
                />
              </div>
              <span className="font-h4 text-h4 text-on-background mb-xs font-bold">বাংলা</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Standard Bengali interface
              </span>
            </label>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="mb-xl flex-1">
          <h3 className="font-label-md text-label-md text-on-background mb-md font-semibold flex items-center gap-sm">
            <Icon name="visibility" className="text-sm" />
            Language Preview
          </h3>
          <div className="bg-surface p-lg rounded-xl border border-outline-variant flex items-center justify-center min-h-[240px]">
            <div className="bg-surface-container-lowest p-lg rounded-lg border border-outline-variant shadow-sm min-w-[280px]">
              <div className="flex justify-between items-center mb-md">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  {selectedLang === "bn" ? "মোট শিক্ষার্থী" : "Total Students"}
                </span>
                <span className="bg-surface-container p-xs rounded-md">
                  <Icon name="group" className="text-primary text-[20px]" />
                </span>
              </div>
              <div className="font-h1 text-h1 text-on-background mb-xs font-bold">
                {selectedLang === "bn" ? "১,২৪৮" : "1,248"}
              </div>
              <div className="flex items-center gap-xs font-body-sm text-body-sm text-secondary font-medium">
                <Icon name="trending_up" className="text-sm" />
                <span>
                  {selectedLang === "bn" ? "এই মাসে +১২%" : "+12% this month"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-lg border-t border-outline-variant flex justify-end gap-md mt-auto">
          <button
            type="button"
            className="px-lg py-sm rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container transition-colors border border-transparent font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-lg py-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:brightness-90 transition-all shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center gap-sm cursor-pointer font-medium disabled:opacity-50"
          >
            {isPending ? (
              <span>Updating...</span>
            ) : (
              <>
                <Icon name="save" className="text-sm" />
                <span>Update Language</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
