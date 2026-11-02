import { formatDateTime } from '@/utils/formatDate';
import { getOptionLabel, STATUS_OPTIONS } from './memberLabels';
import MemberTabTable from './MemberTabTable';
import { useAdminMemberStatusHistories } from './queries';

const COLUMNS = ['일시', '변경 전', '변경 후', '사유', '처리 관리자'];

/**
 * [회원 상세 상태 이력 탭]
 * - 처리 관리자가 없는 변경(본인 탈퇴 등)은 —
 */
export default function MemberHistoryTab({ mbrSn, page, size, onPageChange }) {
  const histories = useAdminMemberStatusHistories({ mbrSn, page, size });

  return (
    <MemberTabTable
      query={histories}
      columns={COLUMNS}
      emptyText="상태 변경 이력이 없어요"
      errorText="상태 이력을 불러오지 못했어요."
      getRowKey={(_, index) => index}
      renderCells={(history) => [
        formatDateTime(history.chgDt),
        getOptionLabel(STATUS_OPTIONS, history.bfrSttsCd),
        getOptionLabel(STATUS_OPTIONS, history.aftrSttsCd),
        history.chgRsn,
        history.prcrNcnm ?? '—',
      ]}
      page={page}
      onPageChange={onPageChange}
    />
  );
}
