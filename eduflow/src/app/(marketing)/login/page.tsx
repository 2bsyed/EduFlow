"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Icon } from "@/components/ui/Icon";

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(t("invalidCredentials"));
        setLoading(false);
        return;
      }

      // Successful sign in -> fetch session to get role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const role = session?.user?.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "OWNER") {
        router.push("/dashboard");
      } else if (role === "TEACHER") {
        router.push("/teacher");
      } else if (role === "STUDENT") {
        router.push("/student");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(t("invalidCredentials"));
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="bg-pattern min-h-screen flex flex-col font-sans text-on-surface antialiased relative">
      {/* Top Navigation for Language Toggle */}
      <header className="w-full flex justify-end p-margin absolute top-0 z-10">
        <LanguageToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-md sm:p-lg">
        {/* Login Card */}
        <div className="bg-surface-container-lowest w-full max-w-[420px] rounded-xl shadow-soft border border-surface-container-highest p-margin relative overflow-hidden my-auto">
          {/* Logo & Header */}
          <div className="text-center mb-xl">
            <div className="flex justify-center mb-md">
              <Image src="/images/logo.jpg" alt="EduFlow logo" width={180} height={60} className="object-contain" />
            </div>
            <h1 className="font-h2 text-h2 text-primary mb-sm">{t("welcomeBack")}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("signInSubhead")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-lg p-md rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-sm">
              <Icon name="error" className="text-[20px] text-error" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Email Input */}
            <div className="space-y-sm">
              <label className="font-label-md text-label-md text-on-surface block" htmlFor="email">
                {t("emailLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <Icon name="mail" className="text-on-surface-variant text-[20px]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduflow.bd"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-md py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface block" htmlFor="password">
                  {t("passwordLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password resets are managed by your Institute Admin. Please contact support@eduflow.bd if you need assistance.")}
                  className="font-label-md text-label-md text-primary hover:text-surface-tint transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                  <Icon name="lock" className="text-on-surface-variant text-[20px]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-[44px] pr-[44px] py-[10px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-body-md text-body-md placeholder:text-outline"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-md flex items-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  <Icon name={showPassword ? "visibility" : "visibility_off"} className="text-[20px]" />
                </button>
              </div>
            </div>

            {/* Remember Me & Submit */}
            <div className="flex items-center mt-md mb-xl">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface-container-lowest cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-sm block font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none"
              >
                {t("rememberMe")}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md py-md rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-sm active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>{t("loggingIn")}</span>
              ) : (
                <>
                  <span>{t("loginButton")}</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-xl relative">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container-highest"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-md bg-surface-container-lowest font-body-sm text-body-sm text-on-surface-variant">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          {/* Demo Quick Login Options */}
          <div className="mt-lg space-y-sm">
            <p className="font-caption text-caption text-center text-on-surface-variant font-medium mb-xs">
              {t("demoCredentialsTitle")}
            </p>
            <div className="grid grid-cols-3 gap-xs">
              <button
                type="button"
                onClick={() => handleQuickFill("owner@eduflow.bd")}
                className="px-2 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded text-xs font-label-md text-primary text-center transition-colors cursor-pointer"
              >
                {t("ownerRole")}
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("kamrul@eduflow.bd")}
                className="px-2 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded text-xs font-label-md text-secondary text-center transition-colors cursor-pointer"
              >
                {t("teacherRole")}
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("student1@eduflow.bd")}
                className="px-2 py-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded text-xs font-label-md text-tertiary text-center transition-colors cursor-pointer"
              >
                {t("studentRole")}
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t("noAccount")}{" "}
              <Link
                href="/register"
                className="font-label-md text-label-md text-primary hover:text-surface-tint font-semibold transition-colors ml-xs"
              >
                {t("freeTrial")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
