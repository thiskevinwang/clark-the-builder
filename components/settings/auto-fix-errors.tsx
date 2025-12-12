import { useFixErrors } from "@/components/settings/use-settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AutoFixErrors() {
  const [fixErrors, setFixErrors] = useFixErrors();
  return (
    <div
      className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 rounded-lg p-3 -m-3 transition-colors"
      onClick={() => setFixErrors(!fixErrors)}
    >
      <Checkbox
        id="auto-fix"
        className="mt-0.5 pointer-events-none"
        checked={fixErrors}
        onCheckedChange={(checked) =>
          setFixErrors(checked === "indeterminate" ? false : checked)
        }
      />
      <div className="space-y-0.5 flex-1 pointer-events-none">
        <Label
          className="text-sm font-medium text-foreground"
          htmlFor="auto-fix"
        >
          Auto-fix errors
        </Label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Automatically detects and fixes errors in generated code.
        </p>
      </div>
    </div>
  );
}
