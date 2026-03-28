"use client";

import { ArrowUpIcon, PanelLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ClarkAvatar } from "@/components/clark-avatar";
import { ConnectorsMenu } from "@/components/connectors/connectors-menu";
import { ModelSelector } from "@/components/settings/model-selector";
import { Settings } from "@/components/settings/settings";
import { Sidebar, useSidebar } from "@/components/sidebar";
import { AppAuthGuard } from "@/components/auth/app-auth-guard";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";

import { useCreateChatMutation } from "./api/hooks";

export function WelcomeScreen() {
  const [input, setInput] = useLocalStorageValue("chat:new:prompt-input");
  const { isOpen, toggle } = useSidebar();
  const router = useRouter();

  const createChatMutation = useCreateChatMutation({
    onSuccess: (data) => {
      const newChatId = data.chat.id;
      localStorage.setItem(`chat:${newChatId}:prompt-input`, input);
      setInput("");
      router.replace(`/chats/${data.chat.id}`);
    },
    onError: (error) => {
      const message = error?.message ?? "An unknown error occurred";
      toast.error(message);
    },
  });
  const isSubmitting = createChatMutation.isMutating;

  const handleSubmit = async () => {
    const prompt = input.trim();
    if (!prompt || isSubmitting) return;
    await createChatMutation.trigger({ title: "New Chat" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-background via-background to-accent/20 px-4">
      {/* Sidebar */}
      <Sidebar />

      {/* Open sidebar button - fixed position top-left */}
      {!isOpen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="fixed top-4 left-4 z-30 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/80 backdrop-blur-sm md:hidden"
            >
              <PanelLeftIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="flex items-center gap-2">
              Open sidebar
              <kbd className="inline-flex h-5 items-center gap-0.5 rounded bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium">
                ⌘.
              </kbd>
            </span>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-1 items-center justify-center">
        <AppAuthGuard className="w-full">
          <div className="flex w-full flex-col items-center">
            {/* Logo and title */}
            <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative mb-6">
                <div className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-xl" />
                <ClarkAvatar size={64} className="relative rounded-2xl shadow-lg" />
              </div>
              <h1
                className="mb-2 text-center text-4xl font-semibold tracking-tight text-foreground"
                style={{
                  fontSize: `clamp(1.875rem, 1.2rem + 2vw, 2.5rem)`,
                }}
              >
                How can I help you today?
              </h1>
            </div>

            {/* Chat input */}
            <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <InputGroup className="border-border/50 bg-card shadow-lg transition-colors hover:border-border">
                  <InputGroupTextarea
                    disabled={isSubmitting}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Describe the app you want to build..."
                    rows={3}
                    value={input}
                    className="text-base"
                  />
                  <InputGroupAddon align="block-end" className="border-t border-border/30">
                    <div className="flex items-center gap-1">
                      <Settings />

                      <ConnectorsMenu />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <ModelSelector />

                      <InputGroupButton
                        type="submit"
                        size="sm"
                        variant="default"
                        disabled={isSubmitting || !input.trim()}
                        className="h-9 w-9 rounded-xl bg-primary p-0 text-primary-foreground transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-40"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                      </InputGroupButton>
                    </div>
                  </InputGroupAddon>
                </InputGroup>

                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <span className="inline-block dark:hidden">Clark</span>
                  <span className="hidden dark:inline-block">Karl</span>&nbsp;is AI and can make
                  mistakes. Please double-check responses.
                </p>
              </form>
            </div>
          </div>
        </AppAuthGuard>
      </div>
    </div>
  );
}
