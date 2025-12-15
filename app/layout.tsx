import { CommandLogsStream } from "@/components/commands-logs/commands-logs-stream";
import { ErrorMonitor } from "@/components/error-monitor/error-monitor";
import { SandboxState } from "@/components/modals/sandbox-state";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "@/lib/chat-context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";

const sansfont = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const monofont = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const title = "Clerk0";
const description = `This is a demo for a generative AI builder app that provisions Clerk applications through the Clerk Platform API`;

export const metadata: Metadata = {
  title,
  description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${sansfont.variable} ${monofont.variable} font-sans antialiased`}
      >
        <Suspense fallback={null}>
          <NuqsAdapter>
            <ChatProvider>
              <ErrorMonitor>{children}</ErrorMonitor>
            </ChatProvider>
          </NuqsAdapter>
        </Suspense>
        <Toaster />
        <CommandLogsStream />
        <SandboxState />
      </body>
    </html>
  );
}
