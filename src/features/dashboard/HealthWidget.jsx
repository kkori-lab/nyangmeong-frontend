import { ArrowDown, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';
import { GLASS_CARD } from './dashStyles';

function Delta({ label, delta, unit }) {
  const Arrow = delta > 0 ? ArrowUp : ArrowDown;
  const amount = Math.abs(Math.round(delta * 10) / 10);

  return (
    <p className="flex items-center gap-2 text-sm">
      <span className="text-subtle">{label}</span>
      <b className="inline-flex h-[26px] items-center gap-0.5 rounded-full bg-surface-2 px-2.5 font-semibold text-ink-2">
        {delta === 0 ? (
          '변화 없음'
        ) : (
          <>
            <Arrow className="size-4" aria-hidden="true" />
            <span className="sr-only">{delta > 0 ? '증가 ' : '감소 '}</span>
            {amount}
            {unit}
          </>
        )}
      </b>
    </p>
  );
}

/** 위젯 카드 겉틀. 순서 편집 중이면 toolbar(손잡이·이동 버튼)가 제목 줄에 붙는다 */
export function WidgetFrame({
  title,
  period,
  toolbar,
  motion,
  children,
  ...rest
}) {
  return (
    <Reveal
      as="section"
      {...motion}
      {...rest}
      className={`${GLASS_CARD} flex flex-col px-8 py-5 hover:-translate-y-1 hover:border-brand-100 max-[700px]:p-4`}
    >
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {toolbar ?? (
          <span className="shrink-0 text-sm text-subtle">{period}</span>
        )}
      </div>
      {children}
    </Reveal>
  );
}

/**
 * 기록이 없을 때 카드 본문: 안내 + 입력 유도 링크
 */
export function WidgetEmpty({ text, linkText, to }) {
  return (
    <div className="mt-4 flex grow flex-col items-start gap-2">
      <p className="text-[22px] leading-tight font-bold">{text}</p>
      <Link
        to={to}
        className="text-sm font-semibold text-brand-600 underline underline-offset-3"
      >
        {linkText}
      </Link>
    </div>
  );
}

/**
 * 건강 지표 카드
 * - delta가 null이면 비교 문구를 숨긴다(비교 대상 없음)
 * - children은 그래프
 */
export default function HealthWidget({
  value,
  unit,
  delta,
  deltaLabel,
  deltaUnit,
  children,
  ...frameProps
}) {
  return (
    <WidgetFrame {...frameProps}>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <p className="flex items-baseline gap-1">
          {/* 숫자가 아닌 표시값("오늘 기록 없음")은 작게 */}
          <b
            className={`leading-none font-bold tracking-[-0.02em] ${
              typeof value === 'number' ? 'text-[34px]' : 'text-[22px]'
            }`}
          >
            {value}
          </b>
          {unit && <span className="text-muted">{unit}</span>}
        </p>
        {delta != null && (
          <Delta label={deltaLabel} delta={delta} unit={deltaUnit} />
        )}
      </div>
      <div className="mt-auto pt-3">{children}</div>
    </WidgetFrame>
  );
}
