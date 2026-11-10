import { useEffect } from 'react';
import { FileX } from 'lucide-react';
import {
  generatePath,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import EmptyResult from '@/components/EmptyResult';
import MissingForm from '@/features/community/missing/MissingForm';
import { toFormValues } from '@/features/community/missing/missingUtils';
import { isExpired, isFound } from '@/features/community/missingCodes';
import {
  useMissing,
  useUpdateMissing,
} from '@/features/community/missingQueries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';
import SkeletonCard from '@/components/SkeletonCard';

/** 로딩 자리: 폼 카드 + 오른쪽 작성 안내 레일(실제 수정 화면과 같은 배치·높이) */
function MissingEditSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10"
    >
      <SkeletonCard className="h-[2200px] max-[760px]:h-[2900px]" />
      <SkeletonCard className="h-[360px]" />
    </div>
  );
}

export default function MissingEditPage() {
  const navigate = useNavigate();
  const lostTpofSn = Number(useParams().lostTpofSn);
  const { data: post, isPending, isError } = useMissing(lostTpofSn);
  const update = useUpdateMissing();
  const { setDirty, onLeave, leaveModal } = useLeaveGuard();
  const detailPath = generatePath(PATHS.COMMUNITY_MISSING_DETAIL, {
    lostTpofSn,
  });
  /** 본인 글이 아니면 안내 후 상세로 이동 */
  const isDenied = Boolean(post) && !post.owner;
  /** 찾았어요·기간 만료 글은 서버가 수정을 받지 않아 주소로 들어와도 상세로 보낸다 */
  const isClosed = Boolean(post) && (isFound(post) || isExpired(post));

  useEffect(() => {
    if (isDenied) showToast('수정 권한이 없어요');
    else if (isClosed) showToast('실종 상태의 글만 수정할 수 있어요');
  }, [isDenied, isClosed]);

  if (isDenied || isClosed) return <Navigate to={detailPath} replace />;

  /** 저장하면 별도 완료 모달 없이 상세로 이동해 바뀐 내용 바로 확인 */
  const handleSubmit = (values) =>
    update.mutate(
      { lostTpofSn, ...values },
      {
        onSuccess: () => {
          setDirty(false);
          showToast('수정한 내용을 저장했어요');
          navigate(detailPath);
        },
      },
    );

  let body;
  if (isPending) {
    body = <MissingEditSkeleton />;
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
    body = (
      <MissingForm
        key={lostTpofSn}
        mode="edit"
        initial={toFormValues(post)}
        cancelTo={detailPath}
        isPending={update.isPending}
        errorMessage={update.isError && update.error.message}
        onSubmit={handleSubmit}
        onLeave={onLeave}
        onDirtyChange={setDirty}
      />
    );
  }

  /** 글쓰기·글수정은 둘 다 title="글쓰기" */
  return (
    <SubPageLayout
      section="community"
      menu={PATHS.COMMUNITY_MISSING}
      title="글쓰기"
      back={false}
      onLeave={onLeave}
    >
      {body}
      {leaveModal}
    </SubPageLayout>
  );
}
