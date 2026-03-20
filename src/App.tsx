import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2, Cpu, Database, Layers,
  Plane, Gamepad2, Tv, Film, Moon,
  ChevronRight, ChevronDown, FileCode, FileJson, FileCog, FileText, Terminal as TerminalIcon, Folder
} from "lucide-react";

type Page = "home.js" | "about.ts" | "projects.json" | "hobbies.sh" | "contact.css" | "developer.md";

const BLUEPRINT_PATTERNS = [
  { char: "/", prefix: "/", suffix: "/" },
  { char: "*", prefix: "/*", suffix: "*/" },
  { char: "+", prefix: "", suffix: "" },
  { char: "-", prefix: "/-", suffix: "-/" },
  { char: "=", prefix: "", suffix: "" },
  { char: "/", prefix: "", suffix: "" },
  { char: ".", prefix: "", suffix: "" },
  { char: "-", prefix: "", suffix: "" },
];

const LineNumbers = () => (
  <div className="flex flex-col text-[10px] font-mono opacity-30 select-none">
    {Array.from({ length: 100 }).map((_, i) => (
      <div key={i} className="h-[20px] flex items-center justify-end pr-2">{i + 1}</div>
    ))}
  </div>
);

const VerticalSlashes = () => (
  <div className="flex flex-col text-[10px] font-mono opacity-30 select-none">
    {Array.from({ length: 100 }).map((_, i) => (
      <div key={i} className="h-[20px] flex items-center">/</div>
    ))}
  </div>
);

// Seeded pseudo-random so grid is stable per page (no re-render flicker)
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const BlueprintGrid = ({ activePage, isMobile }: { activePage: Page; isMobile: boolean }) => {
  const columns = isMobile ? 1 : 5;
  const rows = 40;

  const getOccupiedZones = (page: Page) => {
    const versionZone = { colStart: 0, colEnd: 1, rowStart: 36, rowEnd: 39 };
    switch (page) {
      case "home.js":
        return [{ colStart: 0, colEnd: 1, rowStart: 2, rowEnd: 10 }, { colStart: 3, colEnd: 4, rowStart: 25, rowEnd: 39 }, versionZone];
      case "about.ts":
        return [{ colStart: 0, colEnd: 2, rowStart: 4, rowEnd: 24 }, { colStart: 3, colEnd: 4, rowStart: 30, rowEnd: 38 }, versionZone];
      case "projects.json":
        return [{ colStart: 0, colEnd: 4, rowStart: 4, rowEnd: 24 }, versionZone];
      case "hobbies.sh":
        return [{ colStart: 0, colEnd: 4, rowStart: 8, rowEnd: 32 }, versionZone];
      case "developer.md":
        // Editor is 60% centered — block approx cols 1-3, rows 10-30
        return [{ colStart: 1, colEnd: 3, rowStart: 10, rowEnd: 30 }, versionZone];
      case "contact.css":
        return [{ colStart: 1, colEnd: 3, rowStart: 10, rowEnd: 30 }, versionZone];
      default:
        return [versionZone];
    }
  };

  const zones = getOccupiedZones(activePage);
  const isOccupied = (col: number, row: number) => {
    if (isMobile) {
      // On mobile, only block content rows regardless of col
      return zones.some(z => row >= z.rowStart && row <= z.rowEnd);
    }
    return zones.some(z => col >= z.colStart && col <= z.colEnd && row >= z.rowStart && row <= z.rowEnd);
  };

  // Page index for seeding so each page has different but stable pattern
  const pageIdx = ["home.js","about.ts","projects.json","hobbies.sh","contact.css","developer.md"].indexOf(activePage);

  return (
    <motion.div
      key={activePage}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute top-0 right-0 bottom-0 ${isMobile ? "left-0" : "left-[56px]"} flex pointer-events-none z-10 overflow-hidden`}
    >
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-1 border-r border-line/20 flex flex-col">
          {Array.from({ length: rows }).map((_, rowIndex) => {
            if (isOccupied(colIndex, rowIndex))
              return <div key={rowIndex} className="flex-1 border-b border-line/5" />;

            // Stable seed per cell per page
            const seed = pageIdx * 10000 + colIndex * 1000 + rowIndex * 7;
            const r1 = seededRandom(seed);
            const r2 = seededRandom(seed + 1);
            const r3 = seededRandom(seed + 2);

            // Procedural density: every free cell CAN have lines
            // Edge rows (very top/bottom) are sparse, mid is denser
            const isEdge = rowIndex < 3 || rowIndex > 36;
            const showChance = isEdge ? 0.25 : 0.72;
            if (r1 > showChance) return <div key={rowIndex} className="flex-1 border-b border-line/5" />;

            const pattern = BLUEPRINT_PATTERNS[Math.floor(r2 * BLUEPRINT_PATTERNS.length)];
            // 1–8 lines, weighted toward lower counts
            const lineCount = Math.ceil(r3 * r3 * 8); // squaring biases toward 1-3

            return (
              <motion.div
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.6, x: 0 }}
                transition={{ delay: 0.5 + colIndex * 0.1 + rowIndex * 0.02, duration: 0.8, ease: "easeOut" }}
                className="border-b border-line/10 p-1 flex flex-col justify-center overflow-hidden min-h-[20px] flex-1"
              >
                {Array.from({ length: lineCount }).map((_, li) => (
                  <div key={li} className="font-mono text-[7px] whitespace-nowrap leading-tight flex opacity-100 text-ink">
                    {pattern.prefix && <span className="mr-1">{pattern.prefix}</span>}
                    <span className="flex-1 overflow-hidden">{pattern.char.repeat(200)}</span>
                    {pattern.suffix && <span className="ml-1">{pattern.suffix}</span>}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
};

const terminalProjects = [
  {
    name: "NEON-GRID",
    type: "WebGL Experiment",
    year: "2025",
    status: "ACTIVE",
    version: "v2.4.1",
    desc: "A high-performance WebGL rendering engine featuring reactive GLSL shaders, real-time GPU-accelerated particle systems, and an adaptive resolution pipeline. Built for sub-16ms frame budgets at 4K resolution with dynamic LOD switching and frustum culling.",
    stack: ["WebGL2", "GLSL", "TypeScript", "WASM"],
    stars: 1247,
    forks: 89,
    commits: 342,
    lang: "TypeScript",
    langColor: "#3178c6",
    imgs: [
      "https://picsum.photos/seed/neon1/800/450",
      "https://picsum.photos/seed/neon2/800/450",
    ],
  },
  {
    name: "FLUX-UI",
    type: "Design System",
    year: "2024",
    status: "STABLE",
    version: "v1.9.0",
    desc: "A motion-first component library built on Framer Motion primitives. Features 60+ animated components, an adaptive theming engine with CSS custom properties, Figma token sync, and a zero-runtime CSS-in-JS approach using static extraction at build time.",
    stack: ["React", "Framer Motion", "TypeScript", "Storybook"],
    stars: 3891,
    forks: 211,
    commits: 781,
    lang: "TypeScript",
    langColor: "#3178c6",
    imgs: [
      "https://picsum.photos/seed/flux1/800/450",
      "https://picsum.photos/seed/flux2/800/450",
    ],
  },
  {
    name: "BLUEPRINT-CSS",
    type: "Utility Library",
    year: "2024",
    status: "STABLE",
    version: "v3.1.2",
    desc: "A utility-first CSS framework inspired by technical blueprint aesthetics. Ships a JIT compiler, a constraint-based spacing scale, semantic color tokens, and an integrated dark-mode strategy. Zero-dependency, 4kB gzip core bundle with optional plugin layers.",
    stack: ["PostCSS", "Rust", "Node.js", "CSS Houdini"],
    stars: 2104,
    forks: 143,
    commits: 519,
    lang: "CSS",
    langColor: "#563d7c",
    imgs: [
      "https://picsum.photos/seed/blue1/800/450",
      "https://picsum.photos/seed/blue2/800/450",
    ],
  },
  {
    name: "SYNTH-CORE",
    type: "Audio Engine",
    year: "2023",
    status: "BETA",
    version: "v0.8.3",
    desc: "Low-latency browser-based synthesizer engine running on the Web Audio API with a custom DSP graph scheduler. Supports MIDI input, polyphonic voice allocation, a modular patch bay, and a WASM-compiled filter bank ported from a classic analog architecture.",
    stack: ["Web Audio API", "WASM", "Rust", "TypeScript"],
    stars: 678,
    forks: 44,
    commits: 203,
    lang: "Rust",
    langColor: "#dea584",
    imgs: [
      "https://picsum.photos/seed/synth1/800/450",
      "https://picsum.photos/seed/synth2/800/450",
    ],
  },
  {
    name: "VOID-ENGINE",
    type: "Game Framework",
    year: "2025",
    status: "ACTIVE",
    version: "v1.2.0",
    desc: "Minimalist 2D game engine targeting creative coders and game-jam veterans. Features an entity-component-system architecture, a tilemap renderer with autotiling, a deterministic physics solver, and a hot-reloadable scripting layer backed by QuickJS.",
    stack: ["TypeScript", "Canvas API", "QuickJS", "Vite"],
    stars: 921,
    forks: 67,
    commits: 288,
    lang: "TypeScript",
    langColor: "#3178c6",
    imgs: [
      "https://picsum.photos/seed/void1/800/450",
      "https://picsum.photos/seed/void2/800/450",
    ],
  },
  {
    name: "DATA-STRATA",
    type: "Visualization",
    year: "2024",
    status: "STABLE",
    version: "v2.0.4",
    desc: "Layered data visualization toolkit for complex multi-dimensional datasets. Implements a declarative grammar-of-graphics API, GPU-accelerated rendering via regl, animated transitions powered by a custom interpolation engine, and streaming data support via WebSockets.",
    stack: ["D3.js", "regl", "TypeScript", "WebSockets"],
    stars: 1563,
    forks: 98,
    commits: 412,
    lang: "JavaScript",
    langColor: "#f1e05a",
    imgs: [
      "https://picsum.photos/seed/data1/800/450",
      "https://picsum.photos/seed/data2/800/450",
    ],
  },
  {
    name: "KINETIC-TYPE",
    type: "Typography",
    year: "2023",
    status: "ARCHIVED",
    version: "v1.0.0",
    desc: "Experimental kinetic typography playground built as a set of composable React primitives. Ships 20+ text animation presets, a path-following renderer, variable-font axis interpolation, and an interactive choreography timeline editor baked into the dev toolbar.",
    stack: ["React", "GSAP", "Variable Fonts", "Canvas"],
    stars: 445,
    forks: 31,
    commits: 119,
    lang: "TypeScript",
    langColor: "#3178c6",
    imgs: [
      "https://picsum.photos/seed/type1/800/450",
      "https://picsum.photos/seed/type2/800/450",
    ],
  },
  {
    name: "ORBIT-OS",
    type: "Web Desktop",
    year: "2022",
    status: "ARCHIVED",
    version: "v0.5.0",
    desc: "A browser-based operating system concept featuring a compositing window manager, a virtual filesystem backed by IndexedDB, a process scheduler simulating preemptive multitasking, and a suite of built-in apps including a terminal emulator, text editor, and file explorer.",
    stack: ["React", "IndexedDB", "Web Workers", "CSS Grid"],
    stars: 2887,
    forks: 196,
    commits: 634,
    lang: "TypeScript",
    langColor: "#3178c6",
    imgs: [
      "https://picsum.photos/seed/orbit1/800/450",
      "https://picsum.photos/seed/orbit2/800/450",
    ],
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: "#50fa7b",
  STABLE: "#8be9fd",
  BETA: "#ffb86c",
  ARCHIVED: "#6272a4",
};

const ProjectItem = ({ project, index, isDarkMode, onHover }: any) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      onHover({ project, rect });
    }
  };

  const handleMouseLeave = () => onHover(null);

  return (
    <div ref={triggerRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 + index * 0.1 }}
        className="cursor-pointer border-l-2 border-line/20 pl-6 hover:border-ink transition-colors"
      >
        <span className="text-[10px] font-mono opacity-40 mb-2 block">{project.year} // {project.type}</span>
        <h3 className="text-3xl font-black uppercase tracking-tighter hover:translate-x-2 transition-transform">{project.name}</h3>
      </motion.div>
    </div>
  );
};

const TerminalPopup = ({ project, rect, isDarkMode }: any) => {
  const [typedDesc, setTypedDesc] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const timerRef = useRef<any>(null);
  const imgTimerRef = useRef<any>(null);

  const tm = isDarkMode ? {
    bg: "#282a36", header: "#21222c", border: "#6272a4",
    text: "#f8f8f2", muted: "#6272a4", divider: "#44475a",
    green: "#50fa7b", cyan: "#8be9fd", purple: "#bd93f9",
    pink: "#ff79c6", yellow: "#f1fa8c", tag: "#44475a", tagBorder: "#6272a4",
  } : {
    bg: "#fafaf8", header: "#ebebea", border: "#bbbbbb",
    text: "#1e1e1e", muted: "#888888", divider: "#dddddd",
    green: "#1a7f37", cyan: "#0550ae", purple: "#8250df",
    pink: "#cf222e", yellow: "#9a6700", tag: "#e8e8e6", tagBorder: "#cccccc",
  };

  useEffect(() => {
    setTypedDesc("");
    setImgIdx(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setTypedDesc(project.desc.slice(0, i));
      if (i >= project.desc.length) clearInterval(timerRef.current);
    }, 10);
    imgTimerRef.current = setInterval(() => setImgIdx(p => (p + 1) % project.imgs.length), 2500);
    return () => { clearInterval(timerRef.current); clearInterval(imgTimerRef.current); };
  }, [project]);

  const popupW = 700;
  let left = rect.left;
  if (left + popupW > window.innerWidth - 12) left = window.innerWidth - popupW - 12;
  if (left < 8) left = 8;

  // If popup would go below viewport, show it above the trigger instead
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < 340;
  const top = showAbove ? rect.top - 8 : rect.bottom + 6;
  const transformOrigin = showAbove ? "bottom left" : "top left";
  const translateY = showAbove ? "-100%" : "0%";

  return (
    <div style={{
      position: "fixed",
      top,
      left,
      width: popupW,
      zIndex: 999999,
      transform: `translateY(${translateY})`,
      transformOrigin,
      pointerEvents: "none",
      fontFamily: "monospace",
    }}>
      <div className="text-[11px] shadow-2xl overflow-hidden"
        style={{ background: tm.bg, border: `1px solid ${tm.border}`, borderRadius: 6 }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2" style={{ background: tm.header, borderBottom: `1px solid ${tm.divider}` }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5555]" />
            <div className="w-3 h-3 rounded-full bg-[#f1fa8c]" />
            <div className="w-3 h-3 rounded-full bg-[#50fa7b]" />
          </div>
          <div className="uppercase tracking-widest text-[9px]" style={{ color: tm.muted }}>
            zsh — {project.name.toLowerCase()} — 80×24
          </div>
          <div style={{ color: statusColors[project.status] }} className="uppercase tracking-widest text-[9px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColors[project.status] }} />
            {project.status}
          </div>
        </div>
        {/* Tab Bar */}
        <div className="flex" style={{ background: tm.header, borderBottom: `1px solid ${tm.divider}` }}>
          <div className="px-4 py-1.5 text-[9px] border-t-2" style={{ borderRight: `1px solid ${tm.divider}`, color: tm.text, borderTopColor: tm.purple }}>1: zsh</div>
          <div className="px-4 py-1.5 text-[9px]" style={{ borderRight: `1px solid ${tm.divider}`, color: tm.muted }}>2: logs</div>
          <div className="px-4 py-1.5 text-[9px]" style={{ color: tm.muted }}>3: git</div>
        </div>
        <div className="p-5 grid grid-cols-5 gap-5">
          <div className="col-span-3 space-y-3 text-[10px]" style={{ color: tm.text }}>
            <div>
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span style={{ color: tm.green }}>➜</span>
                <span style={{ color: tm.cyan }}>~/repos/{project.name.toLowerCase()}</span>
                <span style={{ color: tm.purple }}> git:(</span><span style={{ color: tm.pink }}>main</span><span style={{ color: tm.purple }}>)</span>
                <span style={{ color: tm.yellow }}> ✦</span>
              </div>
              <div className="flex gap-1"><span style={{ color: tm.muted }}>$</span><span style={{ color: tm.pink }}> cat</span><span> README.md</span></div>
              <div className="mt-2 pl-3 leading-relaxed" style={{ color: tm.text, opacity: 0.85, borderLeft: `2px solid ${tm.divider}` }}>
                {typedDesc}<span style={{ opacity: 0.6 }}>▌</span>
              </div>
            </div>
            <div>
              <div className="flex gap-1"><span style={{ color: tm.muted }}>$</span><span style={{ color: tm.pink }}> gh</span><span style={{ color: tm.cyan }}> repo</span><span> view --json</span></div>
              <div className="mt-2 pl-3 space-y-0.5" style={{ borderLeft: `2px solid ${tm.divider}` }}>
                <div><span style={{ color: tm.yellow }}>stars</span><span style={{ color: tm.muted }}>: </span><span style={{ color: tm.purple }}>{project.stars}</span></div>
                <div><span style={{ color: tm.yellow }}>forks</span><span style={{ color: tm.muted }}>: </span><span style={{ color: tm.purple }}>{project.forks}</span></div>
                <div><span style={{ color: tm.yellow }}>commits</span><span style={{ color: tm.muted }}>: </span><span style={{ color: tm.purple }}>{project.commits}</span></div>
                <div><span style={{ color: tm.yellow }}>lang</span><span style={{ color: tm.muted }}>: </span><span style={{ color: project.langColor }}>●</span><span> {project.lang}</span></div>
                <div><span style={{ color: tm.yellow }}>version</span><span style={{ color: tm.muted }}>: </span><span style={{ color: tm.green }}>{project.version}</span></div>
              </div>
            </div>
            <div>
              <div className="flex gap-1"><span style={{ color: tm.muted }}>$</span><span style={{ color: tm.pink }}> npm list</span><span> --depth=0</span></div>
              <div className="mt-2 pl-3 flex flex-wrap gap-1.5" style={{ borderLeft: `2px solid ${tm.divider}` }}>
                {project.stack.map((tech: string) => (
                  <span key={tech} className="px-2 py-0.5 text-[9px] rounded" style={{ background: tm.tag, color: tm.text, border: `1px solid ${tm.tagBorder}` }}>{tech}</span>
                ))}
              </div>
            </div>
            <div><span style={{ color: tm.green }}>➜</span> <span style={{ color: tm.muted }}>▌</span></div>
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <div className="relative overflow-hidden" style={{ border: `1px solid ${tm.divider}`, aspectRatio: "16/9" }}>
              <img key={imgIdx} src={project.imgs[imgIdx]} alt={project.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${tm.bg}88, transparent)` }} />
              <div className="absolute bottom-2 right-2 text-[8px]" style={{ color: tm.muted }}>{imgIdx + 1}/{project.imgs.length}</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {project.imgs.map((img: string, i: number) => (
                <div key={i} className="overflow-hidden" style={{ border: `1px solid ${i === imgIdx ? tm.purple : tm.divider}`, aspectRatio: "16/9" }}>
                  <img src={img} alt="" className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const fileTree = [
  {
    name: "src",
    type: "folder",
    expanded: true,
    children: [
      { name: "App.tsx", type: "tsx", page: "home.js" as Page },
      { name: "index.css", type: "css" },
      { name: "main.tsx", type: "tsx" },
    ],
  },
  { name: ".env.example", type: "env" },
  { name: ".gitignore", type: "git" },
  { name: "index.html", type: "html" },
  { name: "metadata.json", type: "json" },
  { name: "package.json", type: "json" },
  { name: "README.md", type: "md" },
  { name: "tsconfig.json", type: "json" },
  { name: "vite.config.ts", type: "tsx" },
  { name: "yarn.lock", type: "lock" },
];

const fileIconColors: Record<string, string> = {
  tsx: "#8be9fd",
  css: "#bd93f9",
  json: "#f1fa8c",
  md: "#50fa7b",
  html: "#ff79c6",
  env: "#ffb86c",
  git: "#ff5555",
  lock: "#6272a4",
  folder: "#f1fa8c",
};

const fileContents: Record<string, { lang: string; lines: { tokens: { text: string; color: string }[] }[] }> = {
  "App.tsx": {
    lang: "tsx",
    lines: [
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " { useState, useEffect, useRef } ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "react"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " { motion, AnimatePresence } ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "motion/react"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  Code2, Cpu, Database, Layers, Plane, Gamepad2,", color: "#f8f8f2" }] },
      { tokens: [{ text: "  Tv, Film, Moon, ChevronRight, ChevronDown,", color: "#f8f8f2" }] },
      { tokens: [{ text: "  FileCode, FileJson, FileCog, FileText,", color: "#f8f8f2" }] },
      { tokens: [{ text: "  Terminal, Folder", color: "#f8f8f2" }] },
      { tokens: [{ text: "} ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "lucide-react"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "type", color: "#ff79c6" }, { text: " Page", color: "#8be9fd" }, { text: " = ", color: "#f8f8f2" }, { text: '"home.js"', color: "#f1fa8c" }, { text: " | ", color: "#f8f8f2" }, { text: '"about.ts"', color: "#f1fa8c" }, { text: " | ", color: "#f8f8f2" }, { text: '"projects.json"', color: "#f1fa8c" }] },
      { tokens: [{ text: "  | ", color: "#f8f8f2" }, { text: '"hobbies.sh"', color: "#f1fa8c" }, { text: " | ", color: "#f8f8f2" }, { text: '"contact.css"', color: "#f1fa8c" }, { text: " | ", color: "#f8f8f2" }, { text: '"developer.md"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "// Seeded pseudo-random for stable blueprint grid", color: "#6272a4" }] },
      { tokens: [{ text: "function", color: "#ff79c6" }, { text: " seededRandom", color: "#50fa7b" }, { text: "(seed:", color: "#f8f8f2" }, { text: " number", color: "#8be9fd" }, { text: ") {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " x ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " Math.sin(seed + ", color: "#f8f8f2" }, { text: "1", color: "#bd93f9" }, { text: ") * ", color: "#f8f8f2" }, { text: "10000", color: "#bd93f9" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "  return", color: "#ff79c6" }, { text: " x - Math.floor(x);", color: "#f8f8f2" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "const", color: "#ff79c6" }, { text: " BLUEPRINT_PATTERNS ", color: "#f8f8f2" }, { text: "= [", color: "#f8f8f2" }] },
      { tokens: [{ text: '  { char: "/"', color: "#f1fa8c" }, { text: ', prefix: "/"', color: "#f1fa8c" }, { text: ', suffix: "/" },', color: "#f1fa8c" }] },
      { tokens: [{ text: '  { char: "*"', color: "#f1fa8c" }, { text: ', prefix: "/*"', color: "#f1fa8c" }, { text: ', suffix: "*/" },', color: "#f1fa8c" }] },
      { tokens: [{ text: '  { char: "-"', color: "#f1fa8c" }, { text: ', prefix: ""', color: "#f1fa8c" }, { text: ', suffix: "" },', color: "#f1fa8c" }] },
      { tokens: [{ text: '  { char: "."', color: "#f1fa8c" }, { text: ', prefix: ""', color: "#f1fa8c" }, { text: ', suffix: "" },', color: "#f1fa8c" }] },
      { tokens: [{ text: "];", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "const", color: "#ff79c6" }, { text: " BlueprintGrid", color: "#50fa7b" }, { text: " = ({ activePage }: { activePage:", color: "#f8f8f2" }, { text: " Page", color: "#8be9fd" }, { text: " }) => {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " getOccupiedZones ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " (page:", color: "#f8f8f2" }, { text: " Page", color: "#8be9fd" }, { text: ") => {", color: "#f8f8f2" }] },
      { tokens: [{ text: "    switch", color: "#ff79c6" }, { text: " (page) {", color: "#f8f8f2" }] },
      { tokens: [{ text: "      case", color: "#ff79c6" }, { text: ' "home.js"', color: "#f1fa8c" }, { text: ":", color: "#f8f8f2" }] },
      { tokens: [{ text: "        return", color: "#ff79c6" }, { text: " [{ colStart:", color: "#f8f8f2" }, { text: " 0", color: "#bd93f9" }, { text: ", colEnd:", color: "#f8f8f2" }, { text: " 1", color: "#bd93f9" }, { text: ", rowStart:", color: "#f8f8f2" }, { text: " 2", color: "#bd93f9" }, { text: ", rowEnd:", color: "#f8f8f2" }, { text: " 10", color: "#bd93f9" }, { text: " }];", color: "#f8f8f2" }] },
      { tokens: [{ text: "      case", color: "#ff79c6" }, { text: ' "about.ts"', color: "#f1fa8c" }, { text: ":", color: "#f8f8f2" }] },
      { tokens: [{ text: "        return", color: "#ff79c6" }, { text: " [{ colStart:", color: "#f8f8f2" }, { text: " 0", color: "#bd93f9" }, { text: ", colEnd:", color: "#f8f8f2" }, { text: " 2", color: "#bd93f9" }, { text: ", rowStart:", color: "#f8f8f2" }, { text: " 4", color: "#bd93f9" }, { text: ", rowEnd:", color: "#f8f8f2" }, { text: " 24", color: "#bd93f9" }, { text: " }];", color: "#f8f8f2" }] },
      { tokens: [{ text: "      default:", color: "#ff79c6" }, { text: " return [];", color: "#f8f8f2" }] },
      { tokens: [{ text: "    }", color: "#f8f8f2" }] },
      { tokens: [{ text: "  };", color: "#f8f8f2" }] },
      { tokens: [{ text: "  // render 5 cols × 40 rows of blueprint lines...", color: "#6272a4" }] },
      { tokens: [{ text: "};", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "// Terminal popup shown on project hover", color: "#6272a4" }] },
      { tokens: [{ text: "const", color: "#ff79c6" }, { text: " TerminalPopup", color: "#50fa7b" }, { text: " = ({ project, rect, isDarkMode }:", color: "#f8f8f2" }, { text: " any", color: "#8be9fd" }, { text: ") => {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " [typedDesc, setTypedDesc] ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " useState", color: "#50fa7b" }, { text: '("");', color: "#f1fa8c" }] },
      { tokens: [{ text: "  // typewriter effect + image slideshow...", color: "#6272a4" }] },
      { tokens: [{ text: "  return", color: "#ff79c6" }, { text: " (", color: "#f8f8f2" }] },
      { tokens: [{ text: '    <div style={{ position: "fixed", zIndex:', color: "#f8f8f2" }, { text: " 999999", color: "#bd93f9" }, { text: " }}>", color: "#f8f8f2" }] },
      { tokens: [{ text: "      {/* Dracula-themed terminal UI */}", color: "#6272a4" }] },
      { tokens: [{ text: "    </div>", color: "#f8f8f2" }] },
      { tokens: [{ text: "  );", color: "#f8f8f2" }] },
      { tokens: [{ text: "};", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "// Hobby node with auto-scrolling image gallery", color: "#6272a4" }] },
      { tokens: [{ text: "const", color: "#ff79c6" }, { text: " ScrollRow", color: "#50fa7b" }, { text: " = ({ images, direction, color }:", color: "#f8f8f2" }, { text: " any", color: "#8be9fd" }, { text: ") => (", color: "#f8f8f2" }] },
      { tokens: [{ text: "  <motion.div animate={{ x:", color: "#f8f8f2" }, { text: " direction ", color: "#f8f8f2" }, { text: "===", color: "#ff79c6" }, { text: ' "left"', color: "#f1fa8c" }] },
      { tokens: [{ text: '    ? ["0%", "-33.33%"] : ["-33.33%", "0%"]', color: "#f1fa8c" }] },
      { tokens: [{ text: "  }} transition={{ duration:", color: "#f8f8f2" }, { text: " 22", color: "#bd93f9" }, { text: ", repeat:", color: "#f8f8f2" }, { text: " Infinity", color: "#8be9fd" }, { text: " }}>", color: "#f8f8f2" }] },
      { tokens: [{ text: "    {/* tripled images for seamless loop */}", color: "#6272a4" }] },
      { tokens: [{ text: "  </motion.div>", color: "#f8f8f2" }] },
      { tokens: [{ text: ");", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "const", color: "#ff79c6" }, { text: " HobbyNode", color: "#50fa7b" }, { text: " = ({ hobby, W, H, isDarkMode }:", color: "#f8f8f2" }, { text: " any", color: "#8be9fd" }, { text: ") => {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " [hovered, setHovered] ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " useState", color: "#50fa7b" }, { text: "(", color: "#f8f8f2" }, { text: "false", color: "#bd93f9" }, { text: ");", color: "#f8f8f2" }] },
      { tokens: [{ text: "  // on hover: compute fixed card position, show gallery", color: "#6272a4" }] },
      { tokens: [{ text: "  return", color: "#ff79c6" }, { text: " (", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <> <NodeBox /> {hovered && <GalleryCard />} </>", color: "#f8f8f2" }] },
      { tokens: [{ text: "  );", color: "#f8f8f2" }] },
      { tokens: [{ text: "};", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "// VSCode-style editor for developer.md page", color: "#6272a4" }] },
      { tokens: [{ text: "const", color: "#ff79c6" }, { text: " VSCodeEditor", color: "#50fa7b" }, { text: " = () => {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " [selectedFile, setSelectedFile] ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " useState", color: "#50fa7b" }, { text: '("App.tsx");', color: "#f1fa8c" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " [openTabs, setOpenTabs] ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " useState", color: "#50fa7b" }, { text: '(["App.tsx"]);', color: "#f1fa8c" }] },
      { tokens: [{ text: "  return", color: "#ff79c6" }, { text: " (", color: "#f8f8f2" }] },
      { tokens: [{ text: '    <div style={{ background: "rgba(30,31,41,0.70)" }}>',color: "#f8f8f2" }] },
      { tokens: [{ text: "      {/* Activity bar + Explorer sidebar */}", color: "#6272a4" }] },
      { tokens: [{ text: "      {/* Tab bar + syntax-highlighted code */}", color: "#6272a4" }] },
      { tokens: [{ text: "      {/* Dracula status bar */}", color: "#6272a4" }] },
      { tokens: [{ text: "    </div>", color: "#f8f8f2" }] },
      { tokens: [{ text: "  );", color: "#f8f8f2" }] },
      { tokens: [{ text: "};", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "export default function", color: "#ff79c6" }, { text: " App", color: "#50fa7b" }, { text: "() {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " [activePage, setActivePage] ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " useState", color: "#50fa7b" }, { text: "<", color: "#f8f8f2" }, { text: "Page", color: "#8be9fd" }, { text: '>("home.js");', color: "#f8f8f2" }] },
      { tokens: [{ text: "  const", color: "#ff79c6" }, { text: " [isDarkMode, setIsDarkMode] ", color: "#f8f8f2" }, { text: "=", color: "#ff79c6" }, { text: " useState", color: "#50fa7b" }, { text: "(", color: "#f8f8f2" }, { text: "false", color: "#bd93f9" }, { text: ");", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "  useEffect", color: "#50fa7b" }, { text: "(() => {", color: "#f8f8f2" }] },
      { tokens: [{ text: "    document.documentElement.classList.toggle(", color: "#f8f8f2" }, { text: '"dark"', color: "#f1fa8c" }, { text: ", isDarkMode);", color: "#f8f8f2" }] },
      { tokens: [{ text: "  }, [isDarkMode]);", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "  return", color: "#ff79c6" }, { text: " (", color: "#f8f8f2" }] },
      { tokens: [{ text: '    <div className="relative w-full h-screen bg-bg">', color: "#f8f8f2" }] },
      { tokens: [{ text: "      {/* Tab nav: home.js about.ts projects.json */}", color: "#6272a4" }] },
      { tokens: [{ text: "      {/* BlueprintGrid — procedural line pattern */}", color: "#6272a4" }] },
      { tokens: [{ text: "      {/* Left sidebar: line numbers + slashes */}", color: "#6272a4" }] },
      { tokens: [{ text: "      <", color: "#f8f8f2" }, { text: "AnimatePresence", color: "#50fa7b" }, { text: " mode", color: "#8be9fd" }, { text: '="wait"', color: "#f1fa8c" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "        <", color: "#f8f8f2" }, { text: "PageContent", color: "#50fa7b" }, { text: " activePage", color: "#8be9fd" }, { text: "={activePage}", color: "#f8f8f2" }] },
      { tokens: [{ text: "          isDarkMode", color: "#8be9fd" }, { text: "={isDarkMode} />", color: "#f8f8f2" }] },
      { tokens: [{ text: "      </", color: "#f8f8f2" }, { text: "AnimatePresence", color: "#50fa7b" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "    </div>", color: "#f8f8f2" }] },
      { tokens: [{ text: "  );", color: "#f8f8f2" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
    ],
  },
  "index.css": {
    lang: "css",
    lines: [
      { tokens: [{ text: "@tailwind", color: "#ff79c6" }, { text: " base;", color: "#f8f8f2" }] },
      { tokens: [{ text: "@tailwind", color: "#ff79c6" }, { text: " components;", color: "#f8f8f2" }] },
      { tokens: [{ text: "@tailwind", color: "#ff79c6" }, { text: " utilities;", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: ":root", color: "#50fa7b" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  --color-bg:", color: "#8be9fd" }, { text: " #f5f5f0;", color: "#f1fa8c" }] },
      { tokens: [{ text: "  --color-ink:", color: "#8be9fd" }, { text: " #111111;", color: "#f1fa8c" }] },
      { tokens: [{ text: "  --color-line:", color: "#8be9fd" }, { text: " #888888;", color: "#f1fa8c" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: ".dark", color: "#50fa7b" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  --color-bg:", color: "#8be9fd" }, { text: " #0d0d0d;", color: "#f1fa8c" }] },
      { tokens: [{ text: "  --color-ink:", color: "#8be9fd" }, { text: " #f0f0f0;", color: "#f1fa8c" }] },
      { tokens: [{ text: "  --color-line:", color: "#8be9fd" }, { text: " #444444;", color: "#f1fa8c" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: ".no-scrollbar::-webkit-scrollbar", color: "#50fa7b" }, { text: " { display:", color: "#8be9fd" }, { text: " none", color: "#f1fa8c" }, { text: "; }", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: ".dashed-grid", color: "#50fa7b" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  background-image:", color: "#8be9fd" }, { text: " repeating-linear-gradient(", color: "#f8f8f2" }] },
      { tokens: [{ text: "    0deg, var(--color-line) 0,", color: "#f1fa8c" }] },
      { tokens: [{ text: "    var(--color-line) 1px, transparent 1px,", color: "#f1fa8c" }] },
      { tokens: [{ text: "    transparent 40px", color: "#f1fa8c" }] },
      { tokens: [{ text: "  );", color: "#f8f8f2" }] },
      { tokens: [{ text: "  background-size:", color: "#8be9fd" }, { text: " 40px 40px;", color: "#f1fa8c" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: ".dotted-line-h", color: "#50fa7b" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  border-top:", color: "#8be9fd" }, { text: " 1px dashed var(--color-line);", color: "#f1fa8c" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: ".dotted-line-v", color: "#50fa7b" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "  border-left:", color: "#8be9fd" }, { text: " 1px dashed var(--color-line);", color: "#f1fa8c" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
    ],
  },
  "main.tsx": {
    lang: "tsx",
    lines: [
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " React ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "react"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " ReactDOM ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "react-dom/client"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " App ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "./App"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: ' "./index.css"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "ReactDOM.createRoot(", color: "#f8f8f2" }, { text: "document", color: "#8be9fd" }, { text: ".getElementById(", color: "#f8f8f2" }, { text: '"root"', color: "#f1fa8c" }, { text: ")!).render(", color: "#f8f8f2" }] },
      { tokens: [{ text: "  <", color: "#f8f8f2" }, { text: "React.StrictMode", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <", color: "#f8f8f2" }, { text: "App", color: "#50fa7b" }, { text: " />", color: "#f8f8f2" }] },
      { tokens: [{ text: "  </", color: "#f8f8f2" }, { text: "React.StrictMode", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: ");", color: "#f8f8f2" }] },
    ],
  },
  ".env.example": {
    lang: "env",
    lines: [
      { tokens: [{ text: "# Copy to .env and fill in your values", color: "#6272a4" }] },
      { tokens: [] },
      { tokens: [{ text: "VITE_APP_TITLE", color: "#ff79c6" }, { text: "=", color: "#f8f8f2" }, { text: "Fine Thought Portfolio", color: "#f1fa8c" }] },
      { tokens: [{ text: "VITE_APP_VERSION", color: "#ff79c6" }, { text: "=", color: "#f8f8f2" }, { text: "1.0.0", color: "#f1fa8c" }] },
      { tokens: [{ text: "VITE_CONTACT_EMAIL", color: "#ff79c6" }, { text: "=", color: "#f8f8f2" }, { text: "hello@finethought.dev", color: "#f1fa8c" }] },
    ],
  },
  ".gitignore": {
    lang: "git",
    lines: [
      { tokens: [{ text: "# Dependencies", color: "#6272a4" }] },
      { tokens: [{ text: "node_modules/", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "# Build output", color: "#6272a4" }] },
      { tokens: [{ text: "dist/", color: "#f8f8f2" }] },
      { tokens: [{ text: "build/", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "# Environment", color: "#6272a4" }] },
      { tokens: [{ text: ".env", color: "#f8f8f2" }] },
      { tokens: [{ text: ".env.local", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "# OS", color: "#6272a4" }] },
      { tokens: [{ text: ".DS_Store", color: "#f8f8f2" }] },
      { tokens: [{ text: "Thumbs.db", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "# Logs", color: "#6272a4" }] },
      { tokens: [{ text: "*.log", color: "#f8f8f2" }] },
      { tokens: [{ text: ".vite/", color: "#f8f8f2" }] },
    ],
  },
  "index.html": {
    lang: "html",
    lines: [
      { tokens: [{ text: "<!DOCTYPE html>", color: "#6272a4" }] },
      { tokens: [{ text: "<", color: "#f8f8f2" }, { text: "html", color: "#ff79c6" }, { text: " lang", color: "#8be9fd" }, { text: '="en"', color: "#f1fa8c" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "  <", color: "#f8f8f2" }, { text: "head", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <", color: "#f8f8f2" }, { text: "meta", color: "#ff79c6" }, { text: " charset", color: "#8be9fd" }, { text: '="UTF-8"', color: "#f1fa8c" }, { text: " />", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <", color: "#f8f8f2" }, { text: "meta", color: "#ff79c6" }, { text: " name", color: "#8be9fd" }, { text: '="viewport"', color: "#f1fa8c" }, { text: " content", color: "#8be9fd" }, { text: '="width=device-width, initial-scale=1.0"', color: "#f1fa8c" }, { text: " />", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <", color: "#f8f8f2" }, { text: "title", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }, { text: "Fine Thought", color: "#f8f8f2" }, { text: "</", color: "#f8f8f2" }, { text: "title", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <", color: "#f8f8f2" }, { text: "link", color: "#ff79c6" }, { text: " rel", color: "#8be9fd" }, { text: '="icon"', color: "#f1fa8c" }, { text: " href", color: "#8be9fd" }, { text: '="/favicon.ico"', color: "#f1fa8c" }, { text: " />", color: "#f8f8f2" }] },
      { tokens: [{ text: "  </", color: "#f8f8f2" }, { text: "head", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "  <", color: "#f8f8f2" }, { text: "body", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "    <", color: "#f8f8f2" }, { text: "div", color: "#ff79c6" }, { text: " id", color: "#8be9fd" }, { text: '="root"', color: "#f1fa8c" }, { text: "></", color: "#f8f8f2" }, { text: "div", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: '    <', color: "#f8f8f2" }, { text: "script", color: "#ff79c6" }, { text: ' type', color: "#8be9fd" }, { text: '="module"', color: "#f1fa8c" }, { text: ' src', color: "#8be9fd" }, { text: '="/src/main.tsx"', color: "#f1fa8c" }, { text: "></", color: "#f8f8f2" }, { text: "script", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "  </", color: "#f8f8f2" }, { text: "body", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
      { tokens: [{ text: "</", color: "#f8f8f2" }, { text: "html", color: "#ff79c6" }, { text: ">", color: "#f8f8f2" }] },
    ],
  },
  "metadata.json": {
    lang: "json",
    lines: [
      { tokens: [{ text: "{", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "name"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"finethought-portfolio"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "version"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"1.0.0"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "author"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"Rhine"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "year"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: "2026", color: "#bd93f9" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "description"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"Blueprint-aesthetic developer portfolio"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "stack"', color: "#f1fa8c" }, { text: ": [", color: "#f8f8f2" }, { text: '"React"', color: "#50fa7b" }, { text: ", ", color: "#f8f8f2" }, { text: '"TypeScript"', color: "#50fa7b" }, { text: ", ", color: "#f8f8f2" }, { text: '"Framer Motion"', color: "#50fa7b" }, { text: "],", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "theme"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"blueprint"', color: "#50fa7b" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
    ],
  },
  "package.json": {
    lang: "json",
    lines: [
      { tokens: [{ text: "{", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "name"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"finethought-portfolio"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "private"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: "true", color: "#bd93f9" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "version"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"1.0.0"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "type"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"module"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "scripts"', color: "#f1fa8c" }, { text: ": {", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "dev"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"vite"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "build"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"tsc -b && vite build"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "preview"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"vite preview"', color: "#50fa7b" }] },
      { tokens: [{ text: "  },", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "dependencies"', color: "#f1fa8c" }, { text: ": {", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "lucide-react"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^0.383.0"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "motion"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^11.2.0"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "react"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^18.3.1"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "react-dom"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^18.3.1"', color: "#50fa7b" }] },
      { tokens: [{ text: "  },", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "devDependencies"', color: "#f1fa8c" }, { text: ": {", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "@vitejs/plugin-react"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^4.3.4"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "tailwindcss"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^3.4.17"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "typescript"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"~5.6.2"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '    "vite"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"^6.0.5"', color: "#50fa7b" }] },
      { tokens: [{ text: "  }", color: "#f8f8f2" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
    ],
  },
  "README.md": {
    lang: "md",
    lines: [
      { tokens: [{ text: "# Fine Thought Portfolio", color: "#ff79c6" }] },
      { tokens: [] },
      { tokens: [{ text: "> Blueprint-aesthetic developer portfolio built with React + Framer Motion", color: "#6272a4" }] },
      { tokens: [] },
      { tokens: [{ text: "## Features", color: "#bd93f9" }] },
      { tokens: [{ text: "- Procedural blueprint grid with seeded random line density", color: "#f8f8f2" }] },
      { tokens: [{ text: "- VS Code-style developer page with Dracula theme", color: "#f8f8f2" }] },
      { tokens: [{ text: "- Computer bus topology diagram for hobbies", color: "#f8f8f2" }] },
      { tokens: [{ text: "- Dracula terminal hover cards for projects", color: "#f8f8f2" }] },
      { tokens: [{ text: "- Dark / light mode toggle", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "## Stack", color: "#bd93f9" }] },
      { tokens: [{ text: "- **React 18** + TypeScript", color: "#f8f8f2" }] },
      { tokens: [{ text: "- **Framer Motion** (motion/react)", color: "#f8f8f2" }] },
      { tokens: [{ text: "- **Tailwind CSS** v3", color: "#f8f8f2" }] },
      { tokens: [{ text: "- **Vite** build tool", color: "#f8f8f2" }] },
      { tokens: [{ text: "- **Lucide React** icons", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "## Getting Started", color: "#bd93f9" }] },
      { tokens: [{ text: "```bash", color: "#6272a4" }] },
      { tokens: [{ text: "yarn install", color: "#50fa7b" }] },
      { tokens: [{ text: "yarn dev", color: "#50fa7b" }] },
      { tokens: [{ text: "```", color: "#6272a4" }] },
      { tokens: [] },
      { tokens: [{ text: "## Build", color: "#bd93f9" }] },
      { tokens: [{ text: "```bash", color: "#6272a4" }] },
      { tokens: [{ text: "yarn build", color: "#50fa7b" }] },
      { tokens: [{ text: "```", color: "#6272a4" }] },
    ],
  },
  "tsconfig.json": {
    lang: "json",
    lines: [
      { tokens: [{ text: "{", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "files"', color: "#f1fa8c" }, { text: ": [],", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "references"', color: "#f1fa8c" }, { text: ": [", color: "#f8f8f2" }] },
      { tokens: [{ text: '    { "path"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"./tsconfig.app.json"', color: "#50fa7b" }, { text: " },", color: "#f8f8f2" }] },
      { tokens: [{ text: '    { "path"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"./tsconfig.node.json"', color: "#50fa7b" }, { text: " }", color: "#f8f8f2" }] },
      { tokens: [{ text: "  ]", color: "#f8f8f2" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "// tsconfig.app.json (compilerOptions)", color: "#6272a4" }] },
      { tokens: [{ text: "{", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "target"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"ES2020"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "lib"', color: "#f1fa8c" }, { text: ": [", color: "#f8f8f2" }, { text: '"ES2020"', color: "#50fa7b" }, { text: ", ", color: "#f8f8f2" }, { text: '"DOM"', color: "#50fa7b" }, { text: ", ", color: "#f8f8f2" }, { text: '"DOM.Iterable"', color: "#50fa7b" }, { text: "],", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "module"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"ESNext"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "jsx"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"react-jsx"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "strict"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: "true", color: "#bd93f9" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "moduleResolution"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: '"bundler"', color: "#50fa7b" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: '  "skipLibCheck"', color: "#f1fa8c" }, { text: ": ", color: "#f8f8f2" }, { text: "true", color: "#bd93f9" }] },
      { tokens: [{ text: "}", color: "#f8f8f2" }] },
    ],
  },
  "vite.config.ts": {
    lang: "tsx",
    lines: [
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " { defineConfig } ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "vite"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [{ text: "import", color: "#ff79c6" }, { text: " react ", color: "#f8f8f2" }, { text: "from", color: "#ff79c6" }, { text: ' "@vitejs/plugin-react"', color: "#f1fa8c" }, { text: ";", color: "#f8f8f2" }] },
      { tokens: [] },
      { tokens: [{ text: "export default", color: "#ff79c6" }, { text: " defineConfig", color: "#50fa7b" }, { text: "({", color: "#f8f8f2" }] },
      { tokens: [{ text: "  plugins:", color: "#8be9fd" }, { text: " [", color: "#f8f8f2" }, { text: "react", color: "#50fa7b" }, { text: "()],", color: "#f8f8f2" }] },
      { tokens: [{ text: "  server:", color: "#8be9fd" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "    port:", color: "#8be9fd" }, { text: " ", color: "#f8f8f2" }, { text: "5173", color: "#bd93f9" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: "    open:", color: "#8be9fd" }, { text: " ", color: "#f8f8f2" }, { text: "true", color: "#bd93f9" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: "  },", color: "#f8f8f2" }] },
      { tokens: [{ text: "  build:", color: "#8be9fd" }, { text: " {", color: "#f8f8f2" }] },
      { tokens: [{ text: "    outDir:", color: "#8be9fd" }, { text: ' "dist"', color: "#f1fa8c" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: "    sourcemap:", color: "#8be9fd" }, { text: " ", color: "#f8f8f2" }, { text: "false", color: "#bd93f9" }, { text: ",", color: "#f8f8f2" }] },
      { tokens: [{ text: "  },", color: "#f8f8f2" }] },
      { tokens: [{ text: "});", color: "#f8f8f2" }] },
    ],
  },
  "yarn.lock": {
    lang: "lock",
    lines: [
      { tokens: [{ text: "# yarn lockfile v1", color: "#6272a4" }] },
      { tokens: [{ text: "# This file is generated automatically.", color: "#6272a4" }] },
      { tokens: [] },
      { tokens: [{ text: '"lucide-react@^0.383.0":', color: "#f1fa8c" }] },
      { tokens: [{ text: "  version", color: "#8be9fd" }, { text: ' "0.383.0"', color: "#50fa7b" }] },
      { tokens: [{ text: "  resolved", color: "#8be9fd" }, { text: ' "https://registry.yarnpkg.com/lucide-react/-/lucide-react-0.383.0.tgz"', color: "#50fa7b" }] },
      { tokens: [] },
      { tokens: [{ text: '"motion@^11.2.0":', color: "#f1fa8c" }] },
      { tokens: [{ text: "  version", color: "#8be9fd" }, { text: ' "11.2.0"', color: "#50fa7b" }] },
      { tokens: [{ text: "  resolved", color: "#8be9fd" }, { text: ' "https://registry.yarnpkg.com/motion/-/motion-11.2.0.tgz"', color: "#50fa7b" }] },
      { tokens: [] },
      { tokens: [{ text: '"react@^18.3.1":', color: "#f1fa8c" }] },
      { tokens: [{ text: "  version", color: "#8be9fd" }, { text: ' "18.3.1"', color: "#50fa7b" }] },
      { tokens: [{ text: "  resolved", color: "#8be9fd" }, { text: ' "https://registry.yarnpkg.com/react/-/react-18.3.1.tgz"', color: "#50fa7b" }] },
      { tokens: [] },
      { tokens: [{ text: '"vite@^6.0.5":', color: "#f1fa8c" }] },
      { tokens: [{ text: "  version", color: "#8be9fd" }, { text: ' "6.0.5"', color: "#50fa7b" }] },
      { tokens: [{ text: "  resolved", color: "#8be9fd" }, { text: ' "https://registry.yarnpkg.com/vite/-/vite-6.0.5.tgz"', color: "#50fa7b" }] },
    ],
  },
};

const getFileIcon = (type: string) => {
  const color = fileIconColors[type] || "#f8f8f2";
  switch (type) {
    case "folder": return <Folder size={13} color={color} />;
    case "tsx": return <FileCode size={13} color={color} />;
    case "css": return <FileCog size={13} color={color} />;
    case "json": return <FileJson size={13} color={color} />;
    case "md": return <FileText size={13} color={color} />;
    default: return <FileText size={13} color={color} />;
  }
};

const VSCodeEditor = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>("App.tsx");
  const [openTabs, setOpenTabs] = useState<string[]>(["App.tsx"]);
  const [srcExpanded, setSrcExpanded] = useState(true);

  const openFile = (name: string) => {
    setSelectedFile(name);
    if (!openTabs.includes(name)) setOpenTabs(p => [...p, name]);
  };

  const closeTab = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openTabs.filter(t => t !== name);
    setOpenTabs(next);
    if (selectedFile === name) setSelectedFile(next[next.length - 1] || null);
  };

  const content = selectedFile ? fileContents[selectedFile] : null;

  return (
    <div className="flex h-full w-full overflow-hidden rounded-lg border border-[#44475a] shadow-2xl" style={{ background: "rgba(30,31,41,0.70)", backdropFilter: "blur(2px)", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      {/* Activity Bar */}
      <div className="w-10 flex flex-col items-center py-3 gap-4 border-r border-[#44475a]" style={{ background: "#21222c" }}>
        {[<FileCode size={18} />, <Folder size={18} />, <TerminalIcon size={18} />].map((icon, i) => (
          <div key={i} className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer" style={{ color: i === 0 ? "#f8f8f2" : "#6272a4" }}>
            {icon}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="w-52 border-r border-[#44475a] overflow-y-auto flex flex-col" style={{ background: "#21222c" }}>
        <div className="px-3 py-2 text-[9px] uppercase tracking-widest" style={{ color: "#6272a4" }}>
          Explorer
        </div>
        <div className="px-2 text-[10px]" style={{ color: "#f8f8f2" }}>
          <div
            className="flex items-center gap-1 py-1 cursor-pointer hover:bg-white/5 px-1 rounded"
            onClick={() => setSrcExpanded(p => !p)}
          >
            {srcExpanded ? <ChevronDown size={11} color="#6272a4" /> : <ChevronRight size={11} color="#6272a4" />}
            <Folder size={13} color="#f1fa8c" />
            <span style={{ color: "#f8f8f2" }}>src</span>
          </div>
          {srcExpanded && (
            <div className="pl-5">
              {["App.tsx", "index.css", "main.tsx"].map(name => {
                const ext = name.split(".").pop()!;
                return (
                  <div
                    key={name}
                    onClick={() => openFile(name)}
                    className="flex items-center gap-1.5 py-0.5 cursor-pointer px-1 rounded transition-colors"
                    style={{ background: selectedFile === name ? "#44475a" : "transparent" }}
                  >
                    {getFileIcon(ext === "tsx" ? "tsx" : ext)}
                    <span style={{ color: fileIconColors[ext === "tsx" ? "tsx" : ext] || "#f8f8f2", fontSize: "10px" }}>{name}</span>
                  </div>
                );
              })}
            </div>
          )}
          {[".env.example", ".gitignore", "index.html", "metadata.json", "package.json", "README.md", "tsconfig.json", "vite.config.ts", "yarn.lock"].map(name => {
            const ext = name.includes(".env") ? "env" : name.includes(".gitignore") ? "git" : name.includes("lock") ? "lock" : name.split(".").pop()!;
            return (
              <div
                key={name}
                onClick={() => openFile(name)}
                className="flex items-center gap-1.5 py-0.5 cursor-pointer px-1 rounded transition-colors"
                style={{ background: selectedFile === name ? "#44475a" : "transparent" }}
              >
                {getFileIcon(ext)}
                <span style={{ color: fileIconColors[ext] || "#f8f8f2", fontSize: "10px" }}>{name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[#44475a]" style={{ background: "#21222c" }}>
          {openTabs.map(tab => {
            const ext = tab.includes(".env") ? "env" : tab.includes(".gitignore") ? "git" : tab.includes("lock") ? "lock" : tab.split(".").pop()!;
            return (
              <div
                key={tab}
                onClick={() => setSelectedFile(tab)}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[10px] border-r border-[#44475a] whitespace-nowrap flex-shrink-0"
                style={{
                  background: selectedFile === tab ? "#282a36" : "#21222c",
                  borderTop: selectedFile === tab ? "1px solid #bd93f9" : "1px solid transparent",
                  color: selectedFile === tab ? "#f8f8f2" : "#6272a4"
                }}
              >
                <span style={{ color: fileIconColors[ext] || "#f8f8f2" }}>{getFileIcon(ext)}</span>
                {tab}
                <span
                  onClick={e => closeTab(tab, e)}
                  className="ml-1 w-3 h-3 flex items-center justify-center rounded-sm opacity-40 hover:opacity-100 hover:bg-white/20 text-[9px] transition-all"
                >×</span>
              </div>
            );
          })}
        </div>

        {/* Code view */}
        <div className="flex-1 overflow-auto" style={{ background: "#282a36" }}>
          {content ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFile}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex min-h-full"
              >
                <div className="select-none text-right pr-3 pt-4 text-[10px] min-w-[36px]" style={{ color: "#44475a", background: "#282a36", borderRight: "1px solid #44475a" }}>
                  {content.lines.map((_, i) => <div key={i} className="leading-5">{i + 1}</div>)}
                </div>
                <div className="flex-1 p-4 font-mono text-[11px] leading-5">
                  {content.lines.map((line, li) => (
                    <div key={li} className="whitespace-pre hover:bg-white/[0.03] transition-colors">
                      {line.tokens.length === 0 ? "\u00A0" : line.tokens.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: "#6272a4" }}>
              <div className="text-center font-mono text-sm">
                <div className="text-4xl mb-4 opacity-20">{"{ }"}</div>
                <div className="text-[11px] uppercase tracking-widest">Select a file to view</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-0.5 text-[9px] font-mono" style={{ background: "#bd93f9", color: "#282a36" }}>
          <div className="flex items-center gap-3">
            <span>⎇ main</span>
            <span>✓ 0 errors</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{selectedFile ? fileContents[selectedFile]?.lang?.toUpperCase() || "TEXT" : "—"}</span>
            <span>UTF-8</span>
            <span>Dracula</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollRow = ({ images, direction, color }: { images: string[]; direction: "left" | "right"; color: string }) => {
  const doubled = [...images, ...images, ...images];
  const duration = 22;
  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
      <motion.div
        className="flex gap-1.5"
        style={{ width: "max-content" }}
        animate={{ x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((src, i) => (
          <div key={i} className="flex-shrink-0 overflow-hidden" style={{ width: 130, height: 78, border: `1px solid ${color}33` }}>
            <img src={src} alt="" className="w-full h-full object-cover" style={{ filter: "grayscale(100%) contrast(0.9)", opacity: 0.75 }} referrerPolicy="no-referrer" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const HobbyNode = ({ hobby, W, H, isDarkMode }: any) => {
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  const handleEnter = () => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const cardW = 520;
      let left = rect.left + rect.width / 2 - cardW / 2;
      if (left + cardW > window.innerWidth - 8) left = window.innerWidth - cardW - 8;
      if (left < 8) left = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const cardH = 260;
      const top = spaceBelow > cardH + 8 ? rect.bottom + 6 : rect.top - cardH - 6;
      setCardStyle({ position: "fixed", top, left, width: cardW, zIndex: 999998 });
    }
    setHovered(true);
  };

  const row1 = hobby.images.slice(0, 3);
  const row2 = hobby.images.slice(3, 6);
  const row3 = hobby.images.slice(6, 9);

  return (
    <>
      <motion.div
        ref={nodeRef}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        style={{ position: "absolute", left: `${(hobby.x / W) * 100}%`, top: `${(hobby.y / H) * 100}%`, transform: "translate(-50%, -50%)", zIndex: 50 }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          className="flex flex-col items-center gap-1.5 px-3 py-2.5 cursor-default whitespace-nowrap"
          style={{ background: "var(--color-bg)", border: `1.5px solid ${hobby.color}`, boxShadow: `2px 2px 0 0 ${hobby.color}` }}
          animate={{ boxShadow: [`2px 2px 0 0 ${hobby.color}44`, `3px 3px 0 0 ${hobby.color}bb`, `2px 2px 0 0 ${hobby.color}44`] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ color: hobby.color }}>{hobby.icon}</div>
          <span className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color: hobby.color }}>{hobby.name}</span>
        </motion.div>
      </motion.div>

      {hovered && (
        <div style={cardStyle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{
              background: isDarkMode ? "rgba(20,20,20,0.96)" : "rgba(250,250,248,0.97)",
              border: `1.5px solid ${hobby.color}55`,
              boxShadow: `0 8px 32px ${hobby.color}22`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: `${hobby.color}22` }}>
              <div style={{ color: hobby.color }}>{hobby.icon}</div>
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: hobby.color }}>{hobby.name}</span>
              <div className="flex-1" />
              <span className="font-mono text-[8px] opacity-30 uppercase tracking-widest">// gallery</span>
            </div>
            {/* 3 scroll rows */}
            <div className="flex flex-col gap-1.5 p-3">
              <ScrollRow images={row1} direction="left" color={hobby.color} />
              <ScrollRow images={row2} direction="right" color={hobby.color} />
              <ScrollRow images={row3} direction="left" color={hobby.color} />
            </div>
            {/* Footer */}
            <div className="px-4 py-2 border-t flex items-center gap-2" style={{ borderColor: `${hobby.color}22` }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: hobby.color, opacity: 0.3 + i * 0.3 }} />)}
              </div>
              <span className="font-mono text-[8px] opacity-30">9 memories</span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

const PageContent = ({ activePage, isDarkMode }: { activePage: Page; isDarkMode: boolean }) => {
  const fillInAnimation = {
    initial: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
    animate: { clipPath: "inset(0 0% 0 0)", opacity: 1 },
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  };
  const bgTextStyles = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16vw] font-black uppercase opacity-[0.03] pointer-events-none select-none z-0";

  switch (activePage) {
    case "home.js":
      return (
        <div className="relative w-full h-full">
          <motion.div {...fillInAnimation} className="absolute top-8 left-4 md:top-12 md:left-24 z-40">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.85] uppercase">
              Web engineer<br />& creative coder
            </h2>
          </motion.div>
          <div className="absolute bottom-0 right-0 p-3 md:p-8 lg:p-12 flex flex-col items-end z-40">
            <motion.div {...fillInAnimation} transition={{ ...fillInAnimation.transition, delay: 0.2 }} className="relative">
              <h1 className="text-[60px] md:text-[120px] lg:text-[200px] font-black tracking-tighter leading-[0.75] uppercase text-right [writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">Fine</h1>
            </motion.div>
            <motion.div {...fillInAnimation} transition={{ ...fillInAnimation.transition, delay: 0.4 }} className="relative mt-[-6px] md:mt-[-10px] lg:mt-[-20px]">
              <h1 className="text-[60px] md:text-[120px] lg:text-[200px] font-black tracking-tighter leading-[0.75] uppercase text-right [writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">Thought</h1>
            </motion.div>
          </div>
        </div>
      );

    case "about.ts":
      return (
        <div className="relative w-full h-full p-4 pt-8 md:p-24 md:pt-32">
          <motion.div {...fillInAnimation} className="max-w-3xl z-40 relative">
            <h2 className="text-2xl md:text-4xl font-black uppercase mb-6 md:mb-8 tracking-tighter">System Profile</h2>
            <div className="space-y-4 md:space-y-6 font-mono text-xs md:text-sm leading-relaxed opacity-80">
              <p>[ bio ] &gt; I build digital experiences at the intersection of design and engineering. Focusing on high-performance web applications and creative coding experiments.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pt-6 md:pt-8 border-t border-line/20">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-3 md:mb-4 font-bold flex items-center gap-2"><Code2 size={12} /> Core Stack</h3>
                    <ul className="space-y-1"><li>- React / Next.js / Vue</li><li>- TypeScript / Node / Go</li><li>- Tailwind / Framer / GSAP</li><li>- Three.js / WebGL / GLSL</li></ul>
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-3 md:mb-4 font-bold flex items-center gap-2"><Database size={12} /> Data & Cloud</h3>
                    <ul className="space-y-1"><li>- PostgreSQL / Redis</li><li>- MongoDB / Firebase</li><li>- AWS / Vercel / Docker</li></ul>
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-3 md:mb-4 font-bold flex items-center gap-2"><Cpu size={12} /> Experience</h3>
                    <ul className="space-y-1"><li>- Creative Dev @ Studio</li><li>- Fullstack Eng @ Tech</li><li>- Open Source Contributor</li></ul>
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-3 md:mb-4 font-bold flex items-center gap-2"><Layers size={12} /> Tools</h3>
                    <ul className="space-y-1"><li>- Figma / Adobe CC</li><li>- Blender / Spline</li><li>- Git / CI/CD</li></ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 z-40">
            <motion.h1 {...fillInAnimation} transition={{ ...fillInAnimation.transition, delay: 0.3 }} className="text-5xl md:text-8xl font-black uppercase tracking-tighter opacity-10 [writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">Rhine</motion.h1>
          </div>
          <div className={bgTextStyles}>About</div>
        </div>
      );

    case "projects.json": {
      const [hoveredInfo, setHoveredInfo] = useState<{ project: any; rect: DOMRect } | null>(null);
      return (
        <div className="relative w-full h-full">
          <div className="w-full h-full p-4 pt-8 md:p-24 md:pt-32 overflow-y-auto custom-scrollbar">
            <motion.div {...fillInAnimation} className="relative" style={{ zIndex: 40 }}>
              <h2 className="text-2xl md:text-4xl font-black uppercase mb-8 md:mb-12 tracking-tighter">Active Repositories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-16">
                {terminalProjects.map((project, i) => (
                  <ProjectItem key={project.name} project={project} index={i} isDarkMode={isDarkMode} onHover={setHoveredInfo} />
                ))}
              </div>
              <div className="h-48" />
            </motion.div>
            <div className={bgTextStyles}>Projects</div>
          </div>
          {/* Popup renders here — sibling to scroll container, outside any motion.div transform */}
          {hoveredInfo && (
            <TerminalPopup project={hoveredInfo.project} rect={hoveredInfo.rect} isDarkMode={isDarkMode} />
          )}
        </div>
      );
    }

    case "hobbies.sh":
      return (
        <div className="relative w-full h-full overflow-hidden bg-bg">
          <motion.div {...fillInAnimation} className="z-40 relative h-full flex flex-col">
            <div className="px-4 pt-8 pb-4 md:px-24 md:pt-32 flex-shrink-0">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">System Preferences</h2>
            </div>
            <div className="relative flex-1 mx-4 md:mx-24 mb-4 md:mb-8" style={{ minHeight: 0 }}>
              {(() => {
                const W = 800, H = 420;
                const cx = 400, cy = 210;
                const hobbies = [
                  { name: "Traveling", icon: <Plane size={16} />, x: 60, y: 40, color: isDarkMode ? "#50fa7b" : "#1a7f37",
                    images: ["https://picsum.photos/seed/t1/200/120","https://picsum.photos/seed/t2/200/120","https://picsum.photos/seed/t3/200/120","https://picsum.photos/seed/t4/200/120","https://picsum.photos/seed/t5/200/120","https://picsum.photos/seed/t6/200/120","https://picsum.photos/seed/t7/200/120","https://picsum.photos/seed/t8/200/120","https://picsum.photos/seed/t9/200/120"] },
                  { name: "Gaming", icon: <Gamepad2 size={16} />, x: 680, y: 40, color: isDarkMode ? "#ff79c6" : "#cf222e",
                    images: ["https://picsum.photos/seed/g1/200/120","https://picsum.photos/seed/g2/200/120","https://picsum.photos/seed/g3/200/120","https://picsum.photos/seed/g4/200/120","https://picsum.photos/seed/g5/200/120","https://picsum.photos/seed/g6/200/120","https://picsum.photos/seed/g7/200/120","https://picsum.photos/seed/g8/200/120","https://picsum.photos/seed/g9/200/120"] },
                  { name: "Anime", icon: <Tv size={16} />, x: 30, y: 340, color: isDarkMode ? "#8be9fd" : "#0550ae",
                    images: ["https://picsum.photos/seed/a1/200/120","https://picsum.photos/seed/a2/200/120","https://picsum.photos/seed/a3/200/120","https://picsum.photos/seed/a4/200/120","https://picsum.photos/seed/a5/200/120","https://picsum.photos/seed/a6/200/120","https://picsum.photos/seed/a7/200/120","https://picsum.photos/seed/a8/200/120","https://picsum.photos/seed/a9/200/120"] },
                  { name: "Movies", icon: <Film size={16} />, x: 710, y: 340, color: isDarkMode ? "#ffb86c" : "#9a6700",
                    images: ["https://picsum.photos/seed/m1/200/120","https://picsum.photos/seed/m2/200/120","https://picsum.photos/seed/m3/200/120","https://picsum.photos/seed/m4/200/120","https://picsum.photos/seed/m5/200/120","https://picsum.photos/seed/m6/200/120","https://picsum.photos/seed/m7/200/120","https://picsum.photos/seed/m8/200/120","https://picsum.photos/seed/m9/200/120"] },
                  { name: "Sleeping", icon: <Moon size={16} />, x: 340, y: 360, color: isDarkMode ? "#bd93f9" : "#8250df",
                    images: ["https://picsum.photos/seed/s1/200/120","https://picsum.photos/seed/s2/200/120","https://picsum.photos/seed/s3/200/120","https://picsum.photos/seed/s4/200/120","https://picsum.photos/seed/s5/200/120","https://picsum.photos/seed/s6/200/120","https://picsum.photos/seed/s7/200/120","https://picsum.photos/seed/s8/200/120","https://picsum.photos/seed/s9/200/120"] },
                ];
                const buildPath = (nx: number, ny: number) => `M ${cx} ${cy} L ${nx} ${cy} L ${nx} ${ny}`;
                return (
                  <>
                    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                      {hobbies.map((h, i) => {
                        const path = buildPath(h.x, h.y);
                        return (
                          <g key={i}>
                            <path d={path} stroke={h.color} strokeWidth="1.5" fill="none" opacity="0.2" />
                            <motion.path d={path} stroke={h.color} strokeWidth="1.5" fill="none" strokeDasharray="6 6"
                              initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -72 }}
                              transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "linear", delay: i * 0.15 }} opacity="0.8" />
                            <circle cx={h.x} cy={cy} r="3.5" fill={h.color} opacity="0.7" />
                            <circle cx={cx} cy={cy} r="3" fill={h.color} opacity="0.4" />
                          </g>
                        );
                      })}
                      <rect x={cx - 55} y={cy - 20} width={110} height={40} fill="currentColor" rx="1" className="text-ink" />
                      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="3" fill="var(--color-bg)">HOBBIES</text>
                    </svg>
                    {hobbies.map((hobby) => (
                      <HobbyNode key={hobby.name} hobby={hobby} W={W} H={H} isDarkMode={isDarkMode} />
                    ))}
                  </>
                );
              })()}
            </div>
          </motion.div>
          <div className={bgTextStyles}>Hobbies</div>
        </div>
      );

    case "developer.md":
      return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-0">
          <motion.div {...fillInAnimation} className="z-40 relative w-full md:w-auto" style={{ width: "min(90%, 60vw)", height: "min(80%, 60vh)" }}>
            <VSCodeEditor />
          </motion.div>
          <div className={bgTextStyles}>Developer</div>
        </div>
      );

    case "contact.css":
      return (
        <div className="relative w-full h-full flex items-center justify-center p-6 md:p-24">
          <motion.div {...fillInAnimation} className="text-center z-40 relative">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter mb-6 md:mb-8">Get in touch</h2>
            <div className="flex flex-col items-center gap-3 md:gap-4 font-mono text-base md:text-lg">
              <a href="mailto:hello@finethought.js" className="hover:underline opacity-80">hello@finethought.js</a>
              <div className="flex gap-6 md:gap-8 mt-6 md:mt-8 opacity-50 text-xs md:text-sm uppercase tracking-widest">
                <a href="#" className="hover:text-ink transition-colors">Twitter</a>
                <a href="#" className="hover:text-ink transition-colors">Github</a>
                <a href="#" className="hover:text-ink transition-colors">LinkedIn</a>
              </div>
            </div>
          </motion.div>
          <div className={bgTextStyles}>Contact</div>
        </div>
      );

    default:
      return null;
  }
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home.js");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pages: Page[] = ["home.js", "about.ts", "projects.json", "hobbies.sh", "contact.css", "developer.md"];

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Page icons for mobile nav
  const pageIcons: Record<Page, React.ReactNode> = {
    "home.js":       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    "about.ts":      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    "projects.json": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    "hobbies.sh":    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    "contact.css":   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    "developer.md":  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  };

  const dotColors: Record<string, string> = {
    ".js": "bg-yellow-500", ".ts": "bg-blue-500", ".json": "bg-orange-500",
    ".sh": "bg-emerald-500", ".md": "bg-purple-500", ".css": "bg-pink-500",
  };
  const getDotColor = (page: Page) => {
    const ext = Object.keys(dotColors).find(e => page.endsWith(e));
    return ext ? dotColors[ext] : "bg-gray-400";
  };

  return (
    <div className="relative w-full h-screen bg-bg selection:bg-ink selection:text-bg" style={{ overflow: "hidden" }}>

      {/* ── DESKTOP / TABLET TOP NAV ── */}
      <div className="hidden md:flex absolute top-0 left-0 w-full h-9 border-b border-line items-end bg-bg/80 backdrop-blur-md z-50">
        <div className="flex h-full overflow-x-auto no-scrollbar">
          {pages.map((page) => (
            <button key={page} onClick={() => setActivePage(page)}
              className={`h-full px-6 flex items-center gap-2 border-r border-line font-mono text-[10px] uppercase tracking-wider transition-all relative whitespace-nowrap ${activePage === page ? "bg-bg opacity-100" : "bg-ink/5 opacity-40 hover:opacity-70"}`}>
              {activePage === page && <motion.div layoutId="activeTab" className="absolute top-0 left-0 w-full h-[2px] bg-ink z-10" />}
              <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(page)} opacity-60`} />
              {page}
            </button>
          ))}
        </div>
        <div className="flex-1 h-full flex items-center justify-end px-4 gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
            <span className="hidden sm:inline">{isDarkMode ? "[ light_mode ]" : "[ dark_mode ]"}</span>
            <div className="w-3 h-3 rounded-full border border-ink/30 flex items-center justify-center">
              {isDarkMode && <div className="w-1.5 h-1.5 rounded-full bg-ink" />}
            </div>
          </button>
          <span className="font-mono text-[10px] opacity-20 hidden lg:block">UTF-8 // LF // TypeScript</span>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV — icon only ── */}
      <div className="flex md:hidden absolute bottom-0 left-0 w-full h-14 border-t border-line bg-bg/90 backdrop-blur-md z-50 items-center justify-around px-2">
        {pages.map((page) => (
          <button key={page} onClick={() => setActivePage(page)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${activePage === page ? "opacity-100" : "opacity-35"}`}>
            {activePage === page && <motion.div layoutId="mobileActiveTab" className="absolute bottom-0 w-6 h-[2px] bg-ink" />}
            <div className={`${activePage === page ? "scale-110" : ""} transition-transform`} style={{ color: "currentColor" }}>
              {pageIcons[page]}
            </div>
            <div className={`w-1 h-1 rounded-full ${getDotColor(page)} opacity-70`} />
          </button>
        ))}
        <button onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full opacity-40">
          <div className="w-4 h-4 rounded-full border border-ink/50 flex items-center justify-center">
            {isDarkMode && <div className="w-2 h-2 rounded-full bg-ink" />}
          </div>
        </button>
      </div>

      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 dashed-grid opacity-10 pointer-events-none z-0" />
      <BlueprintGrid activePage={activePage} isMobile={isMobile} />

      {/* ── LEFT SIDEBAR (desktop only) ── */}
      <div className="absolute left-0 top-9 bottom-0 h-[calc(100%-36px)] hidden md:flex border-r border-line z-20">
        <div className="w-8 border-r border-line bg-bg/50 backdrop-blur-sm"><LineNumbers /></div>
        <div className="w-6 bg-bg/30"><VerticalSlashes /></div>
      </div>

      {/* ── CONTENT AREA ── */}
      {/* Mobile: full width, top=0, bottom=56px (nav height) */}
      {/* Desktop: left=56px (sidebar), top=36px (nav), bottom=0 */}
      <div className="absolute left-0 md:left-0 top-0 md:top-9 bottom-14 md:bottom-0 w-full h-[calc(100%-56px)] md:h-[calc(100%-36px)] overflow-y-auto"
        style={{ overflowX: "visible" }}>
        <AnimatePresence mode="wait">
          <motion.div key={activePage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
            <PageContent activePage={activePage} isDarkMode={isDarkMode} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── DECORATIVE LINES ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[15, 35, 55, 75, 90].map((top) => (
          <div key={top} style={{ top: `${top}%` }} className="absolute left-0 w-full dotted-line-h opacity-30" />
        ))}
        {[20, 40, 60, 80].map((left) => (
          <div key={left} style={{ left: `${left}%` }} className="absolute top-0 h-full dotted-line-v opacity-20 hidden md:block" />
        ))}
      </div>

      {/* ── VERSION LABEL ── */}
      <div className="absolute bottom-16 md:bottom-4 left-4 md:left-24 font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-30 z-50">
        v1.0.0 / 2026 // {activePage}
      </div>
    </div>
  );
}