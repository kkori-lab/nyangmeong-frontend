import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useInView from '@/hooks/useInView';
import { HERO_SLIDES } from './landingData';

const AUTO_MS = 5000;
const RESUME_MS = 10000;
const SLIDE_MS = 800;
const COUNT = HERO_SLIDES.length;

function Slide({ image, className = '', isRunning }) {
  return (
    <div
      className={`absolute inset-0 size-full overflow-hidden will-change-transform ${className}`}
    >
      <img
        src={image}
        alt=""
        className="size-full animate-[landing-zoom_12s_linear_infinite_alternate] object-cover object-center motion-reduce:animate-none"
        style={{ animationPlayState: isRunning ? 'running' : 'paused' }}
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}

export default function HeroSlider() {
  const sectionRef = useRef(null);
  const resumeTimer = useRef(0);
  const isInView = useInView(sectionRef, { threshold: 0.1 });
  const [slide, setSlide] = useState({ index: 0, prev: null });
  const [isAuto, setIsAuto] = useState(true);

  const move = (step) =>
    setSlide((cur) => ({
      index: (cur.index + step + COUNT) % COUNT,
      prev: cur.index,
    }));

  useEffect(() => {
    if (!isAuto) return undefined;
    const timer = setInterval(() => move(1), AUTO_MS);
    return () => clearInterval(timer);
  }, [isAuto]);

  useEffect(() => {
    if (slide.prev === null) return undefined;
    const timer = setTimeout(
      () => setSlide((cur) => ({ ...cur, prev: null })),
      SLIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [slide]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const handleMove = (step) => {
    move(step);
    setIsAuto(false);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsAuto(true), RESUME_MS);
  };

  const { index, prev } = slide;
  const content = HERO_SLIDES[index];
  const hasMoved = prev !== null;

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-black"
    >
      <div className="absolute inset-0 z-0 size-full bg-black">
        {hasMoved && (
          <Slide
            key={`out-${prev}`}
            image={HERO_SLIDES[prev].image}
            isRunning={isInView}
            className="animate-[landing-slide-out_800ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
          />
        )}
        <Slide
          key={`in-${index}`}
          image={content.image}
          isRunning={isInView}
          className={
            hasMoved
              ? 'animate-[landing-slide-in_800ms_cubic-bezier(0.22,1,0.36,1)]'
              : ''
          }
        />
      </div>

      <div
        key={index}
        className="relative z-10 mt-20 mb-48 flex flex-col items-center px-4 text-center text-white md:mt-24 md:mb-40"
      >
        <span className="mb-4 text-[18px] font-medium opacity-90 md:text-[24px]">
          {content.sub}
        </span>
        <div className="mb-8 flex flex-col items-center gap-2 md:gap-4">
          <h2 className="text-[32px] leading-tight font-extrabold md:text-[64px]">
            {content.title1}
          </h2>
          <h2
            aria-label={content.title2}
            className="flex text-[32px] leading-tight font-extrabold md:text-[64px]"
          >
            {content.title2.split('').map((char, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="animate-[landing-char_400ms_ease_both] motion-reduce:animate-none"
                style={{ animationDelay: `${600 + i * 150}ms` }}
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </h2>
        </div>
        <p
          className="max-w-[600px] animate-[landing-fade_1000ms_ease_both] text-[14px] break-keep opacity-80 motion-reduce:animate-none md:text-[16px]"
          style={{ animationDelay: '1200ms' }}
        >
          {content.desc[0]}
          <br />
          {content.desc[1]}
        </p>
      </div>

      <div className="absolute bottom-56 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 md:bottom-48 md:gap-4">
        <button
          type="button"
          onClick={() => handleMove(-1)}
          aria-label="이전 배너"
          className="grid size-6 place-items-center rounded-full bg-white/70 text-black transition-colors hover:bg-white/80"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="relative h-0.5 w-20 overflow-hidden bg-white/40 md:w-[120px]">
          <div
            className="absolute inset-y-0 left-0 bg-white transition-[width] duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${((index + 1) / COUNT) * 100}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => handleMove(1)}
          aria-label="다음 배너"
          className="grid size-6 place-items-center rounded-full bg-white/70 text-black transition-colors hover:bg-white/80"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
