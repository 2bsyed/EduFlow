"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { RecordPaymentModal } from "@/components/fees/RecordPaymentModal";

export interface FeeItem {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  photoUrl?: string | null;
  batchName: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  status: "Paid" | "Due" | "Overdue";
  paymentMethod?: "CASH" | "BKASH" | "NAGAD" | "BANK_TRANSFER" | null;
  receiptNo: string;
}

export interface StudentOption {
  id: string;
  name: string;
  rollNo: string;
  batchName: string;
}

interface FeesTableClientProps {
  fees: FeeItem[];
  students: StudentOption[];
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
}

export function FeesTableClient({
  fees,
  students,
  totalCollected,
  totalPending,
  totalOverdue,
}: FeesTableClientProps) {
  const [activeTab, setActiveTab] = useState<"All" | "Paid" | "Due" | "Overdue">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);

  // Filtered Fees List
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchesTab = activeTab === "All" || fee.status === activeTab;
      const matchesSearch =
        !searchTerm ||
        fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.studentRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [fees, activeTab, searchTerm]);

  const handleOpenRecordPayment = (studentId?: string) => {
    setPreselectedStudentId(studentId);
    setIsModalOpen(true);
  };

  // Payment Method Icon Badge Helper
  const renderMethodBadge = (method?: "CASH" | "BKASH" | "NAGAD" | "BANK_TRANSFER" | null) => {
    if (!method) {
      return (
        <span className="text-on-surface-variant" title="Pending">
          <Icon name="horizontal_rule" className="text-[20px]" />
        </span>
      );
    }

    switch (method) {
      case "BKASH":
        return (
          <div className="flex items-center gap-xs text-[#d12053]">
            <Icon name="send_money" className="text-[16px]" />
            <span className="font-caption text-caption font-medium">bKash</span>
          </div>
        );
      case "NAGAD":
        return (
          <div className="flex items-center gap-xs text-[#f7931e]">
            <Icon name="phone_iphone" className="text-[16px]" />
            <span className="font-caption text-caption font-medium">Nagad</span>
          </div>
        );
      case "BANK_TRANSFER":
        return (
          <div className="flex items-center gap-xs text-primary">
            <Icon name="account_balance" className="text-[16px]" />
            <span className="font-caption text-caption font-medium">Bank</span>
          </div>
        );
      case "CASH":
      default:
        return (
          <div className="flex items-center gap-xs text-secondary">
            <Icon name="payments" className="text-[16px]" />
            <span className="font-caption text-caption font-medium">Cash</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-xl pb-xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-xl">
        <div>
          <h2 className="font-h2 text-h2 font-semibold text-on-background">Fees & Payments</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Manage student fee collections and track dues.
          </p>
        </div>
        <button
          onClick={() => handleOpenRecordPayment()}
          className="flex items-center gap-sm bg-primary-container text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:bg-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer shadow-sm"
        >
          <Icon name="add" className="text-[18px]" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary Strip (3 KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        {/* Total Collected */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-md">
            <div className="p-sm bg-secondary-container text-on-secondary-container rounded-lg">
              <Icon name="account_balance_wallet" className="text-[24px]" />
            </div>
            <span className="flex items-center gap-xs font-label-md text-label-md text-secondary bg-secondary-container/30 px-sm py-xs rounded-full font-semibold">
              <Icon name="trending_up" className="text-[14px]" /> +12%
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">
            Total Collected This Month
          </p>
          <h3 className="font-h2 text-h2 font-semibold text-on-background mt-xs">
            ৳ {totalCollected.toLocaleString()}
          </h3>
        </div>

        {/* Total Pending */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-md">
            <div className="p-sm bg-primary-fixed text-on-primary-fixed rounded-lg">
              <Icon name="pending_actions" className="text-[24px]" />
            </div>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">Total Pending</p>
          <h3 className="font-h2 text-h2 font-semibold text-on-background mt-xs">
            ৳ {totalPending.toLocaleString()}
          </h3>
        </div>

        {/* Overdue Amount */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-md">
            <div className="p-sm bg-error-container text-on-error-container rounded-lg">
              <Icon name="warning" className="text-[24px]" />
            </div>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">Overdue Amount</p>
          <h3 className="font-h2 text-h2 font-semibold text-error mt-xs">
            ৳ {totalOverdue.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filter Tabs & Controls */}
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-bright">
          <div className="flex space-x-md overflow-x-auto w-full sm:w-auto pb-sm sm:pb-0">
            {(["All", "Paid", "Due", "Overdue"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-label-md text-label-md px-md py-sm rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === tab
                    ? "bg-primary-fixed text-on-primary-fixed font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-sm w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Icon
                name="search"
                className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Search student..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-bright">
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium">
                  Student
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium">
                  Batch
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium text-right">
                  Amount Due
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium text-right">
                  Paid
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium">
                  Due Date
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium">
                  Status
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium">
                  Method
                </th>
                <th className="py-md px-lg font-label-md text-label-md text-on-surface-variant font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-sm">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-xl text-center text-on-surface-variant">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const initials = fee.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  let statusBadgeClass = "bg-secondary-container text-on-secondary-container";
                  if (fee.status === "Due") statusBadgeClass = "bg-primary-fixed text-on-primary-fixed";
                  if (fee.status === "Overdue") statusBadgeClass = "bg-error-container text-on-error-container";

                  return (
                    <tr key={fee.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-md px-lg whitespace-nowrap">
                        <div className="flex items-center gap-md">
                          {fee.photoUrl ? (
                            <img
                              src={fee.photoUrl}
                              alt={fee.studentName}
                              className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center text-primary font-medium text-body-sm shrink-0 font-bold">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-label-md text-label-md font-medium text-on-background">
                              {fee.studentName}
                            </p>
                            <p className="font-caption text-caption text-on-surface-variant">
                              Roll: {fee.studentRoll}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-md px-lg whitespace-nowrap text-on-surface">
                        {fee.batchName}
                      </td>
                      <td className="py-md px-lg whitespace-nowrap text-on-surface text-right">
                        ৳ {fee.amountDue.toLocaleString()}
                      </td>
                      <td className="py-md px-lg whitespace-nowrap text-on-surface-variant text-right">
                        ৳ {fee.amountPaid.toLocaleString()}
                      </td>
                      <td
                        className={`py-md px-lg whitespace-nowrap ${
                          fee.status === "Overdue" ? "text-error font-medium" : "text-on-surface"
                        }`}
                      >
                        {fee.dueDate}
                      </td>
                      <td className="py-md px-lg whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-sm py-[2px] rounded-full text-caption font-medium ${statusBadgeClass}`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-md px-lg whitespace-nowrap text-on-surface-variant">
                        {renderMethodBadge(fee.paymentMethod)}
                      </td>
                      <td className="py-md px-lg whitespace-nowrap text-right">
                        {fee.status === "Paid" ? (
                          <button
                            onClick={() => handleOpenRecordPayment(fee.studentId)}
                            className="text-on-surface-variant p-xs rounded hover:bg-surface-container transition-colors cursor-pointer"
                            title="View Receipt"
                          >
                            <Icon name="receipt" className="text-[20px]" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRecordPayment(fee.studentId)}
                            className="bg-surface-container-lowest border border-primary text-primary px-sm py-xs rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
                          >
                            Collect
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={students}
        preselectedStudentId={preselectedStudentId}
      />
    </div>
  );
}
