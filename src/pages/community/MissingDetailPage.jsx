import { FileX } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import MissingDetail from '@/features/community/missing/MissingDetail';
import { useMissing } from '@/features/community/missingQueries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import SkeletonCard from '@/components/SkeletonCard';

const DESCRIPTION =
  '잃어버린 반려동물을 함께 찾아요. 비슷한 아이를 보셨다면 댓글로 알려 주세요';

/** 로딩 자리: 본문 카드 + 아래 카드 + 오른쪽 레일(실제 상세와 같은 배치·높이) */
function MissingDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <SkeletonCard className="h-[1440px] max-[760px]:h-[1965px]" />
        <SkeletonCard className="h-[242px] max-[760px]:h-[234px]" />
      </div>
      <SkeletonCard className="h-[227px] max-[1100px]:h-[205px]" />
    </div>
  );
}

export default function MissingDetailPage() {
  const lostTpofSn = Number(useParams().lostTpofSn);
  const { state } = useLocation();
  const { data: post, isPending, isError } = useMissing(lostTpofSn);

  let body;
  if (isPending) {
    body = <MissingDetailSkeleton />;
  } else if (isError) {
    body = (
      <div role="alert">
        <EmptyResult
          icon={<FileX size={32} aria-hidden="true" />}
          title="게시글을 찾지 못했어요"
          description="삭제되었거나 주소가 잘못되었을 수 있어요"
        >
          <Link
            to={PATHS.COMMUNITY_MISSING}
            className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
          >
            실종센터 목록으로
          </Link>
        </EmptyResult>
      </div>
    );
  } else {
    body = <MissingDetail post={post} />;
  }

  /** 상세 제목은 메뉴 이름이라 title을 넘기지 않는다. 「목록으로」는 본문 박스 위(보던 목록 쿼리로 돌아감) */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_MISSING}
      back
      backTo={`${PATHS.COMMUNITY_MISSING}${state?.listSearch ?? ''}`}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
