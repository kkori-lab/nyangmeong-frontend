/** 뉴스 카테고리 공통코드 값: 화면 이름 ↔ newsClsfCd */
export const NEWS_CATEGORIES = [
  { name: '건강', code: 'CMUC0018' },
  { name: '생활', code: 'CMUC0019' },
  { name: '정책', code: 'CMUC0020' },
  { name: '여행', code: 'CMUC0021' },
];

/** 공통코드 그룹 CMUG07(뉴스출처) 값: newsSrcCd */
export const NEWS_SRC_PRESS = 'CMUC0022';
export const NEWS_SRC_ADMIN = 'CMUC0023';

export const getCategoryName = (code) =>
  NEWS_CATEGORIES.find((category) => category.code === code)?.name;

export const getCategoryCode = (name) =>
  NEWS_CATEGORIES.find((category) => category.name === name)?.code;

/** 관리자 등록 뉴스는 srcPressNm이 비어 와서 서비스 이름을 보인다 */
export const getPressName = (news) =>
  news.newsSrcCd === NEWS_SRC_ADMIN ? '냥멍케어' : news.srcPressNm;

/** 요약을 못 읽은 기사는 newsCn이 제목과 같게 온다 */
export const hasSummary = (news) =>
  Boolean(news.newsCn) && news.newsCn.trim() !== news.newsTtl.trim();
