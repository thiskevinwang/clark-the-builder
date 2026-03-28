import { AppAuthGuard } from "@/components/auth/app-auth-guard";
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
          <AppAuthGuard>
            <div className="mx-auto w-full max-w-4xl">
              <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden px-1">
                <ArtifactsTabs />
              </div>
            </div>
          </AppAuthGuard>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
