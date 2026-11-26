import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/Badge';
import Icon from '@/components/Icon';
import { getMovePath, getMoveState } from './widgetItems';

/** 칩 색 */

/**
 * [대시보드 요약 타일] 760px 미만 2열 (※신규 정책)
 * - 아이콘·이름 / 큰 값 / 칩 0~1개 / 보조 줄. 그래프·목록 없음
 * - 타일 전체가 카드 이동 링크와 같은 곳으로 가는 링크(매일 기록은 「오늘 기록하기」 모달을 엶, ※신규 정책)
 */
export default function WidgetTile({ item, content, petSn, petNm }) {
  const tile = content?.tile;
  const sub = tile ? tile.sub : item.emptyText;

  return (
    <Link
      to={getMovePath(item, content, petSn)}
      state={getMoveState(item)}
      aria-label={`${petNm}의 ${item.nm} ${item.typeCd ? '기록하기' : '기록 화면으로 이동'}`}
      className="flex min-w-0 flex-col gap-1 rounded-card border border-line bg-white p-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 min-[760px]:hidden"
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
      {tile ? (
        <b className="mt-1 truncate text-lg font-bold text-ink">{tile.value}</b>
      ) : (
        <p className="mt-1 truncate text-base text-muted">기록이 없어요</p>
      )}
      {tile?.chip && (
        <Badge tone={tile.chip.tone} className="max-w-full self-start">
          <span className="truncate">{tile.chip.text}</span>
        </Badge>
      )}
      {sub && <span className="truncate text-badge text-subtle">{sub}</span>}
    </Link>
  );
}
