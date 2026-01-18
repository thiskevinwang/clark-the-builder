import { SlidersVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useFixErrors, useReasoningEffort } from "./use-settings";

const OPTIONS = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "Extra high" },
] as const;

export function Settings() {
  const [fixErrors, setFixErrors] = useFixErrors();
  const [reasoningEffort, setReasoningEffort] = useReasoningEffort();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <SlidersVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="start">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={fixErrors}
          onCheckedChange={(checked) => setFixErrors(checked === "indeterminate" ? false : checked)}
        >
          Auto-fix errors
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuLabel>Reasoning Effort</DropdownMenuLabel>
          <DropdownMenuSubTrigger>
            {OPTIONS.find((option) => option.value === reasoningEffort)?.label ||
              "Reasoning Effort"}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={reasoningEffort} onValueChange={setReasoningEffort}>
                {OPTIONS.map((level) => (
                  <DropdownMenuRadioItem key={level.value} value={level.value}>
                    {level.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
