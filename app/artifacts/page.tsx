import { Sidebar, SidebarInset, SidebarProvider } from "@/components/sidebar";

import { Header } from "../header";
import { ArtifactsTabs } from "./artifacts-tabs";

export default function Page() {
  return (
    <SidebarProvider>
      <div className="flex overflow-x-hidden bg-background">
        <Sidebar />

        <SidebarInset className="flex flex-1 flex-col overflow-hidden p-3">
          <Header className="flex items-center w-full px-1" />

          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-1 min-h-0 w-full flex-col overflow-hidden px-1">
              <ArtifactsTabs />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
