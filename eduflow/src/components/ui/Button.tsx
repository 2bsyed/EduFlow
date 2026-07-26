import React from "react";
import Icon from "./Icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  iconName?: string;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  iconName,
  iconPosition = "left",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-label-md transition-colors duration-200 cursor-pointer rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2";

  const variants = {
    primary: "bg-primary-container text-on-primary hover:bg-primary shadow-sm",
    secondary:
      "bg-surface-container text-primary-container hover:bg-surface-container-high border border-outline-variant",
    outline:
      "border border-primary-container text-primary-container hover:bg-surface-container-low",
    ghost: "text-on-surface-variant hover:text-primary hover:bg-surface-container-low",
    danger: "bg-error text-on-error hover:bg-error-container hover:text-on-error-container shadow-sm",
  };

  const sizes = {
    sm: "px-sm py-xs text-caption gap-xs",
    md: "px-md py-sm text-label-md gap-xs",
    lg: "px-lg py-md text-label-md gap-sm",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin material-symbols-outlined text-[18px]">
          progress_activity
        </span>
      ) : (
        iconName && iconPosition === "left" && <Icon name={iconName} size={18} />
      )}
      <span>{children}</span>
      {!isLoading && iconName && iconPosition === "right" && (
        <Icon name={iconName} size={18} />
      )}
    </button>
  );
};

export default Button;
