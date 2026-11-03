import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Select from '@/components/Select';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { showToast } from '@/components/toastStore';
import AdminNewsFormModal from '@/features/adminNews/AdminNewsFormModal';
import AdminNewsTable from '@/features/adminNews/AdminNewsTable';
import NewsKeywordPanel from '@/features/adminNews/NewsKeywordPanel';
import {
  NEWS_CATEGORIES,
  NEWS_SOURCES,
} from '@/features/adminNews/newsLabels';
import {
  useAdminNewsKeywords,
  useAdminNewsList,
  useUpdateAdminNews,
} from '@/features/adminNews/queries';
import { isRunning } from '@/features/batch/batchLabels';
import { useBatches, useRunBatch } from '@/features/batch/queries';
import { PATHS } from '@/routes/paths';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

const TABS = [
  { key: 'news', label: '뉴스' },
  { key: 'keywords', label: '분류 키워드' },
];
const TAB_KEYS = TABS.map((tab) => tab.key);

const PAGE_SIZE = 20;

/** 뉴스 수집 배치구분 공통코드(SYSG02) */
const NEWS_COLLECT_BTCH_SE_CD = 'SYSC0028';

/** 등록 모달을 연 상태 */
const NEW_NEWS = 'new';

const SOURCE_OPTIONS = [
  { value: '', label: '출처: 전체' },
  ...NEWS_SOURCES.map(({ code, name }) => ({ value: code, label: name })),
];
const CATEGORY_OPTIONS = [
  { value: '', label: '카테고리: 전체' },
  ...NEWS_CATEGORIES.map(({ code, name }) => ({ value: code, label: name })),
];

/** 빈 값을 뺀 필터 조건 */
const toFilterParams = ({ newsSrcCd, newsClsfCd }) => ({
  ...(newsSrcCd ? { newsSrcCd } : {}),
  ...(newsClsfCd ? { newsClsfCd } : {}),
});

/** 필터·버튼 줄 + 표 20행 + 쪽 번호: 높이는 행 높이로 계산한 값 */
function NewsListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-full max-[760px]:h-[88px]" />
      <SkeletonCard className="h-[1188px]" />
      <Skeleton className="mx-auto h-9 w-64" />
    </div>
  );
}

/** 안내 문구 + 카테고리 카드 4장 */
function KeywordSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-5 w-[480px] max-w-full" />
      <div className="grid gap-4 min-[761px]:grid-cols-2">
        {NEWS_CATEGORIES.map(({ code }) => (
          <SkeletonCard key={code} className="h-[186px]" />
        ))}
      </div>
    </div>
  );
}

/** 조회 오류: 다시 시도 */
function LoadError({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16">
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
}

/** 뉴스 수집 실행 버튼 + 확인 모달 */
function NewsCollectButton() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const batches = useBatches();
  const run = useRunBatch();
  const newsBatch = batches.data?.find(
    ({ btchSeCd }) => btchSeCd === NEWS_COLLECT_BTCH_SE_CD,
  );
  const isCollecting = Boolean(newsBatch && isRunning(newsBatch));

  const handleConfirm = () =>
    run.mutate(NEWS_COLLECT_BTCH_SE_CD, {
      onSuccess: () => {
        showToast('뉴스 수집을 시작했어요');
        setHasStarted(true);
        setIsConfirming(false);
      },
    });
  const handleCancel = () => {
    run.reset();
    setIsConfirming(false);
  };

  return (
    <>
      <button
        type="button"
        className={`${BTN_SECONDARY} max-[760px]:flex-1`}
        disabled={batches.isPending || isCollecting}
        onClick={() => setIsConfirming(true)}
      >
        {isCollecting ? '수집 중' : '뉴스 수집 실행'}
      </button>
      {hasStarted && (
        <p className="w-full text-sm text-subtle min-[761px]:order-last">
          실행 결과는{' '}
          <Link
            to={`${PATHS.ADMIN_BATCHES}?batch=${NEWS_COLLECT_BTCH_SE_CD}`}
            className="font-semibold text-brand-900 underline underline-offset-2"
          >
            배치 현황
          </Link>
          에서 볼 수 있어요.
        </p>
      )}
      {isConfirming && (
        <ConfirmModal
          title="뉴스 수집 실행"
          description="지금 뉴스 수집 배치를 실행할까요? 결과는 배치 현황에 남아요."
          confirmLabel="실행"
          errorMessage={run.error?.message}
          isPending={run.isPending}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

/** 뉴스 탭: 필터·목록·등록·수정·수집 실행 */
function NewsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 열린 모달: null 닫힘, NEW_NEWS 등록, 뉴스 객체 수정 */
  const [editing, setEditing] = useState(null);

  const page = Number(searchParams.get('page')) || 1;
  const newsSrcCd = searchParams.get('newsSrcCd') ?? '';
  const newsClsfCd = searchParams.get('newsClsfCd') ?? '';
  const filterParams = toFilterParams({ newsSrcCd, newsClsfCd });

  const newsList = useAdminNewsList({
    ...filterParams,
    page,
    size: PAGE_SIZE,
  });
  const update = useUpdateAdminNews();

  const handleFilterChange = (next) =>
    setSearchParams(toFilterParams({ newsSrcCd, newsClsfCd, ...next }));
  const handlePageChange = (nextPage) =>
    setSearchParams({ ...filterParams, page: nextPage });

  const handleToggleUse = (news, useYn) =>
    update.mutate(
      { newsSn: news.newsSn, useYn },
      {
        onSuccess: () =>
          showToast(useYn ? '뉴스를 사용으로 바꿨어요' : '뉴스를 숨겼어요'),
        onError: (error) => showToast(error.message),
      },
    );
  const handleChangeCategory = (news, nextCategory) =>
    update.mutate(
      { newsSn: news.newsSn, newsClsfCd: nextCategory },
      {
        onSuccess: () => showToast('카테고리를 바꿨어요'),
        onError: (error) => showToast(error.message),
      },
    );

  if (newsList.isPending) return <NewsListSkeleton />;
  if (isForbiddenError(newsList.error)) {
    return <AdminForbidden message={newsList.error.message} />;
  }

  const renderList = () => {
    if (newsList.isError) {
      return (
        <LoadError
          message="뉴스 목록을 불러오지 못했어요."
          onRetry={() => newsList.refetch()}
        />
      );
    }
    const { content, totalElements, totalPages } = newsList.data;
    if (content.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          {newsSrcCd || newsClsfCd
            ? '조건에 맞는 뉴스가 없어요'
            : '등록된 뉴스가 없어요'}
        </p>
      );
    }
    return (
      <>
        <AdminNewsTable
          newsList={content}
          pendingSn={update.isPending ? update.variables.newsSn : null}
          onToggleUse={handleToggleUse}
          onChangeCategory={handleChangeCategory}
          onEdit={setEditing}
        />
        <p className="mt-3 mb-2 text-sm text-subtle">
          총 {totalElements.toLocaleString()}건 · {PAGE_SIZE}건씩
        </p>
        <BoardPagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      </>
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          label="출처"
          value={newsSrcCd}
          options={SOURCE_OPTIONS}
          className="w-[160px] max-[760px]:w-[calc(50%-4px)]"
          onChange={(next) => handleFilterChange({ newsSrcCd: next })}
        />
        <Select
          label="카테고리"
          value={newsClsfCd}
          options={CATEGORY_OPTIONS}
          className="w-[160px] max-[760px]:w-[calc(50%-4px)]"
          onChange={(next) => handleFilterChange({ newsClsfCd: next })}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full">
          <NewsCollectButton />
          <button
            type="button"
            className={`${BTN_PRIMARY} max-[760px]:flex-1`}
            onClick={() => setEditing(NEW_NEWS)}
          >
            뉴스 등록
          </button>
        </div>
      </div>
      {renderList()}
      {editing != null && (
        <AdminNewsFormModal
          news={editing === NEW_NEWS ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

/** 분류 키워드 탭 */
function KeywordsTab() {
  const keywords = useAdminNewsKeywords();

  if (keywords.isPending) return <KeywordSkeleton />;
  if (isForbiddenError(keywords.error)) {
    return <AdminForbidden message={keywords.error.message} />;
  }
  if (keywords.isError) {
    return (
      <LoadError
        message="분류 키워드를 불러오지 못했어요."
        onRetry={() => keywords.refetch()}
      />
    );
  }
  return <NewsKeywordPanel keywords={keywords.data} />;
}

/**
 * [펫뉴스]
 * - 탭은 ?tab=news|keywords, 없거나 모르면 뉴스
 * - 뉴스 탭 필터는 ?newsSrcCd=·?newsClsfCd=, 탭을 바꾸면 필터·쪽 번호 초기화
 * - 뉴스 수집 실행은 배치 현황의 수동 실행과 같은 배치(SYSC0028)
 */
export default function AdminNewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const tab = TAB_KEYS.includes(tabParam) ? tabParam : 'news';

  const handleTabSelect = (nextTab) =>
    setSearchParams(nextTab === 'news' ? {} : { tab: nextTab });

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">펫뉴스</h1>
      <div
        role="tablist"
        aria-label="펫뉴스"
        className="mb-4 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {TABS.map(({ key, label }) => {
          const isSelected = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-12 shrink-0 px-4 text-base whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-900'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleTabSelect(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        {tab === 'keywords' ? <KeywordsTab /> : <NewsTab />}
      </div>
    </div>
  );
}
