"use client";

import React, { useEffect } from "react";
import Button from "./Button";
import Icon from "./Icon";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-outline-variant bg-surface-container-low">
          <div>
            {title && (
              <h3 className="text-h4 font-h4 text-on-surface">{title}</h3>
            )}
            {description && (
              <p className="text-body-sm text-on-surface-variant mt-xs">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            className="p-xs"
          >
            <Icon name="close" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-lg overflow-y-auto flex-1 text-body-md text-on-surface">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-lg border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-md">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
