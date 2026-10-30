import { useEffect } from 'react';
import {
  generatePath,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import CareForm from '@/features/community/care/CareForm';
import { toFormValues } from '@/features/community/care/careUtils';
import { useCare, useUpdateCare } from '@/features/community/careQueries';
import useLeaveGuard from '@/features/community/useLeaveGuard';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

export default function CareEditPage() {
  const navigate = useNavigate();
  const petPrtcRcrtSn = Number(useParams().petPrtcRcrtSn);
  const { data: post, isPending, isError } = useCare(petPrtcRcrtSn);
  const update = useUpdateCare();
  const { setDirty, onLeave, leaveModal } = useLeaveGuard();
  const detailPath = generatePath(PATHS.COMMUNITY_PETCARE_DETAIL, {
    petPrtcRcrtSn,
  });
  /** 본인 글이 아니면 안내 후 상세로 이동 */
  const isDenied = Boolean(post) && post.mineYn !== 'Y';

  useEffect(() => {
    if (isDenied) showToast('수정 권한이 없어요');
  }, [isDenied]);

  if (isDenied) return <Navigate to={detailPath} replace />;

  /** 저장하면 별도 완료 모달 없이 상세로 이동해 바뀐 내용 바로 확인 */
  const handleSubmit = (values) =>
    update.mutate(
      { petPrtcRcrtSn, ...values },
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
    body = <p className="text-muted">불러오는 중이에요</p>;
  } else if (isError) {
    body = (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-muted">게시글을 찾지 못했어요</p>
        <Link
          to={PATHS.COMMUNITY_PETCARE}
          className="text-base font-medium text-brand-500 hover:underline"
        >
          우리동네 펫돌봄 목록으로
        </Link>
      </div>
    );
  } else {
    body = (
      <CareForm
        key={petPrtcRcrtSn}
        mode="edit"
        initial={toFormValues(post)}
        cancelTo={detailPath}
        isPending={update.isPending}
        errorMessage={
          update.isError &&
          '게시글을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요'
        }
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
      menu={PATHS.COMMUNITY_PETCARE}
      title="글쓰기"
      back={false}
      onLeave={onLeave}
    >
      {body}
      {leaveModal}
    </SubPageLayout>
  );
}
