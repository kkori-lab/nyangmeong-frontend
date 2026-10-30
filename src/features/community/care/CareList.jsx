import { Pencil, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import { PATHS } from '@/routes/paths';
import { STATUS_TABS } from '../careCodes';
import CareCard from './CareCard';
import CareFilters from './CareFilters';
import CareGuideRail from './CareGuideRail';

const tabClass = (selected) =>
  `h-14 shrink-0 cursor-pointer px-4 text-base leading-none whitespace-nowrap max-[760px]:h-12 ${selected ? 'border-b-2 border-brand-500 font-bold text-ink' : 'font-medium text-muted hover:text-ink'}`;

/**
 * 펫돌봄 목록: 상태 탭 · 건수 · 상세 필터(내 글만 보기 포함)는 콘텐츠 전체 너비, 그 아래 카드 · [돌봄 요청 등록하기] · 페이지(왼쪽)와 안내 레일(오른쪽)
 * - filters: { stts, mine, region, dong, from, to, pet, size }, onChange(바뀐 값만), onReset, onPageChange
 */
export default function CareList({
  posts,
  filters,
  onChange,
  onReset,
  onPageChange,
}) {
  const { content, page, totalPages, totalElements } = posts;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-x-8 gap-y-4 max-[1101px]:grid-cols-1">
      <div className="col-span-full flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-4 border-b border-input-line">
          <div role="tablist" aria-label="모집 상태" className="flex">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={filters.stts === tab.value}
                onClick={() => onChange({ stts: tab.value })}
                className={tabClass(filters.stts === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-5 pb-3 max-[760px]:pb-2">
            <p aria-live="polite" className="text-sm text-muted">
              <b className="font-bold text-ink">{totalElements}</b>건
            </p>
          </div>
        </div>

        <CareFilters filters={filters} onChange={onChange} onReset={onReset} />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
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

        <div className="flex justify-end">
          <Link
            to={PATHS.COMMUNITY_PETCARE_NEW}
            className={`${BTN_PRIMARY} min-w-[120px]`}
          >
            <Pencil size={16} aria-hidden="true" />
            돌봄 요청 등록하기
          </Link>
        </div>
        <BoardPagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </div>

      <CareGuideRail />
    </div>
  );
}
