import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, iconName, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-xs w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-md font-label-md text-on-surface"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {iconName && (
            <span className="material-symbols-outlined absolute left-md text-outline text-[20px] pointer-events-none">
              {iconName}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface-container-lowest text-on-surface text-body-md border rounded px-md py-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container ${
              iconName ? "pl-11" : ""
            } ${
              error
                ? "border-error focus:ring-error"
                : "border-outline-variant hover:border-outline focus:border-primary-container"
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-caption text-error">{error}</span>
        ) : (
          helperText && (
            <span className="text-caption text-outline">{helperText}</span>
          )
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
