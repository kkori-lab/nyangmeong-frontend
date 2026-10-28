import { useRef } from 'react';
import useInView from '@/hooks/useInView';
import FadeIn from './FadeIn';
import { SERVICE_CARDS } from './landingData';

const MARQUEE_CARDS = [
  ...SERVICE_CARDS,
  ...SERVICE_CARDS,
  ...SERVICE_CARDS,
  ...SERVICE_CARDS,
];

export default function ServiceSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { threshold: 0.1 });

  return (
    <section
      id="service"
      ref={sectionRef}
      className="relative w-full scroll-mt-20 overflow-hidden bg-white"
    >
      <div className="flex min-h-[700px] w-full flex-col lg:h-[800px] lg:flex-row">
        <div className="relative z-30 flex w-full justify-start bg-white pt-24 pb-20 lg:w-[45%] lg:items-center lg:justify-end lg:py-0 xl:w-[42%]">
          <div className="flex w-full max-w-[540px] flex-col items-start bg-white px-6 text-left lg:px-0 lg:pr-20">
            <FadeIn delay={100} className="mb-10">
              <h2 className="text-[28px] leading-tight font-semibold break-keep text-black md:text-[38px] lg:text-[40px] xl:text-[48px]">
                건강기록과 AI 비서
                <br />
                냥멍케어 서비스
              </h2>
            </FadeIn>

            <FadeIn delay={500} className="mb-16 space-y-6">
              <h3 className="text-[20px] leading-tight font-normal break-keep text-black md:text-[26px] lg:text-[28px] xl:text-[32px]">
                반려동물에 맞춘
                <br />
                체계적인 건강기록 서비스
              </h3>
              <p className="text-[14px] leading-relaxed font-normal break-keep text-[#555555] md:text-[17px] lg:text-[18px] xl:text-[20px]">
                체중·식사량·산책·혈액검사 수치를 한눈에 보고,
                <br />
                AI 매니저가 분석해 리포트로 알려드려요.
              </p>
            </FadeIn>

            <FadeIn delay={900}>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('process')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="rounded-[50px] bg-brand-600 px-10 py-4 text-[14px] font-medium text-white transition-[background-color,transform] duration-300 hover:scale-[0.96] hover:bg-brand-900 active:scale-100 md:px-12 md:py-5 md:text-[20px]"
              >
                냥멍케어 자세히 알아보기
              </button>
            </FadeIn>
          </div>
        </div>

        <div className="relative z-10 flex w-full items-center overflow-visible lg:w-[55%] xl:w-[58%]">
          <div className="pointer-events-none absolute top-0 left-0 z-20 h-full w-16 bg-linear-to-r from-white to-transparent lg:w-40" />
          <div className="relative w-full">
            <ul
              aria-label="냥멍케어 서비스"
              className="flex w-max animate-[landing-marquee_65s_linear_infinite] gap-6 pt-10 pb-32 motion-reduce:animate-none lg:gap-8 lg:pt-40"
              style={{ animationPlayState: isInView ? 'running' : 'paused' }}
            >
              {MARQUEE_CARDS.map((item, index) => (
                <FadeIn
                  as="li"
                  key={index}
                  delay={index < SERVICE_CARDS.length ? index * 150 : 0}
                  className={`group relative h-[280px] w-[210px] shrink-0 overflow-hidden rounded-3xl shadow-md lg:h-[342px] lg:w-[255px] ${
                    index % 2 === 1 ? 'mt-12 lg:mt-20' : ''
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </FadeIn>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
