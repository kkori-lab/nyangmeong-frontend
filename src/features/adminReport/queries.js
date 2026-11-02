import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminCommunityKeys } from '@/features/adminCommunity/queries';
import { adminMemberKeys } from '@/features/adminMember/queries';
import {
  completeReport,
  getAdminReport,
  getAdminReports,
  getAutoBlindReports,
  rejectReport,
  restoreReport,
} from './api';

export const adminReportKeys = {
  all: ['adminReport'],
  list: (params) => ['adminReport', 'list', params],
  autoBlind: (params) => ['adminReport', 'autoBlind', params],
  detail: (dclrSn) => ['adminReport', 'detail', dclrSn],
};

export const useAdminReports = (params) =>
  useQuery({
    queryKey: adminReportKeys.list(params),
    queryFn: () => getAdminReports(params),
    placeholderData: keepPreviousData,
  });

export const useAutoBlindReports = (params) =>
  useQuery({
    queryKey: adminReportKeys.autoBlind(params),
    queryFn: () => getAutoBlindReports(params),
    placeholderData: keepPreviousData,
  });

export const useAdminReport = (dclrSn) =>
  useQuery({
    queryKey: adminReportKeys.detail(dclrSn),
    queryFn: () => getAdminReport(dclrSn),
    enabled: Number.isInteger(dclrSn),
  });

/** 처리 결과가 닿는 게시글·회원 화면까지 무효화 */
const useInvalidateReportTargets = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminReportKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminCommunityKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all }),
    ]);
};

export const useCompleteReport = () => {
  const invalidate = useInvalidateReportTargets();
  return useMutation({ mutationFn: completeReport, onSuccess: invalidate });
};

export const useRejectReport = () => {
  const invalidate = useInvalidateReportTargets();
  return useMutation({ mutationFn: rejectReport, onSuccess: invalidate });
};

export const useRestoreReport = () => {
  const invalidate = useInvalidateReportTargets();
  return useMutation({ mutationFn: restoreReport, onSuccess: invalidate });
};
