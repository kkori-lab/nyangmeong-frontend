import { Link } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { formatDateTime } from '@/utils/formatDate';
import MemberTabTable from './MemberTabTable';
import { useAdminMemberPoints } from './queries';

const COLUMNS = ['일시', '거래 유형', '증감', '거래 후 잔액', '메모'];

/** 증감 표시: 늘어난 값에 + */
const formatPointChange = (dlngPnt) =>
  `${dlngPnt > 0 ? '+' : ''}${dlngPnt.toLocaleString()}P`;

/**
 * [회원 상세 포인트 탭]
 * - 원장 최신순
 * - [포인트 조정]: 포인트 화면(SCR-ADM-072)으로 이 회원을 걸고 이동
 */
export default function MemberPointsTab({ mbrSn, page, size, onPageChange }) {
  const points = useAdminMemberPoints({ mbrSn, page, size });

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Link
          to={`${PATHS.ADMIN_POINTS}?mbrSn=${mbrSn}`}
          className={BTN_SECONDARY}
        >
          포인트 조정
        </Link>
      </div>
      <MemberTabTable
        query={points}
        columns={COLUMNS}
        emptyText="포인트 내역이 없어요"
        errorText="포인트 내역을 불러오지 못했어요."
        getRowKey={(point) => point.pntGnlgrSn}
        renderCells={(point) => [
          formatDateTime(point.regDt),
          point.pntDlngTypeCdNm,
          <span key="dlngPnt" className="tabular-nums">
            {formatPointChange(point.dlngPnt)}
          </span>,
          <span key="blncPnt" className="tabular-nums">
            {point.dlngAftrBlncPnt.toLocaleString()}P
          </span>,
          point.memoCn ?? '—',
        ]}
        page={page}
        onPageChange={onPageChange}
      />
    </>
  );
}
