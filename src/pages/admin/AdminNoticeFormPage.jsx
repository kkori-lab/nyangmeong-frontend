import { Link, useParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';
import NoticeForm from '@/features/adminNotice/NoticeForm';
import { useAdminNotice } from '@/features/adminNotice/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 폼 카드 한 장 */
function NoticeFormSkeleton() {
  return (
    <div aria-busy="true">
      <SkeletonCard className="h-[600px]" />
    </div>
  );
}

/** 공지 수정: 번호로 불러온 뒤 폼 */
function NoticeEdit({ ntcMttrSnParam }) {
  const ntcMttrSn = Number(ntcMttrSnParam);
  const notice = useAdminNotice(ntcMttrSn);

  const handleRetry = () => notice.refetch();

  if (
    !Number.isInteger(ntcMttrSn) ||
    notice.error?.code === 'NOTICE_NOT_FOUND'
  ) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-white py-16"
      >
        <p className="text-base text-subtle">공지를 찾을 수 없어요</p>
        <Link to={PATHS.ADMIN_NOTICES} className={BTN_SECONDARY}>
          목록으로
        </Link>
      </div>
    );
  }
  if (notice.isPending) return <NoticeFormSkeleton />;
  if (isForbiddenError(notice.error)) {
    return <AdminForbidden message={notice.error.message} />;
  }
  if (notice.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16">
        <p className="text-base text-subtle">공지를 불러오지 못했어요.</p>
        <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
          다시 시도
        </button>
      </div>
    );
  }
  return <NoticeForm key={ntcMttrSn} notice={notice.data} />;
}

/**
 * [공지 등록·수정]
 * - /admin/notices/new는 등록, /admin/notices/:ntcMttrSn/edit는 수정
 * - 잘못된 번호와 없는 공지는 같은 안내
 */
export default function AdminNoticeFormPage() {
  const { ntcMttrSn: ntcMttrSnParam } = useParams();
  const isEdit = ntcMttrSnParam !== undefined;

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">
        {isEdit ? '공지 수정' : '공지 등록'}
      </h1>
      {isEdit ? (
        <NoticeEdit key={ntcMttrSnParam} ntcMttrSnParam={ntcMttrSnParam} />
      ) : (
        <NoticeForm />
      )}
    </div>
  );
}
