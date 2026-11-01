import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getApiFailures,
  getApiTokens,
  getApiUsage,
  getApiUsageDaily,
} from './api';

export const apiUsageKeys = {
  all: ['apiUsage'],
  list: (params) => ['apiUsage', 'list', params],
  daily: (extlApiSeCd, params) => ['apiUsage', 'daily', extlApiSeCd, params],
  tokens: (params) => ['apiUsage', 'tokens', params],
  failures: (params) => ['apiUsage', 'failures', params],
};

export const useApiUsage = (params) =>
  useQuery({
    queryKey: apiUsageKeys.list(params),
    queryFn: () => getApiUsage(params),
    placeholderData: keepPreviousData,
  });

/** 다른 종류의 행은 보이지 않게 같은 종류일 때만 이전 내용 유지 */
export const useApiUsageDaily = (extlApiSeCd, params) =>
  useQuery({
    queryKey: apiUsageKeys.daily(extlApiSeCd, params),
    queryFn: () => getApiUsageDaily(extlApiSeCd, params),
    enabled: Boolean(extlApiSeCd),
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[2] === extlApiSeCd ? previousData : undefined,
  });

export const useApiTokens = (params) =>
  useQuery({
    queryKey: apiUsageKeys.tokens(params),
    queryFn: () => getApiTokens(params),
    placeholderData: keepPreviousData,
  });

export const useApiFailures = (params) =>
  useQuery({
    queryKey: apiUsageKeys.failures(params),
    queryFn: () => getApiFailures(params),
    placeholderData: keepPreviousData,
  });
