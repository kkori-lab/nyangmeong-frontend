import { api } from '@/api/axios';

/**
 * [공지 API]
 * - 목록 GET /notices(page·size·keyword·latestYn): 고정 공지(upendFixYn)가 맨 앞, 쪽 크기·totalElements에 포함
 *   latestYn=true면 고정 무시하고 작성일 최신순(상세 하단 최신 공지)
 * - 상세 GET /notices/{ntcMttrSn}: 고정 여부·조회수 없음
 */
export const getNotices = ({
  page = 1,
  size = 10,
  keyword = '',
  latestYn,
} = {}) =>
  api.get('/notices', {
    params: { page, size, keyword: keyword || undefined, latestYn },
  });

export const getNotice = (ntcMttrSn) => api.get(`/notices/${ntcMttrSn}`);
