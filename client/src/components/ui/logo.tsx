import { cn } from "@/lib/utils";
import owlLogoSvg from "@assets/Updated Final - My College Finace Logo w New Oliver 2 - Thiink Media Graphics (Transparent).png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClass = {
    sm: "h-12 w-12",  // Increased size
    md: "h-16 w-16",  // Increased size
    lg: "h-20 w-20"   // Increased size
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={owlLogoSvg}
        alt="My College Finance Logo"
        className={cn("mr-2", sizeClass[size])}
      />
      {showText && (
        <h1 className="text-primary dark:text-primary-light text-xl md:text-2xl font-bold uppercase font-poppins tracking-wide">
          MY COLLEGE FINANCE
        </h1>
      )}
    </div>
  );
}
