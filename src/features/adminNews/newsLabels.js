/** 뉴스 카테고리 공통코드(CMUG06): newsClsfCd */
export const NEWS_CATEGORIES = [
  { code: 'CMUC0018', name: '건강' },
  { code: 'CMUC0019', name: '생활' },
  { code: 'CMUC0020', name: '정책' },
  { code: 'CMUC0021', name: '여행' },
];

/** 뉴스 출처 공통코드(CMUG07): newsSrcCd */
export const NEWS_SRC = { PRESS: 'CMUC0022', ADMIN: 'CMUC0023' };

/** 출처 필터 항목 */
export const NEWS_SOURCES = [
  { code: NEWS_SRC.PRESS, name: '외부 언론사' },
  { code: NEWS_SRC.ADMIN, name: '관리자 등록' },
];

/** 관리자 등록 출처 표기 */
export const ADMIN_SOURCE_LABEL = '관리자 등록';

/** 카테고리 이름: 모르는 코드는 코드 그대로 */
export const getCategoryName = (code) =>
  NEWS_CATEGORIES.find((category) => category.code === code)?.name ?? code;

/** 관리자 등록 여부 */
export const isAdminNews = (news) => news.newsSrcCd === NEWS_SRC.ADMIN;

/** 출처 표기: 언론사 이름 또는 관리자 등록, 언론사 이름이 없으면 서버 출처 이름 */
export const getSourceLabel = (news) =>
  isAdminNews(news)
    ? ADMIN_SOURCE_LABEL
    : news.srcPressNm || news.newsSrcCdNm || '외부 언론사';
