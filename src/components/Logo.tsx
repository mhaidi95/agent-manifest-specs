import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("flex items-center gap-2 font-bold text-lg tracking-tight", className)}>
    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero shadow-glow">
      <Bot className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
    </span>
    <span>
      Bridge<span className="text-gradient">AI</span>
    </span>
  </Link>
);
