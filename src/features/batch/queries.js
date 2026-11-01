import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBatches, getBatchHistory, runBatch } from './api';
import { isRunning } from './batchLabels';

/** 실행 중 다시 조회 간격 */
const RUNNING_REFETCH_MS = 5_000;

export const batchKeys = {
  all: ['batch'],
  list: ['batch', 'list'],
  histories: ['batch', 'history'],
  history: (btchSeCd, params) => ['batch', 'history', btchSeCd, params],
};

/** 실행이 끝난 시점에 이력 한 번 더 조회: 이력 마지막 재조회가 목록보다 앞설 수 있음 */
export const useBatches = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: batchKeys.list,
    queryFn: getBatches,
    refetchInterval: ({ state }) =>
      state.data?.some(isRunning) ? RUNNING_REFETCH_MS : false,
  });
  const isAnyRunning = Boolean(query.data?.some(isRunning));
  const wasRunningRef = useRef(false);

  useEffect(() => {
    if (wasRunningRef.current && !isAnyRunning) {
      queryClient.invalidateQueries({ queryKey: batchKeys.histories });
    }
    wasRunningRef.current = isAnyRunning;
  }, [isAnyRunning, queryClient]);

  return { ...query, isAnyRunning };
};

/** 쪽 이동 때만 이전 내용 유지: 다른 배치의 행은 보이지 않게 */
export const useBatchHistory = (btchSeCd, params, { isAnyRunning }) =>
  useQuery({
    queryKey: batchKeys.history(btchSeCd, params),
    queryFn: () => getBatchHistory(btchSeCd, params),
    enabled: Boolean(btchSeCd),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === btchSeCd ? previousData : undefined,
    refetchInterval: isAnyRunning ? RUNNING_REFETCH_MS : false,
  });

export const useRunBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runBatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: batchKeys.all }),
  });
};
