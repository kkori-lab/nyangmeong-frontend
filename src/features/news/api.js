import { NEWS_SRC_ADMIN, NEWS_SRC_PRESS } from './newsCodes';

/**
 * [뉴스 가짜 응답]
 * - 뉴스 API(KSJ 백엔드) 연결 전: api.get()으로 교체
 * - 키는 ERD 뉴스 테이블(NEWS_*)을 camelCase로 바꾼 가정. Swagger 전이라 연결 때 확인
 * - 요약 컬럼이 없어 외부 기사는 newsCn이 요약, 관리자 등록은 전문
 * - 외부 기사의 썸네일은 서버가 URL만 보관(thmbUrlPath). 가짜는 비워 자리 표시 노출
 */
const [HEALTH, LIFE, POLICY, TRAVEL] = [
  'CMUC0018',
  'CMUC0019',
  'CMUC0020',
  'CMUC0021',
];

const press = (newsClsfCd, newsTtl, newsCn, srcPressNm, pblcnDt) => ({
  newsClsfCd,
  newsSrcCd: NEWS_SRC_PRESS,
  newsTtl,
  newsCn,
  srcPressNm,
  orgtxtPath: 'https://www.jjan.kr/',
  pblcnDt,
  thmbUrlPath: null,
});

const fakeRows = [
  press(
    LIFE,
    '전북 유기동물 입양 캠페인 확대',
    '전북특별자치도가 유기동물 입양률을 높이기 위한 캠페인을 확대 시행한다고 밝혔다. 지역 내 동물보호센터와 연계해 입양 절차를 간소화하고 지원금도 늘릴 예정이다.',
    '전북일보',
    '2026-10-10 09:30:00',
  ),
  press(
    POLICY,
    '반려동물 등록 의무화, 미등록 과태료 강화',
    '정부가 반려동물 등록 의무화 제도를 강화하며 미등록 적발 시 과태료를 상향 조정한다고 발표했다. 유기동물 발생을 줄이기 위한 조치로 풀이된다.',
    '연합뉴스',
    '2026-10-09 15:10:00',
  ),
  {
    newsClsfCd: HEALTH,
    newsSrcCd: NEWS_SRC_ADMIN,
    newsTtl: '[공지] 환절기 반려동물 호흡기 질환 주의',
    newsCn:
      '일교차가 커지는 환절기에는 기침 · 콧물 같은 호흡기 증상이 늘어나요. 실내 온도와 습도를 일정하게 유지하고, 증상이 이어지면 동물병원을 찾아 주세요.\n\n산책은 날씨가 좋은 낮 시간에 짧게 나누어 하고, 돌아온 뒤에는 발과 털의 먼지를 닦아 주세요.',
    srcPressNm: '냥멍케어',
    orgtxtPath: null,
    pblcnDt: '2026-10-09 10:00:00',
    thmbUrlPath: null,
  },
  press(
    HEALTH,
    '가을철 진드기 예방, 산책 후 이것만은 꼭',
    '가을 산책이 늘면서 진드기 감염 위험도 커지고 있다. 전문가들은 산책 후 빗질과 몸 확인, 정기적인 외부 구충제 투여를 권장한다.',
    '건강경향',
    '2026-10-08 11:20:00',
  ),
  press(
    TRAVEL,
    '반려동물 동반 숙소 1년 새 30% 늘었다',
    '반려동물과 함께 여행하는 가구가 늘면서 동반 가능 숙소가 빠르게 증가하고 있다. 다만 크기 · 마릿수 제한이 다양해 예약 전 확인이 필요하다.',
    '한국관광신문',
    '2026-10-07 08:45:00',
  ),
  press(
    LIFE,
    '노견 · 노묘 위한 집 안 환경 바꾸기',
    '나이 든 반려동물은 미끄러운 바닥과 높은 계단에서 다치기 쉽다. 미끄럼 방지 매트와 낮은 계단을 두면 관절 부담을 줄일 수 있다고 전문가들은 조언한다.',
    '펫데일리',
    '2026-10-06 14:00:00',
  ),
  press(
    POLICY,
    '동물병원 진료비 게시 의무, 내년부터 전 병원으로',
    '내년부터 모든 동물병원이 주요 진료 항목의 비용을 게시해야 한다. 보호자가 병원을 비교하고 선택하기 쉬워질 것으로 기대된다.',
    '한국일보',
    '2026-10-05 17:30:00',
  ),
  press(
    HEALTH,
    '고양이 비만, 놀이 시간으로 관리한다',
    '실내 고양이의 비만이 늘고 있다. 수의사들은 급여량 조절과 함께 하루 두세 번 짧은 놀이 시간을 갖는 것이 체중 관리에 효과적이라고 말한다.',
    '데일리벳',
    '2026-10-03 10:10:00',
  ),
  press(
    LIFE,
    '전주시 반려동물 놀이터 2곳 새로 문 연다',
    '전주시가 덕진공원과 삼천동 일대에 반려동물 놀이터를 새로 조성해 이달 말 개방한다. 대형견과 소형견 공간을 나눠 안전성을 높였다.',
    '전북도민일보',
    '2026-10-02 13:15:00',
  ),
  ...Array.from({ length: 16 }, (_, index) => {
    const category = [HEALTH, LIFE, POLICY, TRAVEL][index % 4];
    const day = String(Math.max(1, 28 - index)).padStart(2, '0');
    return press(
      category,
      `반려동물 소식 모음 ${index + 1}`,
      `반려생활에 도움이 되는 소식 ${index + 1}번의 요약이에요. 반려동물과 함께하는 일상에 도움이 되는 이야기를 전한다.`,
      ['펫뉴스', '동물일보', '전북일보', '연합뉴스'][index % 4],
      `2026-09-${day} 09:00:00`,
    );
  }),
]
  .sort((a, b) => b.pblcnDt.localeCompare(a.pblcnDt))
  .map((row, index, rows) => ({ ...row, newsSn: rows.length - index }));

/** 제목·내용 일치(띄어쓰기 무시) */
const normalize = (text) => text.replace(/\s/g, '').toLowerCase();

export const getNewsList = ({
  page = 1,
  size = 10,
  newsClsfCd = '',
  keyword = '',
} = {}) => {
  const word = normalize(keyword);
  const matched = fakeRows.filter(
    (item) =>
      (!newsClsfCd || item.newsClsfCd === newsClsfCd) &&
      (!word || normalize(item.newsTtl + item.newsCn).includes(word)),
  );
  const totalPages = Math.ceil(matched.length / size);
  return Promise.resolve({
    content: matched.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: matched.length,
    totalPages,
    hasNext: page < totalPages,
  });
};

export const getNews = (newsSn) => {
  const target = fakeRows.find((item) => item.newsSn === newsSn);
  return target
    ? Promise.resolve({ ...target })
    : Promise.reject(new Error('뉴스를 찾지 못했어요'));
};
