import { FileX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import CareDetail from '@/features/community/care/CareDetail';
import { useCare } from '@/features/community/careQueries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import SkeletonCard from '@/components/SkeletonCard';

const DESCRIPTION = '가까운 이웃과 산책 · 돌봄을 부탁하고 도와줘요';

/** 로딩 자리: 본문 카드 + 오른쪽 채팅 상자(실제 상세와 같은 배치·높이) */
function CareDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10"
    >
      <SkeletonCard className="h-[1233px] max-[760px]:h-[1500px]" />
      <SkeletonCard className="h-[273px]" />
    </div>
  );
}

export default function CareDetailPage() {
  const petPrtcRcrtSn = Number(useParams().petPrtcRcrtSn);
  const { data: post, isPending, isError } = useCare(petPrtcRcrtSn);

  let body;
  if (isPending) {
    body = <CareDetailSkeleton />;
  } else if (isError) {
    body = (
      <div role="alert">
        <EmptyResult
          icon={<FileX size={32} aria-hidden="true" />}
          title="게시글을 찾지 못했어요"
          description="삭제되었거나 주소가 잘못되었을 수 있어요"
        >
          <Link
            to={PATHS.COMMUNITY_PETCARE}
            className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
          >
            우리동네 펫돌봄 목록으로
          </Link>
        </EmptyResult>
      </div>
    );
  } else {
    body = <CareDetail post={post} />;
  }

  /** 상세 제목은 메뉴 이름이라 title을 넘기지 않는다. 「목록으로」는 본문 하단 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_PETCARE}
      back={false}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
