import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  createInquiry,
  deleteInquiry,
  getInquiries,
  getInquiry,
  getInquiryImage,
  getInquiryTypes,
  updateInquiry,
} from './api';

export const inquiryKeys = {
  all: ['inquiries'],
  list: (params) => ['inquiries', 'list', params],
  detail: (otoInqrySn) => ['inquiries', otoInqrySn],
  image: (otoInqrySn, atchFileSn) => [
    'inquiries',
    otoInqrySn,
    'image',
    atchFileSn,
  ],
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

/**
 * 첨부 이미지 주소: { [atchFileSn]: blob 주소 }. 받는 중이거나 실패(403·404 등)한 번호는 없다
 * - 주소를 캐시에 두므로 gcTime을 0으로 해 화면을 떠나면 캐시를 지우고, 주소도 그때 해제한다
 */
export const useInquiryImageUrls = (otoInqrySn, imgs) => {
  const urls = useQueries({
    queries: imgs.map(({ atchFileSn }) => ({
      queryKey: inquiryKeys.image(otoInqrySn, atchFileSn),
      queryFn: async () =>
        URL.createObjectURL(await getInquiryImage(otoInqrySn, atchFileSn)),
      staleTime: Infinity,
      gcTime: 0,
      retry: false,
    })),
    combine: (results) => results.map((result) => result.data),
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

/**
 * 목록만 무효화한다. 지운 문의의 상세·이미지를 다시 받으면 404다
 * - 상세를 removeQueries로 지우면 아직 떠 있는 상세 화면이 새로 받아 버려 그대로 둔다(이미지는 gcTime 0이라 화면을 떠나면 지워진다)
 */
export const useDeleteInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...inquiryKeys.all, 'list'] }),
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
