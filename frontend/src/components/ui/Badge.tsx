import React from "react";
import Icon from "./Icon";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  iconName?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  iconName,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center gap-xs px-sm py-xs text-caption font-label-md rounded-full border transition-colors";

  const variants = {
    success:
      "bg-secondary-container text-on-secondary-container border-secondary/20",
    warning:
      "bg-tertiary-container text-on-tertiary-container border-tertiary/20",
    error: "bg-error-container text-on-error-container border-error/20",
    info: "bg-primary-fixed text-on-primary-fixed border-primary/20",
    neutral:
      "bg-surface-container-low text-on-surface-variant border-outline-variant",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {iconName && <Icon name={iconName} size={14} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
