import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  className?: string;
}

export async function Header({ className }: Props) {
  return (
    <header className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2.5">
        <Image
          src="/clark.png"
          alt="Clark the builder"
          width={28}
          height={28}
          className="rounded-md"
        />
        <span className="font-mono hidden md:inline text-sm font-semibold text-foreground tracking-tight">
          Clerk0
        </span>
      </div>
    </header>
  );
}
