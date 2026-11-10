import { RCRT_STTS, RCRT_STTS_LABEL } from '../careCodes';

const BADGE_CLASS =
  'inline-flex h-6 items-center gap-[5px] rounded-full px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap';

const TONES = {
  [RCRT_STTS.OPEN]:
    'bg-tone-green-bg text-tone-green-fg ring-1 ring-current/10 ring-inset before:size-1.5 before:rounded-full before:bg-current before:content-[""]',
  [RCRT_STTS.MATCHED]:
    'bg-tone-blue-bg text-tone-blue-fg ring-1 ring-current/10 ring-inset',
  [RCRT_STTS.DONE]: 'bg-tone-gray-bg text-tone-gray-fg',
};

/** 모집중(초록) · 매칭완료(파랑) · 거래완료(회색) 상태 배지. 색이 있는 상태만 글자색 알파 0.1의 안쪽 테두리 */
export default function CareStatusBadge({ post, className = '' }) {
  return (
    <span className={`${BADGE_CLASS} ${TONES[post.rcrtSttsCd]} ${className}`}>
      {RCRT_STTS_LABEL[post.rcrtSttsCd]}
    </span>
  );
}
