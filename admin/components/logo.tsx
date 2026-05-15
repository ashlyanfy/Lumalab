import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "full" | "mark";
}

const heightClass: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-12",
};

export function Logo({ size = "md", className, variant = "full" }: LogoProps) {
  const src = variant === "mark" ? "/lumalab-mark.png" : "/lumalab-logo.png";
  return (
    <img
      src={src}
      alt="LumaLab"
      className={cn("w-auto select-none", heightClass[size], className)}
      draggable={false}
    />
  );
}
