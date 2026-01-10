"use client";

import { useChat } from "@ai-sdk/react";
import { ArrowUpIcon, PanelLeftIcon } from "lucide-react";

import type { ChatUIMessage } from "@/components/chat/types";
import { ClarkAvatar } from "@/components/clark-avatar";
import { ConnectorsMenu } from "@/components/connectors/connectors-menu";
import { ModelSelector } from "@/components/settings/model-selector";
import { Settings } from "@/components/settings/settings";
import { useSettings } from "@/components/settings/use-settings";
import { Sidebar, useSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSharedChatContext } from "@/lib/chat-context";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";

interface Props {
  onMessageSent: () => void;
}

const PROMPTS = [
  {
    title: "Next.js Starter",
    content: "Generate a Clerk Next.js starter app",
  },
  {
    title: "Checkout Page",
    content: "Build a two panel checkout page",
  },
  {
    title: "B2B SaaS App",
    content: `Build a b2b SaaS app. Use the clerk \`b2b-saas\` template, which has Organizations and Billing enabled. Build a single landing page and render the \`<PricingTable for={'organization'}/>\` component`,
  },
  {
    title: "Waitlist Page",
    content: "Create a waitlist with Clerk's component",
  },
];

export function WelcomeScreen({ onMessageSent }: Props) {
  const [input, setInput] = useLocalStorageValue("prompt-input");
  const { chat } = useSharedChatContext();
  const { modelId, reasoningEffort } = useSettings();
  const { sendMessage, status } = useChat<ChatUIMessage>({ chat });
  const { isOpen, toggle } = useSidebar();

  const handleSubmit = () => {
    if (input.trim()) {
      sendMessage({ text: input }, { body: { modelId, reasoningEffort } });
      setInput("");
      onMessageSent();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background via-background to-accent/20 px-4">
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
              className="fixed top-4 left-4 z-30 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/80 backdrop-blur-sm"
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
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150" />
            <ClarkAvatar size={64} className="relative rounded-2xl shadow-lg" />
          </div>
          <h1
            className="text-4xl font-semibold text-foreground tracking-tight mb-2 text-center"
            style={{
              fontSize: `clamp(1.875rem, 1.2rem + 2vw, 2.5rem)`,
            }}
          >
            How can I help you today?
          </h1>
          {/* <p className="text-muted-foreground text-lg">
            Build Clerk-powered apps in seconds
          </p> */}
        </div>

        {/* Chat input */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <InputGroup className="bg-card shadow-lg border-border/50 hover:border-border transition-colors">
              <InputGroupTextarea
                disabled={status === "streaming" || status === "submitted"}
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
                    disabled={status !== "ready" || !input.trim()}
                    className="h-9 w-9 p-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:bg-muted disabled:text-muted-foreground transition-all"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </div>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>

        {/* Quick prompts */}
        <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <p className="text-sm text-muted-foreground text-center mb-4">Try one of these</p>
          <div className="grid gap-3 md:grid-cols-2">
            {PROMPTS.map((prompt) => (
              <QuickPromptCard
                key={prompt.title}
                title={prompt.title}
                description={prompt.content}
                onClick={() => {
                  setInput(prompt.content);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickPromptCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

function QuickPromptCard({ title, description, onClick }: QuickPromptCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left"
    >
      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
        {title}
      </span>
      <span className="text-sm text-muted-foreground mt-1">{description}</span>
    </button>
  );
}
