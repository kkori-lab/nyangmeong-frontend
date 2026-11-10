import { getDealBadge } from '../shared/chatCodes';

const TONES = {
  gray: 'bg-tone-gray-bg text-tone-gray-fg',
  amber:
    'bg-tone-amber-bg text-tone-amber-fg ring-1 ring-current/10 ring-inset',
  blue: 'bg-tone-blue-bg text-tone-blue-fg ring-1 ring-current/10 ring-inset',
  green:
    'bg-tone-green-bg text-tone-green-fg ring-1 ring-current/10 ring-inset',
};

/** 거래 상태 배지(매칭 전·수락 대기·거래 완료 등) */
export default function DealBadge({ stage, className = '' }) {
  const { label, tone } = getDealBadge(stage);

  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
