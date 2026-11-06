"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Icon } from "@/components/ui/Icon";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [instituteName, setInstituteName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institute_name: instituteName, owner_name: ownerName, email, phone, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Could not create the account.");
      const signedIn = await signIn("credentials", { email, password, redirect: false });
      if (signedIn?.ok) router.push("/dashboard");
      else {
        router.push("/login?created=1");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pattern min-h-screen flex flex-col font-sans text-on-surface antialiased relative pb-xl">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-margin max-w-7xl mx-auto z-10">
        <Link href="/" className="flex items-center gap-xs">
          <Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} priority className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="font-label-md text-label-md text-primary hover:text-surface-tint font-medium"
          >
            Sign In
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-md sm:p-lg">
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-lg sm:p-xl max-w-[520px] w-full shadow-soft my-auto relative overflow-hidden">
          
          {/* Header Banner */}
          <div className="text-center mb-lg">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-container/10 rounded-full mb-md text-primary mx-auto">
              <Icon name="rocket_launch" className="text-[30px]" />
            </div>
            <h1 className="font-h2 text-h2 text-primary font-bold mb-xs">Create your institute account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Set up an owner account for your institute.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-md">
            
            {/* Institute Name */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block" htmlFor="instituteName">
                Coaching Center / Institute Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <Icon name="domain" className="text-on-surface-variant text-[20px]" />
                </div>
                <input
                  id="instituteName"
                  type="text"
                  required
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="e.g. Apex Science Care"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block" htmlFor="ownerName">
                Owner / Director Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <Icon name="person" className="text-on-surface-variant text-[20px]" />
                </div>
                <input
                  id="ownerName"
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="email">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                    <Icon name="mail" className="text-on-surface-variant text-[20px]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@coaching.bd"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                    <Icon name="call" className="text-on-surface-variant text-[20px]" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700 000000"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <Icon name="lock" className="text-on-surface-variant text-[20px]" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 12 characters"
                  minLength={12}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                />
              </div>
            </div>

            {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md py-md rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-sm active:scale-[0.98] cursor-pointer disabled:opacity-60 mt-md"
            >
              {loading ? (
                <span>Creating your account…</span>
              ) : (
                <>
                  <span>Create account</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
            </button>
          </form>

          {/* Sign-in option */}
          <div className="mt-lg pt-md border-t border-surface-container-highest text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">
              Already have an account?
            </p>
            <div className="flex items-center justify-center gap-md">
              <Link
                href="/login"
                className="font-label-md text-label-md text-primary font-semibold hover:underline"
              >
                Sign In Instead
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
