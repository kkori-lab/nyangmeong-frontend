import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getCurrentYm, shiftYm } from '@/utils/yearMonth';
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
  getMonthExpenses,
  getPetStats,
  getTopExpenses,
  sumAmt,
} from '../shared/expenseStats';
import { CARD, CARD_BODY } from '../shared/expenseStyles';
import { useExpenseOverview, useExpenses } from '../queries';

const TOP_EXPENSE_COUNT = 3;

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

  /** 지난달 대비용 조회 범위 */
  const { data: expenses = [], isPlaceholderData } = useExpenses({
    fromYm: shiftYm(ym, -1),
    toYm: ym,
  });
  const { data: overview } = useExpenseOverview();

  if (!overview) return null;

  const monthExpenses = getMonthExpenses(expenses, ym);
  const prevExpenses = getMonthExpenses(expenses, shiftYm(ym, -1));
  const detailExpense = monthExpenses.find(
    (expense) => expense.expndSn === detailSn,
  );
  const selectedItems = selectedYmd
    ? monthExpenses.filter((expense) => expense.expndYmd === selectedYmd)
    : [];

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

  return (
    <div
      className={`grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:items-start ${isPlaceholderData ? 'opacity-60' : ''}`}
    >
      <div className="flex min-w-0 flex-col gap-5">
        <ExpenseSummary
          ym={ym}
          isNextDisabled={ym >= maxYm}
          onChangeMonth={handleChangeMonth}
          totalAmt={sumAmt(monthExpenses)}
          count={monthExpenses.length}
          prevTotalAmt={prevExpenses.length > 0 ? sumAmt(prevExpenses) : null}
          mmExpndLimAmt={overview.mmExpndLimAmt}
          onOpenLimit={() => setIsLimitOpen(true)}
        />
        <section aria-label="월간 달력" className={`${CARD} ${CARD_BODY}`}>
          <ExpenseCalendar
            ym={ym}
            cells={getCalendarCells(ym, monthExpenses)}
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
        <ExpenseCategoryChart stats={getCategoryStats(monthExpenses)} />
        <ExpensePetChart stats={getPetStats(monthExpenses, overview.pets)} />
        <ExpenseTopList
          expenses={getTopExpenses(monthExpenses, TOP_EXPENSE_COUNT)}
        />
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
          mmExpndLimAmt={overview.mmExpndLimAmt}
          onClose={() => setIsLimitOpen(false)}
        />
      )}
      {addingYmd && (
        <ExpenseAddModal
          expndYmd={addingYmd}
          pets={overview.pets}
          onSaved={handleSaved}
          onClose={() => setAddingYmd(null)}
        />
      )}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          pets={overview.pets}
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
