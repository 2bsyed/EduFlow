import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "flat";
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  interactive = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "rounded-lg p-lg bg-surface-container-lowest border border-outline-variant transition-all duration-200";

  const variants = {
    default: "shadow-sm",
    elevated: "shadow-md bg-surface",
    outlined: "border border-outline-variant bg-surface-container-lowest",
    flat: "bg-surface-container-low border-none",
  };

  const interactiveStyles = interactive
    ? "hover:shadow-md hover:border-primary-container cursor-pointer"
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`flex flex-col gap-xs mb-md ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-h4 font-h4 text-on-surface ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, className = "", ...props }) => (
  <p className={`text-body-sm text-on-surface-variant ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => <div className={`${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mt-lg pt-md border-t border-outline-variant flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
