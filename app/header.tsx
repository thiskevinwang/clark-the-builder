import { ClarkAvatar } from "@/components/clark-avatar";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Header({ className }: Props) {
  return (
    <header className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2.5">
        <ClarkAvatar size={28} className="rounded-md" />
        <span className="font-mono hidden md:inline text-sm font-semibold text-foreground tracking-tight">
          Clerk0
        </span>
      </div>
    </header>
  );
}
