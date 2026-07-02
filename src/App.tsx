import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowDown, Menu, X } from 'lucide-react';

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
}

// ─── FRAME DECODER HOOK ───────────────────────────────────────────────────────
// Uses the ImageDecoder API (Chrome/Edge 94+) to extract every frame of an
// animated WebP into ImageBitmaps so we can render any frame on demand.

interface FrameDecodeState {
  frames: ImageBitmap[];
  loaded: boolean;
  supported: boolean;
  loadProgress: number;
}

function useFrameDecoder(url: string): FrameDecodeState {
  const [state, setState] = useState<FrameDecodeState>({
    frames: [],
    loaded: false,
    supported: true,
    loadProgress: 0,
  });

  useEffect(() => {
    if (typeof (window as any).ImageDecoder === 'undefined') {
      setState(s => ({ ...s, supported: false }));
      return;
    }

    let cancelled = false;
    const bitmaps: ImageBitmap[] = [];

    async function decode() {
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();

        const decoder = new (window as any).ImageDecoder({
          data: blob.stream(),
          type: blob.type || 'image/webp',
        });

        await decoder.tracks.ready;
        const track = decoder.tracks.selectedTrack;
        const total: number = track?.frameCount ?? 0;

        const limit = total > 0 ? total : 1000;

        for (let i = 0; i < limit; i++) {
          if (cancelled) break;
          try {
            const result = await decoder.decode({ frameIndex: i });
            const bmp = await createImageBitmap(result.image);
            result.image.close();
            bitmaps.push(bmp);
            if (total > 0) setState(s => ({ ...s, loadProgress: (i + 1) / total }));
          } catch {
            break;
          }
        }

        decoder.close();

        if (!cancelled) {
          setState({ frames: bitmaps, loaded: true, supported: true, loadProgress: 1 });
        }
      } catch (err) {
        console.error('[FrameDecoder]', err);
        if (!cancelled) setState(s => ({ ...s, supported: false }));
      }
    }

    decode();

    return () => {
      cancelled = true;
      bitmaps.forEach(b => b.close());
    };
  }, [url]);

  return state;
}

// ─── CANVAS DRAW ─────────────────────────────────────────────────────────────
// Renders an ImageBitmap to a canvas using object-fit: cover semantics.

function drawFrameCover(
  ctx: CanvasRenderingContext2D,
  frame: ImageBitmap,
  cw: number,
  ch: number,
) {
  const fW = frame.width;
  const fH = frame.height;
  const ca = cw / ch;
  const fa = fW / fH;

  let sx = 0, sy = 0, sw = fW, sh = fH;
  if (ca > fa) { sh = fW / ca; sy = (fH - sh) / 2; }
  else         { sw = fH * ca; sx = (fW - sw) / 2; }

  ctx.drawImage(frame, sx, sy, sw, sh, 0, 0, cw, ch);
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[200] transition-all duration-500"
      style={{
        padding: scrolled ? '10px 24px' : '20px 24px',
        background: scrolled ? 'rgba(4,4,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg
            width={scrolled ? 28 : 34}
            height={scrolled ? 28 : 34}
            viewBox="0 0 100 100"
            fill="none"
            className="transition-all duration-500"
          >
            <circle cx="50" cy="50" r="42" stroke="#e8702a" strokeWidth="6" />
            <circle cx="50" cy="50" r="22" stroke="#34d5b0" strokeWidth="5" />
            <circle cx="50" cy="50" r="7" fill="#f0e040" />
          </svg>
          <span
            className="text-white font-bold tracking-tight transition-all duration-500"
            style={{ fontSize: scrolled ? '18px' : '22px' }}
          >
            HELIX
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {['Research', 'Pipeline', 'Science', 'About'].map(item => (
            <a
              key={item}
              href="#"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            Log In
          </a>
          <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:scale-[1.04] active:scale-95">
            Get Access
          </button>
        </div>

        <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 flex flex-col gap-4">
          {['Research', 'Pipeline', 'Science', 'About'].map(item => (
            <a key={item} href="#" className="text-white/80 text-sm font-medium px-1">{item}</a>
          ))}
          <button className="mt-2 bg-[#e8702a] text-white text-sm font-semibold px-5 py-2.5 rounded-full w-fit">
            Get Access
          </button>
        </div>
      )}
    </header>
  );
}

// ─── SCROLL HERO ─────────────────────────────────────────────────────────────

const WEBP_URL = '/0702-ezgif.com-video-to-webp-converter_(2).webp';

function ScrollHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  const { frames, loaded, supported, loadProgress } = useFrameDecoder(WEBP_URL);

  // Keep canvas pixel dimensions in sync with viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Single RAF loop: read scroll → pick frame → draw → update state
  const startLoop = useCallback(() => {
    let lastIdx = -1;

    const tick = () => {
      const section = sectionRef.current;
      const canvas  = canvasRef.current;

      if (section) {
        const rect       = section.getBoundingClientRect();
        const totalScroll = section.offsetHeight - window.innerHeight;
        const p          = clamp(-rect.top / totalScroll, 0, 1);

        setProgress(p);

        if (canvas && loaded && frames.length > 0) {
          const ctx = canvas.getContext('2d');
          const idx = clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);

          if (ctx && idx !== lastIdx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawFrameCover(ctx, frames[idx], canvas.width, canvas.height);
            lastIdx = idx;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frames, loaded]);

  useEffect(() => startLoop(), [startLoop]);

  // Text reveal values derived from scroll progress
  const introOpacity = mapRange(progress, 0,    0.18, 1, 0);
  const introY       = mapRange(progress, 0,    0.22, 0, -50);
  const titleOpacity = mapRange(progress, 0.3,  0.52, 0, 1);
  const titleY       = mapRange(progress, 0.3,  0.52, 40, 0);
  const subOpacity   = mapRange(progress, 0.45, 0.65, 0, 1);
  const subY         = mapRange(progress, 0.45, 0.65, 30, 0);
  const ctaOpacity   = mapRange(progress, 0.6,  0.80, 0, 1);
  const ctaY         = mapRange(progress, 0.6,  0.80, 20, 0);
  const overlayOp    = mapRange(progress, 0.25, 0.7,  0, 0.58);
  const hintOp       = mapRange(progress, 0,    0.10, 1, 0);

  return (
    // 320vh outer container — provides scroll distance
    <div ref={sectionRef} style={{ height: '320vh' }}>
      {/* Viewport-locked sticky panel */}
      <div className="sticky top-0 h-screen overflow-hidden bg-black">

        {/* ── Scrubbed canvas ── */}
        {supported ? (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ display: loaded ? 'block' : 'none' }}
          />
        ) : (
          <img src={WEBP_URL} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Loading bar */}
        {!loaded && supported && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <div className="w-48 h-px bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#34d5b0] transition-all duration-200"
                style={{ width: `${loadProgress * 100}%` }}
              />
            </div>
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Loading</p>
          </div>
        )}

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.72) 100%)' }}
        />

        {/* Scroll-progress dark overlay */}
        <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOp }} />

        {/* ── Intro text (fades out) ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{ opacity: introOpacity, transform: `translateY(${introY}px)`, willChange: 'opacity, transform' }}
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.32em] uppercase text-[#34d5b0] mb-5">
            Molecular Innovation
          </p>
          <h1
            className="text-white font-bold leading-[0.92]"
            style={{ fontSize: 'clamp(48px, 8vw, 110px)', letterSpacing: '-0.04em' }}
          >
            Decoding<br />
            <span className="text-[#e8702a]">Life Itself</span>
          </h1>
          <p className="mt-6 text-white/50 text-base sm:text-lg max-w-md leading-relaxed">
            Scroll to explore the structure of discovery.
          </p>
        </div>

        {/* ── Reveal text (fades in) ── */}
        <div className="absolute inset-0 flex flex-col items-start justify-end px-8 sm:px-14 md:px-20 pb-20">
          <div
            style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, willChange: 'opacity, transform' }}
          >
            <p className="text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-[#34d5b0] mb-4">
              Protein Engineering
            </p>
            <h2
              className="text-white font-bold leading-[0.9] max-w-3xl"
              style={{ fontSize: 'clamp(36px, 6vw, 92px)', letterSpacing: '-0.045em' }}
            >
              Where biology<br />
              <span className="text-[#e8702a] font-playfair italic">meets precision</span>
            </h2>
          </div>

          <div style={{ opacity: subOpacity, transform: `translateY(${subY}px)`, willChange: 'opacity, transform' }}>
            <p className="mt-5 text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
              We engineer proteins at the atomic level — designing therapeutic molecules that target disease with unprecedented specificity.
            </p>
          </div>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ opacity: ctaOpacity, transform: `translateY(${ctaY}px)`, willChange: 'opacity, transform' }}
          >
            <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all hover:scale-[1.04] active:scale-95 hover:shadow-xl hover:shadow-[#e8702a]/30">
              Explore Research
            </button>
            <button className="border border-white/25 text-white hover:bg-white/10 font-medium px-8 py-3.5 rounded-full text-sm transition-all">
              View Pipeline
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: hintOp }}
        >
          <span className="text-white/35 text-[10px] tracking-widest uppercase">Scroll</span>
          <ArrowDown size={14} className="text-white/35 animate-bounce" />
        </div>

        {/* Frame indicator (subtle) */}
        {loaded && frames.length > 0 && (
          <div className="absolute top-20 right-5 text-white/15 text-[10px] font-mono pointer-events-none tabular-nums select-none">
            {clamp(Math.round(progress * (frames.length - 1)), 0, frames.length - 1) + 1} / {frames.length}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FEATURE SECTION ─────────────────────────────────────────────────────────

function FeatureSection() {
  return (
    <div className="bg-black">
      <div className="border-t border-white/[0.06] border-b border-white/[0.06] py-12 px-8 sm:px-14 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/[0.08]">
          {[
            { value: '3.2Å', label: 'Resolution accuracy' },
            { value: '140+', label: 'Proteins mapped' },
            { value: '94%', label: 'Binding precision' },
            { value: '12',  label: 'Clinical candidates' },
          ].map(({ value, label }) => (
            <div key={label} className="md:px-10 first:pl-0 last:pr-0">
              <p className="text-white font-bold leading-none mb-2" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.04em' }}>
                {value}
              </p>
              <p className="text-white/38 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="py-24 px-8 sm:px-14 md:px-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#0d1f1b,#0a1510)', minHeight: 380 }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 40%,#34d5b0,transparent 60%)' }} />
            <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-end" style={{ minHeight: 380 }}>
              <div className="mb-auto">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-[#34d5b0] border border-[#34d5b0]/30 mb-5">TECHNOLOGY</span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-bold mb-3" style={{ letterSpacing: '-0.035em' }}>
                Atomic-level<br />protein design
              </h3>
              <p className="text-white/48 text-sm leading-relaxed max-w-xs">
                Our proprietary platform resolves protein folding at sub-angstrom fidelity, enabling therapeutic designs impossible with legacy tools.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {[
              { tag: 'PIPELINE', title: 'Phase II trials underway', body: 'Three oncology candidates advancing with best-in-class binding profiles.', accent: '#e8702a', bg: 'linear-gradient(135deg,#1f0e04,#120801)', glow: '#e8702a' },
              { tag: 'PLATFORM', title: 'AI-guided structure prediction', body: 'Deep learning models trained on 18M protein structures accelerate discovery 10×.', accent: '#f0e040', bg: 'linear-gradient(135deg,#1a190a,#0f0e06)', glow: '#f0e040' },
            ].map(({ tag, title, body, accent, bg, glow }) => (
              <div key={tag} className="rounded-2xl overflow-hidden relative flex-1" style={{ background: bg, minHeight: 170 }}>
                <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(circle at 80% 30%,${glow},transparent 60%)` }} />
                <div className="relative z-10 p-7 sm:p-8">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider border mb-4" style={{ color: accent, borderColor: `${accent}40` }}>{tag}</span>
                  <h3 className="text-white text-lg font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>{title}</h3>
                  <p className="text-white/48 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER CTA ───────────────────────────────────────────────────────────────

function FooterCTA() {
  return (
    <div className="relative overflow-hidden border-t border-white/[0.06] py-28 px-8 sm:px-14 md:px-20 text-center" style={{ background: '#040408' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%,rgba(232,112,42,0.12),transparent 70%)' }} />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#34d5b0] mb-5">Join the mission</p>
        <h2 className="text-white font-bold leading-[0.92] mb-6" style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', letterSpacing: '-0.04em' }}>
          The next breakthrough<br />starts with a conversation.
        </h2>
        <p className="text-white/48 text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Partner with our team to accelerate your drug discovery program using our protein engineering platform.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white font-semibold px-9 py-4 rounded-full text-sm transition-all hover:scale-[1.04] active:scale-95 hover:shadow-xl hover:shadow-[#e8702a]/30">
            Request a Demo
          </button>
          <button className="border border-white/20 text-white hover:bg-white/[0.06] font-medium px-9 py-4 rounded-full text-sm transition-all">
            Read the Science
          </button>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#e8702a" strokeWidth="6" />
            <circle cx="50" cy="50" r="22" stroke="#34d5b0" strokeWidth="5" />
            <circle cx="50" cy="50" r="7"  fill="#f0e040" />
          </svg>
          <span className="text-white font-bold text-base tracking-tight">HELIX</span>
        </div>
        <p className="text-white/22 text-xs">© 2026 Helix Biosciences, Inc. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map(item => (
            <a key={item} href="#" className="text-white/28 hover:text-white/65 text-xs transition-colors">{item}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="bg-black min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ScrollHero />
      <FeatureSection />
      <FooterCTA />
    </div>
  );
}
