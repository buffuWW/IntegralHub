import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "secondary" | "danger" };

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  danger: "bg-rose-600 text-white hover:bg-rose-700"
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = ""
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
