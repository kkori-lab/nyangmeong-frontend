import { SearchX } from 'lucide-react';
import BoardPagination from '@/components/BoardPagination';
import EmptyResult from '@/components/EmptyResult';
import CareCard from './CareCard';
import CareFilters from './CareFilters';
import CareGuideRail from './CareGuideRail';

/**
 * 펫돌봄 목록: 왼쪽에 필터 · 건수와 모집중만 보기·내 글만 보기 · 카드 · 페이지, 오른쪽에 안내 레일
 * - [돌봄 요청 등록]은 오른쪽 레일 맨 위(action, CareListPage가 넘긴다). 탭은 없고 모집중만 보기는 체크(?stts=open)
 * - filters: { stts, mine, region, dong, from, to, pet, size }, onChange(바뀐 값만), onReset, onPageChange
 */
export default function CareList({
  posts,
  filters,
  onChange,
  onReset,
  onPageChange,
  action,
}) {
  const { content, page, totalPages, totalElements } = posts;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-x-8 gap-y-10 border-t border-line-strong pt-6 max-[1101px]:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-5">
        <CareFilters filters={filters} onChange={onChange} onReset={onReset} />

        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-t border-line pt-4">
          <p aria-live="polite" className="text-sm text-muted">
            총 <b className="font-bold text-ink">{totalElements}</b>건
          </p>
        </div>

        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title="조건에 맞는 돌봄 요청이 없어요"
            description="지역이나 날짜를 넓혀서 다시 찾아보세요"
          >
            <button
              type="button"
              onClick={onReset}
              className="h-9 cursor-pointer rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-surface-2"
            >
              필터 초기화
            </button>
          </EmptyResult>
        ) : (
          <ul className="flex flex-col gap-3">
            {content.map((item) => (
              <li key={item.petPrtcRcrtSn}>
                <CareCard post={item} />
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

      <div className="flex min-w-0 flex-col gap-8 max-[1101px]:contents">
        <div className="max-[1101px]:order-first">{action}</div>
        <CareGuideRail />
      </div>
    </div>
  );
}
