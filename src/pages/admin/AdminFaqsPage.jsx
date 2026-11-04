import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import FaqCategoryTabs from '@/features/adminFaq/FaqCategoryTabs';
import FaqFormModal from '@/features/adminFaq/FaqFormModal';
import FaqSearch from '@/features/adminFaq/FaqSearch';
import FaqTable from '@/features/adminFaq/FaqTable';
import { useAdminFaqs, useFaqCategories } from '@/features/adminFaq/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const PAGE_SIZE = 20;

/** 등록 모달을 연 상태 */
const NEW_FAQ = 'new';

/** 빈 값을 뺀 검색 조건 */
const toFilterParams = ({ faqClsfCd, keyword }) => ({
  ...(faqClsfCd ? { faqClsfCd } : {}),
  ...(keyword ? { keyword } : {}),
});

/** 카테고리 탭 + 검색 줄 + 표 20행 + 쪽 번호 자리 */
function FaqListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-full max-[760px]:h-[136px]" />
      <SkeletonCard className="h-[1025px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/**
 * [FAQ]
 * - 카테고리 탭은 ?faqClsfCd=, 질문·답변 검색은 ?keyword=, 둘은 함께 걸린다
 * - 행 클릭 -> 수정 모달, [FAQ 등록] -> 등록 모달
 * - 순서는 서버 기준
 */
export default function AdminFaqsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 열린 모달: null(닫힘), NEW_FAQ(등록), faqSn(수정) */
  const [editing, setEditing] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const faqClsfCd = searchParams.get('faqClsfCd') ?? '';
  const keyword = searchParams.get('keyword') ?? '';
  const filterParams = toFilterParams({ faqClsfCd, keyword });

  const categories = useFaqCategories();
  const faqs = useAdminFaqs({ ...filterParams, page, size: PAGE_SIZE });

  const handleRetry = () => {
    if (categories.isError) categories.refetch();
    faqs.refetch();
  };
  const handleCategorySelect = (nextCategory) =>
    setSearchParams(toFilterParams({ faqClsfCd: nextCategory, keyword }));
  const handleSearch = (nextKeyword) =>
    setSearchParams(toFilterParams({ faqClsfCd, keyword: nextKeyword }));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...filterParams, page: nextPage });
  const handleModalClose = () => setEditing(null);

  /** 본문: 로딩 / 403 / 그 밖의 오류 / 빈 목록 / 목록 */
  const renderBody = () => {
    if (faqs.isPending || categories.isPending) return <FaqListSkeleton />;
    const forbiddenError = [faqs.error, categories.error].find(
      isForbiddenError,
    );
    if (forbiddenError) {
      return <AdminForbidden message={forbiddenError.message} />;
    }

    const renderList = () => {
      if (faqs.isError) {
        return (
          <div role="alert" className="flex flex-col items-center gap-3 py-16">
            <p className="text-base text-subtle">
              FAQ 목록을 불러오지 못했어요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        );
      }
      if (faqs.data.content.length === 0) {
        return (
          <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
            {faqClsfCd || keyword
              ? '조건에 맞는 FAQ가 없어요'
              : '등록된 FAQ가 없어요'}
          </p>
        );
      }
      return (
        <>
          <FaqTable faqs={faqs.data.content} onSelect={setEditing} />
          <p className="mt-3 mb-2 text-sm text-subtle">
            총 {faqs.data.totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
          </p>
          <BoardPagination
            page={page}
            totalPages={faqs.data.totalPages}
            onChange={handlePageChange}
          />
        </>
      );
    };

    if (categories.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-16">
          <p className="text-base text-subtle">
            FAQ 카테고리를 불러오지 못했어요.
          </p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }

    return (
      <>
        <FaqCategoryTabs
          categories={categories.data}
          selected={faqClsfCd}
          onSelect={handleCategorySelect}
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FaqSearch key={keyword} keyword={keyword} onSearch={handleSearch} />
          <button
            type="button"
            className={`${BTN_PRIMARY} max-[760px]:w-full`}
            onClick={() => setEditing(NEW_FAQ)}
          >
            FAQ 등록
          </button>
        </div>
        <div role="tabpanel">{renderList()}</div>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">FAQ</h1>
      {renderBody()}
      {editing != null && categories.isSuccess && (
        <FaqFormModal
          faqSn={editing === NEW_FAQ ? null : editing}
          categories={categories.data}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
