import { useEffect, useRef, useState } from 'react';
import countBg from '@/assets/landing/banner/place.png';
import useInView from '@/hooks/useInView';
import FadeIn from './FadeIn';
import SectionTitle from './SectionTitle';
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
      className="text-[40px] leading-none font-extrabold tracking-tight text-white tabular-nums md:text-[60px] lg:text-[78.8px]"
    >
      {current}
    </span>
  );
}

export default function CountSection() {
  return (
    <section
      id="stats"
      className="w-full scroll-mt-20 bg-white px-3 py-10 md:px-5 lg:py-16"
    >
      {/* 흰 배경 위에 둥근 사진 카드로 둬서 위아래 섹션과 경계가 튀지 않게 한다 */}
      <div className="relative isolate mx-auto flex min-h-[620px] w-full max-w-[1680px] flex-col items-center justify-center overflow-hidden rounded-[28px] py-20 lg:min-h-[max(780px,calc(100dvh-8rem))] lg:rounded-[36px]">
        {/* 원본이 작아 글자가 잘 읽히도록 브랜드색 막을 깐다 */}
        <img
          src={countBg}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[50%_35%]"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#0d2a2c]/60 via-[#0d2a2c]/55 to-[#0d2a2c]/75" />

        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionTitle
            isLight
            label="The pawever Data"
            title="기록이 쌓이면 케어가 달라집니다"
            desc={
              <>
                pawever에 모인 기록입니다.
                <br />
                보호자와 반려동물의 하루가 숫자로 남아요.
              </>
            }
            className="mb-14 lg:mb-20"
          />

          <FadeIn
            delay={500}
            className="grid grid-cols-2 gap-y-12 lg:grid-cols-4"
          >
            {COUNT_DATA.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center lg:not-first:border-l lg:not-first:border-white/25"
              >
                <div className="flex items-baseline">
                  <AnimatedNumber value={item.value} />
                  <span className="ml-1.5 text-[16px] font-normal text-white md:text-[20px] lg:text-[24px]">
                    {item.unit}
                  </span>
                </div>
                <span className="mt-4 text-[14px] font-normal text-white/80 md:text-[16px] lg:text-[18px]">
                  {item.label}
                </span>
              </div>
            ))}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
