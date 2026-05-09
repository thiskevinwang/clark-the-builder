import { AppAuthGuard } from "@/components/auth/app-auth-guard";
import { Horizontal, Vertical } from "@/components/layout/panels";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/sidebar";
import { TabContent, TabItem } from "@/components/tabs";

import { Chat } from "./chat";
import { FileExplorer } from "./file-explorer";
import { Header } from "./header";
import { Logs } from "./logs";
import { Preview } from "./preview";
import { PreviewPanel } from "./preview-panel";

interface Props {
  horizontalSizes: number[];
  verticalSizes: number[];
}

export function MainLayout({ horizontalSizes, verticalSizes }: Props) {
  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen overflow-hidden bg-background">
        {/* Sidebar - handles its own visibility */}
        <Sidebar />

        {/* Main Content */}
        <SidebarInset className="flex flex-1 flex-col overflow-hidden p-3">
          <Header className="flex items-center w-full px-1" />
          <AppAuthGuard>
            <>
              <ul className="flex gap-1 px-1 py-2 text-sm md:hidden">
                <TabItem tabId="chat">Chat</TabItem>
                <TabItem tabId="preview">Preview</TabItem>
                <TabItem tabId="file-explorer">Files</TabItem>
                <TabItem tabId="logs">Logs</TabItem>
              </ul>

              {/* Mobile layout tabs taking the whole space*/}
              <div className="flex w-full flex-1 overflow-hidden pt-2 md:hidden">
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
              <div className="hidden min-h-0 w-full flex-1 overflow-hidden pt-2 md:flex">
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
            </>
          </AppAuthGuard>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
