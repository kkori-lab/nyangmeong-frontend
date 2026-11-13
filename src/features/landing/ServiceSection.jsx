import { useEffect, useRef } from 'react';
import useInView from '@/hooks/useInView';
import useMediaQuery from '@/hooks/useMediaQuery';
import FadeIn from './FadeIn';
import { SERVICE_CARDS } from './landingData';

/** 같은 줄을 네 번 이어 붙여 절반 너비마다 처음으로 돌리면 끊김 없이 돈다(넓은 화면에서도 빈칸 없이) */
const MARQUEE_CARDS = [
  ...SERVICE_CARDS,
  ...SERVICE_CARDS,
  ...SERVICE_CARDS,
  ...SERVICE_CARDS,
];

/** 흐르는 속도(CSS px/초) */
const SPEED_PX_PER_SEC = 40;

export default function ServiceSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const isInView = useInView(sectionRef, { threshold: 0.1 });
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  /**
   * CSS 애니메이션은 소수점 위치로 옮겨 Windows 배율(125% 등)에서 이미지가 떨린다.
   * 위치를 화면 픽셀 정수로 반올림해 옮긴다
   */
  useEffect(() => {
    if (!isInView || isReducedMotion) return;
    const track = trackRef.current;
    let raf = 0;
    let prev = 0;
    const step = (now) => {
      const dpr = window.devicePixelRatio || 1;
      const half = track.scrollWidth / 2;
      if (prev) {
        offsetRef.current =
          (offsetRef.current + (SPEED_PX_PER_SEC * (now - prev)) / 1000) % half;
      }
      prev = now;
      const x = Math.round(offsetRef.current * dpr) / dpr;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, isReducedMotion]);

  return (
    <section
      id="service"
      ref={sectionRef}
      className="relative w-full scroll-mt-20 overflow-hidden bg-surface-2 py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <FadeIn>
          <h2 className="text-[28px] leading-tight font-semibold break-keep text-ink md:text-[38px] lg:text-[44px]">
            건강기록과 AI 비서
            <br />
            냥멍케어 서비스
          </h2>
        </FadeIn>
      </div>

      <ul
        aria-label="냥멍케어 서비스"
        ref={trackRef}
        className="mt-10 flex w-max will-change-transform lg:mt-14"
      >
        {MARQUEE_CARDS.map((card, index) => (
          <li
            key={index}
            aria-hidden={index >= SERVICE_CARDS.length || undefined}
            className="mr-4 w-[260px] shrink-0 rounded-[28px] bg-white p-2.5 md:mr-5 md:w-[300px] lg:mr-6 lg:w-[340px]"
          >
            <div className="aspect-square overflow-hidden rounded-[20px] bg-surface-3 px-5 pt-5">
              <img
                src={card.src}
                alt=""
                className="size-full rounded-t-xl object-cover object-top shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              />
            </div>
            <div className="px-3 pt-4 pb-3">
              <p className="text-[13px] text-subtle lg:text-[14px]">
                {card.label}
              </p>
              <h3 className="mt-1 text-[16px] font-bold text-ink lg:text-[18px]">
                {card.title}
              </h3>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
