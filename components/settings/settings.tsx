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

type ReasoningEffort = (typeof OPTIONS)[number]["value"];

export function Settings() {
  const [fixErrors, setFixErrors] = useFixErrors();
  const [reasoningEffort, setReasoningEffort] = useReasoningEffort();
  const selectedReasoningEffort = reasoningEffort ?? "low";

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
          onCheckedChange={(checked) => void setFixErrors(checked === true)}
        >
          Auto-fix errors
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuLabel>Reasoning Effort</DropdownMenuLabel>
          <DropdownMenuSubTrigger>
            {OPTIONS.find((option) => option.value === selectedReasoningEffort)?.label ||
              "Reasoning Effort"}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={selectedReasoningEffort}
                onValueChange={(value) => void setReasoningEffort(value as ReasoningEffort)}
              >
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
