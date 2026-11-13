import { SearchX } from 'lucide-react';
import { useState } from 'react';
import BoardPagination from '@/components/BoardPagination';
import EmptyResult from '@/components/EmptyResult';
import MissingCard from './MissingCard';
import MissingFilters from './MissingFilters';
import MissingRail from './MissingRail';

/**
 * 실종센터 목록: 왼쪽에 필터(검색 · 실종일 · 지역 · 반려동물) · 건수와 내 글만 보기 · 카드(한 줄 3개) · 페이지, 오른쪽에 레일
 * - [실종 신고 등록]은 오른쪽 레일 맨 위(action, MissingListPage가 넘긴다). 실종·찾았어요 글이 탭 없이 한 목록에 섞여 서버 순서로 나옴
 * - filters: { mine, region, dong, pet, period, keyword }, onChange(바뀐 값만), onReset, onPageChange
 */
export default function MissingList({
  posts,
  filters,
  onChange,
  onReset,
  onPageChange,
  action,
}) {
  const [input, setInput] = useState(filters.keyword);
  const { content, page, totalPages, totalElements } = posts;

  const handleReset = () => {
    setInput('');
    onReset();
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-x-8 gap-y-10 border-t border-line-strong pt-6 max-[1100px]:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-5">
        <MissingFilters
          filters={filters}
          search={{
            value: input,
            onChange: setInput,
            onSubmit: () => onChange({ keyword: input.trim() }),
          }}
          onChange={onChange}
          onReset={handleReset}
        />

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <p aria-live="polite" className="text-sm text-muted">
            총 <b className="font-bold text-ink">{totalElements}</b>건
          </p>
        </div>

        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title="조건에 맞는 게시글이 없어요"
            description="지역이나 기간을 넓혀서 다시 찾아보세요"
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

        <div className="mt-5">
          <BoardPagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-10 max-[1100px]:contents">
        <div className="max-[1100px]:order-first">{action}</div>
        <MissingRail />
      </div>
    </div>
  );
}
