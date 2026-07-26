import React from "react";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  size,
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = { ...style };
  if (size) {
    customStyle.fontSize = typeof size === "number" ? `${size}px` : size;
  }

  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={customStyle}
      {...props}
    >
      {name}
    </span>
  );
};

export default Icon;
