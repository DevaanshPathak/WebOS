"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";

type AppId =
  | "welcome"
  | "terminal"
  | "writer"
  | "monitor"
  | "profile"
  | "research"
  | "contact";

type WindowModel = {
  id: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
};

type AppDefinition = {
  id: AppId;
  title: string;
  shortTitle: string;
  icon: string;
  accent: string;
  defaultWindow: WindowModel;
};

type DesktopSize = {
  width: number;
  height: number;
};

type SnapPreview = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

type Interaction =
  | {
      type: "move";
      id: AppId;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      width: number;
      height: number;
    }
  | {
      type: "resize";
      id: AppId;
      startX: number;
      startY: number;
      originWidth: number;
      originHeight: number;
      originX: number;
      originY: number;
    };

type BlogEntry = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  path: string;
  sourcePath: string;
};

type TerminalLine = {
  kind: "system" | "input" | "output" | "error";
  text: string;
};

type LayoutSnapshot = {
  windows: WindowModel[];
  nextZ: number;
};

const STORAGE_KEY = "webos-1-window-layout-v3";
const TASKBAR_HEIGHT = 52;
const SNAP_EDGE = 36;

const appDefinitions: AppDefinition[] = [
  {
    id: "welcome",
    title: "Welcome",
    shortTitle: "Welcome",
    icon: "W1",
    accent: "from-sky-500 to-cyan-300",
    defaultWindow: {
      id: "welcome",
      title: "Welcome",
      x: 156,
      y: 78,
      width: 600,
      height: 420,
      minWidth: 360,
      minHeight: 280,
      isOpen: true,
      isMinimized: false,
      zIndex: 12
    }
  },
  {
    id: "terminal",
    title: "Terminal",
    shortTitle: "Terminal",
    icon: "C:\\",
    accent: "from-emerald-500 to-lime-300",
    defaultWindow: {
      id: "terminal",
      title: "Terminal",
      x: 812,
      y: 94,
      width: 520,
      height: 390,
      minWidth: 380,
      minHeight: 280,
      isOpen: true,
      isMinimized: false,
      zIndex: 14
    }
  },
  {
    id: "writer",
    title: "WordPad",
    shortTitle: "WordPad",
    icon: "DOC",
    accent: "from-blue-600 to-indigo-300",
    defaultWindow: {
      id: "writer",
      title: "WordPad",
      x: 190,
      y: 122,
      width: 760,
      height: 560,
      minWidth: 520,
      minHeight: 360,
      isOpen: false,
      isMinimized: false,
      zIndex: 10
    }
  },
  {
    id: "monitor",
    title: "System Monitor",
    shortTitle: "Monitor",
    icon: "CPU",
    accent: "from-teal-500 to-green-300",
    defaultWindow: {
      id: "monitor",
      title: "System Monitor",
      x: 884,
      y: 512,
      width: 420,
      height: 340,
      minWidth: 340,
      minHeight: 280,
      isOpen: true,
      isMinimized: false,
      zIndex: 13
    }
  },
  {
    id: "profile",
    title: "Profile",
    shortTitle: "Profile",
    icon: "DP",
    accent: "from-amber-500 to-orange-300",
    defaultWindow: {
      id: "profile",
      title: "Profile",
      x: 72,
      y: 126,
      width: 540,
      height: 500,
      minWidth: 420,
      minHeight: 360,
      isOpen: false,
      isMinimized: false,
      zIndex: 9
    }
  },
  {
    id: "research",
    title: "Research",
    shortTitle: "Research",
    icon: "SRE",
    accent: "from-violet-500 to-fuchsia-300",
    defaultWindow: {
      id: "research",
      title: "Research",
      x: 442,
      y: 210,
      width: 600,
      height: 450,
      minWidth: 440,
      minHeight: 320,
      isOpen: false,
      isMinimized: false,
      zIndex: 8
    }
  },
  {
    id: "contact",
    title: "Uplink",
    shortTitle: "Uplink",
    icon: "NET",
    accent: "from-slate-500 to-slate-200",
    defaultWindow: {
      id: "contact",
      title: "Uplink",
      x: 980,
      y: 230,
      width: 380,
      height: 320,
      minWidth: 320,
      minHeight: 250,
      isOpen: false,
      isMinimized: false,
      zIndex: 7
    }
  }
];

const appMap = new Map(appDefinitions.map((app) => [app.id, app]));
const defaultWindows = appDefinitions.map((app) => app.defaultWindow);

const bootLines = [
  "WEBOS-1 BIOS 0.3.0",
  "firmware: stardance-desktop-rom",
  "cpu: browser-thread virtual core online",
  "memory check: 65536 KB ok",
  "nvram: localStorage layout service ready",
  "display: desktop compositor attached",
  "input: pointer and keyboard drivers loaded",
  "network: static host bridge configured",
  "portfolio disk: /portfolio mounted",
  "fake login: public session granted",
  "handoff: explorer shell"
];

const profileFacts = [
  ["Name", "Devaansh Pathak"],
  ["Track", "CS + AI/ML student"],
  ["Focus", "Reliable LLM agents, RL environments, evaluation systems"],
  ["Current thread", "SRE-Zero"],
  ["Website", "devaanshpathak.com"]
];

const researchFocus = [
  "Environment-grounded evaluation for tool-using agents",
  "Simulated incident response workflows",
  "Evidence gathering, remediation quality, and recovery",
  "Post-training feedback loops and benchmark infrastructure",
  "Tokenizer inspection and prompt-layer evaluation tooling"
];

const terminalIntro: TerminalLine[] = [
  { kind: "system", text: "WebOS Terminal [static session]" },
  { kind: "system", text: "Type 'help' for commands." }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
}

function validateLayout(input: unknown): LayoutSnapshot | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<LayoutSnapshot>;
  if (!Array.isArray(candidate.windows)) {
    return null;
  }

  const merged = defaultWindows.map((base) => {
    const saved = candidate.windows?.find((item) => item.id === base.id);

    if (!saved) {
      return base;
    }

    return {
      ...base,
      x: Number.isFinite(saved.x) ? saved.x : base.x,
      y: Number.isFinite(saved.y) ? saved.y : base.y,
      width: Number.isFinite(saved.width) ? saved.width : base.width,
      height: Number.isFinite(saved.height) ? saved.height : base.height,
      isOpen: Boolean(saved.isOpen),
      isMinimized: Boolean(saved.isMinimized),
      zIndex: Number.isFinite(saved.zIndex) ? saved.zIndex : base.zIndex
    };
  });

  const highestZ = Math.max(...merged.map((item) => item.zIndex), 20);
  return {
    windows: merged,
    nextZ:
      typeof candidate.nextZ === "number" && Number.isFinite(candidate.nextZ)
        ? Math.max(candidate.nextZ, highestZ + 1)
        : highestZ + 1
  };
}

function getSnapPreview(
  pointerX: number,
  pointerY: number,
  bounds: DOMRect,
  size: DesktopSize
): SnapPreview | null {
  const x = pointerX - bounds.left;
  const y = pointerY - bounds.top;
  const nearLeft = x <= SNAP_EDGE;
  const nearRight = x >= size.width - SNAP_EDGE;
  const nearTop = y <= SNAP_EDGE;
  const nearBottom = y >= size.height - SNAP_EDGE;
  const halfWidth = Math.round(size.width / 2);
  const halfHeight = Math.round(size.height / 2);

  if (nearLeft && nearTop) {
    return { x: 8, y: 8, width: halfWidth - 12, height: halfHeight - 12, label: "Top left" };
  }

  if (nearRight && nearTop) {
    return {
      x: halfWidth + 4,
      y: 8,
      width: halfWidth - 12,
      height: halfHeight - 12,
      label: "Top right"
    };
  }

  if (nearLeft && nearBottom) {
    return {
      x: 8,
      y: halfHeight + 4,
      width: halfWidth - 12,
      height: halfHeight - 12,
      label: "Bottom left"
    };
  }

  if (nearRight && nearBottom) {
    return {
      x: halfWidth + 4,
      y: halfHeight + 4,
      width: halfWidth - 12,
      height: halfHeight - 12,
      label: "Bottom right"
    };
  }

  if (nearLeft) {
    return { x: 8, y: 8, width: halfWidth - 12, height: size.height - 16, label: "Left half" };
  }

  if (nearRight) {
    return {
      x: halfWidth + 4,
      y: 8,
      width: halfWidth - 12,
      height: size.height - 16,
      label: "Right half"
    };
  }

  if (nearTop) {
    return { x: 8, y: 8, width: size.width - 16, height: size.height - 16, label: "Maximize" };
  }

  return null;
}

export function WebDesktop() {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const [windows, setWindows] = useState<WindowModel[]>(defaultWindows);
  const [nextZ, setNextZ] = useState(30);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [snapPreview, setSnapPreview] = useState<SnapPreview | null>(null);
  const [desktopSize, setDesktopSize] = useState<DesktopSize>({
    width: 1280,
    height: 720
  });
  const [bootVisible, setBootVisible] = useState(true);
  const [clock, setClock] = useState("--:--");
  const [dateLabel, setDateLabel] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  const visibleWindows = useMemo(
    () => windows.filter((item) => item.isOpen && !item.isMinimized),
    [windows]
  );

  const openWindows = useMemo(
    () => windows.filter((item) => item.isOpen),
    [windows]
  );

  const bringToFront = useCallback((id: AppId) => {
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, zIndex: nextZ } : item))
    );
    setNextZ((value) => value + 1);
  }, [nextZ]);

  const updateWindow = useCallback(
    (id: AppId, changes: Partial<WindowModel>) => {
      setWindows((current) =>
        current.map((item) => (item.id === id ? { ...item, ...changes } : item))
      );
    },
    []
  );

  const launchWindow = useCallback(
    (id: AppId) => {
      setWindows((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                isOpen: true,
                isMinimized: false,
                zIndex: nextZ
              }
            : item
        )
      );
      setNextZ((value) => value + 1);
      setStartOpen(false);
    },
    [nextZ]
  );

  const resetLayout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setWindows(defaultWindows);
    setNextZ(30);
    setSnapPreview(null);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = validateLayout(JSON.parse(raw));
        if (parsed) {
          setWindows(parsed.windows);
          setNextZ(parsed.nextZ);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLayoutReady(true);
    }
  }, []);

  useEffect(() => {
    if (!layoutReady) {
      return;
    }

    const snapshot: LayoutSnapshot = { windows, nextZ };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [layoutReady, nextZ, windows]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBootVisible(false), 4800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(formatClock(now));
      setDateLabel(formatDate(now));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!desktopRef.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      setDesktopSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(desktopRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!interaction) {
      return;
    }

    const active = interaction;

    function handlePointerMove(event: PointerEvent) {
      const availableWidth = Math.max(340, desktopSize.width);
      const availableHeight = Math.max(380, desktopSize.height);
      const bounds = desktopRef.current?.getBoundingClientRect();

      if (active.type === "move" && bounds) {
        setSnapPreview(getSnapPreview(event.clientX, event.clientY, bounds, desktopSize));
      }

      setWindows((current) =>
        current.map((item) => {
          if (item.id !== active.id) {
            return item;
          }

          if (active.type === "move") {
            const nextX = clamp(
              active.originX + event.clientX - active.startX,
              8,
              availableWidth - active.width - 8
            );
            const nextY = clamp(
              active.originY + event.clientY - active.startY,
              8,
              availableHeight - active.height - 8
            );

            return { ...item, x: nextX, y: nextY };
          }

          const width = clamp(
            active.originWidth + event.clientX - active.startX,
            item.minWidth,
            availableWidth - active.originX - 8
          );
          const height = clamp(
            active.originHeight + event.clientY - active.startY,
            item.minHeight,
            availableHeight - active.originY - 8
          );

          return { ...item, width, height };
        })
      );
    }

    function handlePointerUp() {
      if (active.type === "move" && snapPreview) {
        updateWindow(active.id, {
          x: snapPreview.x,
          y: snapPreview.y,
          width: snapPreview.width,
          height: snapPreview.height
        });
      }

      setInteraction(null);
      setSnapPreview(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [desktopSize, interaction, snapPreview, updateWindow]);

  function startMove(event: ReactPointerEvent, item: WindowModel) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    bringToFront(item.id);
    setInteraction({
      type: "move",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      width: item.width,
      height: item.height
    });
  }

  function startResize(event: ReactPointerEvent, item: WindowModel) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    bringToFront(item.id);
    setInteraction({
      type: "resize",
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: item.width,
      originHeight: item.height,
      originX: item.x,
      originY: item.y
    });
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-slate-950">
      <section className="relative flex h-screen flex-col overflow-hidden">
        <div className="desktop-wallpaper absolute inset-0" />

        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          data-desktop
          onPointerDown={() => setStartOpen(false)}
          ref={desktopRef}
        >
          <DesktopIcons launchWindow={launchWindow} />

          {snapPreview ? (
            <div
              className="pointer-events-none absolute z-30 rounded-md border-2 border-sky-200/90 bg-sky-300/20 shadow-[0_0_60px_rgba(125,211,252,0.25)]"
              data-snap-preview
              style={{
                height: snapPreview.height,
                left: snapPreview.x,
                top: snapPreview.y,
                width: snapPreview.width
              }}
            >
              <span className="absolute left-3 top-3 rounded bg-sky-950/80 px-2 py-1 text-xs font-semibold text-sky-100">
                {snapPreview.label}
              </span>
            </div>
          ) : null}

          {visibleWindows.map((item) => (
            <DesktopWindow
              desktopSize={desktopSize}
              key={item.id}
              onClose={() =>
                updateWindow(item.id, { isOpen: false, isMinimized: false })
              }
              onFocus={() => bringToFront(item.id)}
              onMinimize={() => updateWindow(item.id, { isMinimized: true })}
              onMoveStart={(event) => startMove(event, item)}
              onResizeStart={(event) => startResize(event, item)}
              window={item}
            >
              <WindowContent
                id={item.id}
                launchWindow={launchWindow}
                resetLayout={resetLayout}
              />
            </DesktopWindow>
          ))}
        </div>

        <Taskbar
          clock={clock}
          dateLabel={dateLabel}
          launchWindow={launchWindow}
          openWindows={openWindows}
          resetLayout={resetLayout}
          startOpen={startOpen}
          toggleStart={() => setStartOpen((value) => !value)}
          updateWindow={updateWindow}
        />

        {bootVisible ? <BootOverlay onDismiss={() => setBootVisible(false)} /> : null}
      </section>
    </main>
  );
}

function DesktopIcons({ launchWindow }: { launchWindow: (id: AppId) => void }) {
  return (
    <div className="absolute left-5 top-5 z-10 grid w-24 auto-rows-max gap-4">
      {appDefinitions.map((app) => (
        <button
          className="group flex min-h-20 flex-col items-center justify-start gap-1 rounded px-2 py-1 text-center text-white outline-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)] transition hover:bg-white/15 focus:bg-white/20"
          data-launcher={app.id}
          key={app.id}
          onClick={() => launchWindow(app.id)}
          type="button"
        >
          <span
            className={`grid size-11 place-items-center rounded-md border border-white/50 bg-gradient-to-br ${app.accent} text-[10px] font-black text-white shadow-lg shadow-black/30`}
          >
            {app.icon}
          </span>
          <span className="max-w-20 text-[12px] font-semibold leading-tight">
            {app.shortTitle}
          </span>
        </button>
      ))}
    </div>
  );
}

function DesktopWindow({
  children,
  desktopSize,
  onClose,
  onFocus,
  onMinimize,
  onMoveStart,
  onResizeStart,
  window
}: {
  children: ReactNode;
  desktopSize: DesktopSize;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMoveStart: (event: ReactPointerEvent) => void;
  onResizeStart: (event: ReactPointerEvent) => void;
  window: WindowModel;
}) {
  const app = appMap.get(window.id);
  const width = Math.min(window.width, Math.max(window.minWidth, desktopSize.width - 16));
  const height = Math.min(window.height, Math.max(window.minHeight, desktopSize.height - 16));
  const x = clamp(window.x, 8, desktopSize.width - width - 8);
  const y = clamp(window.y, 8, desktopSize.height - height - 8);

  return (
    <section
      className="absolute flex flex-col overflow-hidden rounded-md border border-slate-400/80 bg-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
      data-window={window.id}
      onPointerDown={onFocus}
      style={
        {
          "--accent": app?.accent ?? "from-sky-500 to-cyan-300",
          height,
          transform: `translate3d(${x}px, ${y}px, 0)`,
          width,
          zIndex: window.zIndex
        } as CSSProperties
      }
    >
      <div
        className="flex h-9 cursor-grab touch-none select-none items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 pl-2 text-white active:cursor-grabbing"
        data-window-title={window.id}
        onPointerDown={onMoveStart}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`grid size-5 place-items-center rounded-sm bg-gradient-to-br ${app?.accent ?? "from-sky-500 to-cyan-300"} text-[8px] font-black`}
          >
            {app?.icon ?? "APP"}
          </span>
          <span className="truncate text-[13px] font-semibold">{window.title}</span>
        </div>

        <div className="flex h-full shrink-0">
          <button
            aria-label={`Minimize ${window.title}`}
            className="grid h-full w-10 place-items-center text-sm transition hover:bg-white/15"
            onClick={(event) => {
              event.stopPropagation();
              onMinimize();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            _
          </button>
          <button
            aria-label={`Close ${window.title}`}
            className="grid h-full w-10 place-items-center text-sm transition hover:bg-red-600"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            x
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-slate-50">{children}</div>

      <button
        aria-label={`Resize ${window.title}`}
        className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize touch-none border-b-2 border-r-2 border-slate-500/80"
        data-resize-handle={window.id}
        onPointerDown={onResizeStart}
        type="button"
      />
    </section>
  );
}

function Taskbar({
  clock,
  dateLabel,
  launchWindow,
  openWindows,
  resetLayout,
  startOpen,
  toggleStart,
  updateWindow
}: {
  clock: string;
  dateLabel: string;
  launchWindow: (id: AppId) => void;
  openWindows: WindowModel[];
  resetLayout: () => void;
  startOpen: boolean;
  toggleStart: () => void;
  updateWindow: (id: AppId, changes: Partial<WindowModel>) => void;
}) {
  return (
    <footer
      className="relative z-40 flex h-[52px] shrink-0 items-center gap-2 border-t border-white/20 bg-slate-950/82 px-2 text-white shadow-[0_-12px_35px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      style={{ height: TASKBAR_HEIGHT }}
    >
      {startOpen ? (
        <StartMenu
          launchWindow={launchWindow}
          resetLayout={resetLayout}
        />
      ) : null}

      <button
        className="flex h-10 items-center gap-2 rounded-md bg-sky-500 px-4 text-sm font-bold text-white shadow hover:bg-sky-400"
        data-start-button
        onClick={(event) => {
          event.stopPropagation();
          toggleStart();
        }}
        type="button"
      >
        <span className="grid size-5 place-items-center rounded bg-white text-xs font-black text-sky-600">
          W
        </span>
        Start
      </button>

      <div className="flex h-10 items-center gap-1 border-l border-white/15 pl-2">
        {["terminal", "writer", "monitor"].map((id) => {
          const app = appMap.get(id as AppId);
          if (!app) {
            return null;
          }

          return (
            <button
              className="grid size-10 place-items-center rounded-md text-xs font-black hover:bg-white/15"
              data-pinned-app={id}
              key={id}
              onClick={() => launchWindow(id as AppId)}
              title={app.title}
              type="button"
            >
              <span
                className={`grid size-7 place-items-center rounded bg-gradient-to-br ${app.accent} text-[8px] text-white`}
              >
                {app.icon}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {openWindows.map((item) => {
          const app = appMap.get(item.id);

          return (
            <button
              className={`flex h-10 min-w-36 max-w-52 items-center gap-2 rounded-md border px-3 text-left text-xs transition ${
                item.isMinimized
                  ? "border-white/10 bg-white/5 text-slate-300"
                  : "border-sky-300/50 bg-sky-500/22 text-white"
              }`}
              data-taskbar-app={item.id}
              key={item.id}
              onClick={() =>
                item.isMinimized
                  ? launchWindow(item.id)
                  : updateWindow(item.id, { isMinimized: true })
              }
              type="button"
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded bg-gradient-to-br ${app?.accent ?? "from-slate-500 to-slate-300"} text-[8px] font-black`}
              >
                {app?.icon ?? "APP"}
              </span>
              <span className="truncate">{item.title}</span>
            </button>
          );
        })}
      </div>

      <div className="min-w-24 rounded px-2 py-1 text-right text-[11px] leading-4 hover:bg-white/10">
        <div>{clock}</div>
        <div className="text-slate-300">{dateLabel}</div>
      </div>
    </footer>
  );
}

function StartMenu({
  launchWindow,
  resetLayout
}: {
  launchWindow: (id: AppId) => void;
  resetLayout: () => void;
}) {
  return (
    <div
      className="absolute bottom-[56px] left-2 w-[360px] overflow-hidden rounded-lg border border-white/20 bg-slate-950/96 text-white shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl"
      data-start-menu
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-sky-700 to-slate-900 p-4">
        <img
          alt="Devaansh Pathak"
          className="size-12 rounded-md border border-white/30 object-cover"
          src="/portfolio/me.png"
        />
        <div>
          <p className="text-sm font-bold">Devaansh Pathak</p>
          <p className="text-xs text-sky-100">WebOS 1 public session</p>
        </div>
      </div>

      <div className="grid gap-1 p-2">
        {appDefinitions.map((app) => (
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
            data-start-app={app.id}
            key={app.id}
            onClick={() => launchWindow(app.id)}
            type="button"
          >
            <span
              className={`grid size-8 place-items-center rounded bg-gradient-to-br ${app.accent} text-[9px] font-black`}
            >
              {app.icon}
            </span>
            <span>{app.title}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 p-2">
        <button
          className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
          onClick={resetLayout}
          type="button"
        >
          Reset window layout
        </button>
      </div>
    </div>
  );
}

function BootOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black text-green-200">
      <div className="w-full max-w-3xl p-6 font-mono">
        <div className="mb-5 flex items-center justify-between border-b border-green-300/30 pb-3 text-xs uppercase tracking-[0.18em]">
          <span>webos-1 firmware console</span>
          <button
            className="border border-green-300/50 px-3 py-1 text-green-100 transition hover:bg-green-300 hover:text-black"
            onClick={onDismiss}
            type="button"
          >
            skip
          </button>
        </div>
        <div className="space-y-2 text-sm">
          {bootLines.map((line, index) => (
            <p
              className="boot-line"
              key={line}
              style={{ animationDelay: `${index * 155}ms` }}
            >
              <span className="text-cyan-300">&gt;</span> {line}
            </p>
          ))}
        </div>
        <div className="mt-8 border border-green-300/30 bg-green-950/20 p-3 text-xs uppercase tracking-[0.16em] text-amber-200">
          password prompt bypassed / no login gate / public desktop loading
        </div>
      </div>
    </div>
  );
}

function WindowContent({
  id,
  launchWindow,
  resetLayout
}: {
  id: AppId;
  launchWindow: (id: AppId) => void;
  resetLayout: () => void;
}) {
  if (id === "welcome") {
    return <WelcomeApp launchWindow={launchWindow} />;
  }

  if (id === "terminal") {
    return <TerminalApp resetLayout={resetLayout} />;
  }

  if (id === "writer") {
    return <WriterApp />;
  }

  if (id === "monitor") {
    return <SystemMonitorApp />;
  }

  if (id === "profile") {
    return <ProfileApp launchWindow={launchWindow} />;
  }

  if (id === "research") {
    return <ResearchApp launchWindow={launchWindow} />;
  }

  return <ContactApp />;
}

function WelcomeApp({ launchWindow }: { launchWindow: (id: AppId) => void }) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-slate-800 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
          Stardance WebOS 1 mission
        </p>
        <h1 className="mt-3 text-4xl font-bold">WebOS 1 Desktop</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50">
          A Windows-style browser desktop for Devaansh Pathak, with real window
          movement, snapping, persistence, terminal commands, monitor telemetry,
          and a document editor for local blog Markdown.
        </p>
      </div>

      <div className="grid flex-1 gap-4 p-5 md:grid-cols-3">
        <InfoTile label="No password gate" value="Public session" />
        <InfoTile label="Layout storage" value="localStorage" />
        <InfoTile label="Static hosting" value="Next export" />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 p-4">
        <CommandButton onClick={() => launchWindow("terminal")}>Open Terminal</CommandButton>
        <CommandButton onClick={() => launchWindow("writer")}>Open WordPad</CommandButton>
        <CommandButton onClick={() => launchWindow("monitor")}>Open Monitor</CommandButton>
      </div>
    </div>
  );
}

function ProfileApp({ launchWindow }: { launchWindow: (id: AppId) => void }) {
  return (
    <div className="min-h-full bg-slate-100 p-5">
      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <img
          alt="Devaansh Pathak"
          className="aspect-square w-full rounded-lg border border-slate-300 object-cover shadow"
          src="/portfolio/me.png"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            CS + AI/ML student
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Devaansh Pathak</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            AI/ML and systems builder interested in reliable software,
            thoughtful evaluation, and practical research tools. This desktop
            pulls profile material from the local portfolio repo.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {profileFacts.map(([label, value]) => (
          <div
            className="grid gap-2 rounded border border-slate-200 bg-white p-3 text-sm sm:grid-cols-[140px_1fr]"
            key={label}
          >
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="text-slate-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <CommandButton onClick={() => launchWindow("research")}>Research</CommandButton>
        <CommandButton onClick={() => launchWindow("writer")}>Blog Notes</CommandButton>
      </div>
    </div>
  );
}

function ResearchApp({ launchWindow }: { launchWindow: (id: AppId) => void }) {
  return (
    <div className="min-h-full bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
        Current research thread
      </p>
      <h2 className="mt-2 text-3xl font-bold text-slate-950">SRE-Zero</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
        SRE-Zero is an environment-grounded benchmark for studying reliable
        tool-using agents in simulated incident-response workflows. It focuses
        on evidence gathering, diagnosis, remediation quality, safe tool use,
        and recovery from mistakes under step budgets.
      </p>

      <div className="mt-5 grid gap-3">
        {researchFocus.map((item) => (
          <div
            className="rounded border border-violet-100 bg-violet-50 px-3 py-2 text-sm text-violet-950"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-950">Related local notes</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          The WordPad app can open the copied Markdown posts about SRE-Zero,
          TokenScope, agent benchmarking, and model evaluation runs.
        </p>
        <div className="mt-3">
          <CommandButton onClick={() => launchWindow("writer")}>
            Open WordPad
          </CommandButton>
        </div>
      </div>
    </div>
  );
}

function ContactApp() {
  return (
    <div className="min-h-full bg-slate-100 p-5">
      <h2 className="text-2xl font-bold text-slate-950">Uplink</h2>
      <p className="mt-2 text-sm text-slate-600">
        Public contact targets from the portfolio source.
      </p>
      <div className="mt-5 grid gap-3 text-sm">
        <a className="rounded border border-slate-200 bg-white p-4 text-sky-700 hover:border-sky-300" href="mailto:devaanshpathak08@gmail.com">
          devaanshpathak08@gmail.com
        </a>
        <a className="rounded border border-slate-200 bg-white p-4 text-sky-700 hover:border-sky-300" href="https://github.com/DevaanshPathak">
          github.com/DevaanshPathak
        </a>
        <a className="rounded border border-slate-200 bg-white p-4 text-sky-700 hover:border-sky-300" href="https://www.linkedin.com/in/devaanshpa/">
          linkedin.com/in/devaanshpa
        </a>
      </div>
    </div>
  );
}

function TerminalApp({ resetLayout }: { resetLayout: () => void }) {
  const [lines, setLines] = useState<TerminalLine[]>(terminalIntro);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function runCommand(command: string) {
    const normalized = command.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    const output: TerminalLine[] = [{ kind: "input", text: `C:\\Users\\Devaansh> ${command}` }];

    if (normalized === "help") {
      output.push(
        { kind: "output", text: "system info    show WebOS build details" },
        { kind: "output", text: "ls             list desktop apps and mounted files" },
        { kind: "output", text: "whoami         print active public user" },
        { kind: "output", text: "ping           ping the portfolio host" },
        { kind: "output", text: "clear          clear terminal output" },
        { kind: "output", text: "reset-layout   reset saved window layout" },
        { kind: "output", text: "stardance      easter egg" }
      );
    } else if (normalized === "system info" || normalized === "systeminfo") {
      output.push(
        { kind: "output", text: "OS Name: WebOS 1 Desktop" },
        { kind: "output", text: "Build: phase-3-static-export" },
        { kind: "output", text: "Shell: browser explorer" },
        { kind: "output", text: "Persistence: localStorage window layout" },
        { kind: "output", text: "Auth: none, public mission session" }
      );
    } else if (normalized === "ls" || normalized === "dir") {
      output.push(
        { kind: "output", text: "Desktop" },
        { kind: "output", text: "Profile" },
        { kind: "output", text: "Research" },
        { kind: "output", text: "WordPad" },
        { kind: "output", text: "System Monitor" },
        { kind: "output", text: "portfolio/blogs/*.md" }
      );
    } else if (normalized === "whoami") {
      output.push({ kind: "output", text: "webos-1\\devaansh-public-session" });
    } else if (normalized.startsWith("ping")) {
      output.push(
        { kind: "output", text: "Pinging devaanshpathak.com [static] with 32 bytes of data:" },
        { kind: "output", text: "Reply from static-host: bytes=32 time=12ms TTL=64" },
        { kind: "output", text: "Reply from static-host: bytes=32 time=10ms TTL=64" },
        { kind: "output", text: "Reply from static-host: bytes=32 time=11ms TTL=64" },
        { kind: "output", text: "Packets: Sent = 3, Received = 3, Lost = 0" }
      );
    } else if (normalized === "stardance") {
      output.push(
        { kind: "output", text: "Signal locked. The desktop is dancing in static export mode." },
        { kind: "output", text: "Mission requirement: custom feature confirmed." }
      );
    } else if (normalized === "clear" || normalized === "cls") {
      setLines([]);
      return;
    } else if (normalized === "reset-layout") {
      resetLayout();
      output.push({ kind: "output", text: "Window layout reset. Reload is not required." });
    } else {
      output.push({ kind: "error", text: `'${command}' is not recognized. Try 'help'.` });
    }

    setLines((current) => [...current, ...output]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const command = input;
    setInput("");
    setHistoryIndex(null);
    if (command.trim()) {
      setHistory((current) => [...current, command.trim()]);
    }
    runCommand(command);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHistoryIndex((current) => {
        const next = current === null ? history.length - 1 : Math.max(0, current - 1);
        setInput(history[next] ?? "");
        return next;
      });
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHistoryIndex((current) => {
        if (current === null) {
          return null;
        }
        const next = current + 1;
        if (next >= history.length) {
          setInput("");
          return null;
        }
        setInput(history[next] ?? "");
        return next;
      });
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#050805] font-mono text-sm text-green-200">
      <div className="border-b border-green-900/80 bg-black px-3 py-2 text-xs text-green-400">
        WebOS Terminal - hardcoded command session
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {lines.map((line, index) => (
          <div
            className={
              line.kind === "error"
                ? "text-red-300"
                : line.kind === "input"
                  ? "text-cyan-200"
                  : line.kind === "system"
                    ? "text-amber-200"
                    : "text-green-200"
            }
            key={`${line.text}-${index}`}
          >
            {line.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <form className="flex border-t border-green-900/80 bg-black p-2" onSubmit={handleSubmit}>
        <span className="mr-2 text-cyan-200">C:\Users\Devaansh&gt;</span>
        <input
          aria-label="Terminal command"
          className="min-w-0 flex-1 bg-transparent text-green-100 outline-none"
          data-terminal-input
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          value={input}
        />
      </form>
    </div>
  );
}

function SystemMonitorApp() {
  const startRef = useRef(Date.now());
  const [samples, setSamples] = useState([34, 48, 42, 55, 61, 46, 58, 52, 66, 49, 44, 57]);
  const [cpu, setCpu] = useState(42);
  const [ram, setRam] = useState(58);
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSamples((current) => {
        const nextValue = Math.round(25 + Math.random() * 58);
        return [...current.slice(1), nextValue];
      });
      setCpu(Math.round(30 + Math.random() * 56));
      setRam(Math.round(48 + Math.random() * 22));

      const seconds = Math.floor((Date.now() - startRef.current) / 1000);
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${s}`);
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-full bg-[#06110c] p-4 font-mono text-xs text-green-100">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-green-300">btop://webos-host</p>
          <p className="text-slate-400">fake telemetry, animated locally</p>
        </div>
        <div className="rounded border border-green-700 px-2 py-1 text-green-300">
          uptime {uptime}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MonitorMeter label="CPU" value={cpu} color="bg-green-300" />
        <MonitorMeter label="RAM" value={ram} color="bg-cyan-300" />
        <MonitorMeter label="IO" value={37} color="bg-amber-300" />
      </div>

      <div className="mt-4 grid h-32 grid-cols-12 items-end gap-1 rounded border border-green-900 bg-black/50 p-3">
        {samples.map((sample, index) => (
          <span
            className="monitor-bar block rounded-t bg-green-300/80"
            key={`${sample}-${index}`}
            style={{ height: `${sample}%` }}
          />
        ))}
      </div>

      <div className="mt-4 rounded border border-green-900 bg-black/45">
        <div className="grid grid-cols-[1fr_64px_64px] border-b border-green-900 px-3 py-2 text-green-400">
          <span>process</span>
          <span className="text-right">cpu</span>
          <span className="text-right">mem</span>
        </div>
        {[
          ["explorer.exe", "08.4", "142M"],
          ["windowd", "05.1", "91M"],
          ["wordpad-md", "03.3", "74M"],
          ["terminal.exe", "02.0", "32M"],
          ["portfoliofs", "01.4", "48M"]
        ].map(([name, cpuValue, mem]) => (
          <div
            className="grid grid-cols-[1fr_64px_64px] px-3 py-1 text-slate-200"
            key={name}
          >
            <span>{name}</span>
            <span className="text-right text-green-200">{cpuValue}%</span>
            <span className="text-right text-cyan-200">{mem}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WriterApp() {
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [selected, setSelected] = useState<BlogEntry | null>(null);
  const [content, setContent] = useState("Loading local Markdown files...");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      const response = await fetch("/portfolio/blogs/manifest.json");
      const data = (await response.json()) as BlogEntry[];
      const sorted = [...data].sort((a, b) => {
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return a.title.localeCompare(b.title);
      });

      if (!cancelled) {
        setBlogs(sorted);
        setSelected(sorted[0] ?? null);
      }
    }

    loadManifest().catch(() => {
      if (!cancelled) {
        setContent("Could not load /portfolio/blogs/manifest.json");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    let cancelled = false;
    setContent("Opening document...");

    fetch(selected.path)
      .then((response) => response.text())
      .then((text) => {
        if (!cancelled) {
          setContent(stripFrontmatter(text));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContent(`Could not open ${selected.sourcePath}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const filteredBlogs = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return blogs;
    }

    return blogs.filter((blog) =>
      [blog.title, blog.description, blog.sourcePath, blog.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [blogs, query]);

  return (
    <div className="flex h-full flex-col bg-slate-200">
      <div className="border-b border-slate-300 bg-white">
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              WordPad
            </p>
            <p className="text-sm font-bold text-slate-900">
              {selected?.title ?? "Local Markdown Library"}
            </p>
          </div>
          <span className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600">
            Read only
          </span>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 px-3 py-2 text-xs">
          {["File", "Home", "Insert", "Review", "View"].map((tab) => (
            <button className="rounded px-2 py-1 font-semibold text-slate-700 hover:bg-blue-50" key={tab} type="button">
              {tab}
            </button>
          ))}
          <span className="mx-1 h-6 border-l border-slate-300" />
          {["B", "I", "U"].map((tool) => (
            <button className="grid size-7 place-items-center rounded border border-slate-300 bg-slate-50 font-bold text-slate-800" key={tool} type="button">
              {tool}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr]">
        <aside className="min-h-0 overflow-auto border-r border-slate-300 bg-slate-100 p-3">
          <input
            aria-label="Search documents"
            className="mb-3 w-full rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents"
            value={query}
          />
          <div className="space-y-2">
            {filteredBlogs.map((blog) => (
              <button
                className={`w-full rounded border p-2 text-left text-xs ${
                  selected?.path === blog.path
                    ? "border-blue-400 bg-blue-50 text-blue-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                }`}
                data-blog-document={blog.path}
                key={blog.path}
                onClick={() => setSelected(blog)}
                type="button"
              >
                <span className="block font-bold">{blog.title}</span>
                <span className="mt-1 block truncate text-slate-500">
                  {blog.date || blog.sourcePath}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-h-0 overflow-auto bg-slate-300 p-6">
          <article className="mx-auto min-h-full max-w-3xl bg-white px-12 py-10 text-slate-950 shadow-xl">
            <div className="mb-6 border-b border-slate-200 pb-4 text-xs text-slate-500">
              <p>{selected?.sourcePath ?? "No document selected"}</p>
              {selected?.description ? <p className="mt-1">{selected.description}</p> : null}
            </div>
            <MarkdownView text={content} />
          </article>
        </div>
      </div>
    </div>
  );
}

function MarkdownView({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let codeLines: string[] = [];
  let inCode = false;

  function flushCode(index: number) {
    if (!codeLines.length) {
      return;
    }

    nodes.push(
      <pre className="my-4 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100" key={`code-${index}`}>
        {codeLines.join("\n")}
      </pre>
    );
    codeLines = [];
  }

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode(index);
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      nodes.push(<div className="h-3" key={`space-${index}`} />);
      return;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h1 className="mb-4 mt-2 text-3xl font-bold leading-tight" key={line + index}>
          {line.replace(/^#\s+/, "")}
        </h1>
      );
      return;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 className="mb-3 mt-6 text-2xl font-bold leading-tight" key={line + index}>
          {line.replace(/^##\s+/, "")}
        </h2>
      );
      return;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 className="mb-2 mt-5 text-xl font-bold leading-tight" key={line + index}>
          {line.replace(/^###\s+/, "")}
        </h3>
      );
      return;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      nodes.push(
        <p className="my-1 pl-5 text-sm leading-7 before:mr-2 before:content-['-']" key={line + index}>
          {line.replace(/^\s*[-*]\s+/, "")}
        </p>
      );
      return;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      nodes.push(
        <p className="my-1 pl-5 text-sm leading-7" key={line + index}>
          {line}
        </p>
      );
      return;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      nodes.push(
        <pre className="my-2 overflow-auto rounded bg-slate-100 p-2 text-xs" key={line + index}>
          {line}
        </pre>
      );
      return;
    }

    nodes.push(
      <p className="my-2 text-sm leading-7 text-slate-800" key={line + index}>
        {line}
      </p>
    );
  });

  flushCode(lines.length);
  return <>{nodes}</>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function CommandButton({
  children,
  onClick
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function MonitorMeter({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded border border-green-900 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-green-400">{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-slate-800">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function stripFrontmatter(text: string) {
  return text.replace(/^---[\s\S]*?---\s*/, "");
}
