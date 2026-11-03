import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAdminNotificationLogs,
  getNotificationChannels,
  getNotificationTypes,
  getSendingResults,
} from './api';

export const adminNotificationLogKeys = {
  all: ['adminNotificationLog'],
  list: (params) => ['adminNotificationLog', 'list', params],
  types: ['adminNotificationLog', 'types'],
  channels: ['adminNotificationLog', 'channels'],
  results: ['adminNotificationLog', 'results'],
};

export const useAdminNotificationLogs = (params) =>
  useQuery({
    queryKey: adminNotificationLogKeys.list(params),
    queryFn: () => getAdminNotificationLogs(params),
    placeholderData: keepPreviousData,
  });

/** 유형·채널·결과는 SQL로만 바뀌어 오래 둔다 */
export const useNotificationTypes = () =>
  useQuery({
    queryKey: adminNotificationLogKeys.types,
    queryFn: getNotificationTypes,
    staleTime: Infinity,
  });

export const useNotificationChannels = () =>
  useQuery({
    queryKey: adminNotificationLogKeys.channels,
    queryFn: getNotificationChannels,
    staleTime: Infinity,
  });

export const useSendingResults = () =>
  useQuery({
    queryKey: adminNotificationLogKeys.results,
    queryFn: getSendingResults,
    staleTime: Infinity,
  });
