"use client";

import { AlertTriangleIcon, FileTextIcon, UploadCloudIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type DragEvent } from "react";

import { Sidebar, SidebarInset, SidebarProvider } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { cn } from "@/lib/utils";

import { Header } from "../../header";

type SessionFormat = "codex" | "claude" | "unknown";

type NormalizedEntry = {
  id: string;
  source: SessionFormat;
  kind: string;
  role?: string;
  timestamp?: string;
  text?: string;
  raw: unknown;
};

const JSON_INDENT = 2;

function parseJsonInput(contents: string) {
  const trimmed = contents.trim();
  if (!trimmed) return [] as unknown[];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as unknown);
  }
}

function isClaudeLikeEntry(entry: unknown) {
  if (typeof entry !== "object" || entry === null) return false;
  const record = entry as Record<string, unknown>;

  if ("message" in record && "sessionId" in record) return true;
  if ("role" in record && "content" in record) return true;
  if (record.type === "message" && "content" in record) return true;
  if (record.type === "message" && "message" in record) return true;

  return false;
}

function detectFormat(entries: unknown[]): SessionFormat {
  const hasCodex = entries.some(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      "payload" in entry &&
      "type" in entry &&
      "timestamp" in entry,
  );
  const hasClaude = entries.some((entry) => isClaudeLikeEntry(entry));

  if (hasCodex) return "codex";
  if (hasClaude) return "claude";
  return "unknown";
}

function extractCodexContent(content: unknown): string | undefined {
  if (!Array.isArray(content)) return undefined;
  const texts = content
    .map((item) =>
      typeof item === "object" && item && "text" in item
        ? String((item as { text?: unknown }).text ?? "")
        : "",
    )
    .filter(Boolean);
  return texts.length > 0 ? texts.join("\n") : undefined;
}

function extractClaudeContent(content: unknown): string | undefined {
  if (typeof content === "string") return content;
  if (typeof content === "object" && content) {
    if ("text" in content) return String((content as { text?: unknown }).text ?? "");
  }
  if (!Array.isArray(content)) return undefined;
  const texts = content
    .map((item) => {
      if (typeof item === "object" && item) {
        if ("text" in item) return String((item as { text?: unknown }).text ?? "");
        if ("type" in item) return `[${String((item as { type?: unknown }).type)}]`;
      }
      return "";
    })
    .filter(Boolean);
  return texts.length > 0 ? texts.join("\n") : undefined;
}

function normalizeEntry(entry: unknown, format: SessionFormat, index: number): NormalizedEntry {
  if (format === "claude" && typeof entry === "object" && entry !== null) {
    const record = entry as Record<string, unknown>;
    const message = typeof record.message === "object" && record.message ? record.message : null;
    const role =
      message && "role" in message
        ? String(message.role)
        : typeof record.role === "string"
          ? record.role
          : typeof record.type === "string"
            ? record.type
            : undefined;
    const contentSource = message
      ? (message as Record<string, unknown>).content
      : (record.content ?? record.text);
    const text =
      extractClaudeContent(contentSource) ??
      (typeof record.text === "string" ? record.text : undefined);
    const timestampValue = record.timestamp ?? record.created_at ?? record.createdAt;
    const timestamp =
      typeof timestampValue === "string"
        ? timestampValue
        : typeof timestampValue === "number"
          ? new Date(timestampValue).toISOString()
          : undefined;

    return {
      id: String(
        record.uuid ??
          record.id ??
          record.message_id ??
          record.messageId ??
          `${record.type ?? role ?? "claude"}-${index}`,
      ),
      source: "claude",
      kind: typeof record.type === "string" ? record.type : "message",
      role,
      timestamp,
      text,
      raw: entry,
    };
  }

  if (format === "codex" && typeof entry === "object" && entry !== null) {
    const record = entry as Record<string, unknown>;
    const kind = String(record.type ?? "event");
    const payload = typeof record.payload === "object" && record.payload ? record.payload : null;

    if (kind === "response_item" && payload && (payload as { type?: unknown }).type === "message") {
      const payloadRecord = payload as Record<string, unknown>;
      const role = payloadRecord.role ? String(payloadRecord.role) : undefined;
      const text = extractCodexContent(payloadRecord.content);
      return {
        id: `${kind}-${index}`,
        source: "codex",
        kind: "message",
        role,
        timestamp: typeof record.timestamp === "string" ? record.timestamp : undefined,
        text,
        raw: entry,
      };
    }

    if (
      kind === "event_msg" &&
      payload &&
      typeof (payload as { type?: unknown }).type === "string"
    ) {
      const payloadRecord = payload as Record<string, unknown>;
      const payloadType = String(payloadRecord.type);
      if (payloadType === "user_message" || payloadType === "agent_message") {
        const role = payloadType === "user_message" ? "user" : "assistant";
        const text = typeof payloadRecord.message === "string" ? payloadRecord.message : undefined;
        return {
          id: `${payloadType}-${index}`,
          source: "codex",
          kind: "message",
          role,
          timestamp: typeof record.timestamp === "string" ? record.timestamp : undefined,
          text,
          raw: entry,
        };
      }

      return {
        id: `${payloadType}-${index}`,
        source: "codex",
        kind: payloadType,
        timestamp: typeof record.timestamp === "string" ? record.timestamp : undefined,
        text: payloadType,
        raw: entry,
      };
    }

    return {
      id: `${kind}-${index}`,
      source: "codex",
      kind,
      timestamp: typeof record.timestamp === "string" ? record.timestamp : undefined,
      text:
        payload && typeof (payload as { type?: unknown }).type === "string"
          ? String((payload as { type?: unknown }).type)
          : undefined,
      raw: entry,
    };
  }

  return {
    id: `entry-${index}`,
    source: "unknown",
    kind: "entry",
    raw: entry,
  };
}

function summarizeRole(role?: string) {
  if (!role) return "Event";
  if (role === "assistant") return "Assistant";
  if (role === "user") return "User";
  if (role === "developer") return "Developer";
  if (role === "system") return "System";
  return role;
}

export default function ChatUploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [entries, setEntries] = useState<unknown[]>([]);
  const [format, setFormat] = useState<SessionFormat>("unknown");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setFileName(file.name);

    try {
      const contents = await file.text();
      const parsedEntries = parseJsonInput(contents);
      const detected = detectFormat(parsedEntries);

      setEntries(parsedEntries);
      setFormat(detected);
      setSelectedId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse file";
      setParseError(message);
      setEntries([]);
      setFormat("unknown");
      setSelectedId(null);
    }
  }, []);

  const normalized = useMemo(
    () => entries.map((entry, index) => normalizeEntry(entry, format, index)),
    [entries, format],
  );

  const messages = useMemo(
    () => normalized.filter((entry) => entry.kind === "message"),
    [normalized],
  );

  const selectedEntry = useMemo(
    () => normalized.find((entry) => entry.id === selectedId) ?? null,
    [normalized, selectedId],
  );

  const summary = useMemo(() => {
    if (format === "codex") {
      const meta = entries.find(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { type?: string }).type === "session_meta",
      ) as { payload?: { id?: string } } | undefined;
      return meta?.payload?.id;
    }

    if (format === "claude") {
      const first = entries[0];
      if (typeof first === "object" && first !== null) {
        const record = first as Record<string, unknown>;
        const sessionValue = record.sessionId ?? record.session_id ?? record.conversation_id;
        if (sessionValue) return String(sessionValue);
      }
    }

    return undefined;
  }, [entries, format]);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        void handleFile(file);
      }
    },
    [handleFile],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const triggerPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen overflow-hidden bg-background">
        <Sidebar />

        <SidebarInset className="flex flex-1 flex-col overflow-hidden p-3">
          <Header className="flex items-center w-full px-1" />

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 left-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-12 right-10 h-48 w-48 rounded-full bg-accent/50 blur-[90px]" />
            </div>

            <div className="relative z-10 flex flex-1 flex-col gap-6 overflow-hidden">
              <div className="flex flex-wrap items-end justify-between gap-4 px-1">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Chat upload
                  </p>
                  <h1 className="text-2xl font-semibold text-foreground">Preview a session file</h1>
                  <p className="text-sm text-muted-foreground">
                    Drop a JSON or JSONL export from Codex or Claude to see a structured preview.
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "relative flex flex-col gap-3 rounded-2xl border border-dashed p-6 transition-all",
                  "bg-card/80 shadow-sm",
                  dragActive ? "border-primary bg-primary/5" : "border-border",
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".json,.jsonl,application/json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <UploadCloudIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <TextShimmer className="text-base font-semibold">
                        Drag & drop a session file
                      </TextShimmer>
                      <p className="text-sm text-muted-foreground">
                        JSON or JSONL files from Codex CLI or Claude projects.
                      </p>
                    </div>
                  </div>
                  <Button onClick={triggerPicker} className="gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Choose file
                  </Button>
                </div>

                {fileName && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <FileTextIcon className="h-4 w-4" />
                    <span>{fileName}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide">
                      {format}
                    </span>
                    {summary && (
                      <span className="rounded-full bg-accent/50 px-2 py-0.5 text-xs">
                        Session {summary}
                      </span>
                    )}
                  </div>
                )}

                {parseError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangleIcon className="mt-0.5 h-4 w-4" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>

              {normalized.length > 0 ? (
                <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
                  <div className="flex min-h-0 flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Entries
                        </p>
                        <p className="text-lg font-semibold text-foreground">{normalized.length}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Messages
                        </p>
                        <p className="text-lg font-semibold text-foreground">{messages.length}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Format
                        </p>
                        <p className="text-lg font-semibold text-foreground">{format}</p>
                      </div>
                    </div>

                    <Tabs defaultValue="conversation" className="flex min-h-0 flex-1 flex-col">
                      <TabsList className="w-fit">
                        <TabsTrigger value="conversation">Conversation</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      </TabsList>

                      <TabsContent value="conversation" className="min-h-0 flex-1">
                        <ScrollArea className="h-full rounded-2xl border border-border bg-card/60 p-4">
                          <div className="flex flex-col gap-4">
                            {messages.length === 0 && (
                              <p className="text-sm text-muted-foreground">No messages detected.</p>
                            )}
                            {messages.map((entry) => (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedId(entry.id)}
                                className={cn(
                                  "group flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition",
                                  entry.role === "user"
                                    ? "self-end border-primary/30 bg-primary text-primary-foreground"
                                    : "border-border bg-background",
                                  selectedId === entry.id
                                    ? "ring-2 ring-primary/40"
                                    : "hover:border-primary/40",
                                )}
                              >
                                <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-70">
                                  <span>{summarizeRole(entry.role)}</span>
                                  {entry.timestamp && <span>{entry.timestamp}</span>}
                                </div>
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                  {entry.text || "(no text)"}
                                </p>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="timeline" className="min-h-0 flex-1">
                        <ScrollArea className="h-full rounded-2xl border border-border bg-card/60 p-4">
                          <div className="flex flex-col gap-3">
                            {normalized.map((entry) => (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedId(entry.id)}
                                className={cn(
                                  "rounded-xl border border-border bg-background px-3 py-2 text-left text-sm transition",
                                  selectedId === entry.id
                                    ? "border-primary/50 ring-2 ring-primary/20"
                                    : "hover:border-primary/40",
                                )}
                              >
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="uppercase tracking-wide">{entry.kind}</span>
                                  {entry.timestamp && <span>{entry.timestamp}</span>}
                                </div>
                                <div className="mt-1 text-sm text-foreground">
                                  {entry.text || summarizeRole(entry.role)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex min-h-0 flex-col gap-4">
                    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Selected entry
                      </p>
                      {selectedEntry ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide">
                              {selectedEntry.kind}
                            </span>
                            {selectedEntry.role && (
                              <span className="rounded-full bg-accent/50 px-2 py-0.5 text-xs uppercase tracking-wide">
                                {summarizeRole(selectedEntry.role)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedEntry.timestamp ?? "No timestamp"}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click a message or event to inspect details.
                        </p>
                      )}
                    </div>

                    <div className="min-h-0 flex-1 rounded-2xl border border-border bg-card/60 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Raw JSON
                      </p>
                      <ScrollArea className="mt-3 h-full rounded-xl border border-border bg-background/80 p-3">
                        <pre className="text-xs leading-relaxed text-foreground">
                          {selectedEntry
                            ? JSON.stringify(selectedEntry.raw, null, JSON_INDENT)
                            : "Select an entry to view the raw payload."}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
                  Upload a JSON or JSONL session file to see the preview panels.
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
