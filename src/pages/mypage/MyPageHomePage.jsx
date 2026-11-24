import ExpenseSummaryCard from '@/features/expense/home/ExpenseSummaryCard';
import MyPetsSection from '@/features/pet/home/MyPetsSection';
import MissionSummaryCard from '@/features/point/home/MissionSummaryCard';
import PointSummaryCard from '@/features/point/home/PointSummaryCard';
import SubPageLayout from '@/layouts/SubPageLayout';

export default function MyPageHomePage() {
  return (
    <SubPageLayout
      section="mypage"
      description="내 반려동물과 포인트 · 지출, 오늘의 케어미션을 한눈에 확인해요"
    >
      <div className="flex flex-col gap-12">
        <section
          aria-label="한눈에 보기"
          className="grid divide-y divide-line-soft overflow-hidden rounded-card border border-line bg-white shadow-[0_1px_2px_rgba(26,50,52,0.04)] min-[1100px]:grid-cols-3 min-[1100px]:divide-x min-[1100px]:divide-y-0"
        >
          <PointSummaryCard />
          <ExpenseSummaryCard />
          <MissionSummaryCard />
        </section>
        <MyPetsSection />
      </div>
    </SubPageLayout>
  );
}
