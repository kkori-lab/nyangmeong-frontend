import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import MonthNav from '@/components/MonthNav';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { formatYm, getCurrentYm, shiftYm } from '@/utils/yearMonth';
import ExpenseAddModal from './ExpenseAddModal';
import ExpenseCalendar from './ExpenseCalendar';
import ExpenseCategoryChart from './ExpenseCategoryChart';
import ExpenseDayDetail from './ExpenseDayDetail';
import ExpenseDeleteDialog from './ExpenseDeleteDialog';
import ExpenseDetailSheet from '../shared/ExpenseDetailSheet';
import ExpenseEditModal from '../shared/ExpenseEditModal';
import ExpenseLimitModal from './ExpenseLimitModal';
import ExpensePetChart from './ExpensePetChart';
import ExpenseSummary from './ExpenseSummary';
import ExpenseTopList from './ExpenseTopList';
import {
  getCalendarCells,
  getCategoryStats,
  getPetStats,
  sumAmt,
} from '../shared/expenseStats';
import { CARD, CARD_BODY, CARD_HEAD } from '../shared/expenseStyles';
import { useExpensePets, useExpenseStatistics, useExpenses } from '../queries';

/** 하루 지출 상세는 한 번에 최대 건수(서버 한 쪽 최대) */
const DAY_SIZE = 50;

/** 첫 로딩 자리: 실제 배치(1440px·390px에서 잰 카드 높이) */
function ExpenseDashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:items-start"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <SkeletonCard className="h-[234px]" />
        <SkeletonCard className="h-[594px] max-[760px]:h-[343px]" />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <SkeletonCard className="h-[135px]" />
        <SkeletonCard className="h-[349px]" />
        <SkeletonCard className="h-[135px]" />
        <Skeleton className="h-[60px] rounded-card" />
      </div>
    </div>
  );
}

/** onViewAll(ym): 보던 달을 넘기는 전체 내역 이동 */
export default function ExpenseDashboard({ onViewAll }) {
  const [maxYm] = useState(getCurrentYm);
  const [ym, setYm] = useState(maxYm);
  const [selectedYmd, setSelectedYmd] = useState(null);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  /** 등록 모달 날짜·수정 중인 지출 */
  const [addingYmd, setAddingYmd] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  /** 앱 지출 상세 시트: 보고 있는 지출 번호(편집 중에는 시트를 잠시 숨기고 저장하면 다시 표시) */
  const [detailSn, setDetailSn] = useState(null);

  const statsQuery = useExpenseStatistics(ym);
  const petsQuery = useExpensePets();
  const { data: stats, isPlaceholderData } = statsQuery;
  const { data: pets } = petsQuery;
  /** 선택한 날짜의 지출: 이전 날짜 결과를 잠시 보이지 않도록 이전 값 유지는 끈다 */
  const { data: dayPage } = useExpenses(
    {
      startYmd: selectedYmd,
      endYmd: selectedYmd,
      size: DAY_SIZE,
      sort: 'latest',
    },
    1,
    { enabled: Boolean(selectedYmd), placeholderData: undefined },
  );

  const handleChangeMonth = (delta) => {
    setYm(shiftYm(ym, delta));
    setSelectedYmd(null);
  };
  const handleSelectDay = (expndYmd) =>
    setSelectedYmd(expndYmd === selectedYmd ? null : expndYmd);
  /** 저장 날짜로 달력 이동·상세 펼침(영수증 날짜는 다른 달 가능) */
  const handleSaved = (expndYmd) => {
    setAddingYmd(null);
    setEditingExpense(null);
    setYm(expndYmd.slice(0, 7));
    setSelectedYmd(expndYmd);
  };

  if (!stats || !pets) {
    const failed = [statsQuery, petsQuery].filter(
      (query) => !query.data && query.isError,
    );
    if (failed.length === 0) return <ExpenseDashboardSkeleton />;
    /** 실패한 달에서 다른 달로 갈 수 있게 월 이동 줄은 남긴다 */
    return (
      <div className="flex flex-col gap-5">
        <section aria-label="조회 월" className={`${CARD} ${CARD_HEAD}`}>
          <MonthNav
            onPrev={() => handleChangeMonth(-1)}
            onNext={() => handleChangeMonth(1)}
            isNextDisabled={ym >= maxYm}
          >
            <b className="min-w-28 text-center text-lg">{formatYm(ym)}</b>
          </MonthNav>
        </section>
        <EmptyResult title="가계부를 불러오지 못했어요">
          <button
            type="button"
            onClick={() => failed.forEach((query) => query.refetch())}
            className={BTN_PRIMARY}
          >
            다시 시도
          </button>
        </EmptyResult>
      </div>
    );
  }

  const selectedItems = selectedYmd ? (dayPage?.content ?? []) : [];
  const detailExpense = [...selectedItems, ...stats.topExpenses].find(
    (expense) => expense.expndSn === detailSn,
  );
  const totalCount = stats.days.reduce((sum, day) => sum + day.expndCnt, 0);

  return (
    <div
      className={`grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:items-start ${isPlaceholderData ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <ExpenseSummary
          ym={ym}
          isNextDisabled={ym >= maxYm}
          onChangeMonth={handleChangeMonth}
          totalAmt={stats.totalExpndAmt}
          count={totalCount}
          prevTotalAmt={stats.lastMonthTotalExpndAmt}
          mmExpndLimAmt={stats.mmExpndLimAmt}
          onOpenLimit={() => setIsLimitOpen(true)}
        />
        <section aria-label="월간 달력" className={`${CARD} ${CARD_BODY}`}>
          <ExpenseCalendar
            ym={ym}
            cells={getCalendarCells(ym, stats.days)}
            selectedYmd={selectedYmd}
            onSelectDay={handleSelectDay}
            onEmptyDay={setAddingYmd}
          />
          {selectedItems.length > 0 && (
            <ExpenseDayDetail
              expndYmd={selectedYmd}
              items={selectedItems}
              totalAmt={sumAmt(selectedItems)}
              onAdd={() => setAddingYmd(selectedYmd)}
              onEdit={setEditingExpense}
              onDelete={setDeletingExpense}
              onOpenDetail={(expense) => setDetailSn(expense.expndSn)}
            />
          )}
        </section>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <ExpenseCategoryChart stats={getCategoryStats(stats.categories)} />
        <ExpensePetChart stats={getPetStats(stats, pets)} />
        <ExpenseTopList expenses={stats.topExpenses} />
        <button
          type="button"
          onClick={() => onViewAll(ym)}
          className={`${CARD} flex items-center justify-between px-6 py-4 font-semibold hover:border-brand-100`}
        >
          이번달 전체 내역 보기
          <ChevronRight className="size-5 text-subtle" aria-hidden="true" />
        </button>
      </div>
      {isLimitOpen && (
        <ExpenseLimitModal
          mmExpndLimAmt={stats.mmExpndLimAmt}
          onClose={() => setIsLimitOpen(false)}
        />
      )}
      {addingYmd && (
        <ExpenseAddModal
          expndYmd={addingYmd}
          pets={pets}
          onSaved={handleSaved}
          onClose={() => setAddingYmd(null)}
        />
      )}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          pets={pets}
          onSaved={handleSaved}
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
    </div>
  );
}
