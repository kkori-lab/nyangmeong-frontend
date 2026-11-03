import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axios';

/**
 * [비공개 이미지 조회]
 * - 도메인 이미지 API를 blob으로 받아 <img src>용 data URL로 -> { src, isPending, isError }
 * - data URL이라 해제할 주소 없이 화면끼리 캐시 공유: 한 화면 전용 큰 사진은 object URL + 해제(문의 첨부 useInquiryImageUrls)
 */

/** Blob을 data URL로 변환 */
const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** 이미지 Blob 조회(로그인 전 401 랜딩 이동 끄기) */
const getImageBlob = (url, params) =>
  api.get(url, { params, responseType: 'blob', skipAuthRedirect: true });

/** 비공개 이미지 주소와 상태: src는 로딩 중·실패 때 null */
export const useFileImage = ({ queryKey, url, params, enabled = true }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getImageBlob(url, params).then(blobToDataUrl),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  return { src: data ?? null, isPending: isLoading, isError };
};
