import type { ComponentPropsWithoutRef, ElementType } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-coral text-white hover:bg-coral-dark focus-visible:outline-coral shadow-sm shadow-coral/20",
  secondary:
    "bg-teal-900 text-white hover:bg-[#0d5b56] focus-visible:outline-teal-900",
  ghost:
    "bg-transparent text-teal-900 border border-teal-900/25 hover:bg-mist focus-visible:outline-teal-900",
};

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export default function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
