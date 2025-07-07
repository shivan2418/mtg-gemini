import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold bg-gradient-to-r shadow-lg hover:scale-105 focus:ring-mtg-gold",
    secondary: "bg-mtg-gold bg-opacity-10 hover:bg-opacity-20 border-mtg-gold text-mtg-gold border hover:scale-105 focus:ring-mtg-gold",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "text-mtg-gold hover:text-mtg-gold-light transition-colors focus:ring-mtg-gold"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed hover:scale-100" 
    : "cursor-pointer";
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}