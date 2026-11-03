import { useEffect, useRef } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createAdminInquiryAnswer,
  getAdminInquiries,
  getAdminInquiry,
  getAdminInquiryImage,
  getAdminInquiryTypes,
  processAdminInquiryCharacterError,
  updateAdminInquiryAnswer,
} from './api';

export const adminInquiryKeys = {
  all: ['adminInquiry'],
  list: (params) => ['adminInquiry', 'list', params],
  detail: (otoInqrySn) => ['adminInquiry', 'detail', otoInqrySn],
  image: (otoInqrySn, atchFileSn) => [
    'adminInquiry',
    'image',
    otoInqrySn,
    atchFileSn,
  ],
  types: ['adminInquiry', 'types'],
};

export const useAdminInquiries = (params) =>
  useQuery({
    queryKey: adminInquiryKeys.list(params),
    queryFn: () => getAdminInquiries(params),
    placeholderData: keepPreviousData,
  });

export const useAdminInquiry = (otoInqrySn) =>
  useQuery({
    queryKey: adminInquiryKeys.detail(otoInqrySn),
    queryFn: () => getAdminInquiry(otoInqrySn),
    enabled: Number.isInteger(otoInqrySn),
  });

/** 공통코드는 화면을 열어 둔 동안 변경 없음 */
export const useAdminInquiryTypes = () =>
  useQuery({
    queryKey: adminInquiryKeys.types,
    queryFn: getAdminInquiryTypes,
    staleTime: Infinity,
  });

/**
 * 첨부 이미지 주소: { [atchFileSn]: object URL }
 * - 큰 원본이라 화면을 떠나면 주소 해제, 캐시도 남기지 않음
 */
export const useAdminInquiryImageUrls = (otoInqrySn, imgs) => {
  const urls = useQueries({
    queries: imgs.map(({ atchFileSn }) => ({
      queryKey: adminInquiryKeys.image(otoInqrySn, atchFileSn),
      queryFn: async () =>
        URL.createObjectURL(await getAdminInquiryImage(otoInqrySn, atchFileSn)),
      staleTime: Infinity,
      gcTime: 0,
      retry: false,
    })),
    /** 받는 중 undefined, 실패 null */
    combine: (results) =>
      results.map((result) => (result.isError ? null : result.data)),
  });
  const urlsRef = useRef([]);
  useEffect(() => {
    urlsRef.current = urls;
  });
  useEffect(
    () => () =>
      urlsRef.current.forEach((url) => url && URL.revokeObjectURL(url)),
    [],
  );
  return Object.fromEntries(
    imgs.map(({ atchFileSn }, index) => [atchFileSn, urls[index]]),
  );
};

/** 처리 결과를 상세 캐시에 바로 넣고 목록은 다시 받기 */
const useApplyInquiryResult = () => {
  const queryClient = useQueryClient();
  return (inquiry) => {
    queryClient.setQueryData(
      adminInquiryKeys.detail(inquiry.otoInqrySn),
      inquiry,
    );
    return queryClient.invalidateQueries({
      queryKey: [...adminInquiryKeys.all, 'list'],
    });
  };
};

/** 실패(이미 처리·삭제됨 등)면 상세를 다시 받아 지금 상태로 */
const useRefetchInquiry = () => {
  const queryClient = useQueryClient();
  return (error, { otoInqrySn }) =>
    queryClient.invalidateQueries({
      queryKey: adminInquiryKeys.detail(otoInqrySn),
    });
};

export const useCreateAdminInquiryAnswer = () =>
  useMutation({
    mutationFn: createAdminInquiryAnswer,
    onSuccess: useApplyInquiryResult(),
    onError: useRefetchInquiry(),
  });

export const useUpdateAdminInquiryAnswer = () =>
  useMutation({
    mutationFn: updateAdminInquiryAnswer,
    onSuccess: useApplyInquiryResult(),
    onError: useRefetchInquiry(),
  });

export const useProcessAdminInquiryCharacterError = () =>
  useMutation({
    mutationFn: processAdminInquiryCharacterError,
    onSuccess: useApplyInquiryResult(),
    onError: useRefetchInquiry(),
  });
