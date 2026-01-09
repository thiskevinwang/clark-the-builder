"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  Code2Icon,
  ExternalLinkIcon,
  EyeIcon,
  FileIcon,
  FolderIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RefreshCwIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarLoader } from "react-spinners";

import { buildFileTree, type FileNode } from "@/components/file-explorer/build-file-tree";
import { FileContent } from "@/components/file-explorer/file-content";
import { useChatPanel } from "@/components/layout/panels";
import { Panel } from "@/components/panels/panels";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ViewMode = "preview" | "files";

interface Props {
  className?: string;
  disabled?: boolean;
  url?: string;
  paths: string[];
  sandboxId?: string;
}

export function PreviewPanel({ className, disabled, url, paths, sandboxId }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [currentUrl, setCurrentUrl] = useState(url);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(url || "");
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadStartTime = useRef<number | null>(null);

  // File explorer state
  const fileTree = useMemo(() => buildFileTree(paths), [paths]);
  const [selected, setSelected] = useState<FileNode | null>(null);
  const [fs, setFs] = useState<FileNode[]>(fileTree);

  useEffect(() => {
    setFs(fileTree);
  }, [fileTree]);

  useEffect(() => {
    setCurrentUrl(url);
    setInputValue(url || "");
  }, [url]);

  const refreshIframe = () => {
    if (iframeRef.current && currentUrl) {
      setIsLoading(true);
      setError(null);
      loadStartTime.current = Date.now();
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentUrl;
        }
      }, 10);
    }
  };

  const loadNewUrl = () => {
    if (iframeRef.current && inputValue) {
      if (inputValue !== currentUrl) {
        setIsLoading(true);
        setError(null);
        loadStartTime.current = Date.now();
        iframeRef.current.src = inputValue;
      } else {
        refreshIframe();
      }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load the page");
  };

  const toggleFolder = useCallback((path: string) => {
    setFs((prev) => {
      const updateNode = (nodes: FileNode[]): FileNode[] =>
        nodes.map((node) => {
          if (node.path === path && node.type === "folder") {
            return { ...node, expanded: !node.expanded };
          } else if (node.children) {
            return { ...node, children: updateNode(node.children) };
          } else {
            return node;
          }
        });
      return updateNode(prev);
    });
  }, []);

  const selectFile = useCallback((node: FileNode) => {
    if (node.type === "file") {
      setSelected(node);
    }
  }, []);

  const renderFileTree = useCallback(
    (nodes: FileNode[], depth = 0) => {
      return nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={depth}
          selected={selected}
          onToggleFolder={toggleFolder}
          onSelectFile={selectFile}
          renderFileTree={renderFileTree}
        />
      ));
    },
    [selected, toggleFolder, selectFile],
  );

  return (
    <Panel className={className}>
      {/* URL Bar */}
      <div className="text-sm flex items-center border-b border-border px-2 py-1.5 text-foreground bg-secondary/50 gap-1">
        {/* Left side: Chat Toggle and View Toggle */}
        <div className="flex items-center gap-0.5">
          <ChatPanelToggle />

          <div className="flex items-center border border-border rounded-md bg-background ml-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "p-1.5 transition-colors border-r border-border",
                    viewMode === "preview"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("files")}
                  className={cn(
                    "p-1.5 transition-colors",
                    viewMode === "files"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Code2Icon className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Files</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Center: URL Input or File Path */}
        <div className="flex-1 flex justify-center px-2">
          {viewMode === "preview" ? (
            <input
              type="text"
              className="text-xs h-7 border border-border px-3 bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary w-full max-w-md"
              onChange={(event) => setInputValue(event.target.value)}
              onClick={(event) => event.currentTarget.select()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                  loadNewUrl();
                }
              }}
              value={inputValue}
              placeholder="https://..."
            />
          ) : viewMode === "files" && selected ? (
            <span className="text-xs text-muted-foreground font-mono truncate max-w-md">
              {selected.path}
            </span>
          ) : null}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-0.5">
          {viewMode === "preview" && url && (
            <div className="flex items-center border border-border rounded-md bg-background">
              <button
                onClick={refreshIframe}
                type="button"
                className={cn(
                  "p-1.5 text-muted-foreground hover:text-foreground transition-colors border-r border-border",
                  { "animate-spin": isLoading },
                )}
                title="Refresh"
              >
                <RefreshCwIcon className="w-3.5 h-3.5" />
              </button>
              <a
                href={currentUrl}
                target="_blank"
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Open in new tab"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === "preview" ? (
          <>
            {currentUrl && !disabled && (
              <>
                <iframe
                  ref={iframeRef}
                  src={currentUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title="Browser content"
                />

                {isLoading && !error && (
                  <div className="absolute inset-0 bg-card/90 flex items-center justify-center flex-col gap-3 z-10">
                    <BarLoader color="var(--primary)" />
                    <span className="text-muted-foreground text-sm">Loading...</span>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 bg-card flex items-center justify-center flex-col gap-3 z-10">
                    <span className="text-destructive font-medium">Failed to load page</span>
                    <button
                      className="text-primary hover:underline text-sm font-medium"
                      type="button"
                      onClick={() => {
                        if (currentUrl) {
                          setIsLoading(true);
                          setError(null);
                          const newUrl = new URL(currentUrl);
                          newUrl.searchParams.set("t", Date.now().toString());
                          setCurrentUrl(newUrl.toString());
                        }
                      }}
                    >
                      Try again
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex text-sm">
            <ScrollArea className="w-1/4 border-r border-border shrink-0 bg-secondary/30">
              <div className="py-1">{renderFileTree(fs)}</div>
            </ScrollArea>
            {selected && sandboxId && !disabled && (
              <ScrollArea className="w-3/4 shrink-0">
                <FileContent sandboxId={sandboxId} path={selected.path.substring(1)} />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

// Chat panel toggle button component
function ChatPanelToggle() {
  const { isCollapsed, toggleChatPanel } = useChatPanel();

  return (
    <div className="flex items-center border border-border rounded-md bg-background">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleChatPanel}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpenIcon className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftCloseIcon className="w-3.5 h-3.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{isCollapsed ? "Show chat" : "Hide chat"}</TooltipContent>
      </Tooltip>
    </div>
  );
}

// Memoized file tree node component
const FileTreeNode = memo(function FileTreeNode({
  node,
  depth,
  selected,
  onToggleFolder,
  onSelectFile,
  renderFileTree,
}: {
  node: FileNode;
  depth: number;
  selected: FileNode | null;
  onToggleFolder: (path: string) => void;
  onSelectFile: (node: FileNode) => void;
  renderFileTree: (nodes: FileNode[], depth: number) => React.ReactNode;
}) {
  const handleClick = useCallback(() => {
    if (node.type === "folder") {
      onToggleFolder(node.path);
    } else {
      onSelectFile(node);
    }
  }, [node, onToggleFolder, onSelectFile]);

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer transition-colors text-sm",
          "hover:bg-accent",
          selected?.path === node.path
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          <>
            {node.expanded ? (
              <ChevronDownIcon className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ChevronRightIcon className="w-3.5 h-3.5 mr-1" />
            )}
            <FolderIcon className="w-4 h-4 mr-2 text-primary/70" />
          </>
        ) : (
          <>
            <div className="w-3.5 mr-1" />
            <FileIcon className="w-4 h-4 mr-2" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {node.type === "folder" && node.expanded && node.children && (
        <div>{renderFileTree(node.children, depth + 1)}</div>
      )}
    </div>
  );
});
