import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import { getMoveState } from './widgetItems';

/** 칩 색 */
const CHIP_TONES = {
  gray: 'bg-surface-2 text-ink-2',
  green: 'bg-tone-green-bg text-tone-green-fg',
  rose: 'bg-tone-rose-bg text-tone-rose-fg',
  amber: 'bg-tone-amber-bg text-tone-amber-fg',
};

/**
 * [대시보드 요약 타일] 640px 미만 2열 (※신규 정책)
 * - 아이콘·이름 / 큰 값 / 칩 0~1개 / 보조 줄. 그래프·목록 없음
 * - 타일 전체가 카드 [더보기]와 같은 곳으로 가는 링크
 */
export default function WidgetTile({ item, content, petSn, petNm }) {
  const tile = content?.tile;
  const sub = tile ? tile.sub : item.emptyText;

  return (
    <Link
      to={content?.moveTo ?? item.moveTo}
      state={getMoveState(item, petSn)}
      aria-label={`${petNm}의 ${item.nm} 기록 화면으로 이동`}
      className="flex min-w-0 flex-col gap-1 rounded-card border border-line bg-white p-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:hidden"
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <Icon name={item.icon} className="shrink-0 text-lg text-brand-500" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          {item.nm}
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-subtle"
          aria-hidden="true"
        />
      </span>
      <b className="mt-1 truncate text-xl font-bold text-ink">
        {tile ? tile.value : '기록 없음'}
      </b>
      {tile?.chip && (
        <span
          className={`max-w-full self-start truncate rounded-full px-2 py-0.5 text-badge font-semibold ${CHIP_TONES[tile.chip.tone]}`}
        >
          {tile.chip.text}
        </span>
      )}
      {sub && <span className="truncate text-badge text-subtle">{sub}</span>}
    </Link>
  );
}
