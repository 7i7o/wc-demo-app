import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children?: ReactNode;
  variant?: "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Card({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: CardProps) {
  const baseStyles =
    "font-relative transition-colors duration-200";
  const variants = {
    default:
      "bg-white dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-900 shadow-lg",
  };

  const sizes = {
    sm: "py-2 px-4 text-xs w-[200px] space-y-2 rounded-lg",
    md: "py-4 px-6 text-sm w-[300px] space-y-3 rounded-xl",
    lg: "py-6 px-8 text-lg w-md space-y-4 rounded-2xl",
  };

  return (
    <div
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
