import { formatDateTime } from '@/utils/formatDate';
import MemberTabTable from './MemberTabTable';
import { useAdminMemberTerms } from './queries';

const COLUMNS = ['약관', '동의 버전', '동의 여부', '동의 일시'];

/**
 * [회원 상세 약관 동의 탭]
 * - 약관 종류별 한 줄, 마케팅 수신 동의 포함
 */
export default function MemberTermsTab({ mbrSn }) {
  const terms = useAdminMemberTerms(mbrSn);

  return (
    <MemberTabTable
      query={terms}
      columns={COLUMNS}
      emptyText="약관 동의 내역이 없어요"
      errorText="약관 동의를 불러오지 못했어요."
      getRowKey={(term) => term.trmsNm}
      renderCells={(term) => [
        term.trmsNm,
        term.trmsVerNo,
        term.agreYn === 'Y' ? '동의' : '미동의',
        term.agreDt ? formatDateTime(term.agreDt) : '—',
      ]}
    />
  );
}
