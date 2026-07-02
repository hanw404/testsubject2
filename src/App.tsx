import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowDown, Menu, X } from 'lucide-react';

// === UTILITIES ===

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
}

// === HEADER ===

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
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <svg width={scrolled ? 28 : 34} height={scrolled ? 28 : 34} viewBox="0 0 100 100" className="transition-all duration-500" fill="none">
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {['Research', 'Pipeline', 'Science', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium tracking-wide"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
            Log In
          </a>
          <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:scale-[1.04] active:scale-95">
            Get Access
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 flex flex-col gap-4">
          {['Research', 'Pipeline', 'Science', 'About'].map((item) => (
            <a key={item} href="#" className="text-white/80 text-sm font-medium px-1">
              {item}
            </a>
          ))}
          <button className="mt-2 bg-[#e8702a] text-white text-sm font-semibold px-5 py-2.5 rounded-full w-fit">
            Get Access
          </button>
        </div>
      )}
    </header>
  );
}

// === SCROLL HERO ===

function ScrollHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const rawProgress = useRef(0);
  const smoothProgress = useRef(0);

  const tick = useCallback(() => {
    smoothProgress.current += (rawProgress.current - smoothProgress.current) * 0.08;
    setProgress(smoothProgress.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      rawProgress.current = clamp(scrolled / totalScroll, 0, 1);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  // Derived values from scroll progress
  const imgScale = mapRange(progress, 0, 1, 1, 2.2);
  const imgOpacity = mapRange(progress, 0.7, 1, 1, 0.4);

  const introOpacity = mapRange(progress, 0, 0.25, 1, 0);
  const introY = mapRange(progress, 0, 0.3, 0, -60);

  const titleOpacity = mapRange(progress, 0.35, 0.6, 0, 1);
  const titleY = mapRange(progress, 0.35, 0.6, 40, 0);

  const subOpacity = mapRange(progress, 0.5, 0.72, 0, 1);
  const subY = mapRange(progress, 0.5, 0.72, 30, 0);

  const ctaOpacity = mapRange(progress, 0.65, 0.85, 0, 1);
  const ctaY = mapRange(progress, 0.65, 0.85, 20, 0);

  const overlayOpacity = mapRange(progress, 0.3, 0.75, 0, 0.72);

  const scrollArrowOpacity = mapRange(progress, 0, 0.15, 1, 0);

  return (
    <div ref={sectionRef} className="relative" style={{ height: '350vh' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Animated WebP — scroll-driven scale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/0702-ezgif.com-video-to-webp-converter_(2).webp"
            alt=""
            className="w-full h-full object-cover origin-center"
            style={{
              transform: `scale(${imgScale})`,
              opacity: imgOpacity,
              willChange: 'transform, opacity',
              transition: 'none',
            }}
          />
        </div>

        {/* Dark overlay that intensifies mid-scroll then clears */}
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />

        {/* Radial vignette always present */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Intro text — fades out on scroll */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          style={{
            opacity: introOpacity,
            transform: `translateY(${introY}px)`,
            willChange: 'opacity, transform',
          }}
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-[#34d5b0] mb-5">
            Molecular Innovation
          </p>
          <h1
            className="text-white font-bold leading-[0.92]"
            style={{ fontSize: 'clamp(48px, 8vw, 110px)', letterSpacing: '-0.04em' }}
          >
            Decoding<br />
            <span className="text-[#e8702a]">Life Itself</span>
          </h1>
          <p className="mt-6 text-white/60 text-base sm:text-lg max-w-md leading-relaxed">
            Scroll to explore the structure of discovery.
          </p>
        </div>

        {/* Reveal headline — fades in as molecule zooms */}
        <div
          className="absolute inset-0 flex flex-col items-start justify-end px-8 sm:px-14 md:px-20 pb-20 pointer-events-none"
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            willChange: 'opacity, transform',
          }}
        >
          <p className="text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-[#34d5b0] mb-4">
            Protein Engineering
          </p>
          <h2
            className="text-white font-bold leading-[0.9] max-w-3xl"
            style={{ fontSize: 'clamp(40px, 6.5vw, 96px)', letterSpacing: '-0.045em' }}
          >
            Where biology<br />
            <span className="text-[#e8702a] font-playfair italic">meets precision</span>
          </h2>

          <div
            style={{
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
              willChange: 'opacity, transform',
            }}
          >
            <p className="mt-5 text-white/65 text-sm sm:text-base max-w-md leading-relaxed">
              We engineer proteins at the atomic level — designing therapeutic molecules that target disease with unprecedented specificity.
            </p>
          </div>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{
              opacity: ctaOpacity,
              transform: `translateY(${ctaY}px)`,
              willChange: 'opacity, transform',
            }}
          >
            <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all hover:scale-[1.04] active:scale-95 hover:shadow-xl hover:shadow-[#e8702a]/30">
              Explore Research
            </button>
            <button className="border border-white/25 text-white hover:bg-white/10 font-medium px-8 py-3.5 rounded-full text-sm transition-all">
              View Pipeline
            </button>
          </div>
        </div>

        {/* Scroll hint arrow */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: scrollArrowOpacity }}
        >
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown size={16} className="text-white/40 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// === FEATURE SECTION ===

function FeatureSection() {
  return (
    <div className="bg-black">
      {/* Stats bar */}
      <div className="border-t border-white/8 border-b border-white/8 py-12 px-8 sm:px-14 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/10">
          {[
            { value: '3.2Å', label: 'Resolution accuracy' },
            { value: '140+', label: 'Proteins mapped' },
            { value: '94%', label: 'Binding precision' },
            { value: '12', label: 'Clinical candidates' },
          ].map(({ value, label }) => (
            <div key={label} className="md:px-10 first:pl-0 last:pr-0">
              <p
                className="text-white font-bold leading-none mb-2"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.04em' }}
              >
                {value}
              </p>
              <p className="text-white/45 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="py-24 px-8 sm:px-14 md:px-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Large card */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #0d1f1b 0%, #0a1510 100%)', minHeight: 380 }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              background: 'radial-gradient(circle at 70% 40%, #34d5b0 0%, transparent 60%)',
            }} />
            <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full justify-end" style={{ minHeight: 380 }}>
              <div className="mb-auto">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-[#34d5b0] border border-[#34d5b0]/30 mb-5">
                  TECHNOLOGY
                </span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-bold mb-3" style={{ letterSpacing: '-0.035em' }}>
                Atomic-level<br />protein design
              </h3>
              <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                Our proprietary platform resolves protein folding at sub-angstrom fidelity, enabling therapeutic designs impossible with legacy tools.
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {[
              {
                tag: 'PIPELINE',
                title: 'Phase II trials underway',
                body: 'Three oncology candidates advancing with best-in-class binding profiles.',
                accent: '#e8702a',
                bg: 'linear-gradient(135deg, #1f0e04 0%, #120801 100%)',
                glow: '#e8702a',
              },
              {
                tag: 'PLATFORM',
                title: 'AI-guided structure prediction',
                body: 'Deep learning models trained on 18M protein structures accelerate discovery timelines by 10×.',
                accent: '#f0e040',
                bg: 'linear-gradient(135deg, #1a190a 0%, #0f0e06 100%)',
                glow: '#f0e040',
              },
            ].map(({ tag, title, body, accent, bg, glow }) => (
              <div
                key={tag}
                className="rounded-2xl overflow-hidden relative flex-1"
                style={{ background: bg, minHeight: 170 }}
              >
                <div className="absolute inset-0 opacity-15" style={{
                  background: `radial-gradient(circle at 80% 30%, ${glow} 0%, transparent 60%)`,
                }} />
                <div className="relative z-10 p-7 sm:p-8">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider border mb-4"
                    style={{ color: accent, borderColor: `${accent}40` }}
                  >
                    {tag}
                  </span>
                  <h3 className="text-white text-lg font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>
                    {title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// === MOLECULE SHOWCASE ===

function MoleculeShowcase() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="bg-black border-t border-white/8 py-24 px-8 sm:px-14 md:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#34d5b0] mb-5">
              Visual Analysis
            </p>
            <h2
              className="text-white font-bold leading-[0.92] mb-6"
              style={{ fontSize: 'clamp(32px, 4.5vw, 64px)', letterSpacing: '-0.04em' }}
            >
              See every bond.<br />
              <span className="text-[#e8702a]">Control every interaction.</span>
            </h2>
            <p className="text-white/55 text-base leading-relaxed mb-8 max-w-md">
              Our visualization suite renders protein structures in real-time, letting researchers manipulate binding sites, simulate mutations, and observe conformational changes live.
            </p>
            <button className="border border-white/20 text-white hover:bg-white/8 font-medium px-7 py-3 rounded-full text-sm transition-all">
              See Visualization Tools
            </button>
          </div>

          <div
            className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ aspectRatio: '4/3', background: '#040408' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <img
              src="/0702-ezgif.com-video-to-webp-converter_(2).webp"
              alt="Protein structure visualization"
              className="w-full h-full object-cover transition-transform duration-700"
              style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
              style={{ opacity: hovered ? 1 : 0, background: 'rgba(0,0,0,0.35)' }}
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 text-white text-sm font-medium">
                View Interactive Model
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === FOOTER CTA ===

function FooterCTA() {
  return (
    <div
      className="relative overflow-hidden border-t border-white/8 py-28 px-8 sm:px-14 md:px-20 text-center"
      style={{ background: '#040408' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(232,112,42,0.12) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#34d5b0] mb-5">
          Join the mission
        </p>
        <h2
          className="text-white font-bold leading-[0.92] mb-6"
          style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', letterSpacing: '-0.04em' }}
        >
          The next breakthrough<br />starts with a conversation.
        </h2>
        <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Partner with our team to accelerate your drug discovery program using our protein engineering platform.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white font-semibold px-9 py-4 rounded-full text-sm transition-all hover:scale-[1.04] active:scale-95 hover:shadow-xl hover:shadow-[#e8702a]/30">
            Request a Demo
          </button>
          <button className="border border-white/20 text-white hover:bg-white/8 font-medium px-9 py-4 rounded-full text-sm transition-all">
            Read the Science
          </button>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="mt-20 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#e8702a" strokeWidth="6" />
            <circle cx="50" cy="50" r="22" stroke="#34d5b0" strokeWidth="5" />
            <circle cx="50" cy="50" r="7" fill="#f0e040" />
          </svg>
          <span className="text-white font-bold text-base tracking-tight">HELIX</span>
        </div>
        <p className="text-white/30 text-xs">© 2026 Helix Biosciences, Inc. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map((item) => (
            <a key={item} href="#" className="text-white/35 hover:text-white/70 text-xs transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// === APP ===

export default function App() {
  return (
    <div className="bg-black min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />
      <ScrollHero />
      <FeatureSection />
      <MoleculeShowcase />
      <FooterCTA />
    </div>
  );
}
