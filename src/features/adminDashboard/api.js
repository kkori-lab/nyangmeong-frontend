import { IS_DEV } from '@/api/env';
import { addDays, diffDays, getTodayYmd } from '@/utils/formatDate';

/**
 * [관리자 대시보드 API]
 * - /api/admin/dashboard·/api/admin/dashboard/stats 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 필드 이름과 응답 모양은 가정. 통계는 건수만(건강기록·AI 대화 내용 없음)
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 */

/** 가짜 서비스 시작일: 이 날 전 통계는 0건 */
const FAKE_OPEN_YMD = '2026-08-01';

const FAKE_NICKNAMES = ['초코맘', '나비집사', '보리아빠', '콩이네', '두부언니'];

/** 게시판 코드는 관리자 게시글 화면과 같은 값(CMUC0001·0002·0024) */
const FAKE_POSTS = [
  { bbsCd: 'CMUC0002', bbsNm: '펫일상', pstTtl: '산책 다녀왔어요' },
  {
    bbsCd: 'CMUC0001',
    bbsNm: '펫정보',
    pstTtl: '사료 바꿀 때 며칠에 걸쳐 섞나요?',
  },
  {
    bbsCd: 'CMUC0024',
    bbsNm: '실종센터',
    pstTtl: '역삼동에서 갈색 푸들을 찾습니다',
  },
  { bbsCd: 'CMUC0002', bbsNm: '펫일상', pstTtl: '오늘 처음 미용했어요' },
  { bbsCd: 'CMUC0001', bbsNm: '펫정보', pstTtl: '고양이 예방접종 주기 정리' },
];

const FAKE_BOARDS = [
  { bbsCd: 'CMUC0001', bbsNm: '펫정보', weight: 4 },
  { bbsCd: 'CMUC0002', bbsNm: '펫일상', weight: 9 },
  { bbsCd: 'CMUC0024', bbsNm: '실종센터', weight: 2 },
];

/** 가계부 카테고리 코드는 MYPC0012~0018(MYPG05) */
const FAKE_EXPENSE_CATEGORIES = [
  { ctgryCd: 'MYPC0012', ctgryNm: '병원', weight: 4 },
  { ctgryCd: 'MYPC0013', ctgryNm: '사료', weight: 8 },
  { ctgryCd: 'MYPC0014', ctgryNm: '간식', weight: 6 },
  { ctgryCd: 'MYPC0015', ctgryNm: '용품', weight: 5 },
  { ctgryCd: 'MYPC0016', ctgryNm: '미용', weight: 2 },
  { ctgryCd: 'MYPC0017', ctgryNm: '돌봄', weight: 2 },
  { ctgryCd: 'MYPC0018', ctgryNm: '기타', weight: 1 },
];

const FAKE_BREEDS = [
  { petSeNm: '강아지', vrtyNm: '푸들', weight: 7 },
  { petSeNm: '강아지', vrtyNm: '말티즈', weight: 6 },
  { petSeNm: '고양이', vrtyNm: '코리안 숏헤어', weight: 6 },
  { petSeNm: '강아지', vrtyNm: '포메라니안', weight: 4 },
  { petSeNm: '고양이', vrtyNm: '러시안 블루', weight: 3 },
];

const FAKE_PLACES = [
  { plcSn: 301, plcNm: '한강 반려견 놀이터', weight: 9 },
  { plcSn: 302, plcNm: '행복동물병원', weight: 7 },
  { plcSn: 303, plcNm: '멍멍카페 역삼점', weight: 5 },
  { plcSn: 304, plcNm: '24시 바른동물의료센터', weight: 4 },
  { plcSn: 305, plcNm: '냥이네 미용실', weight: 3 },
];

const throwFakeError = () => {
  const fake = IS_DEV
    ? new URLSearchParams(window.location.search).get('fake')
    : null;
  if (fake === 'forbidden') {
    throw {
      code: 'ADMIN_ONLY',
      message: '관리자만 접근할 수 있습니다.',
      fields: null,
      data: null,
    };
  }
  if (fake === 'error') {
    throw {
      code: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
      fields: null,
      data: null,
    };
  }
};

/** 날짜마다 같은 값이 나오는 0 이상 정수 */
const seedOf = (ymd, salt) => {
  const day = diffDays(FAKE_OPEN_YMD, ymd);
  return Math.abs((day * 37 + salt * 101) % 17);
};

/** 오늘에서 거슬러 간 일시 문자열 */
const toDateTime = (daysAgo, hour) =>
  `${addDays(getTodayYmd(), -daysAgo)}T${String(hour).padStart(2, '0')}:10:00`;

/**
 * 운영 현황·처리 대기: 기간과 무관한 지금 값
 * - 미확정: 경로 GET /api/admin/dashboard, 필드 이름 전부
 */
export const getAdminDashboard = async () => {
  throwFakeError();
  return {
    totMbrCnt: 1284,
    nrmlMbrCnt: 1270,
    stopMbrCnt: 14,
    todayJoinCnt: 12,
    weekJoinCnt: 86,
    totPstCnt: 3412,
    recentMbrs: FAKE_NICKNAMES.map((mbrNcnm, index) => ({
      mbrSn: 1290 - index,
      mbrNcnm,
      regDt: toDateTime(Math.floor(index / 2), 18 - index),
    })),
    recentPsts: FAKE_POSTS.map((post, index) => ({
      pstSn: 5120 - index,
      ...post,
      regDt: toDateTime(Math.floor(index / 2), 20 - index),
    })),
    dclrRcptCnt: 7,
    unansInqryCnt: 5,
    pixelInqryCnt: 2,
    charFailCnt: 1,
    ocrFailCnt: 3,
    notiFailCnt: 0,
    btchFailCnt: 1,
  };
};

/** 기간 합계에 비율을 곱한 묶음 */
const spread = (rows, total) =>
  rows.map(({ weight, ...row }) => ({
    ...row,
    cnt: Math.round((total * weight) / 10),
  }));

/**
 * 이용 통계: 기간 안 일별 건수 + 묶음 건수
 * - fromYmd·toYmd 포함, 일별 행은 날짜 순서대로 빠짐없이
 * - 미확정: 경로 GET /api/admin/dashboard/stats, 필드 이름 전부
 */
export const getAdminDashboardStats = async ({ fromYmd, toYmd }) => {
  throwFakeError();
  const days = diffDays(fromYmd, toYmd) + 1;
  const daily = Array.from({ length: days }, (_, index) => {
    const ymd = addDays(fromYmd, index);
    if (ymd < FAKE_OPEN_YMD) {
      return { ymd, joinCnt: 0, whdwlCnt: 0, aiChatCnt: 0, ocrRqstCnt: 0 };
    }
    return {
      ymd,
      joinCnt: 6 + seedOf(ymd, 1),
      whdwlCnt: seedOf(ymd, 2) % 4,
      aiChatCnt: 40 + seedOf(ymd, 3) * 3,
      ocrRqstCnt: 8 + seedOf(ymd, 4),
    };
  });
  const activeDays = daily.filter(({ ymd }) => ymd >= FAKE_OPEN_YMD).length;
  return {
    daily,
    pstCntByBbs: activeDays ? spread(FAKE_BOARDS, activeDays * 4) : [],
    expnsCntByCtgry: activeDays
      ? spread(FAKE_EXPENSE_CATEGORIES, activeDays * 3)
      : [],
    petDstrb: activeDays ? spread(FAKE_BREEDS, activeDays * 2) : [],
    fvrtPlcs: activeDays ? spread(FAKE_PLACES, activeDays) : [],
  };
};
