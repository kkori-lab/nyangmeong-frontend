import { SearchX } from 'lucide-react';
import EmptyResult from '@/components/EmptyResult';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import useSearchDraft from '@/hooks/useSearchDraft';
import ListPager from '@/components/ListPager';

import MissingCard from './MissingCard';
import MissingFilters from './MissingFilters';
import MissingGuideButton from './MissingGuideButton';
import MissingRail from './MissingRail';

/**
 * 실종센터 목록: 왼쪽에 필터(검색 · 실종일 · 지역 · 반려동물) · 건수 · 카드(한 줄 3개) · 무한 스크롤, 오른쪽에 레일
 * - [실종 신고 등록]은 오른쪽 레일 맨 위(action, MissingListPage가 넘긴다). 실종·찾았어요 글이 탭 없이 한 목록에 섞여 서버 순서로 나옴
 * - filters: { mine, region, dong, pet, period, keyword }, onChange(바뀐 값만), onReset, 모바일은 hasNext·isFetchingNext·onLoadMore(무한 스크롤), 그 밖은 page·onPageChange(쪽 번호)
 */
export default function MissingList({
  posts,
  filters,
  onChange,
  onReset,
  isMobile,
  page,
  onPageChange,
  hasNext,
  isFetchingNext,
  onLoadMore,
  action,
}) {
  const { input, setInput, commit } = useSearchDraft(filters.keyword);
  const { content, totalElements } = posts;

  const handleReset = () => {
    setInput('');
    onReset();
  };

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-x-8 gap-y-10 max-[1100px]:grid-cols-1`}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <MissingFilters
          filters={filters}
          search={{
            value: input,
            onChange: setInput,
            onSubmit: () => {
              const next = commit();
              if (next !== filters.keyword) onChange({ keyword: next });
            },
          }}
          onChange={(next) => onChange({ ...next, keyword: commit() })}
          onReset={handleReset}
        />

        <div className="flex items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted">
            전체 <b className="font-bold text-ink">{totalElements}</b> 건
          </p>
        </div>

        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title="검색 결과가 없어요"
            description="검색어나 필터를 바꿔 다시 찾아보세요"
          >
            <button
              type="button"
              onClick={handleReset}
              className="h-9 cursor-pointer rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
            >
              필터 초기화
            </button>
          </EmptyResult>
        ) : (
          <ul className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
            {content.map((item) => (
              <li key={item.lostTpofSn}>
                <MissingCard post={item} />
              </li>
            ))}
          </ul>
        )}

        <ListPager
          isMobile={isMobile}
          hasNext={hasNext}
          isFetchingNext={isFetchingNext}
          onLoadMore={onLoadMore}
          page={page}
          totalPages={posts.totalPages}
          onPageChange={onPageChange}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-10 max-[1100px]:contents">
        <div className="max-[1100px]:order-first">
          {action}
          <MissingGuideButton variant="inline" />
        </div>
        {/* 760px 이하에서는 목록 아래에 쌓이는 안내를 숨긴다 */}
        <div className="min-w-0 max-[760px]:hidden">
          <MissingRail />
        </div>
      </div>
    </div>
  );
}
