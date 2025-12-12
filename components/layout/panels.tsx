"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { HORIZONTAL_COOKIE, VERTICAL_COOKIE } from "./sizing";

interface ChatPanelContextValue {
  isCollapsed: boolean;
  toggleChatPanel: () => void;
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function useChatPanel() {
  const context = useContext(ChatPanelContext);
  if (!context) {
    throw new Error("useChatPanel must be used within a Horizontal component");
  }
  return context;
}

interface HandleProps {
  onDoubleClick?: () => void;
}

function HorizontalHandle({ onDoubleClick }: HandleProps) {
  return (
    <PanelResizeHandle
      className="group w-2 flex items-center justify-center"
      onDoubleClick={onDoubleClick}
    >
      <div className="h-8 w-1 rounded-full bg-border group-hover:bg-muted-foreground/50 group-data-[resize-handle-active]:bg-muted-foreground transition-colors" />
    </PanelResizeHandle>
  );
}

function VerticalHandle({ onDoubleClick }: HandleProps) {
  return (
    <PanelResizeHandle
      className="group h-2 flex items-center justify-center"
      onDoubleClick={onDoubleClick}
    >
      <div className="w-8 h-1 rounded-full bg-border group-hover:bg-muted-foreground/50 group-data-[resize-handle-active]:bg-muted-foreground transition-colors" />
    </PanelResizeHandle>
  );
}

const DEFAULT_HORIZONTAL = [33.33, 66.66];
const DEFAULT_VERTICAL = [66.66, 33.33];

interface HProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLayout: number[];
}

export function Horizontal({ defaultLayout, left, right }: HProps) {
  const groupRef = useRef<ImperativePanelGroupHandle>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onLayout = (sizes: number[]) => {
    document.cookie = `${HORIZONTAL_COOKIE}=${JSON.stringify(sizes)}`;
  };

  const resetLayout = () => {
    groupRef.current?.setLayout(DEFAULT_HORIZONTAL);
  };

  const toggleChatPanel = useCallback(() => {
    if (leftPanelRef.current) {
      if (isCollapsed) {
        leftPanelRef.current.expand();
      } else {
        leftPanelRef.current.collapse();
      }
    }
  }, [isCollapsed]);

  const handleCollapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const handleExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  return (
    <ChatPanelContext.Provider value={{ isCollapsed, toggleChatPanel }}>
      <PanelGroup ref={groupRef} direction="horizontal" onLayout={onLayout}>
        <Panel
          ref={leftPanelRef}
          defaultSize={defaultLayout[0]}
          collapsible
          collapsedSize={0}
          minSize={15}
          onCollapse={handleCollapse}
          onExpand={handleExpand}
        >
          {left}
        </Panel>
        <HorizontalHandle onDoubleClick={resetLayout} />
        <Panel defaultSize={defaultLayout[1]}>{right}</Panel>
      </PanelGroup>
    </ChatPanelContext.Provider>
  );
}

interface VProps {
  defaultLayout: number[];
  top: React.ReactNode;
  bottom: React.ReactNode;
}

export function Vertical({ defaultLayout, top, bottom }: VProps) {
  const ref = useRef<ImperativePanelGroupHandle>(null);

  const onLayout = (sizes: number[]) => {
    document.cookie = `${VERTICAL_COOKIE}=${JSON.stringify(sizes)}`;
  };

  const resetLayout = () => {
    ref.current?.setLayout(DEFAULT_VERTICAL);
  };

  return (
    <PanelGroup ref={ref} direction="vertical" onLayout={onLayout}>
      <Panel defaultSize={defaultLayout[0]}>{top}</Panel>
      <VerticalHandle onDoubleClick={resetLayout} />
      <Panel defaultSize={defaultLayout[1]}>{bottom}</Panel>
    </PanelGroup>
  );
}
