import { isExpired, isFound } from '../missingCodes';

const BADGE_CLASS =
  'inline-flex h-6 items-center rounded-full px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap';

const TONES = {
  found: 'bg-tone-green-bg text-tone-green-fg',
  expired: 'bg-surface-2 text-muted',
  lost: 'bg-tone-rose-bg text-tone-rose-fg',
};

const LABELS = { found: '찾았어요', expired: '기간 만료', lost: '실종' };

/** 실종(빨강) · 찾았어요(초록) · 기간 만료(회색) 상태 배지 */
export default function MissingStatusBadge({ post, className = '' }) {
  let state = 'lost';
  if (isFound(post)) state = 'found';
  else if (isExpired(post)) state = 'expired';
  return (
    <span className={`${BADGE_CLASS} ${TONES[state]} ${className}`}>
      {LABELS[state]}
    </span>
  );
}
