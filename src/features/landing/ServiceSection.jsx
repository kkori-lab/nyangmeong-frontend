import { useEffect, useRef, useState } from 'react';
import useInView from '@/hooks/useInView';
import SectionTitle from './SectionTitle';
import { SERVICE_CARDS } from './landingData';

const COUNT = SERVICE_CARDS.length;
const HALF = Math.floor(COUNT / 2);
// 화면에 보이는 동안 카드가 저절로 넘어가는 간격
const AUTO_MS = 3000;
// 직접 넘긴 뒤 자동 넘김을 다시 켜기까지
const RESUME_MS = 10000;
// 이만큼(px) 넘게 옆으로 밀면 스와이프로 본다
const SWIPE_PX = 40;

// 고른 카드 기준으로 원형으로 떨어진 칸 수(-HALF ~ HALF). 끝에서 처음으로 넘어갈 때 카드가 거꾸로 훑고 지나가지 않는다
const offsetOf = (index, active) =>
  ((index - active + COUNT + HALF) % COUNT) - HALF;

// 가운데에서 떨어진 칸 수(d)에 따른 카드 모양. 양옆은 작아지고 안쪽으로 기울며, 멀수록 흐려진다(바로 옆 1px·약간 어둡게, 맨 끝 3px)
function cardStyle(d) {
  const abs = Math.abs(d);
  return {
    transform: `translateX(calc(var(--gap) * ${d})) scale(${abs === 0 ? 1 : abs === 1 ? 0.84 : 0.7}) rotateY(${Math.max(-2, Math.min(2, d)) * -14}deg)`,
    zIndex: 10 - abs,
    opacity: abs > 2 ? 0 : 1,
    filter:
      abs === 0
        ? 'none'
        : abs === 1
          ? 'blur(1px) brightness(0.92)'
          : 'blur(3px) brightness(0.92)',
  };
}

export default function ServiceSection() {
  const sectionRef = useRef(null);
  const resumeTimer = useRef(0);
  const swipeStartX = useRef(null);
  const isInView = useInView(sectionRef, { threshold: 0.3 });
  const [active, setActive] = useState(0);
  const [isAuto, setIsAuto] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // 스크롤을 붙잡지 않는다(예전에는 섹션을 카드 수만큼 늘려 스크롤로 넘겨서 페이지가 여기서 멈춘 것처럼 보였다).
  // 화면에 보이는 동안 저절로 넘기고, 마우스를 올려 두거나 동작 줄이기 설정이면 멈춘다
  useEffect(() => {
    if (!isInView || !isAuto || isHovered) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return undefined;
    const timer = setInterval(
      () => setActive((cur) => (cur + 1) % COUNT),
      AUTO_MS,
    );
    return () => clearInterval(timer);
  }, [isInView, isAuto, isHovered]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  // 점·옆 카드·스와이프로 직접 넘기면 잠시 자동 넘김을 멈춘다
  const goToCard = (index) => {
    setActive((index + COUNT) % COUNT);
    setIsAuto(false);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsAuto(true), RESUME_MS);
  };

  const handleTouchStart = (event) => {
    swipeStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (swipeStartX.current === null) return;
    const dx = event.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) > SWIPE_PX) goToCard(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      id="service"
      ref={sectionRef}
      className="relative flex min-h-[calc(100dvh-5rem)] w-full scroll-mt-20 flex-col items-center justify-center overflow-hidden bg-white py-24"
    >
      <div className="flex w-full flex-col items-center px-6">
        <SectionTitle
          label="All-in-one Pet Care"
          title={
            <>
              기록부터 일상까지,
              <br className="md:hidden" /> pawever 서비스
            </>
          }
          desc={
            <>
              건강 일지부터 플레이스까지
              <br className="md:hidden" /> 반려생활에 필요한 것을 한곳에
              모았어요.
            </>
          }
        />

        <ul
          aria-label="pawever 서비스"
          className="relative mt-14 h-[342px] w-full touch-pan-y [--gap:150px] [perspective:1200px] md:mt-20 md:[--gap:250px] lg:h-[402px] lg:[--gap:300px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {SERVICE_CARDS.map((card, index) => {
            const d = offsetOf(index, active);
            return (
              <li
                key={card.title}
                aria-hidden={d !== 0}
                className="absolute top-0 left-1/2 -ml-[127.5px] h-[342px] w-[255px] overflow-hidden rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none lg:-ml-[150px] lg:h-[402px] lg:w-[300px]"
                style={cardStyle(d)}
                onClick={d === 0 ? undefined : () => goToCard(index)}
              >
                <img
                  src={card.src}
                  alt=""
                  className="size-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/60 to-transparent px-5 pt-20 pb-6 text-white">
                  <p className="text-[20px] font-bold lg:text-[22px]">
                    {card.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug break-keep opacity-90 lg:text-[14px]">
                    {card.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex items-center gap-2 md:mt-10">
          {SERVICE_CARDS.map((card, index) => (
            <button
              key={card.title}
              type="button"
              aria-label={`${card.title} 보기`}
              aria-current={index === active}
              onClick={() => goToCard(index)}
              className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                index === active ? 'w-6 bg-brand-600' : 'w-2 bg-[#d5d8d6]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
