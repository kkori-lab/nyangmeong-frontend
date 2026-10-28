import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useInView from '@/hooks/useInView';
import useMediaQuery from '@/hooks/useMediaQuery';
import FadeIn from './FadeIn';
import { PROCESS_STEPS } from './landingData';

const STEP_MS = 600;

function ProcessCard({ item, index, activeIndex, isDesktop }) {
  const ref = useRef(null);
  const isCardInView = useInView(ref, { threshold: 0.6 });
  const isActive = isDesktop ? index <= activeIndex : isCardInView;
  const isLast = index === PROCESS_STEPS.length - 1;
  return (
    <FadeIn
      delay={400 + index * 300}
      className="w-full max-w-[340px] shrink-0 snap-center xl:max-w-none"
    >
      <div
        ref={ref}
        className="flex w-full flex-col items-center gap-8 px-4 xl:px-0"
      >
        <div
          className={`mb-4 flex items-center justify-center rounded-[50px] px-6 py-2 transition-colors duration-700 ${
            isActive ? 'bg-brand-600' : 'bg-[#ededed]'
          }`}
        >
          <span
            className={`text-[14px] font-medium transition-colors duration-700 md:text-[16px] ${
              isActive ? 'text-white' : 'text-[#333333]'
            }`}
          >
            {item.step}
          </span>
        </div>
        <div
          className={`relative flex h-[420px] w-full max-w-[302px] flex-col items-center rounded-[20px] border px-8 pt-14 pb-10 text-center transition-all duration-700 ${
            isActive
              ? '-translate-y-2.5 border-brand-600 bg-white shadow-xl'
              : 'border-[#ededed] bg-white'
          }`}
        >
          <div className="relative mt-4 mb-12 flex size-[106px] items-center justify-center">
            <img
              src={item.icon}
              alt=""
              className={`size-full object-contain transition-all duration-700 ${
                isActive ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'
              }`}
            />
          </div>
          <h3
            className={`mb-4 text-[22px] font-normal transition-colors duration-700 ${
              isActive ? 'text-brand-600' : 'text-black'
            }`}
          >
            {item.title}
          </h3>
          <p className="text-[16px] leading-relaxed break-keep text-[#444444]">
            {item.description}
          </p>
          {!isLast && (
            <ArrowRight
              aria-hidden="true"
              className={`absolute top-1/2 -right-8 z-10 hidden size-6 -translate-y-1/2 transition-colors duration-700 xl:block ${
                isActive ? 'text-brand-600' : 'text-[#ededed]'
              }`}
            />
          )}
        </div>
      </div>
    </FadeIn>
  );
}

export default function ProcessSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isInView = useInView(sectionRef, { threshold: 0.3, isOnce: true });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isInView || !isDesktop) return undefined;
    const timers = PROCESS_STEPS.map((_, index) =>
      setTimeout(() => setActiveIndex(index), (index + 1) * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [isInView, isDesktop]);

  const handleScroll = () => {
    const el = trackRef.current;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
  };

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative flex w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden bg-white py-24 lg:min-h-screen"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <FadeIn
          delay={100}
          className="mb-20 flex flex-col items-center space-y-4 text-center lg:mb-28"
        >
          <span className="text-[14px] font-medium tracking-wider text-[#2c6669] uppercase md:text-[18px] lg:text-[20px]">
            SERVICE PROCESS
          </span>
          <h2 className="text-[28px] leading-tight font-normal break-keep text-black md:text-[40px] lg:text-[48px]">
            냥멍케어 서비스 과정
          </h2>
          <p className="text-[14px] leading-relaxed break-keep text-black md:text-[18px] lg:text-[20px]">
            가입부터 기록, 미션, 커뮤니티까지
            <br />네 단계로 시작해요.
          </p>
        </FadeIn>

        <div>
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto px-4 pb-4 [scrollbar-width:none] xl:grid xl:grid-cols-4 xl:gap-x-8 xl:overflow-x-visible xl:px-10 xl:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {PROCESS_STEPS.map((item, index) => (
              <ProcessCard
                key={item.step}
                item={item}
                index={index}
                activeIndex={activeIndex}
                isDesktop={isDesktop}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col items-center px-10 xl:hidden">
          <div className="flex w-full max-w-[280px] items-center gap-3">
            <ChevronLeft className="size-3 text-[#999999]" aria-hidden="true" />
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#e0e0e0]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#757575]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ChevronRight
              className="size-3 text-[#999999]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
