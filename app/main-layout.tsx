"use client";

import type { ChatUIMessage } from "@/components/chat/types";
import { Horizontal, Vertical } from "@/components/layout/panels";
import { Sidebar } from "@/components/sidebar";
import { TabContent, TabItem } from "@/components/tabs";
import { useSharedChatContext } from "@/lib/chat-context";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { Chat } from "./chat";
import { FileExplorer } from "./file-explorer";
import { Header } from "./header";
import { Logs } from "./logs";
import { Preview } from "./preview";
import { PreviewPanel } from "./preview-panel";
import { WelcomeScreen } from "./welcome-screen";

interface Props {
  horizontalSizes: number[];
  verticalSizes: number[];
}

export function MainLayout({ horizontalSizes, verticalSizes }: Props) {
  const { chat } = useSharedChatContext();
  const { messages } = useChat<ChatUIMessage>({ chat });
  const [hasStarted, setHasStarted] = useState(false);

  // Track if conversation has started (messages exist or user explicitly started)
  useEffect(() => {
    if (messages.length > 0) {
      setHasStarted(true);
    }
  }, [messages.length]);

  // Show welcome screen if no conversation has started
  if (!hasStarted) {
    return <WelcomeScreen onMessageSent={() => setHasStarted(true)} />;
  }

  // Show full layout once conversation has started
  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-background">
      {/* Collapsible Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden p-3">
        <Header className="flex items-center w-full px-1" />
        <ul className="flex gap-1 text-sm px-1 py-2 md:hidden">
          <TabItem tabId="chat">Chat</TabItem>
          <TabItem tabId="preview">Preview</TabItem>
          <TabItem tabId="file-explorer">Files</TabItem>
          <TabItem tabId="logs">Logs</TabItem>
        </ul>

        {/* Mobile layout tabs taking the whole space*/}
        <div className="flex flex-1 w-full overflow-hidden pt-2 md:hidden">
          <TabContent tabId="chat" className="flex-1">
            <Chat className="flex-1 overflow-hidden" />
          </TabContent>
          <TabContent tabId="preview" className="flex-1">
            <Preview className="flex-1 overflow-hidden" />
          </TabContent>
          <TabContent tabId="file-explorer" className="flex-1">
            <FileExplorer className="flex-1 overflow-hidden" />
          </TabContent>
          <TabContent tabId="logs" className="flex-1">
            <Logs className="flex-1 overflow-hidden" />
          </TabContent>
        </div>

        {/* Desktop layout with horizontal and vertical panels */}
        <div className="hidden flex-1 w-full min-h-0 overflow-hidden pt-2 md:flex">
          <Horizontal
            defaultLayout={horizontalSizes ?? [50, 50]}
            left={<Chat className="flex-1 overflow-hidden" />}
            right={
              <Vertical
                defaultLayout={verticalSizes ?? [66.66, 33.33]}
                top={<PreviewPanel className="flex-1 overflow-hidden" />}
                bottom={<Logs className="flex-1 overflow-hidden" />}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
