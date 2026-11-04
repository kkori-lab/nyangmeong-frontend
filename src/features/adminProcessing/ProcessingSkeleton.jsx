import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';

/**
 * [처리 현황 탭 로딩 자리]
 * - 필터 줄 + 건수 카드 + 표 + 쪽 번호, 크기는 탭마다 className으로
 */
export default function ProcessingSkeleton({
  filterClass,
  cardCount,
  cardGridClass,
  cardClass,
  tableClass,
}) {
  return (
    <div className="space-y-4" aria-busy="true">
      {filterClass && <Skeleton className={filterClass} />}
      <div className={`grid grid-cols-2 gap-3 ${cardGridClass}`}>
        {Array.from({ length: cardCount }, (_, index) => (
          <SkeletonCard key={index} className={cardClass} />
        ))}
      </div>
      <SkeletonCard className={tableClass} />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}
