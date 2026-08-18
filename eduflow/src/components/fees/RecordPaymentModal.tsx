"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { recordPaymentAction } from "@/app/actions/fees";
import { useTranslations } from "next-intl";

interface StudentOption {
  id: string;
  name: string;
  rollNo: string;
  batchName: string;
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentOption[];
  preselectedStudentId?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  students,
  preselectedStudentId,
}: RecordPaymentModalProps) {
  const t = useTranslations("RecordPayment");
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || "");
  const [amount, setAmount] = useState("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BKASH" | "NAGAD" | "BANK_TRANSFER">(
    "CASH"
  );
  const [receiptNo, setReceiptNo] = useState(
    `RCPT-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedStudentId(preselectedStudentId || "");
      setAmount("");
      setDateStr(new Date().toISOString().split("T")[0]);
      setPaymentMethod("CASH");
      setReceiptNo(`RCPT-${Math.floor(100000 + Math.random() * 900000)}`);
      setServerError(null);
    }
  }, [isOpen, preselectedStudentId]);

  if (!isOpen) return null;

  const handleRefreshReceipt = () => {
    setReceiptNo(`RCPT-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const selectedStudentObj = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amount || !dateStr) {
      setServerError(t("errorRequired"));
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("studentId", selectedStudentId);
    formData.append("amount", amount);
    formData.append("date", dateStr);
    formData.append("paymentMethod", paymentMethod);
    formData.append("receiptNo", receiptNo);

    const res = await recordPaymentAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setServerError(res.error || t("errorFailed"));
    }
  };

  // Method Icon Helper
  const renderMethodIcon = () => {
    switch (paymentMethod) {
      case "BKASH":
        return <Icon name="send_money" className="text-[14px]" />;
      case "NAGAD":
        return <Icon name="phone_iphone" className="text-[14px]" />;
      case "BANK_TRANSFER":
        return <Icon name="account_balance" className="text-[14px]" />;
      case "CASH":
      default:
        return <Icon name="money" className="text-[14px]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative border border-outline-variant">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
        >
          <Icon name="close" className="text-[20px]" />
        </button>

        {/* Left Section: Form */}
        <div className="flex-1 p-lg md:p-xl border-b md:border-b-0 md:border-r border-outline-variant bg-surface-bright flex flex-col justify-between">
          <div>
            <div className="mb-lg">
              <h2 className="font-h3 text-h3 font-semibold text-on-background mb-1">
                {t("title")}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t("subtitle")}
              </p>
            </div>

            {serverError && (
              <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg font-body-sm">
                {serverError}
              </div>
            )}

            <form id="record-payment-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2 font-medium">
                  {t("studentLabel")}
                </label>
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface pr-10 transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      {t("selectStudent")}
                    </option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.batchName}) - Roll: {s.rollNo}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="expand_more"
                    className="absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[20px]"
                  />
                </div>
              </div>

              {/* Amount & Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2 font-medium">
                    {t("amountLabel")}
                  </label>
                  <div className="relative">
                    <Icon
                      name="payments"
                      className="absolute left-3 top-3 text-on-surface-variant text-[20px]"
                    />
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface transition-colors"
                      placeholder="0.00"
                      type="number"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-2 font-medium">
                    {t("dateLabel")}
                  </label>
                  <div className="relative">
                    <input
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-on-surface transition-colors"
                      type="date"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Styled Radio Badges */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-3 font-medium">
                  {t("methodLabel")}
                </label>
                <div className="flex gap-4">
                  {/* Cash (Green) */}
                  <label
                    onClick={() => setPaymentMethod("CASH")}
                    className="cursor-pointer relative flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full border-2 bg-surface-container-lowest flex items-center justify-center transition-all ${
                        paymentMethod === "CASH"
                          ? "border-secondary bg-secondary-container text-on-secondary-container"
                          : "border-outline-variant text-on-surface-variant hover:border-secondary"
                      }`}
                    >
                      <Icon name="money" className="text-[24px]" />
                    </div>
                    <span className="font-caption text-caption font-medium text-on-surface">
                      {t("cash")}
                    </span>
                  </label>

                  {/* bKash (Pink) */}
                  <label
                    onClick={() => setPaymentMethod("BKASH")}
                    className="cursor-pointer relative flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full border-2 bg-surface-container-lowest flex items-center justify-center transition-all ${
                        paymentMethod === "BKASH"
                          ? "border-error bg-error-container text-on-error-container"
                          : "border-outline-variant text-on-surface-variant hover:border-error"
                      }`}
                    >
                      <Icon name="send_money" className="text-[24px]" />
                    </div>
                    <span className="font-caption text-caption font-medium text-on-surface">
                      {t("bkash")}
                    </span>
                  </label>

                  {/* Nagad (Orange) */}
                  <label
                    onClick={() => setPaymentMethod("NAGAD")}
                    className="cursor-pointer relative flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full border-2 bg-surface-container-lowest flex items-center justify-center transition-all ${
                        paymentMethod === "NAGAD"
                          ? "border-tertiary-container bg-tertiary-fixed text-on-tertiary-container"
                          : "border-outline-variant text-on-surface-variant hover:border-tertiary"
                      }`}
                    >
                      <Icon name="phone_iphone" className="text-[24px]" />
                    </div>
                    <span className="font-caption text-caption font-medium text-on-surface">
                      {t("nagad")}
                    </span>
                  </label>

                  {/* Bank (Blue) */}
                  <label
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className="cursor-pointer relative flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full border-2 bg-surface-container-lowest flex items-center justify-center transition-all ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "border-primary bg-primary-container text-on-primary"
                          : "border-outline-variant text-on-surface-variant hover:border-primary"
                      }`}
                    >
                      <Icon name="account_balance" className="text-[24px]" />
                    </div>
                    <span className="font-caption text-caption font-medium text-on-surface">
                      {t("bank")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Receipt Info */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2 font-medium">
                  {t("receiptNoLabel")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    value={receiptNo}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-body-sm text-on-surface-variant cursor-not-allowed font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleRefreshReceipt}
                    className="p-2 text-primary hover:bg-surface-container rounded-lg cursor-pointer"
                    title={t("generateReceipt")}
                  >
                    <Icon name="refresh" className="text-[20px]" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-xl pt-lg border-t border-outline-variant">
            <button
              type="submit"
              form="record-payment-form"
              disabled={isSubmitting}
              className="w-full bg-primary-container text-on-primary hover:bg-primary py-3 rounded-lg font-label-md text-label-md flex justify-center items-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Icon name="check_circle" className="text-[20px]" />
              <span>{isSubmitting ? t("recording") : t("confirm")}</span>
            </button>
          </div>
        </div>

        {/* Right Section: Digital Receipt Preview */}
        <div className="flex-1 bg-surface-container-low p-lg md:p-xl flex items-center justify-center relative bg-[radial-gradient(#c4c5d5_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-lg shadow-md border border-outline-variant p-6 relative overflow-hidden">
            {/* Decorative header strip */}
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

            {/* Header */}
            <div className="text-center border-b border-outline-variant pb-4 mb-4 mt-2">
              <Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain mb-1" />
              <p className="font-caption text-caption text-on-surface-variant">
                {t("receiptPreview")}
              </p>
            </div>

            {/* Body Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="font-caption text-caption text-on-surface-variant">
                  {t("receiptNo")}
                </span>
                <span className="font-label-md text-label-md text-on-surface font-mono">
                  {receiptNo}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-caption text-caption text-on-surface-variant">{t("date")}</span>
                <span className="font-label-md text-label-md text-on-surface">
                  {new Date(dateStr).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-caption text-caption text-on-surface-variant">
                  {t("student")}
                </span>
                <span className="font-label-md text-label-md text-on-surface font-medium text-right max-w-[150px] truncate">
                  {selectedStudentObj ? selectedStudentObj.name : t("selectStudentPreview")}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-caption text-caption text-on-surface-variant">
                  {t("method")}
                </span>
                <span className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  {renderMethodIcon()}
                  <span>
                    {paymentMethod === "BANK_TRANSFER"
                      ? t("bank")
                      : paymentMethod === "BKASH"
                      ? t("bkash")
                      : paymentMethod === "NAGAD"
                      ? t("nagad")
                      : t("cash")}
                  </span>
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-surface-bright rounded-lg p-4 border border-outline-variant mb-6 flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface font-medium">
                {t("totalAmount")}
              </span>
              <span className="font-h3 text-h3 font-bold text-primary">
                ৳ {amount ? parseFloat(amount).toLocaleString() : "0.00"}
              </span>
            </div>

            {/* Footer & QR Placeholder */}
            <div className="flex flex-col items-center border-t border-outline-variant pt-4 border-dashed">
              <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded mb-2 border border-outline-variant">
                <Icon name="qr_code_2" className="text-[32px] text-outline" />
              </div>
              <p className="font-caption text-caption text-on-surface-variant text-center">
                {t("scanVerify")}
                <br />
                {t("thankYou")}
              </p>
            </div>

            {/* Decorative Cutouts */}
            <div className="absolute -left-2 top-1/2 w-4 h-4 bg-surface-container-low rounded-full border-r border-outline-variant"></div>
            <div className="absolute -right-2 top-1/2 w-4 h-4 bg-surface-container-low rounded-full border-l border-outline-variant"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
