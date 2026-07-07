const desktopApps = [
  { name: "Terminal", id: "tty-01", tone: "text-green-300" },
  { name: "Monitor", id: "sysmon", tone: "text-cyan-300" },
  { name: "Projects", id: "vault", tone: "text-amber-300" },
  { name: "Notes", id: "field", tone: "text-slate-200" }
];

const bootLines = [
  "WEBOS-1 BIOS 0.0.1",
  "memory check: 65536 KB ok",
  "serial bus: attached",
  "network stack: simulated",
  "desktop handoff: ready"
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070a0f] text-slate-100">
      <section className="relative flex min-h-screen flex-col border border-green-400/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_32%),linear-gradient(135deg,rgba(8,13,20,0.98),rgba(4,7,11,1))]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="pointer-events-none absolute inset-0 scanline opacity-45" />

        <header className="relative z-10 flex h-10 items-center justify-between border-b border-green-300/20 bg-black/50 px-4 font-mono text-xs uppercase tracking-[0.18em] text-green-200">
          <span>webos-1.local</span>
          <span className="text-cyan-200">static export ready</span>
        </header>

        <div className="relative z-10 grid flex-1 grid-cols-1 gap-6 p-5 md:grid-cols-[120px_1fr] md:p-8">
          <nav className="grid auto-rows-max grid-cols-2 gap-4 md:grid-cols-1">
            {desktopApps.map((app) => (
              <div
                className="group flex min-h-24 flex-col items-center justify-center gap-2 border border-slate-600/50 bg-slate-950/50 p-3 text-center shadow-[0_0_24px_rgba(15,23,42,0.38)] transition-colors hover:border-green-300/60"
                key={app.id}
              >
                <div className="grid size-10 place-items-center border border-current bg-black/45 font-mono text-sm text-slate-100 group-hover:text-green-200">
                  {app.id.slice(0, 2).toUpperCase()}
                </div>
                <span className={`font-mono text-[11px] ${app.tone}`}>
                  {app.name}
                </span>
              </div>
            ))}
          </nav>

          <div className="grid min-h-[520px] gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="flex flex-col border border-green-300/25 bg-slate-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
              <div className="flex h-9 items-center justify-between border-b border-green-300/20 bg-green-950/25 px-3 font-mono text-xs text-green-100">
                <span>tty-01 / boot preview</span>
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/75" />
                  <span className="size-2.5 rounded-full bg-amber-300/75" />
                  <span className="size-2.5 rounded-full bg-green-300/75" />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 font-mono">
                <div className="space-y-2 text-sm text-green-200">
                  {bootLines.map((line) => (
                    <p key={line}>
                      <span className="text-cyan-300">&gt;</span> {line}
                    </p>
                  ))}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Phase 0 shell
                  </p>
                  <h1 className="mt-3 max-w-2xl text-4xl font-semibold text-slate-50 md:text-6xl">
                    Embedded desktop simulation for the browser.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    The first scaffold is in place: Next.js, Tailwind CSS, a
                    static-export configuration, and a visual desktop shell for
                    the WebOS 1 mission.
                  </p>
                </div>
              </div>
            </section>

            <aside className="grid gap-5">
              <section className="border border-cyan-300/25 bg-slate-950/75">
                <div className="border-b border-cyan-300/20 px-3 py-2 font-mono text-xs text-cyan-100">
                  sysmon / placeholder
                </div>
                <div className="space-y-4 p-4 font-mono text-xs">
                  <Meter label="cpu" value="42%" color="bg-green-300" />
                  <Meter label="ram" value="1.8G / 4G" color="bg-cyan-300" />
                  <Meter label="uptime" value="00:00:00" color="bg-amber-300" />
                </div>
              </section>

              <section className="border border-amber-300/25 bg-slate-950/75 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-200">
                  build notes
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>Static export stays enabled for simple hosting.</li>
                  <li>No login gate or server runtime is planned.</li>
                  <li>Window behavior begins in Phase 1.</li>
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function Meter({
  label,
  value,
  color
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-slate-300">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 border border-slate-700 bg-black/60">
        <div className={`h-full w-2/3 ${color}`} />
      </div>
    </div>
  );
}
