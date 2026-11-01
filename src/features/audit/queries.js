import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAuditLog,
  getAuditLogAdmins,
  getAuditLogs,
  getAuditTaskTypes,
} from './api';

export const auditKeys = {
  all: ['audit'],
  list: (params) => ['audit', 'list', params],
  admins: ['audit', 'admins'],
  taskTypes: ['audit', 'taskTypes'],
  detail: (mngrTaskLogSn) => ['audit', 'detail', mngrTaskLogSn],
};

export const useAuditLogs = (params) =>
  useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
  });

export const useAuditLogAdmins = () =>
  useQuery({ queryKey: auditKeys.admins, queryFn: getAuditLogAdmins });

export const useAuditTaskTypes = () =>
  useQuery({
    queryKey: auditKeys.taskTypes,
    queryFn: getAuditTaskTypes,
    staleTime: Infinity,
  });

export const useAuditLog = (mngrTaskLogSn) =>
  useQuery({
    queryKey: auditKeys.detail(mngrTaskLogSn),
    queryFn: () => getAuditLog(mngrTaskLogSn),
  });
