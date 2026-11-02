import { api } from '@/api/axios';

/**
 * [뉴스 API]
 * - 목록 GET /news(page·size·newsClsfCd·keyword): 분류와 검색어는 AND. 모르는 분류 코드는 400
 * - 상세 GET /news/{newsSn}: 없으면 404
 * - 외부 기사의 newsCn은 요약, 관리자 등록은 전문. 썸네일(thmbUrlPath)은 없을 수 있다
 */
export const getNewsList = ({
  page = 1,
  size = 10,
  newsClsfCd = '',
  keyword = '',
} = {}) =>
  api.get('/news', {
    params: {
      page,
      size,
      newsClsfCd: newsClsfCd || undefined,
      keyword: keyword || undefined,
    },
  });

export const getNews = (newsSn) => api.get(`/news/${newsSn}`);
