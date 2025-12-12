import { AutoFixErrors } from "./auto-fix-errors";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReasoningEffort } from "./reasoning-effort";
import { SlidersVerticalIcon } from "lucide-react";

export function Settings() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <SlidersVerticalIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-medium text-foreground">Settings</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your chat preferences
          </p>
        </div>
        <div className="p-4 space-y-5">
          <AutoFixErrors />
          <ReasoningEffort />
        </div>
      </PopoverContent>
    </Popover>
  );
}
