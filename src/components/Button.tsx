import { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Button = ({
  children,
  variant = "primary",
  size = "sm",
  className,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "font-normal rounded-lg transition-colors duration-200 inline-flex items-center justify-center";

  const variants = {
    primary: "bg-blue-500 hover:bg-blue-700 text-white",
    secondary:
      "bg-transparent text-white border-2 border-blue-700 hover:bg-blue-500 hover:text-white",
    outline:
      "bg-transparent text-gray-900 border-2 border-gray-200 hover:bg-gray-50",
  };

  const sizes = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
