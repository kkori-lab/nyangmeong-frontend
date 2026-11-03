import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminTerm,
  getAdminTerm,
  getAdminTerms,
  getAdminTermsHistory,
} from './api';

export const adminTermsKeys = {
  all: ['adminTerms'],
  list: ['adminTerms', 'list'],
  history: (trmsFixIdntfKey) => ['adminTerms', 'history', trmsFixIdntfKey],
  detail: (trmsSn) => ['adminTerms', 'detail', trmsSn],
};

export const useAdminTerms = () =>
  useQuery({ queryKey: adminTermsKeys.list, queryFn: getAdminTerms });

export const useAdminTermsHistory = (trmsFixIdntfKey) =>
  useQuery({
    queryKey: adminTermsKeys.history(trmsFixIdntfKey),
    queryFn: () => getAdminTermsHistory({ trmsFixIdntfKey }),
  });

/** trmsSn이 null이면 조회 안 함. 지난 버전 내용은 바뀌지 않아 오래 둔다 */
export const useAdminTerm = (trmsSn) =>
  useQuery({
    queryKey: adminTermsKeys.detail(trmsSn),
    queryFn: () => getAdminTerm(trmsSn),
    enabled: trmsSn != null,
    staleTime: Infinity,
  });

/** 등록하면 목록·이력 모두 무효화(이전 버전 사용 여부가 바뀜) */
export const useCreateAdminTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminTerm,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminTermsKeys.all }),
  });
};
