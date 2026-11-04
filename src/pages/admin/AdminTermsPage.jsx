import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';
import TermsHistoryModal from '@/features/adminTerms/TermsHistoryModal';
import TermsTable from '@/features/adminTerms/TermsTable';
import { useAdminTerms } from '@/features/adminTerms/queries';
import {
  TERMS_REAGREE_GUIDE,
  getTermsKindName,
} from '@/features/adminTerms/termsKinds';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 머리 줄 + 6행 표 */
function TermsListSkeleton() {
  return (
    <div aria-busy="true">
      <SkeletonCard className="h-[372px]" />
    </div>
  );
}

/** 등록 완료 안내: 재동의 없음 + 공지 등록 링크(FN-ADM-051-05) */
function RegisteredGuide({ terms, onClose }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-[14px] border border-brand-100 bg-brand-50 px-5 py-4 max-[760px]:px-4"
    >
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">
          {getTermsKindName(terms.trmsFixIdntfKey)} {terms.trmsVerId}을
          등록했어요
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          {TERMS_REAGREE_GUIDE}
        </p>
        <Link
          to={PATHS.ADMIN_NOTICE_NEW}
          className={`${BTN_SECONDARY} mt-3 h-8 px-3 text-sm`}
        >
          공지 등록하러 가기
        </Link>
      </div>
      <button
        type="button"
        aria-label="안내 닫기"
        className="grid size-8 shrink-0 place-items-center rounded-md text-subtle hover:bg-white hover:text-ink"
        onClick={onClose}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * [약관]
 * - 관리 대상 종류별 사용 중 버전. [이력]은 모달, [새 버전 등록]은 /admin/terms/new
 * - 등록 화면에서 돌아오면 location.state.registeredTerms로 완료 안내
 */
export default function AdminTermsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const terms = useAdminTerms();
  /** 이력 모달을 연 종류 키, null이면 닫힘 */
  const [historyKind, setHistoryKind] = useState(null);

  const registeredTerms = location.state?.registeredTerms ?? null;

  /** 안내를 닫으면 state를 비워 새로고침·뒤로가기에서 다시 안 보이게 */
  const handleGuideClose = () =>
    navigate(location.pathname, { replace: true, state: null });

  const renderBody = () => {
    if (terms.isPending) return <TermsListSkeleton />;
    if (terms.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            약관 목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => terms.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return <TermsTable terms={terms.data} onHistory={setHistoryKind} />;
  };

  if (isForbiddenError(terms.error)) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <h1 className="mb-5 text-2xl font-bold text-ink">약관</h1>
        <AdminForbidden message={terms.error.message} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">약관</h1>
        <Link to={PATHS.ADMIN_TERM_NEW} className={BTN_PRIMARY}>
          <Plus className="size-4" aria-hidden="true" />새 버전 등록
        </Link>
      </div>
      {registeredTerms && (
        <RegisteredGuide terms={registeredTerms} onClose={handleGuideClose} />
      )}
      {renderBody()}
      <p className="mt-3 text-sm text-subtle">
        새 버전을 등록하면 같은 종류의 이전 버전은 사용 안 함으로 바뀌어요.
      </p>
      {historyKind && (
        <TermsHistoryModal
          trmsFixIdntfKey={historyKind}
          onClose={() => setHistoryKind(null)}
        />
      )}
    </div>
  );
}
