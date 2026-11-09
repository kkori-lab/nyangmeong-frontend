import Skeleton from '@/components/Skeleton';

/** 홈 한눈에 보기 칸이 불러오는 동안 같은 칸 높이를 차지한다 */
export default function StatSkeleton() {
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
