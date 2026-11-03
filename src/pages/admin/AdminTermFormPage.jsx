import { useSearchParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import SkeletonCard from '@/components/SkeletonCard';
import TermsVersionForm from '@/features/adminTerms/TermsVersionForm';
import { useAdminTerms } from '@/features/adminTerms/queries';
import { isTermsKind } from '@/features/adminTerms/termsKinds';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/**
 * [약관 새 버전 등록]
 * - ?trmsFixIdntfKey=로 종류를 미리 고름(모르는 값이면 빈 값)
 * - 종류별 현재 버전을 먼저 불러와 폼에 넘김(현재 버전 안내·필수 여부 기본값)
 */
export default function AdminTermFormPage() {
  const [searchParams] = useSearchParams();
  const kindParam = searchParams.get('trmsFixIdntfKey');
  const initialKind = isTermsKind(kindParam) ? kindParam : '';
  const terms = useAdminTerms();

  const renderBody = () => {
    if (terms.isPending) {
      return (
        <div aria-busy="true">
          <SkeletonCard className="h-[720px]" />
        </div>
      );
    }
    if (isForbiddenError(terms.error)) {
      return <AdminForbidden message={terms.error.message} />;
    }
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
    return (
      <TermsVersionForm
        key={initialKind}
        initialKind={initialKind}
        currentByKind={
          new Map(terms.data.map((item) => [item.trmsFixIdntfKey, item]))
        }
      />
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">약관 새 버전 등록</h1>
      {renderBody()}
    </div>
  );
}
