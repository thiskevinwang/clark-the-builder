import { SidebarProvider } from "@/components/sidebar";

import { WelcomeScreen } from "./welcome-screen";

export default async function Page() {
  return (
    <SidebarProvider>
      <WelcomeScreen />
    </SidebarProvider>
  );
}
