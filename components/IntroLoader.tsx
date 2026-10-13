// First-visit intro for the home page: the wordmark "renders" left to right over a
// progress bar, then the panel wipes up into the hero. Plain server markup driven by
// CSS (see .intro in globals.css); it only shows when the root layout's inline
// script has set <html data-intro>, so repeat visits in a session skip it.

function Wordmark() {
  return (
    <>
      <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.035em' }}>motion</span>
      <span style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)', margin: '0 0.04em' }}>by</span>
      <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 400, color: '#ffffff', letterSpacing: '-0.035em' }}>harsh</span>
    </>
  );
}

export default function IntroLoader() {
  return (
    <div
      aria-hidden="true"
      className="intro fixed inset-0 flex-col items-center justify-center select-none"
      style={{ zIndex: 200, background: '#060B14' }}
    >
      {/* Faint blueprint grid, echoing the hero background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(79,142,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000, transparent)',
        }}
      />

      <div className="intro-mark relative whitespace-nowrap" style={{ fontSize: 'clamp(40px, 7vw, 84px)', lineHeight: 1.2 }}>
        <div style={{ opacity: 0.12, filter: 'grayscale(1)' }}>
          <Wordmark />
        </div>
        <div className="intro-mark-lit absolute inset-0">
          <Wordmark />
        </div>
      </div>

      <div className="absolute inset-x-6 md:inset-x-12 bottom-8 md:bottom-10">
        <div
          className="flex items-end justify-between font-body uppercase mb-3 text-[10.5px] md:text-[11px] tracking-[0.2em]"
          style={{ color: 'rgba(240,237,232,0.6)' }}
        >
          <span>Loading the reel</span>
          <span className="font-display" style={{ color: '#fff', fontSize: 'clamp(22px, 2.4vw, 30px)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span className="intro-count" />
            <span style={{ color: 'var(--accent)' }}>%</span>
          </span>
        </div>
        <div style={{ height: 1, background: 'rgba(147,197,253,0.14)' }}>
          <div
            className="intro-bar h-full"
            style={{ background: 'linear-gradient(90deg, var(--accent), #c9dcff)', boxShadow: '0 0 12px rgba(79,142,247,0.8)' }}
          />
        </div>
      </div>
    </div>
  );
}
