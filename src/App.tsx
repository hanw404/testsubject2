import { useEffect, useState, useRef } from 'react';
import { Menu } from 'lucide-react';

// === VEX HERO SECTION COMPONENTS ===

interface FadeInProps {
  delay: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

function FadeIn({ delay, duration = 1000, children, className = '' }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedHeadingProps {
  text: string;
  delay?: number;
  charDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

function AnimatedHeading({ text, delay = 200, charDelay = 30, className = '', style }: AnimatedHeadingProps) {
  const [animate, setAnimate] = useState(false);
  const lines = text.split('\n');

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="block">
          {line.split('').map((char, charIndex) => {
            const lineLength = line.length;
            const totalDelay = (lineIndex * lineLength * charDelay) + (charIndex * charDelay);
            return (
              <span
                key={charIndex}
                className="inline-block"
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'translateX(0)' : 'translateX(-18px)',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '500ms',
                  transitionDelay: `${totalDelay}ms`,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      ))}
    </h1>
  );
}

interface MagnetSquareProps {
  strength?: number;
  padding?: number;
  className?: string;
}

function MagnetSquare({ strength = 20, padding = 100, className = '' }: MagnetSquareProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = Math.abs(e.clientX - centerX);
      const distanceY = Math.abs(e.clientY - centerY);

      const isNear = distanceX < rect.width / 2 + padding && distanceY < rect.height / 2 + padding;

      if (isNear) {
        setIsHovering(true);
        const translateX = (e.clientX - centerX) / strength;
        const translateY = (e.clientY - centerY) / strength;
        setTransform({ x: translateX, y: translateY });
      } else if (isHovering) {
        setIsHovering(false);
        setTransform({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength, padding, isHovering]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `rotate(9deg) translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isHovering ? 'transform 0.3s ease-out' : 'transform 0.6s ease-in-out',
        willChange: 'transform',
      }}
    />
  );
}

function VexHero() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Centered Rotated Square */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <MagnetSquare
          strength={20}
          padding={100}
          className="w-[600px] h-[600px] max-w-[90vw] max-h-[90vw] bg-gray-500/30 rounded-2xl"
        />
      </div>

      {/* Navbar */}
      <div className="px-6 md:px-12 lg:px-16 pt-6">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-tight">VEX</div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className="hover:text-gray-300 transition-colors">Story</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Investing</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Building</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Advisory</a>
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Start a Chat
          </button>
        </nav>
      </div>

      {/* Hero Content */}
      <div className="px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16 min-h-[calc(100vh-100px)]">
        <div className="lg:grid lg:grid-cols-2 lg:items-end">
          {/* Left Column */}
          <div>
            <AnimatedHeading
              text="Shaping tomorrow\nwith vision and action."
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
              style={{ letterSpacing: '-0.04em' }}
            />
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5">
                We back visionaries and craft ventures that define what comes next.
              </p>
            </FadeIn>
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Start a Chat
                </button>
                <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all">
                  Explore Now
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Right Column */}
          <FadeIn delay={1400} duration={1000}>
            <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <p className="text-lg md:text-xl lg:text-2xl font-light">
                  Investing. Building. Advisory.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

// === LITHOS HERO SECTION COMPONENTS ===

const BG_IMAGE_1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';
const BG_IMAGE_2 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';
const SPOTLIGHT_R = 260;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = divRef.current;
    if (!canvas || !div) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = divRef.current;
    if (!canvas || !div) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)');
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    div.style.maskImage = `url(${dataUrl})`;
    div.style.webkitMaskImage = `url(${dataUrl})`;
    div.style.maskSize = '100% 100%';
    div.style.webkitMaskSize = '100% 100%';
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div
        ref={divRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{ backgroundImage: `url(${image})` }}
      />
    </>
  );
}

function LithosHero() {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;
      setCursorPos({ x: smoothRef.current.x, y: smoothRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ height: '100dvh' }}
    >
      {/* Base Image */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-zoom z-10"
        style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
      />

      {/* Reveal Layer */}
      <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      {/* Heading */}
      <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Layers hold
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            tales of time
          </span>
        </h1>
      </div>

      {/* Bottom-left paragraph */}
      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
        </p>
      </div>

      {/* Bottom-right block */}
      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          Our interactive maps let you peel back the crust to trace how stones, fossils, and deep time combine to shape the ground beneath your feet.
        </p>
        <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30">
          Start Digging
        </button>
      </div>
    </section>
  );
}

// === LITHOS NAVBAR (Fixed) ===

function LithosNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-2xl font-playfair italic">Lithos</span>
      </div>

      {/* Center Pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        <button className="text-white px-4 py-1.5 rounded-full text-sm font-medium">Course</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Field Guides</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Geology</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Plans</button>
        <button className="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">Live Tour</button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
          Sign Up
        </button>
        <button className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}

// === MAIN APP ===

function App() {
  return (
    <div className="min-h-screen bg-white tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VexHero />
      <LithosNav />
      <LithosHero />
    </div>
  );
}

export default App;
