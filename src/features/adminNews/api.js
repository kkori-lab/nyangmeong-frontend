/**
 * [관리자 펫뉴스 API]
 * - 백엔드 `/api/admin/news` 없음 -> 메모리 배열 가짜 응답: 새로고침하면 처음 값
 * - 필드 이름은 백엔드 `News`·`NewsKeyword`(KWRD_DICT) 그대로
 */
import { NEWS_CATEGORIES, NEWS_SRC } from './newsLabels';

const pad = (value) => String(value).padStart(2, '0');

/** 로컬 시각 문자열(yyyy-MM-ddTHH:mm:ss) */
const toDateTime = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

const FAKE_PRESS_NAMES = ['펫뉴스24', '반려타임즈', '애니멀데일리'];
const FAKE_PRESS_TITLES = [
  '겨울철 반려견 관절 관리',
  '고양이 구내염, 초기 증상 알아보기',
  '반려동물 동반 여행지 추천',
  '동물병원 진료비 공시 확대',
  '노령견 산책 시간 줄여야 할까',
  '반려묘 음수량 늘리는 방법',
  '펫티켓 캠페인 전국 확대',
  '강아지 슬개골 탈구 예방 운동',
];

/** 가짜 뉴스 32건: 2026-11-03부터 하루씩 거슬러, 다섯 번째마다 관리자 등록 */
const fakeNews = Array.from({ length: 32 }, (_, index) => {
  const date = new Date(2026, 10, 3 - index, 9, 30);
  const isAdmin = index % 5 === 1;
  const category = NEWS_CATEGORIES[index % NEWS_CATEGORIES.length];
  return {
    newsSn: 32 - index,
    atchFileSn: null,
    newsClsfCd: category.code,
    newsSrcCd: isAdmin ? NEWS_SRC.ADMIN : NEWS_SRC.PRESS,
    newsTtl: isAdmin
      ? `[안내] 동물등록제 안내 ${32 - index}`
      : FAKE_PRESS_TITLES[index % FAKE_PRESS_TITLES.length],
    newsCn: isAdmin
      ? '반려동물 등록은 가까운 동물병원이나 구청에서 할 수 있어요.'
      : '기사 요약입니다.',
    srcPressNm: isAdmin
      ? null
      : FAKE_PRESS_NAMES[index % FAKE_PRESS_NAMES.length],
    orgtxtPath: isAdmin ? null : `https://example.com/news/${32 - index}`,
    pblcnDt: toDateTime(date),
    useYn: index % 7 !== 3,
    regDt: toDateTime(date),
    mdfcnDt: null,
    thmbUrlPath: null,
  };
});

const findNews = (newsSn) => {
  const news = fakeNews.find((item) => item.newsSn === newsSn);
  if (!news) throw fakeError('NOT_FOUND', '뉴스를 찾을 수 없습니다.');
  return news;
};

/** 뉴스 목록(최신순): { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminNewsList = async ({
  newsSrcCd,
  newsClsfCd,
  page = 1,
  size = 20,
} = {}) => {
  const filtered = fakeNews
    .filter((news) => !newsSrcCd || news.newsSrcCd === newsSrcCd)
    .filter((news) => !newsClsfCd || news.newsClsfCd === newsClsfCd)
    .toSorted((a, b) => b.regDt.localeCompare(a.regDt) || b.newsSn - a.newsSn);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  return {
    content: structuredClone(filtered.slice((page - 1) * size, page * size)),
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/** 관리자 뉴스 등록: { newsSn } */
export const createAdminNews = async ({
  newsTtl,
  newsCn,
  newsClsfCd,
  thumbnail,
}) => {
  const newsSn = Math.max(0, ...fakeNews.map((news) => news.newsSn)) + 1;
  const now = toDateTime(new Date());
  fakeNews.unshift({
    newsSn,
    atchFileSn: null,
    newsClsfCd,
    newsSrcCd: NEWS_SRC.ADMIN,
    newsTtl,
    newsCn,
    srcPressNm: null,
    orgtxtPath: null,
    pblcnDt: now,
    useYn: true,
    regDt: now,
    mdfcnDt: null,
    thmbUrlPath: thumbnail ? URL.createObjectURL(thumbnail) : null,
  });
  return { newsSn };
};

/** 뉴스 수정: 넘긴 값만 덮어씀(관리자 등록은 제목·요약·카테고리·썸네일, 수집 기사는 사용·카테고리) */
export const updateAdminNews = async ({ newsSn, thumbnail, ...changes }) => {
  const news = findNews(newsSn);
  Object.assign(news, changes, {
    mdfcnDt: toDateTime(new Date()),
    ...(thumbnail ? { thmbUrlPath: URL.createObjectURL(thumbnail) } : {}),
  });
  return null;
};

/** 분류 키워드: DICT_USG_CD 뉴스 분류(AIMC0039), mpngCd는 뉴스 카테고리 */
const FAKE_KEYWORDS = {
  CMUC0018: ['질병', '예방접종', '동물병원', '건강검진'],
  CMUC0019: ['산책', '훈련', '사료'],
  CMUC0020: ['동물등록', '법안', '지자체'],
  CMUC0021: ['여행', '동반', '캠핑'],
};

const fakeKeywords = Object.entries(FAKE_KEYWORDS).flatMap(
  ([mpngCd, words], categoryIndex) =>
    words.map((kwrdCn, index) => ({
      kwrdDictSn: categoryIndex * 10 + index + 1,
      mpngCd,
      kwrdCn,
      sortSeq: index + 1,
    })),
);

/** 분류 키워드 목록(정렬 순서·번호순): [{ kwrdDictSn, mpngCd, kwrdCn, sortSeq }] */
export const getAdminNewsKeywords = async () =>
  structuredClone(
    fakeKeywords.toSorted(
      (a, b) => a.sortSeq - b.sortSeq || a.kwrdDictSn - b.kwrdDictSn,
    ),
  );

/** 분류 키워드 등록: { kwrdDictSn } */
export const createAdminNewsKeyword = async ({ mpngCd, kwrdCn }) => {
  const isDuplicate = fakeKeywords.some(
    (keyword) =>
      keyword.mpngCd === mpngCd &&
      keyword.kwrdCn.toLowerCase() === kwrdCn.toLowerCase(),
  );
  if (isDuplicate) throw fakeError('DUPLICATE', '이미 등록된 키워드입니다.');
  const kwrdDictSn =
    Math.max(0, ...fakeKeywords.map((keyword) => keyword.kwrdDictSn)) + 1;
  const sortSeq =
    Math.max(
      0,
      ...fakeKeywords
        .filter((keyword) => keyword.mpngCd === mpngCd)
        .map((keyword) => keyword.sortSeq),
    ) + 1;
  fakeKeywords.push({ kwrdDictSn, mpngCd, kwrdCn, sortSeq });
  return { kwrdDictSn };
};

/** 분류 키워드 삭제 */
export const deleteAdminNewsKeyword = async (kwrdDictSn) => {
  const index = fakeKeywords.findIndex(
    (keyword) => keyword.kwrdDictSn === kwrdDictSn,
  );
  if (index < 0) throw fakeError('NOT_FOUND', '키워드를 찾을 수 없습니다.');
  fakeKeywords.splice(index, 1);
  return null;
};
