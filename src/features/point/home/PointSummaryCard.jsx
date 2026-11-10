import StatLink from '@/components/StatLink';
import { PATHS } from '@/routes/paths';
import { usePointBalance } from '../queries';
import StatSkeleton from './StatSkeleton';

export default function PointSummaryCard() {
  const { data: balance, isPending, isError } = usePointBalance();

  if (isPending) return <StatSkeleton />;

  return (
    <StatLink
      to={PATHS.MYPAGE_POINTS}
      label="포인트"
      icon={
        <b className="text-2xl leading-none" aria-hidden="true">
          P
        </b>
      }
      value={balance?.hldPnt.toLocaleString()}
      unit="P"
      note={isError ? '불러오지 못했어요' : undefined}
    />
  );
}
