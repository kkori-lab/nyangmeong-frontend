import { useState } from 'react';
import Skeleton from '@/components/Skeleton';
import StatLink from '@/components/StatLink';
import { PATHS } from '@/routes/paths';
import { getCurrentYm } from '@/utils/yearMonth';
import { useExpenseStatistics } from '../queries';

/** 불러오는 동안 같은 칸 높이를 차지한다 */
function StatSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex h-[72px] min-w-0 flex-col justify-center gap-3 px-5 md:h-[135px] md:p-6"
    >
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

export default function ExpenseSummaryCard() {
  const [ym] = useState(getCurrentYm);
  const { data: stats, isPending, isError } = useExpenseStatistics(ym);

  const total = stats?.totalExpndAmt;

  if (isPending) return <StatSkeleton />;

  return (
    <StatLink
      to={PATHS.MYPAGE_EXPENSES}
      label="이번달 지출액"
      value={total?.toLocaleString('ko-KR')}
      unit="원"
      note={isError ? '불러오지 못했어요' : undefined}
    />
  );
}
