import { ClarkAvatar, ClarkName } from "@/components/clark-avatar";

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthPageShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-accent/20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[18%] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[12%] right-[10%] h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex max-w-xl flex-1 flex-col justify-center">
          <div className="mb-8 inline-flex w-fit items-center gap-3">
            <ClarkAvatar size={36} className="rounded-xl shadow-lg" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                <ClarkName />
              </p>
              <p className="text-xs text-muted-foreground">Build apps with AI</p>
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-10 flex flex-1 items-center justify-center lg:mt-0">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/90 p-4 shadow-2xl backdrop-blur sm:p-6">
            {children}
            <div className="mt-6 border-t border-border/60 pt-4 text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
