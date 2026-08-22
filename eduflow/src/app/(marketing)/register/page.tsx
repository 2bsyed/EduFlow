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
  const [plan, setPlan] = useState("growth");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Automatic quick login with demo owner credentials for trial access
      const res = await signIn("credentials", {
        email: "owner@eduflow.bd",
        password: "password123",
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pattern min-h-screen flex flex-col font-sans text-on-surface antialiased relative pb-xl">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-margin max-w-7xl mx-auto z-10">
        <Link href="/" className="flex items-center gap-xs">
          <Icon name="school" className="text-[28px] text-primary" />
          <Link href="/">
              <Image src="/images/logo.jpg" alt="EduFlow logo" width={140} height={40} className="object-contain -ml-2" />
            </Link>
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
            <h1 className="font-h2 text-h2 text-primary font-bold mb-xs">Start Your 14-Day Free Trial</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Register your coaching center in minutes. No credit card required.
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
                  placeholder="Create password"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                />
              </div>
            </div>

            {/* Plan selection */}
            <div className="space-y-xs pt-xs">
              <label className="font-label-md text-label-md text-on-surface block">
                Select Trial Plan
              </label>
              <div className="grid grid-cols-3 gap-xs">
                {[
                  { id: "starter", name: "Starter", cap: "100 Students" },
                  { id: "growth", name: "Growth", cap: "500 Students" },
                  { id: "pro", name: "Pro", cap: "Unlimited" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`p-xs rounded-lg border text-center transition-all cursor-pointer ${
                      plan === p.id
                        ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{p.name}</div>
                    <div className="text-[10px] opacity-75">{p.cap}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md py-md rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-sm active:scale-[0.98] cursor-pointer disabled:opacity-60 mt-md"
            >
              {loading ? (
                <span>Launching Your Trial...</span>
              ) : (
                <>
                  <span>Create Account & Launch Trial</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Option */}
          <div className="mt-lg pt-md border-t border-surface-container-highest text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">
              Already have an account or want a quick test?
            </p>
            <div className="flex items-center justify-center gap-md">
              <Link
                href="/login"
                className="font-label-md text-label-md text-primary font-semibold hover:underline"
              >
                Sign In Instead
              </Link>
              <span className="text-outline">•</span>
              <button
                type="button"
                onClick={handleSubmit}
                className="font-label-md text-label-md text-secondary font-semibold hover:underline cursor-pointer"
              >
                Instant Demo Access
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
