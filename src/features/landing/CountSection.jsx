import { useEffect, useRef, useState } from 'react';
import useInView from '@/hooks/useInView';
import FadeIn from './FadeIn';
import { COUNT_DATA } from './landingData';

const COUNT_MS = 1600;

function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.5, isOnce: true });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isInView) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setCurrent(value));
      return () => cancelAnimationFrame(frame);
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / COUNT_MS, 1);
      setCurrent(Math.floor(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <span
      ref={ref}
      className="text-[40px] leading-none font-extrabold tracking-tight text-brand-600 tabular-nums md:text-[60px] lg:text-[78.8px]"
    >
      {current}
    </span>
  );
}

export default function CountSection() {
  return (
    <section
      id="stats"
      className="relative flex w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden bg-[#f8f8f8] py-24 lg:h-[742px]"
    >
      <div className="mx-auto w-full max-w-7xl px-4">
        <FadeIn
          delay={100}
          className="mb-16 flex flex-col items-center space-y-4 text-center lg:mb-24"
        >
          <span className="text-[14px] font-medium tracking-wider text-[#2c6669] uppercase md:text-[18px] lg:text-[20px]">
            The NYANGMUNGCARE DATA
          </span>
          <h2 className="text-[24px] leading-tight font-medium break-keep text-black md:text-[40px] lg:text-[48px] lg:font-normal">
            기록이 쌓이면 케어가 달라집니다
          </h2>
          <p className="text-[14px] leading-relaxed break-keep text-black md:text-[18px] lg:text-[20px]">
            냥멍케어에 모인 기록입니다.
            <br />
            보호자와 반려동물의 하루가 숫자로 남아요.
          </p>
        </FadeIn>

        <FadeIn
          delay={500}
          className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-x-8"
        >
          {COUNT_DATA.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="mb-4 text-[16px] font-normal text-[#555555] md:text-[20px]">
                {item.label}
              </span>
              <div className="flex items-baseline">
                <AnimatedNumber value={item.value} />
                <span className="ml-1 text-[14px] font-normal text-black md:text-[16px]">
                  {item.unit}
                </span>
              </div>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
