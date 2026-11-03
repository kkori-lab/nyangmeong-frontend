import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  bulkDeleteExpenses,
  createExpenses,
  deleteExpense,
  deleteExpenses,
  findDuplicateExpenses,
  getExpenseMonths,
  getExpensePets,
  getExpenseStatistics,
  getExpenseTotals,
  getExpenses,
  recognizeReceipt,
  saveExpenseLimit,
  updateExpense,
} from './api';

export const expenseKeys = {
  all: ['expenses'],
  statistics: (ym) => ['expenses', 'statistics', ym],
  list: (cond, page) => ['expenses', 'list', cond, page],
  infinite: (cond) => ['expenses', 'infinite', cond],
  totals: (cond) => ['expenses', 'totals', cond],
  months: () => ['expenses', 'months'],
  pets: () => ['expenses', 'pets'],
};

/** 월 통계: 월 전환 시 깜박임 방지용 이전 결과 유지 */
export const useExpenseStatistics = (ym) =>
  useQuery({
    queryKey: expenseKeys.statistics(ym),
    queryFn: () => getExpenseStatistics(ym),
    placeholderData: keepPreviousData,
  });

/** 날짜·카테고리 등 조건의 지출 한 쪽 (PC 페이지 번호, 대시보드 날짜별 상세) */
export const useExpenses = (cond, page = 1, options = {}) =>
  useQuery({
    queryKey: expenseKeys.list(cond, page),
    queryFn: () => getExpenses({ ...cond, page }),
    placeholderData: keepPreviousData,
    ...options,
  });

/** 앱 이어 불러오기 */
export const useInfiniteExpenses = (cond, options = {}) =>
  useInfiniteQuery({
    queryKey: expenseKeys.infinite(cond),
    queryFn: ({ pageParam }) => getExpenses({ ...cond, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    ...options,
  });

export const useExpenseTotals = (cond, options = {}) =>
  useQuery({
    queryKey: expenseKeys.totals(cond),
    queryFn: () => getExpenseTotals(cond),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useExpenseMonths = () =>
  useQuery({ queryKey: expenseKeys.months(), queryFn: getExpenseMonths });

export const useExpensePets = () =>
  useQuery({ queryKey: expenseKeys.pets(), queryFn: getExpensePets });

const useExpenseMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
};

export const useSaveExpenseLimit = () => useExpenseMutation(saveExpenseLimit);
export const useDeleteExpense = () => useExpenseMutation(deleteExpense);
export const useDeleteExpenses = () => useExpenseMutation(deleteExpenses);
/** 그 사이 지출이 바뀌어 건수가 맞지 않을 때 서버가 주는 오류 코드 */
export const BULK_DELETE_CHANGED = 'EXPENSE_BULK_DELETE_CHANGED';

/** 성공과 409(내역이 바뀜) 모두 목록·달력·차트·총 지출을 다시 불러온다 */
export const useBulkDeleteExpenses = () => {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: expenseKeys.all });
  return useMutation({
    mutationFn: bulkDeleteExpenses,
    onSuccess: refresh,
    onError: (error) => {
      if (error.code === BULK_DELETE_CHANGED) refresh();
    },
  });
};
export const useCreateExpenses = () => useExpenseMutation(createExpenses);
export const useUpdateExpense = () => useExpenseMutation(updateExpense);
/** 저장 전 중복 지출 조회 */
export const useFindDuplicateExpenses = () =>
  useMutation({ mutationFn: findDuplicateExpenses });
export const useRecognizeReceipt = () =>
  useMutation({ mutationFn: recognizeReceipt });
