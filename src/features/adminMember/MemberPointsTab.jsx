import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDateTime } from '@/utils/formatDate';
import { getOptionLabel, POINT_TYPE_OPTIONS } from './memberLabels';
import MemberTabTable from './MemberTabTable';
import { useAdminMemberPoints } from './queries';

const COLUMNS = ['일시', '거래 유형', '증감', '거래 후 잔액', '메모'];

/** 증감 표시: 늘어난 값에 + */
const formatPointChange = (dlngPnt) =>
  `${dlngPnt > 0 ? '+' : ''}${dlngPnt.toLocaleString()}P`;

/**
 * [회원 상세 포인트 탭]
 * - 원장 최신순
 * - [포인트 조정]: 포인트 화면(SCR-ADM-072)이 생길 때까지 비활성
 */
export default function MemberPointsTab({ mbrSn, page, size, onPageChange }) {
  const points = useAdminMemberPoints({ mbrSn, page, size });

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button type="button" className={BTN_SECONDARY} disabled>
          포인트 조정
        </button>
      </div>
      <MemberTabTable
        query={points}
        columns={COLUMNS}
        emptyText="포인트 내역이 없어요"
        errorText="포인트 내역을 불러오지 못했어요."
        getRowKey={(point) => point.pntGnlgrSn}
        renderCells={(point) => [
          formatDateTime(point.regDt),
          getOptionLabel(POINT_TYPE_OPTIONS, point.pntDlngTypeCd),
          formatPointChange(point.dlngPnt),
          `${point.dlngAftrBlncPnt.toLocaleString()}P`,
          point.memoCn ?? '—',
        ]}
        page={page}
        onPageChange={onPageChange}
      />
    </>
  );
}
