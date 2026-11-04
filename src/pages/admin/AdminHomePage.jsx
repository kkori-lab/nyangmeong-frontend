import { useSearchParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import DashboardError from '@/features/adminDashboard/DashboardError';
import {
  DEFAULT_PERIOD_KEY,
  PERIOD_CUSTOM,
  resolvePeriod,
} from '@/features/adminDashboard/dashboardPeriod';
import OverviewSection from '@/features/adminDashboard/OverviewSection';
import PendingSection from '@/features/adminDashboard/PendingSection';
import PeriodPicker from '@/features/adminDashboard/PeriodPicker';
import {
  useAdminDashboard,
  useAdminDashboardStats,
} from '@/features/adminDashboard/queries';
import StatsSection from '@/features/adminDashboard/StatsSection';
import { INQUIRY_TYPE_PIXEL_CHARACTER } from '@/features/adminInquiry/inquiryLabels';
import { SNDNG_RSLT_FAIL } from '@/features/adminNotificationLog/api';
import {
  CHAR_JOB_STTS_FAIL,
  OCR_STTS_FAIL,
} from '@/features/adminProcessing/processingLabels';
import { REPORT_STATUS_RECEIVED } from '@/features/adminReport/reportLabels';
import { PATHS } from '@/routes/paths';
import { addDays, getTodayYmd } from '@/utils/formatDate';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 1:1 문의 미답변 상태(CSCG03) */
const INQUIRY_STATUS_UNANSWERED = 'CSCC0012';

/** 쿼리를 붙인 경로 */
const withQuery = (path, query) => `${path}?${new URLSearchParams(query)}`;

/** 처리 대기 칸: 건수 + 필터를 건 관리 화면 링크 */
const toPendingItems = (overview) => {
  const todayYmd = getTodayYmd();
  const unansweredQuery = { inqryPrcsSttsCd: INQUIRY_STATUS_UNANSWERED };
  return [
    {
      key: 'dclr',
      label: '접수 신고',
      value: overview.dclrRcptCnt,
      to: withQuery(PATHS.ADMIN_REPORTS, { status: REPORT_STATUS_RECEIVED }),
    },
    {
      key: 'inqry',
      label: '미답변 문의',
      value: overview.unansInqryCnt,
      to: withQuery(PATHS.ADMIN_INQUIRIES, unansweredQuery),
      sub: {
        label: '픽셀 캐릭터',
        value: overview.pixelInqryCnt,
        to: withQuery(PATHS.ADMIN_INQUIRIES, {
          ...unansweredQuery,
          inqryTypeCd: INQUIRY_TYPE_PIXEL_CHARACTER,
        }),
      },
    },
    {
      key: 'char',
      label: '캐릭터 생성 실패',
      value: overview.charFailCnt,
      to: withQuery(PATHS.ADMIN_PROCESSING, {
        tab: 'character',
        jobSttsCd: CHAR_JOB_STTS_FAIL,
      }),
    },
    {
      key: 'ocr',
      label: 'OCR 인식 실패',
      value: overview.ocrFailCnt,
      to: withQuery(PATHS.ADMIN_PROCESSING, {
        tab: 'ocr',
        ocrPrcsSttsCd: OCR_STTS_FAIL,
      }),
    },
    {
      key: 'noti',
      label: '알림 발송 실패(24시간)',
      value: overview.notiFailCnt,
      to: withQuery(PATHS.ADMIN_NOTIFICATION_LOGS, {
        sndngRsltCd: SNDNG_RSLT_FAIL,
        fromYmd: addDays(todayYmd, -1),
        toYmd: todayYmd,
      }),
    },
    {
      key: 'btch',
      label: '실패한 배치',
      value: overview.btchFailCnt,
      to: PATHS.ADMIN_BATCHES,
    },
  ];
};

/**
 * [대시보드]
 * - 운영 현황·처리 대기는 지금 값, 이용 통계만 기간 선택(?period=7|30|custom&fromYmd=&toYmd=)
 * - 처리 대기 건수 -> 필터를 건 관리 화면
 */
export default function AdminHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = resolvePeriod(searchParams);

  const overview = useAdminDashboard();
  const stats = useAdminDashboardStats({
    fromYmd: period.fromYmd,
    toYmd: period.toYmd,
  });

  const handlePeriodChange = ({ periodKey, fromYmd, toYmd }) => {
    if (periodKey === PERIOD_CUSTOM) {
      setSearchParams({ period: periodKey, fromYmd, toYmd });
      return;
    }
    setSearchParams(
      periodKey === DEFAULT_PERIOD_KEY ? {} : { period: periodKey },
    );
  };

  const forbiddenError = [overview.error, stats.error].find(isForbiddenError);

  let body;
  if (
    (overview.isPending && !overview.isError) ||
    (stats.isPending && !stats.isError)
  ) {
    body = <DashboardSkeleton />;
  } else if (forbiddenError) {
    body = <AdminForbidden message={forbiddenError.message} />;
  } else {
    body = (
      <div className="flex flex-col gap-8">
        {overview.isError ? (
          <DashboardError
            message="운영 현황과 처리 대기를 불러오지 못했어요."
            onRetry={() => overview.refetch()}
          />
        ) : (
          <>
            <OverviewSection overview={overview.data} />
            <PendingSection items={toPendingItems(overview.data)} />
          </>
        )}
        {stats.isError ? (
          <DashboardError
            message="이용 통계를 불러오지 못했어요."
            onRetry={() => stats.refetch()}
          />
        ) : (
          <StatsSection
            stats={stats.data}
            fromYmd={period.fromYmd}
            toYmd={period.toYmd}
            picker={
              <PeriodPicker
                key={`${period.periodKey}-${period.fromYmd}-${period.toYmd}`}
                period={period}
                onChange={handlePeriodChange}
              />
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">대시보드</h1>
      {body}
    </div>
  );
}

/** 첫 진입 로딩: 운영 현황·처리 대기·이용 통계 배치 */
function DashboardSkeleton() {
  return (
    <PageSkeleton>
      <div className="flex flex-col gap-8">
        <div className="space-y-3">
          <Skeleton className="h-7 w-24" />
          <div className="grid grid-cols-2 gap-3 min-[1101px]:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonCard key={index} className="h-[106px]" />
            ))}
          </div>
          <div className="grid gap-3 min-[1101px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <SkeletonCard className="h-[300px]" />
            <SkeletonCard className="h-[300px]" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-7 w-24" />
          <div className="grid grid-cols-2 gap-3 min-[761px]:grid-cols-3 min-[1101px]:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonCard key={index} className="h-[106px]" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-10 w-[260px]" />
          </div>
          <div className="grid gap-3 min-[1101px]:grid-cols-2">
            <SkeletonCard className="h-[560px]" />
            <SkeletonCard className="h-[560px]" />
            <SkeletonCard className="h-[300px]" />
            <SkeletonCard className="h-[300px]" />
            <SkeletonCard className="h-[300px]" />
            <SkeletonCard className="h-[300px]" />
          </div>
        </div>
      </div>
    </PageSkeleton>
  );
}
