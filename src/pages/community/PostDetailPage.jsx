import { FileX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import PostDetail from '@/features/community/PostDetail';
import { usePost } from '@/features/community/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import SkeletonCard from '@/components/SkeletonCard';

const DESCRIPTION = '반려생활의 일상과 유용한 정보를 함께 나눠요';

/** 로딩 자리: 본문 카드 + 아래 카드 + 오른쪽 레일(실제 상세와 같은 배치·높이) */
function PostDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <SkeletonCard className="h-[500px] max-[760px]:h-[520px]" />
        <SkeletonCard className="h-[360px] max-[760px]:h-[340px]" />
      </div>
      <SkeletonCard className="h-[395px]" />
    </div>
  );
}

export default function PostDetailPage() {
  const pstSn = Number(useParams().pstSn);
  const { data: post, isPending, isError } = usePost(pstSn);

  let body;
  if (isPending) {
    body = <PostDetailSkeleton />;
  } else if (isError) {
    body = (
      <div role="alert">
        <EmptyResult
          icon={<FileX size={32} aria-hidden="true" />}
          title="게시글을 찾지 못했어요"
          description="삭제되었거나 주소가 잘못되었을 수 있어요"
        >
          <Link
            to={PATHS.COMMUNITY}
            className="inline-flex h-9 items-center rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
          >
            펫이야기 목록으로
          </Link>
        </EmptyResult>
      </div>
    );
  } else {
    body = <PostDetail post={post} />;
  }

  /** 상세 제목은 '상세보기'가 아니라 메뉴 이름이라 title을 넘기지 않는다. 「목록으로」는 본문 하단 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY}
      back={false}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
