import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative h-full overflow-hidden bg-background">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px]" />

        {/* Decorative markers */}
        <div className="absolute top-[20%] left-[25%] w-3 h-3 rounded-full bg-accent/30" />
        <div className="absolute top-[45%] left-[55%] w-2 h-2 rounded-full bg-red-400/20" />
        <div className="absolute top-[65%] left-[35%] w-4 h-4 rounded-full bg-orange-400/20" />
        <div className="absolute top-[30%] left-[70%] w-2.5 h-2.5 rounded-full bg-blue-400/15" />
        <div className="absolute top-[75%] left-[60%] w-3 h-3 rounded-full bg-accent/20" />
        <div className="absolute top-[55%] left-[45%] w-1.5 h-1.5 rounded-full bg-green-400/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/10 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-accent tracking-wider uppercase">
            Educatief · Openbaar · Gratis
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          <span className="text-gradient">Ontdek de</span>
          <br />
          <span className="text-gradient">geschiedenis</span>
          <br />
          <span className="text-gradient">om je heen</span>
        </h1>

        {/* Description */}
        <p className="max-w-lg text-lg sm:text-xl text-text-secondary font-light leading-relaxed mb-10">
          Een interactieve kaart die historische gebeurtenissen uit de
          afgelopen <span className="text-text-primary font-medium">100+ jaar</span> toont.
          Ontdek wat er in jouw buurt gebeurde tijdens oorlogen, crises
          en bijzondere momenten.
        </p>

        {/* CTA */}
        <Link
          href="/kaart"
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-accent text-background font-semibold text-lg transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_40px_rgba(212,184,112,0.3)] active:scale-[0.98]"
        >
          <span>Verken de kaart</span>
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          <div className="glass rounded-xl p-4 text-left">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Interactieve kaart</h3>
            <p className="text-xs text-text-secondary">Navigeer door Europa en ontdek historische gebeurtenissen met één klik.</p>
          </div>
          <div className="glass rounded-xl p-4 text-left">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Tijdlijn & filters</h3>
            <p className="text-xs text-text-secondary">Filter op periode, categorie of zoek specifieke locaties.</p>
          </div>
          <div className="glass rounded-xl p-4 text-left">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4m0 12v4m-8-8H2m20 0h-4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">In de buurt</h3>
            <p className="text-xs text-text-secondary">Ontdek wat er in jouw omgeving gebeurde, misschien wel om de hoek.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-text-muted">
          <span>© 2026 SectorHistory</span>
          <a
            href="https://ko-fi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/60 hover:text-accent transition-colors"
          >
            Steun dit project
          </a>
        </div>
      </div>
    </div>
  );
}
