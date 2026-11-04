import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAdminDashboard, getAdminDashboardStats } from './api';

export const adminDashboardKeys = {
  all: ['adminDashboard'],
  overview: ['adminDashboard', 'overview'],
  stats: (params) => ['adminDashboard', 'stats', params],
};

export const useAdminDashboard = () =>
  useQuery({
    queryKey: adminDashboardKeys.overview,
    queryFn: getAdminDashboard,
  });

export const useAdminDashboardStats = (params) =>
  useQuery({
    queryKey: adminDashboardKeys.stats(params),
    queryFn: () => getAdminDashboardStats(params),
    placeholderData: keepPreviousData,
  });
