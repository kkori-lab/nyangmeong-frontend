import { formatYm } from '@/utils/yearMonth';
import { getClsfName } from '../shared/expenseStats';
import { getPetLabel } from '../shared/expenseFormat';
import { getTodayYmd } from '../shared/expenseInput';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
/** 앱: 칸 테두리 없이 주 사이 얇은 선만, 날짜는 가운데 */
const CELL =
  'flex min-h-20 min-w-0 flex-col items-start border-r border-b border-line bg-white p-2 text-left text-sm max-[760px]:min-h-0 max-[760px]:items-center max-[760px]:gap-1 max-[760px]:border-r-0 max-[760px]:border-line-soft max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:pt-1.5 max-[760px]:pb-2';

const DAY_BASE =
  'max-[760px]:grid max-[760px]:size-8 max-[760px]:place-items-center max-[760px]:rounded-full max-[760px]:text-[15px]';

/** 날짜 칸 클릭 -> 등록 또는 상세 */
export default function ExpenseCalendar({
  ym,
  cells,
  selectedYmd,
  onSelectDay,
  onEmptyDay,
}) {
  const monthLabel = formatYm(ym);
  const todayYmd = getTodayYmd();
  const lastDayIndex = cells.findLastIndex((cell) => cell.day !== null);

  return (
    <div>
      <p className="mb-3 text-sm text-subtle">날짜를 눌러 지출을 등록하세요</p>
      <div
        role="group"
        aria-label={`${monthLabel} 달력`}
        className="grid grid-cols-7 overflow-hidden rounded-box border-t border-l border-line max-[760px]:overflow-visible max-[760px]:rounded-none max-[760px]:border-0"
      >
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="flex items-center justify-center border-r border-b border-line bg-surface-2 py-2 text-sm font-semibold text-subtle max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:py-1.5 max-[760px]:font-medium"
          >
            {name}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (cell.day === null) {
            return (
              <div
                key={`out-${index}`}
                aria-hidden="true"
                className={`${CELL} bg-surface-2 ${index > lastDayIndex ? 'max-[760px]:hidden' : ''}`}
              />
            );
          }
          const hasItems = cell.count > 0;
          /** 내일 이후 칸은 지출이 없으면 등록할 수 없다 */
          const isFuture = cell.expndYmd > todayYmd;
          const isSelected = cell.expndYmd === selectedYmd;
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          /** 앱: 오늘은 초록 글자, 선택은 초록 원 */
          let dayClass = isWeekend
            ? 'max-[760px]:font-semibold max-[760px]:text-subtle'
            : 'max-[760px]:font-semibold max-[760px]:text-ink';
          if (cell.expndYmd === todayYmd) {
            dayClass = 'max-[760px]:font-bold max-[760px]:text-brand-600';
          }
          if (isSelected) {
            dayClass =
              'max-[760px]:font-semibold max-[760px]:bg-brand-600 max-[760px]:text-white';
          }
          return (
            <button
              key={cell.expndYmd}
              type="button"
              disabled={isFuture && !hasItems}
              onClick={() =>
                hasItems
                  ? onSelectDay(cell.expndYmd)
                  : onEmptyDay(cell.expndYmd)
              }
              aria-pressed={hasItems ? isSelected : undefined}
              aria-label={
                hasItems
                  ? undefined
                  : isFuture
                    ? `${Number(ym.slice(5))}월 ${cell.day}일 (등록할 수 없는 날짜)`
                    : `${Number(ym.slice(5))}월 ${cell.day}일 지출 등록`
              }
              className={`${CELL} enabled:cursor-pointer enabled:hover:bg-surface-2 max-[760px]:hover:bg-transparent disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-brand-50 shadow-[inset_0_0_0_2px_var(--color-brand-500)] hover:bg-brand-50 max-[760px]:bg-transparent max-[760px]:shadow-none'
                  : ''
              }`}
            >
              <span
                className={`${DAY_BASE} ${dayClass} ${
                  isSelected ? 'font-bold text-brand-600' : 'text-subtle'
                }`}
              >
                {cell.day}
              </span>
              {hasItems && (
                <>
                  <span className="mt-1 max-w-full truncate font-bold tabular-nums max-[760px]:hidden">
                    {cell.totalAmt.toLocaleString('ko-KR')}
                  </span>
                  <span className="max-w-full truncate text-subtle max-[760px]:hidden">
                    {cell.only
                      ? `${getPetLabel(cell.only)}·${getClsfName(cell.only.expndClsfCd)}`
                      : `${cell.count}건`}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`hidden h-[5px] rounded-[3px] max-[760px]:block ${cell.count > 1 ? 'w-3.5' : 'w-[5px]'} ${isSelected ? 'bg-brand-600' : 'bg-[#4f8f86]'}`}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
