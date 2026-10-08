import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "default" | "narrow" | "wide";
}

export function Container({
  children,
  size = "default",
  className = "",
  ...props
}: ContainerProps) {
  const maxWidthClass =
    size === "narrow"
      ? "max-w-2xl"
      : size === "wide"
      ? "max-w-5xl"
      : "max-w-3xl";

  return (
    <div
      className={`mx-auto w-full px-5 sm:px-6 ${maxWidthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
