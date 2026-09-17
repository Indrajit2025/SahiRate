import { cn } from "@/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <span className={cn("font-bold tracking-tight inline-block", className)}>
      <span className="text-primary">Sahi</span>
      <span className="text-copper">Rate</span>
    </span>
  );
}
