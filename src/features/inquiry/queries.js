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
  /** 문의 목록·상세와 따로 둔다: 문의를 저장해도 유형 목록은 재조회 없음 */
  types: ['inquiry-types'],
};

/** enabled: false면 요청 없음(상태 필터가 켜졌을 때만 전체 건수를 따로 묻는 용도) */
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
 * 첨부 이미지 주소: { [atchFileSn]: blob 주소 }. 받는 중이거나 실패(403·404 등)한 번호는 없음
 * - 주소를 캐시에 두므로 gcTime을 0으로 해 화면을 떠나면 캐시 삭제, 주소도 그때 해제
 * - 해제는 떠난 뒤 한 틱 미룬다: 수정 → 상세처럼 바로 다음 화면이 같은 캐시 주소를 받아 쓰고 있으면 해제하지 않는다
 *   (그 화면이 떠날 때 해제). 바로 해제하면 다음 화면에 깨진 이미지가 보인다
 */
export const useInquiryImageUrls = (otoInqrySn, imgs) => {
  const queryClient = useQueryClient();
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
  const entriesRef = useRef([]);
  useEffect(() => {
    entriesRef.current = imgs.map(({ atchFileSn }, index) => [
      inquiryKeys.image(otoInqrySn, atchFileSn),
      urls[index],
    ]);
  });
  useEffect(
    () => () => {
      const entries = entriesRef.current;
      setTimeout(() =>
        entries.forEach(([queryKey, url]) => {
          if (!url) return;
          const query = queryClient
            .getQueryCache()
            .find({ queryKey, exact: true });
          const inUse =
            query?.getObserversCount() > 0 && query.state.data === url;
          if (!inUse) URL.revokeObjectURL(url);
        }),
      );
    },
    [queryClient],
  );
  return Object.fromEntries(
    imgs.map(({ atchFileSn }, index) => [atchFileSn, urls[index]]),
  );
};

/** 공통코드는 화면을 열어 둔 동안 변경 없음 */
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
 * 목록만 무효화. 지운 문의의 상세·이미지를 재조회 시 404
 * - 상세를 removeQueries로 지우면 아직 떠 있는 상세 화면이 새로 받아 버려 그대로 유지(이미지는 gcTime 0이라 화면을 떠나면 삭제)
 */
export const useDeleteInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...inquiryKeys.all, 'list'] }),
  });
};

/**
 * 목록과 그 문의 상세만 무효화
 * - inquiryKeys.all이나 exact 없는 상세 키는 이미지 키(['inquiries', sn, 'image', …])까지 맞아, 열려 있는 수정 화면이
 *   첨부를 다시 받는다(방금 지운 첨부는 404, 남긴 첨부는 중복 다운로드)
 */
export const useUpdateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInquiry,
    onSuccess: (_data, { otoInqrySn }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...inquiryKeys.all, 'list'],
        }),
        queryClient.invalidateQueries({
          queryKey: inquiryKeys.detail(otoInqrySn),
          exact: true,
        }),
      ]),
  });
};
