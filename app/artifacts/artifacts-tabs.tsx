"use client";

import { ArtifactsAppsList } from "@/components/artifacts/apps-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ArtifactsTabs() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Artifacts</h1>
        <p className="text-sm text-muted-foreground">
          Apps and other outputs created during your session
        </p>
      </div>

      <Tabs defaultValue="apps" className="h-full">
        <TabsList>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="sandboxes" disabled>
            Sandboxes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apps">
          <ArtifactsAppsList />
        </TabsContent>

        <TabsContent value="sandboxes">
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Sandboxes are coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
