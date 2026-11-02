import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import MonthNav from '@/components/MonthNav';
import MonthPicker from '@/components/MonthPicker';
import Pagination from '@/components/Pagination';
import useMediaQuery from '@/hooks/useMediaQuery';
import { getCurrentYm, isYm, shiftYm } from '@/utils/yearMonth';
import { toDateCond } from '../api';
import ExpenseDeleteDialog from '../dashboard/ExpenseDeleteDialog';
import ExpenseBulkDeleteDialog from './ExpenseBulkDeleteDialog';
import {
  EXPND_CLSF,
  FILTER_ALL,
  FILTER_SHARED,
  LOAD,
  RANGE_MODE,
  SORT,
} from '../shared/expenseCodes';
import ExpenseDetailSheet from '../shared/ExpenseDetailSheet';
import ExpenseEditModal from '../shared/ExpenseEditModal';
import ExpenseFilterBar from './ExpenseFilterBar';
import { formatWon, getPetFilterLabel } from '../shared/expenseFormat';
import ExpenseGroupList from './ExpenseGroupList';
import ExpenseLoadMore from './ExpenseLoadMore';
import ExpenseRangeSelect from './ExpenseRangeSelect';
import ExpenseSelectBar from './ExpenseSelectBar';
import { groupByDay } from '../shared/expenseStats';
import { CARD } from '../shared/expenseStyles';
import {
  useExpenseMonths,
  useExpensePets,
  useExpenseTotals,
  useExpenses,
  useInfiniteExpenses,
} from '../queries';

/** 앱(≤760px)은 페이지 번호 대신 무한 스크롤 */
const MOBILE_QUERY = '(max-width: 760px)';

/** 기간 순서 보정 */
const getSortedPeriod = (range) =>
  range.fromYm <= range.toYm
    ? { fromYm: range.fromYm, toYm: range.toYm }
    : { fromYm: range.toYm, toYm: range.fromYm };

const getQueryRange = (range, isEditing, ym) => {
  if (!isEditing || range.mode === RANGE_MODE.MONTH) {
    return { fromYm: ym, toYm: ym };
  }
  if (range.mode === RANGE_MODE.ALL) return { fromYm: null, toYm: null };
  return getSortedPeriod(range);
};

/** 반려동물·카테고리 필터를 서버 조건으로 */
const toFilterCond = (petFilter, categoryFilter) => ({
  ...(petFilter === FILTER_SHARED && { common: true }),
  ...(petFilter !== FILTER_ALL &&
    petFilter !== FILTER_SHARED && { petSn: Number(petFilter) }),
  ...(categoryFilter !== FILTER_ALL && { expndClsfCd: categoryFilter }),
});

/** initialYm: 진입 시 보던 달 */
export default function ExpenseHistory({ initialYm }) {
  const [maxYm] = useState(getCurrentYm);
  const [ym, setYm] = useState(() =>
    isYm(initialYm) && initialYm <= maxYm ? initialYm : maxYm,
  );
  const [petFilter, setPetFilter] = useState(FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL);
  const [sort, setSort] = useState(SORT.LATEST);
  const [page, setPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [range, setRange] = useState({
    mode: RANGE_MODE.MONTH,
    fromYm: ym,
    toYm: ym,
  });
  /** 개별 선택: 지출 번호 -> 금액(페이지를 넘어도 유지) */
  const [selected, setSelected] = useState(() => new Map());
  /** 조회 결과 전체 선택: 번호 대신 조건(범위·필터)으로 지운다 */
  const [isAllResult, setIsAllResult] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  /** 앱 지출 상세 시트: 보고 있는 지출 번호(편집 중에는 시트를 잠시 숨기고 저장하면 다시 표시) */
  const [detailSn, setDetailSn] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const { data: months } = useExpenseMonths();
  const { data: pets } = useExpensePets();

  const queryRange = getQueryRange(range, isEditing, ym);
  const filterCond = toFilterCond(petFilter, categoryFilter);
  const resultCond = { ...toDateCond(queryRange), ...filterCond };
  const listCond = {
    ...resultCond,
    sort: sort === SORT.AMOUNT ? 'amount' : 'latest',
  };

  /** 상단 합계·건수는 필터와 무관한 그 달 전체 */
  const { data: monthTotals } = useExpenseTotals(
    toDateCond({ fromYm: ym, toYm: ym }),
  );
  /** 편집 중 조회 결과 전체의 건수·합계 */
  const { data: resultTotals } = useExpenseTotals(resultCond, {
    enabled: isEditing,
  });
  const pageQuery = useExpenses(listCond, page, { enabled: !isMobile });
  const infiniteQuery = useInfiniteExpenses(listCond, { enabled: isMobile });

  const pageCount = Math.max(1, pageQuery.data?.totalPages ?? 1);
  const currentPage = Math.min(page, pageCount);
  /** 마지막 쪽 항목을 다 지우면 앞 쪽으로 */
  if (!isMobile && pageQuery.data && page > pageCount) setPage(pageCount);

  if (!months || !pets) return null;

  const pageItems = isMobile
    ? (infiniteQuery.data?.pages.flatMap((result) => result.content) ?? [])
    : (pageQuery.data?.content ?? []);
  const isPlaceholderData = isMobile
    ? infiniteQuery.isRefetching
    : pageQuery.isPlaceholderData;
  const isLoadEnd = !infiniteQuery.hasNextPage;
  let loadStatus = LOAD.IDLE;
  if (infiniteQuery.isFetchingNextPage) loadStatus = LOAD.LOADING;
  else if (infiniteQuery.isFetchNextPageError) loadStatus = LOAD.ERROR;

  const isChecked = (expndSn) => isAllResult || selected.has(expndSn);
  const detailExpense = pageItems.find(
    (expense) => expense.expndSn === detailSn,
  );
  const resultCount = resultTotals?.expndCnt ?? 0;
  const selectedCount = isAllResult ? resultCount : selected.size;
  const selectedAmt = isAllResult
    ? (resultTotals?.totalExpndAmt ?? 0)
    : [...selected.values()].reduce((sum, amt) => sum + amt, 0);
  const isPageAllSelected =
    pageItems.length > 0 &&
    pageItems.every((expense) => isChecked(expense.expndSn));

  /** 기간 지정 선택 가능 달 */
  const rangeMonths = [...new Set([...months, ym])].sort();
  const scope =
    range.mode === RANGE_MODE.ALL
      ? {
          fromYm: rangeMonths[0],
          toYm: rangeMonths[rangeMonths.length - 1],
        }
      : getQueryRange(range, true, ym);
  const petOption = pets.find((pet) => String(pet.petSn) === petFilter);
  const petLabel =
    petFilter === FILTER_ALL
      ? '전체 반려동물'
      : petFilter === FILTER_SHARED
        ? '공용'
        : getPetFilterLabel(petOption);
  const categoryLabel =
    categoryFilter === FILTER_ALL
      ? '전체 카테고리'
      : EXPND_CLSF[categoryFilter].name;

  const clearSelection = () => {
    setSelected(new Map());
    setIsAllResult(false);
  };
  /** 앱: 다음 20건 (조건이 바뀌면 키가 바뀌어 1쪽부터 다시 불러온다) */
  const handleLoadMore = () => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetching) {
      infiniteQuery.fetchNextPage();
    }
  };
  const handleOpenItem = (expense) =>
    isMobile ? setDetailSn(expense.expndSn) : setEditingExpense(expense);

  /** 조회 조건 변경 시 1페이지·편집 종료 */
  const resetView = () => {
    setPage(1);
    setIsEditing(false);
    clearSelection();
  };
  const handleChangeMonth = (nextYm) => {
    setYm(nextYm);
    resetView();
  };
  const handleChangePet = (value) => {
    setPetFilter(value);
    resetView();
  };
  const handleChangeCategory = (value) => {
    setCategoryFilter(value);
    resetView();
  };
  const handleChangeSort = (value) => {
    setSort(value);
    resetView();
  };
  const handleStartEdit = () => {
    setRange({ mode: RANGE_MODE.MONTH, fromYm: ym, toYm: ym });
    clearSelection();
    setPage(1);
    setIsEditing(true);
  };
  const handleChangeRange = (nextRange) => {
    setRange(nextRange);
    clearSelection();
    setPage(1);
  };
  /** 결과 전체 선택 중 하나를 끄면 지금 보이는 항목만 개별 선택으로 바뀐다 */
  const handleToggle = (expndSn) => {
    if (isAllResult) {
      setSelected(
        new Map(
          pageItems
            .filter((expense) => expense.expndSn !== expndSn)
            .map((expense) => [expense.expndSn, expense.expndAmt]),
        ),
      );
      setIsAllResult(false);
      return;
    }
    const next = new Map(selected);
    if (next.has(expndSn)) {
      next.delete(expndSn);
    } else {
      const item = pageItems.find((expense) => expense.expndSn === expndSn);
      next.set(expndSn, item.expndAmt);
    }
    setSelected(next);
  };
  const handleTogglePage = () => {
    if (isAllResult) {
      clearSelection();
      return;
    }
    const next = new Map(selected);
    pageItems.forEach((expense) => {
      if (isPageAllSelected) next.delete(expense.expndSn);
      else next.set(expense.expndSn, expense.expndAmt);
    });
    setSelected(next);
  };
  const handleToggleResult = () => {
    setSelected(new Map());
    setIsAllResult(!isAllResult);
  };
  const handleDeleted = () => {
    clearSelection();
    setPage(1);
    setIsBulkOpen(false);
  };

  return (
    <div
      className={`flex flex-col gap-5 ${isPlaceholderData ? 'opacity-60' : ''}`}
    >
      {isEditing ? (
        <ExpenseRangeSelect
          baseYm={ym}
          range={range}
          months={rangeMonths}
          onChange={handleChangeRange}
          onCancel={resetView}
        />
      ) : (
        <section
          aria-label="조회 기간"
          className={`${CARD} flex flex-wrap items-center justify-between gap-3 px-6 py-4`}
        >
          <MonthNav
            onPrev={() => handleChangeMonth(shiftYm(ym, -1))}
            onNext={() => handleChangeMonth(shiftYm(ym, 1))}
            isNextDisabled={ym >= maxYm}
          >
            <MonthPicker
              ym={ym}
              maxYm={maxYm}
              enabledYms={months}
              onSelect={handleChangeMonth}
            />
          </MonthNav>
          <p className="flex items-baseline gap-2">
            <b className="text-page leading-[1.35] font-bold">
              {formatWon(monthTotals?.totalExpndAmt ?? 0)}
            </b>
            <span className="text-subtle">{monthTotals?.expndCnt ?? 0}건</span>
          </p>
        </section>
      )}
      <ExpenseFilterBar
        pets={pets}
        petFilter={petFilter}
        categoryFilter={categoryFilter}
        sort={sort}
        hasSort={!isEditing}
        onChangePet={handleChangePet}
        onChangeCategory={handleChangeCategory}
        onChangeSort={handleChangeSort}
      >
        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className={BTN_SECONDARY}
          >
            편집
          </button>
        )}
      </ExpenseFilterBar>
      {!isEditing && (
        <div className="-mb-2 flex items-center justify-between px-0.5 min-[761px]:hidden">
          <label className="relative inline-flex items-center text-sm text-ink-2">
            <select
              aria-label="정렬"
              value={sort}
              onChange={(event) => handleChangeSort(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent py-1 pr-5 focus:outline-none"
            >
              <option value={SORT.LATEST}>최신순</option>
              <option value={SORT.AMOUNT}>금액순</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-0 size-4"
              aria-hidden="true"
            />
          </label>
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-[15px] font-semibold text-brand-600"
          >
            편집
          </button>
        </div>
      )}
      <section aria-label="지출 내역" className={`${CARD} overflow-hidden`}>
        {isEditing && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isPageAllSelected}
                onChange={handleTogglePage}
                disabled={pageItems.length === 0}
                className="size-5 cursor-pointer accent-brand-500"
              />
              <span>
                전체 선택{' '}
                <span className="text-subtle">
                  (<span className="max-[760px]:hidden">이 페이지</span>
                  <span className="hidden max-[760px]:inline">불러온</span>{' '}
                  {pageItems.length}건)
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={handleToggleResult}
              disabled={resultCount === 0}
              className="font-semibold text-brand-600 hover:underline disabled:text-line-strong disabled:no-underline"
            >
              {isAllResult
                ? '선택 모두 해제'
                : `조회 결과 ${resultCount}건 모두 선택`}
            </button>
          </div>
        )}
        {pageItems.length === 0 ? (
          <p className="px-4 py-10 text-center text-subtle">
            조회된 지출이 없어요
          </p>
        ) : (
          <ExpenseGroupList
            items={pageItems}
            groups={groupByDay(pageItems)}
            hasDayHead={sort === SORT.LATEST}
            isEditing={isEditing}
            selected={{ has: isChecked }}
            onToggle={handleToggle}
            onOpenItem={handleOpenItem}
          />
        )}
      </section>
      {isMobile ? (
        pageItems.length > 0 && (
          <ExpenseLoadMore
            isEnd={isLoadEnd}
            status={loadStatus}
            onLoadMore={handleLoadMore}
            onRetry={handleLoadMore}
          />
        )
      ) : (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onChange={setPage}
        />
      )}
      {!isEditing && (
        <p className="text-center text-sm text-subtle max-[760px]:hidden">
          항목을 누르면 바로 수정할 수 있어요
        </p>
      )}
      {isEditing && (
        <ExpenseSelectBar
          count={selectedCount}
          totalAmt={selectedAmt}
          onDelete={() => setIsBulkOpen(true)}
        />
      )}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          pets={pets}
          onSaved={() => setEditingExpense(null)}
          onClose={() => setEditingExpense(null)}
        />
      )}
      {detailExpense && !editingExpense && (
        <ExpenseDetailSheet
          expense={detailExpense}
          onEdit={() => setEditingExpense(detailExpense)}
          onDelete={() => setDeletingExpense(detailExpense)}
          onClose={() => setDetailSn(null)}
        />
      )}
      {deletingExpense && (
        <ExpenseDeleteDialog
          expense={deletingExpense}
          onDeleted={() => setDetailSn(null)}
          onClose={() => setDeletingExpense(null)}
        />
      )}
      {isBulkOpen && (
        <ExpenseBulkDeleteDialog
          expndSns={isAllResult ? null : [...selected.keys()]}
          bulkCond={isAllResult ? resultCond : null}
          count={selectedCount}
          totalAmt={selectedAmt}
          fromYm={scope.fromYm}
          toYm={scope.toYm}
          filterLabel={`${petLabel} · ${categoryLabel}`}
          onDeleted={handleDeleted}
          onClose={() => setIsBulkOpen(false)}
        />
      )}
    </div>
  );
}
