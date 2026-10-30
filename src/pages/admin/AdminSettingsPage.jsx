import { BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';
import SettingForm from '@/features/setting/admin/SettingForm';
import { useAdminSettings } from '@/features/setting/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import { getHmOf, getYmdOf } from '@/utils/formatDate';
import AdminForbidden from './AdminForbidden';

/** 묶음 5개 카드 자리: 회원·반려동물 5 / 커뮤니티 7 / 알림 1 / AI 2 / 파일 1 항목. 760px 이하는 첫 묶음만 */
function SettingSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <SkeletonCard className="h-[383px]" />
      <SkeletonCard className="h-[503px] max-[761px]:hidden" />
      <SkeletonCard className="h-[143px] max-[761px]:hidden" />
      <SkeletonCard className="h-[203px] max-[761px]:hidden" />
      <SkeletonCard className="h-[143px] max-[761px]:hidden" />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data, error, isPending, isError, refetch } = useAdminSettings();

  const handleRetry = () => refetch();

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 폼 */
  const renderBody = () => {
    if (isPending) return <SettingSkeleton />;
    if (isForbiddenError(error)) {
      return <AdminForbidden message={error.message} />;
    }
    if (isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">설정을 불러오지 못했어요.</p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    return <SettingForm settings={data} />;
  };

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink">운영 설정</h1>
        {/** 마지막 수정 */}
        {data && (
          <p className="text-base text-subtle">
            마지막 수정 {getYmdOf(data.mdfcnDt)} {getHmOf(data.mdfcnDt)} ·{' '}
            {data.mdfrId}
          </p>
        )}
      </div>
      {renderBody()}
    </div>
  );
}
