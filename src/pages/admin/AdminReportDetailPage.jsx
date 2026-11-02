import { useState } from 'react';
import { generatePath, Link, useNavigate, useParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useAdminReport } from '@/features/adminReport/queries';
import ReportCompleteForm from '@/features/adminReport/ReportCompleteForm';
import ReportDetailInfo from '@/features/adminReport/ReportDetailInfo';
import ReportHistory from '@/features/adminReport/ReportHistory';
import { REPORT_STATUS_RECEIVED } from '@/features/adminReport/reportLabels';
import ReportRejectModal from '@/features/adminReport/ReportRejectModal';
import ReportTable from '@/features/adminReport/ReportTable';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 버튼 줄 + 상세 + 같은 대상 신고 + 이력 자리 */
function ReportDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-24" />
      <SkeletonCard className="h-[420px]" />
      <SkeletonCard className="h-[120px]" />
      <SkeletonCard className="h-[120px]" />
      <SkeletonCard className="h-[336px] max-[760px]:h-[436px]" />
    </div>
  );
}

/**
 * [신고 상세]
 * - 접수 신고만 처리 완료·반려, 처리된 신고는 조회만
 * - 잘못된 번호와 없는 신고는 같은 안내
 */
export default function AdminReportDetailPage() {
  const { dclrSn: dclrSnParam } = useParams();
  const navigate = useNavigate();
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const dclrSn = Number(dclrSnParam);
  const report = useAdminReport(dclrSn);

  const handleRetry = () => report.refetch();
  const handleRejectClose = () => setIsRejectOpen(false);
  const handleSelect = (nextDclrSn) =>
    navigate(generatePath(PATHS.ADMIN_REPORT_DETAIL, { dclrSn: nextDclrSn }));

  /** 본문: 없는 신고 / 로딩 / 403 / 그 밖의 오류 / 상세 */
  const renderBody = () => {
    if (
      !Number.isInteger(dclrSn) ||
      report.error?.code === 'REPORT_NOT_FOUND'
    ) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-white py-16"
        >
          <p className="text-base text-subtle">신고를 찾을 수 없어요</p>
          <Link to={PATHS.ADMIN_REPORTS} className={BTN_SECONDARY}>
            목록으로
          </Link>
        </div>
      );
    }
    if (report.isPending) return <ReportDetailSkeleton />;
    if (isForbiddenError(report.error)) {
      return <AdminForbidden message={report.error.message} />;
    }
    if (report.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">신고를 불러오지 못했어요.</p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }

    const canProcess = report.data.dclrPrcsSttsCd === REPORT_STATUS_RECEIVED;

    return (
      <>
        <div className="mb-4">
          <Link to={PATHS.ADMIN_REPORTS} className={BTN_SECONDARY}>
            목록으로
          </Link>
        </div>
        <ReportDetailInfo report={report.data} />
        <h2 className="mt-6 mb-3 text-lg font-bold text-ink">같은 대상 신고</h2>
        <ReportTable
          reports={report.data.sameTargetReports}
          onSelect={handleSelect}
        />
        <h2 className="mt-6 mb-3 text-lg font-bold text-ink">처리 이력</h2>
        <ReportHistory histories={report.data.statusHistories} />
        {canProcess && (
          <>
            <h2 className="mt-6 mb-3 text-lg font-bold text-ink">신고 처리</h2>
            <ReportCompleteForm
              key={dclrSn}
              report={report.data}
              onReject={() => setIsRejectOpen(true)}
            />
          </>
        )}
        {isRejectOpen && (
          <ReportRejectModal dclrSn={dclrSn} onClose={handleRejectClose} />
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">신고 상세</h1>
      {renderBody()}
    </div>
  );
}
