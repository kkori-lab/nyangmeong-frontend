import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInquiry,
  getInquiries,
  getInquiry,
  getInquiryTypes,
  updateInquiry,
} from './api';

export const inquiryKeys = {
  all: ['inquiries'],
  list: (params) => ['inquiries', 'list', params],
  detail: (otoInqrySn) => ['inquiries', otoInqrySn],
  /** 문의 목록·상세와 따로 둔다: 문의를 저장해도 유형 목록은 다시 받지 않는다 */
  types: ['inquiry-types'],
};

/** enabled: false면 요청하지 않는다(상태 필터가 켜졌을 때만 전체 건수를 따로 묻는 데 쓴다) */
export const useInquiries = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: inquiryKeys.list(params),
    queryFn: () => getInquiries(params),
    enabled,
  });

export const useInquiry = (otoInqrySn) =>
  useQuery({
    queryKey: inquiryKeys.detail(otoInqrySn),
    queryFn: () => getInquiry(otoInqrySn),
    retry: false,
  });

/** 공통코드는 화면을 열어 둔 동안 바뀌지 않는다 */
export const useInquiryTypes = () =>
  useQuery({
    queryKey: inquiryKeys.types,
    queryFn: getInquiryTypes,
    staleTime: Infinity,
  });

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInquiry,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inquiryKeys.all }),
  });
};

export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInquiry,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inquiryKeys.all }),
  });
};
