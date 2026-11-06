import { FileX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyResult from '@/components/EmptyResult';
import MissingDetail from '@/features/community/missing/MissingDetail';
import { useMissing } from '@/features/community/missingQueries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

const DESCRIPTION =
  '잃어버린 반려동물을 함께 찾아요. 비슷한 아이를 보셨다면 댓글로 알려 주세요';

export default function MissingDetailPage() {
  const lostTpofSn = Number(useParams().lostTpofSn);
  const { data: post, isPending, isError } = useMissing(lostTpofSn);

  let body;
  if (isPending) {
    body = <p className="text-muted">불러오는 중이에요</p>;
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

  /** 상세 제목은 메뉴 이름이라 title을 넘기지 않는다. 「목록으로」는 본문 하단 */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_MISSING}
      back={false}
      description={DESCRIPTION}
    >
      {body}
    </SubPageLayout>
  );
}
