import { api } from '@/api/axios';

/**
 * [FAQ API]
 * - 목록 GET /faqs(page·size·faqClsfCd·keyword): 답변(ansCn)까지 담아 오고, 분류와 검색어는 AND
 * - 분류 코드(CSCG01)를 모르는 값으로 보내면 400
 * - 칩 문구는 디자인대로 「신고 · 제재」라 서버 이름(faqClsfCdNm)을 쓰지 않는다
 */
export const FAQ_CATEGORIES = [
  { faqClsfCd: 'CSCC0001', label: '이용방법' },
  { faqClsfCd: 'CSCC0002', label: '계정' },
  { faqClsfCd: 'CSCC0003', label: '신고 · 제재' },
  { faqClsfCd: 'CSCC0004', label: '기타' },
];

export const getFaqs = ({
  page = 1,
  size = 10,
  faqClsfCd = '',
  keyword = '',
} = {}) =>
  api.get('/faqs', {
    params: {
      page,
      size,
      faqClsfCd: faqClsfCd || undefined,
      keyword: keyword || undefined,
    },
  });
