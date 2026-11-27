import { useRef } from 'react';
import useInView from '@/hooks/useInView';
import FadeIn from './FadeIn';
import { PHONE_CARDS, PHONE_SCREEN } from './landingData';

// 첫 카드가 나오기까지, 그리고 카드 사이 간격
const FIRST_MS = 500;
const GAP_MS = 1100;

const POINTS = [
  '체중·식사량·음수량을 매일 기록해요.',
  '쌓인 기록은 AI가 분석해 리포트로 알려줘요.',
  '검진·처방 이력까지 반려동물별로 모아 봐요.',
];

// 섹션이 보이면 큰 기능 카드가 폰에서 차례로 한 번씩 튀어나오고 그대로 남는다
function PopCard({ card, index, isShown }) {
  const Icon = card.icon;
  const hidden = { transform: `translateX(${card.dir * -90}px) scale(0.6)` };

  return (
    <div
      style={{
        transitionDelay: `${FIRST_MS + index * GAP_MS}ms`,
        ...(isShown ? null : hidden),
      }}
      className={`absolute z-10 w-[190px] rounded-2xl bg-white p-4 shadow-[0_14px_36px_rgba(20,60,60,0.16)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none lg:w-64 lg:rounded-3xl lg:p-6 ${card.pos} ${
        isShown ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2c6669] lg:text-[15px]">
        <Icon className="size-3.5 lg:size-4.5" aria-hidden="true" />
        {card.title}
      </p>
      {card.lead && (
        <p className="mt-3 text-[17px] leading-tight font-extrabold break-keep text-ink lg:text-[22px]">
          {card.lead}
        </p>
      )}
      {card.note && (
        <p className="mt-1.5 text-[11px] leading-snug break-keep text-ink-2 lg:text-[13px]">
          {card.note}
        </p>
      )}
      {card.rows && (
        <dl className="mt-3 space-y-1.5 lg:space-y-2">
          {card.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between"
            >
              <dt className="text-[11px] text-ink-2 lg:text-[13px]">
                {row.label}
              </dt>
              <dd className="text-[15px] font-extrabold text-ink lg:text-[19px]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function HealthShowcaseSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { threshold: 0.4, isOnce: true });

  return (
    <section
      id="health"
      ref={sectionRef}
      className="relative flex min-h-[calc(100dvh-5rem)] w-full scroll-mt-20 items-center justify-center overflow-hidden bg-linear-to-b from-white via-[#eef5f4] to-white py-20 lg:min-h-[max(820px,calc(100dvh-5rem))] lg:py-0"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-6 lg:flex-row lg:justify-between lg:gap-8">
        <FadeIn
          delay={100}
          className="flex flex-col items-center text-center lg:max-w-[460px] lg:items-start lg:text-left"
        >
          <span className="text-[14px] font-medium tracking-wider text-[#2c6669] uppercase md:text-[18px] lg:text-[20px]">
            Health Record
          </span>
          <h2 className="mt-4 text-[28px] leading-tight font-normal break-keep text-black md:text-[40px] lg:text-[48px]">
            기록하면,
            <br />
            변화가 보여요
          </h2>
          <ul className="mt-8 space-y-3 text-[14px] leading-relaxed break-keep text-ink-2 md:text-[17px] lg:text-[18px]">
            {POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={400} className="w-full max-w-[250px] lg:max-w-82.5">
          {/* 카드는 같은 내용을 그림으로 보여 줄 뿐이라 보조기기에는 왼쪽 글로 전한다 */}
          <div aria-hidden="true" className="relative">
            <div className="relative filter-[drop-shadow(0_26px_30px_rgba(20,60,60,0.18))]">
              <div className="relative aspect-390/800 w-full overflow-hidden rounded-[2.6rem] border-[9px] border-[#1d2423] bg-[#f7f9f8] lg:rounded-[3rem] lg:border-11">
                <img
                  src={PHONE_SCREEN}
                  alt=""
                  className="size-full translate-y-6 object-cover object-top mask-[linear-gradient(to_bottom,black_52%,rgba(0,0,0,0.85)_65%,rgba(0,0,0,0.58)_78%,rgba(0,0,0,0.28)_90%,transparent_100%)]"
                />
                <span className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1d2423]" />
              </div>
            </div>
            {PHONE_CARDS.map((card, index) => (
              <PopCard
                key={card.title}
                card={card}
                index={index}
                isShown={isInView}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
