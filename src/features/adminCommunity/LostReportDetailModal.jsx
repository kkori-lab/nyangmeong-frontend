import { generatePath, Link } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import FileImage from '@/components/FileImage';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { PATHS } from '@/routes/paths';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { getLostStatusLabel, LOST_STATUS } from './lostReportLabels';
import { useAdminLostReport } from './queries';

/** 라벨·값 한 줄 */
function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3 border-b border-line px-4 py-3 text-base last:border-b-0">
      <dt className="text-subtle">{label}</dt>
      <dd className="min-w-0 break-words text-ink-2">{children}</dd>
    </div>
  );
}

/** 찾았어요: 제목·상태·처리 시각만(결정 13) */
function FoundInfo({ report }) {
  return (
    <>
      <InfoRow label="상태">
        {getLostStatusLabel(report.lostTpofSttsCd)}
      </InfoRow>
      <InfoRow label="제목">{report.pstTtl}</InfoRow>
      <InfoRow label="처리 시각">
        {report.dscvSwtcDt ? formatDateTime(report.dscvSwtcDt) : '—'}
      </InfoRow>
    </>
  );
}

/** 실종·만료: 상태·만료 기준일·제목·본문·사진 */
function OpenInfo({ report }) {
  return (
    <>
      <InfoRow label="상태">
        {getLostStatusLabel(report.lostTpofSttsCd)}
        {report.expryCrtrDt &&
          ` · 만료 기준일 ${formatDate(report.expryCrtrDt, { separator: '-' })}`}
      </InfoRow>
      <InfoRow label="제목">{report.pstTtl}</InfoRow>
      <InfoRow label="본문 · 사진">
        <p className="leading-[1.5] whitespace-pre-line">{report.pstCn}</p>
        {report.imgs?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {report.imgs.map(({ atchFileSn }, index) => (
              <FileImage
                key={atchFileSn}
                src={publicFileUrl(atchFileSn)}
                alt={`실종제보 사진 ${index + 1}`}
                className="size-24 rounded-[8px] object-cover"
              />
            ))}
          </div>
        )}
      </InfoRow>
    </>
  );
}

/**
 * [실종제보 상세 모달]
 * - 별도 URL 없음. 강제 만료·기간 조정 없음(결정 12), 문제 글은 게시글·댓글 상세에서 블라인드
 */
export default function LostReportDetailModal({ lostTpofSn, onClose }) {
  const report = useAdminLostReport(lostTpofSn);

  const renderBody = () => {
    if (report.isPending) {
      return (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }
    if (report.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-8">
          <p className="text-base text-subtle">
            {report.error?.message || '실종제보를 불러오지 못했어요.'}
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => report.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    const isFound = report.data.lostTpofSttsCd === LOST_STATUS.FOUND;
    return (
      <dl className="rounded-[14px] border border-line bg-white">
        {isFound ? (
          <FoundInfo report={report.data} />
        ) : (
          <OpenInfo report={report.data} />
        )}
      </dl>
    );
  };

  const pstSn = report.data?.pstSn;

  return (
    <Modal
      title="실종제보 상세"
      isWide
      onClose={onClose}
      footer={
        pstSn != null && (
          <Link
            to={generatePath(PATHS.ADMIN_POST_DETAIL, { pstSn })}
            className={BTN_SECONDARY}
          >
            게시글·댓글에서 보기
          </Link>
        )
      }
    >
      {renderBody()}
    </Modal>
  );
}
