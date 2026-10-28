import { PET_SE } from '@/utils/petCodes';
import { addDays, diffDays, getTodayYmd, toYmd } from '@/utils/formatDate';
import {
  BREEDS,
  EXTEND_BEFORE_DAYS,
  EXTEND_DAYS,
  foundCommentText,
  getBreedName,
  LOST_STTS,
} from './missingCodes';

/**
 * [실종센터 가짜 응답]
 * - 실종 게시글·댓글·좋아요·신고·연장·찾았어요 API(KSJ 백엔드) 연결 전: api.get()·post()로 교체
 * - 키는 ERD(PST·LOST_TPOF·CMNT 컬럼)를 camelCase로 바꾼 것이다. 실종 글은 PST(1) + LOST_TPOF(1)를 서버가 합쳐 준다고 가정한다
 *   [PST] pstSn, pstTtl, pstCn, inqCnt, rcmdtnCnt, regDt, mdfcnDt
 *   [LOST_TPOF] lostTpofSn, petSeCd, petNm, colrNm, chrcCn, vrtyNm(VRTY_SN의 품종명), vrtyDrctInptNm, lastWtnsDt, wtnsPlcNm,
 *   wtnsPlcLat(WTNS_PLC_LAT), wtnsPlcLot(WTNS_PLC_LOT), lostTpofSttsCd, expryCrtrDt, dscvSwtcDt, pstgPrdUpdtNmtm, prvcRlsAgreYn
 *   [CMNT] cmntSn, prntCmntSn, pstSn, mbrSn, cmntCn, sysAutoCrtYn, delYn, regDt
 * - ERD에 없어 서버가 계산한다고 가정한 값: cnpl(CNPL_ENC를 복호화한 연락처), sggNm·emdNm(RGN_SN의 시군구·읍면동명),
 *   wtnsPlcAddr(주소 전체), wrtrNcknm, cmntCnt, likeYn, mineYn, thmbUrlPath, atchFiles, rmndDayCnt(게시 종료까지 남은 일수)
 * - 좋아요(PST_RCMDTN)·댓글(CMNT)·신고(DCLR)는 pstSn, 상태·연장·찾았어요·수정·삭제는 lostTpofSn 기준
 * - 목록의 실종 기간 필터는 마지막 목격 날짜(lastWtnsDt) 기준이다(사람 결정. ERD 비고는 등록일시 기준이라 문서가 다르다)
 * - 로그인 전이라 내 회원번호는 MY_MBR_SN으로 고정한다
 */
const MY_MBR_SN = 1;
const MY_NICKNAME = '토리맘';
const POST_DAYS = 30;
const RAIL_NEWS_COUNT = 4;
const RAIL_FOUND_COUNT = 2;

const pad = (value) => String(value).padStart(2, '0');

/** 지금부터 minutes분 전 시각 'YYYY-MM-DD HH:mm:00' */
const ago = (minutes) => {
  const date = new Date(Date.now() - minutes * 60000);
  return `${toYmd(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const now = () => ago(0);

/** 사진 자리 표시: 단색 SVG */
const photo = (name, color) => ({
  id: name,
  name: `${name}.svg`,
  url: `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${color}"/></svg>`,
  )}`,
});

/** 가짜 게시글의 목격 장소. 글쓰기의 장소 찾기는 카카오 검색(missing/placeSearch.js)을 쓴다. 좌표는 전주 일대 */
const PLACES = [
  ['서곡초등학교 인근', '전주시 완산구', '서곡동', 35.8452, 127.0884],
  ['서곡공원', '전주시 완산구', '서곡동', 35.8478, 127.0851],
  ['효자공원', '전주시 완산구', '효자동', 35.7954, 127.1111],
  ['삼천변 산책로', '전주시 완산구', '삼천동', 35.7977, 127.1235],
  ['인후공원', '전주시 덕진구', '인후동', 35.8498, 127.1612],
  ['금암광장', '전주시 덕진구', '금암동', 35.8383, 127.1314],
  ['송천동 먹거리타운', '전주시 덕진구', '송천동', 35.8683, 127.1146],
  ['나운동 중앙시장', '군산시', '나운동', 35.9747, 126.7173],
  ['영등동 영등공원', '익산시', '영등동', 35.9436, 126.9439],
  ['봉동읍 봉동초등학교', '완주군', '봉동읍', 35.9532, 127.0376],
].map(([wtnsPlcNm, sggNm, emdNm, wtnsPlcLat, wtnsPlcLot], index) => ({
  plcSn: index + 1,
  wtnsPlcNm,
  wtnsPlcAddr: `전북 ${sggNm} ${emdNm} ${wtnsPlcNm}`,
  sggNm,
  emdNm,
  wtnsPlcLat,
  wtnsPlcLot,
}));

const placeOf = (sggNm, emdNm) =>
  PLACES.find((row) => row.sggNm === sggNm && row.emdNm === emdNm) ??
  PLACES.find((row) => row.sggNm === sggNm) ??
  PLACES[0];

let nextLostSn = 1;
const lost = ({
  petSeCd = PET_SE.DOG,
  petNm,
  vrtyNm = null,
  vrtyDrctInptNm = null,
  colrNm,
  chrcCn = '',
  sggNm,
  emdNm,
  title,
  body,
  cnpl = '010-1234-5678',
  wrtrNcknm,
  mbrSn,
  minutes,
  seenMinutes = minutes,
  daysLeft = POST_DAYS,
  found = false,
  inqCnt = 0,
  rcmdtnCnt = 0,
  images = [],
}) => {
  const place = placeOf(sggNm, emdNm);
  return {
    lostTpofSn: nextLostSn++,
    pstSn: 0,
    prvcRlsAgreYn: 'Y',
    pstgPrdUpdtNmtm: 0,
    mbrSn,
    petSeCd,
    petNm,
    vrtyNm,
    vrtyDrctInptNm,
    colrNm,
    chrcCn,
    lastWtnsDt: ago(seenMinutes),
    wtnsPlcNm: place.wtnsPlcNm,
    wtnsPlcAddr: place.wtnsPlcAddr,
    wtnsPlcLat: place.wtnsPlcLat,
    wtnsPlcLot: place.wtnsPlcLot,
    sggNm,
    emdNm,
    pstTtl: title ?? `${petNm}${vrtyNm ? ` (${vrtyNm})` : ''}를 찾습니다`,
    pstCn: body,
    cnpl,
    lostTpofSttsCd: found ? LOST_STTS.FOUND : LOST_STTS.LOST,
    expryCrtrDt: addDays(getTodayYmd(), daysLeft),
    dscvSwtcDt: found ? ago(minutes / 2) : null,
    inqCnt,
    rcmdtnCnt,
    wrtrNcknm,
    regDt: ago(minutes),
    mdfcnDt: ago(minutes),
    atchFiles: images,
  };
};

const DAY = 24 * 60;
/** 게시글(PST) 번호는 실종제보(LOST_TPOF) 번호와 다르다: 좋아요·댓글·신고는 pstSn 기준 */
const PST_SN_BASE = 100;
const COLORS = ['#dfe9e9', '#cfe2d4', '#e7dcc4', '#e6e0ef'];

let posts = [
  lost({
    petNm: '보리',
    vrtyNm: '몰티즈',
    colrNm: '흰색',
    chrcCn: '왼쪽 눈가 갈색 점, 빨간 목줄, 사람을 잘 따라요',
    sggNm: '전주시 완산구',
    emdNm: '서곡동',
    body: '흰색 털, 왼쪽 눈가에 갈색 점이 있고 빨간 목줄을 하고 있어요.\n완산구 서곡동 인근에서 마지막으로 목격됐어요. 겁이 많아 이름을 부르면 숨을 수 있으니, 보시면 천천히 다가가 주시거나 연락 부탁드려요.',
    wrtrNcknm: MY_NICKNAME,
    mbrSn: MY_MBR_SN,
    minutes: 23 * DAY,
    seenMinutes: 23 * DAY + 60,
    daysLeft: 7,
    inqCnt: 88,
    rcmdtnCnt: 34,
    images: [photo('bori-1', COLORS[0])],
  }),
  lost({
    petNm: '치즈',
    petSeCd: PET_SE.CAT,
    vrtyNm: '코리안 숏헤어',
    colrNm: '치즈색',
    chrcCn: '목에 빨간 리본, 사람을 잘 따라요',
    sggNm: '전주시 덕진구',
    emdNm: '금암동',
    body: '산책 중에 놀라서 도망갔어요. 금암동 광장 근처에서 마지막으로 봤어요.',
    wrtrNcknm: '치즈맘',
    mbrSn: 12,
    minutes: 6 * 60,
    inqCnt: 21,
    rcmdtnCnt: 5,
    images: [photo('cheese-1', COLORS[2])],
  }),
  lost({
    petNm: '콩이',
    vrtyNm: '푸들',
    colrNm: '갈색',
    chrcCn: '갈색 곱슬 털, 목줄 없음',
    sggNm: '전주시 완산구',
    emdNm: '효자동',
    body: '효자동 공원에서 산책하다 놓쳤어요. 갈색 곱슬 털이고 목줄이 없어요.',
    wrtrNcknm: '콩이아빠',
    mbrSn: 13,
    minutes: 30 * 60,
    inqCnt: 40,
    rcmdtnCnt: 9,
  }),
  lost({
    petNm: '몽이',
    vrtyNm: '진돗개',
    colrNm: '흰색',
    chrcCn: '흰색 진돗개 믹스, 인식표 있음',
    sggNm: '전주시 완산구',
    emdNm: '삼천동',
    body: '삼천변 산책로에서 사라졌어요. 인식표가 있고 순해요.',
    wrtrNcknm: '몽이네',
    mbrSn: 14,
    minutes: 28 * 60,
    inqCnt: 33,
    rcmdtnCnt: 4,
  }),
  lost({
    petNm: '별이',
    vrtyNm: '시츄',
    colrNm: '흰색',
    chrcCn: '게시글 정보는 비공개로 바뀌었어요',
    sggNm: '전주시 덕진구',
    emdNm: '인후동',
    body: '인후동에서 잃어버렸다가 가족 품으로 돌아왔어요.',
    wrtrNcknm: '인후동별이네',
    mbrSn: 15,
    minutes: 3 * DAY,
    found: true,
    inqCnt: 120,
    rcmdtnCnt: 31,
  }),
  lost({
    petNm: '까망이',
    petSeCd: PET_SE.CAT,
    vrtyNm: '코리안 숏헤어',
    colrNm: '검은색',
    chrcCn: '검은 고양이, 흰 양말 무늬 발',
    sggNm: '군산시',
    emdNm: '나운동',
    body: '나운동 아파트 단지에서 사라졌어요. 검은 고양이이고 발에 흰 양말 무늬가 있어요.',
    wrtrNcknm: '까망맘',
    mbrSn: 16,
    minutes: 2 * DAY,
    inqCnt: 18,
    rcmdtnCnt: 2,
  }),
  lost({
    petNm: '두부',
    vrtyDrctInptNm: '믹스견',
    colrNm: '검은색',
    chrcCn: '검은색 중형견, 파란 인식표',
    sggNm: '익산시',
    emdNm: '영등동',
    body: '영등공원에서 산책 중 목줄이 풀려 도망갔어요. 파란 인식표를 하고 있어요.',
    wrtrNcknm: '두부아빠',
    mbrSn: 17,
    minutes: 14 * DAY,
    daysLeft: 16,
    inqCnt: 56,
    rcmdtnCnt: 7,
  }),
  lost({
    petNm: '나비',
    petSeCd: PET_SE.CAT,
    vrtyNm: '코리안 숏헤어',
    colrNm: '삼색',
    chrcCn: '삼색 고양이, 왼쪽 귀 접힘',
    sggNm: '전주시 덕진구',
    emdNm: '송천동',
    body: '송천동 골목에서 마지막으로 봤어요. 삼색 고양이이고 왼쪽 귀가 접혀 있어요.',
    wrtrNcknm: '나비집사',
    mbrSn: 18,
    minutes: 5 * DAY,
    inqCnt: 25,
    rcmdtnCnt: 3,
  }),
  lost({
    petNm: '초코',
    vrtyNm: '푸들',
    colrNm: '갈색',
    chrcCn: '게시글 정보는 비공개로 바뀌었어요',
    sggNm: '전주시 완산구',
    emdNm: '중화산동',
    body: '중화산동에서 잃어버렸다가 찾았어요.',
    wrtrNcknm: '초코엄마',
    mbrSn: 19,
    minutes: 42 * DAY,
    found: true,
    inqCnt: 200,
    rcmdtnCnt: 44,
  }),
  lost({
    petNm: '흰둥이',
    vrtyNm: '비숑 프리제',
    colrNm: '흰색',
    chrcCn: '하얀 곱슬 털, 분홍 하네스',
    sggNm: '전주시 덕진구',
    emdNm: '덕진동',
    body: '덕진공원 근처에서 하네스가 풀려 도망갔어요.',
    wrtrNcknm: '흰둥맘',
    mbrSn: 20,
    minutes: 4 * 60,
    inqCnt: 12,
    rcmdtnCnt: 1,
  }),
  lost({
    petNm: '루이',
    petSeCd: PET_SE.CAT,
    vrtyNm: '러시안 블루',
    colrNm: '회색',
    chrcCn: '회색 털, 초록 눈, 겁이 많아요',
    sggNm: '전주시 완산구',
    emdNm: '평화동',
    body: '평화동 빌라에서 창문으로 나갔어요. 겁이 많아서 숨어 있을 수 있어요.',
    wrtrNcknm: '루이집사',
    mbrSn: 21,
    minutes: 3 * DAY + 120,
    inqCnt: 30,
    rcmdtnCnt: 6,
  }),
  lost({
    petNm: '해피',
    vrtyNm: '웰시 코기 펨브로크',
    colrNm: '황갈색',
    chrcCn: '짧은 다리, 노란 목줄, 꼬리 없음',
    sggNm: '완주군',
    emdNm: '봉동읍',
    body: '봉동읍 초등학교 근처에서 사라졌어요. 노란 목줄을 하고 있어요.',
    wrtrNcknm: '해피네',
    mbrSn: 22,
    minutes: 6 * DAY,
    inqCnt: 44,
    rcmdtnCnt: 8,
  }),
  lost({
    petNm: '모모',
    petSeCd: PET_SE.CAT,
    vrtyNm: '스코티시 폴드',
    colrNm: '회색',
    chrcCn: '게시글 정보는 비공개로 바뀌었어요',
    sggNm: '전주시 덕진구',
    emdNm: '인후동',
    body: '우아동에서 잃어버렸다가 찾았어요.',
    wrtrNcknm: '모모맘',
    mbrSn: 23,
    minutes: 20 * DAY,
    found: true,
    inqCnt: 90,
    rcmdtnCnt: 12,
  }),
  lost({
    petNm: '바둑이',
    vrtyNm: '진돗개',
    colrNm: '흰색과 검은색',
    chrcCn: '흰 바탕에 검은 점, 대형견',
    sggNm: '김제시',
    emdNm: '요촌동',
    body: '요촌동 근처 농로에서 사라졌어요. 대형견이라 멀리 갔을 수 있어요.',
    wrtrNcknm: '바둑이아빠',
    mbrSn: 24,
    minutes: 35 * DAY,
    daysLeft: 1,
    inqCnt: 70,
    rcmdtnCnt: 10,
  }),
  lost({
    petNm: '구름',
    petSeCd: PET_SE.CAT,
    vrtyNm: '페르시안',
    colrNm: '흰색',
    chrcCn: '긴 흰 털, 납작한 얼굴',
    sggNm: '전주시 완산구',
    emdNm: '서신동',
    body: '서신동 아파트 단지에서 사라졌어요. 긴 흰 털의 페르시안이에요.',
    wrtrNcknm: '구름집사',
    mbrSn: 25,
    minutes: 10 * DAY,
    inqCnt: 38,
    rcmdtnCnt: 5,
  }),
].map((row, index) => ({
  ...row,
  lostTpofSn: index + 1,
  pstSn: PST_SN_BASE + index + 1,
}));

let nextCmntSn = 1;
const cmnt = ({
  pstSn,
  prntCmntSn = null,
  mbrSn,
  wrtrNcknm,
  cmntCn,
  minutes,
  sysAutoCrtYn = 'N',
}) => ({
  cmntSn: nextCmntSn++,
  prntCmntSn,
  pstSn,
  mbrSn,
  wrtrNcknm,
  cmntCn,
  sysAutoCrtYn,
  delYn: 'N',
  regDt: ago(minutes),
  mdfcnDt: ago(minutes),
});

let comments = [
  cmnt({
    pstSn: 101,
    mbrSn: 31,
    wrtrNcknm: '동네주민',
    cmntCn: '방금 서곡동 놀이터 근처에서 비슷한 아이 본 것 같아요!',
    minutes: 30,
  }),
  cmnt({
    pstSn: 101,
    prntCmntSn: 1,
    mbrSn: MY_MBR_SN,
    wrtrNcknm: MY_NICKNAME,
    cmntCn: '정말요?! 정확한 위치 알 수 있을까요 ㅠㅠ',
    minutes: 20,
  }),
  cmnt({
    pstSn: 102,
    mbrSn: 32,
    wrtrNcknm: '금암주민',
    cmntCn: '금암광장 쪽에서 비슷한 고양이를 봤어요.',
    minutes: 90,
  }),
];

const likedSns = new Set();
const reportedSns = new Set();
const reportedCmntSns = new Set();
const viewedSns = new Set();

const findPost = (lostTpofSn) =>
  posts.find((row) => row.lostTpofSn === lostTpofSn);

const findPostByPst = (pstSn) => posts.find((row) => row.pstSn === pstSn);

const countComments = (pstSn) =>
  comments.filter((row) => row.pstSn === pstSn && row.delYn !== 'Y').length;

const toSummary = (row) => ({
  ...row,
  cmntCnt: countComments(row.pstSn),
  likeYn: likedSns.has(row.pstSn) ? 'Y' : 'N',
  mineYn: row.mbrSn === MY_MBR_SN ? 'Y' : 'N',
  thmbUrlPath: row.atchFiles[0]?.url ?? null,
  rmndDayCnt: diffDays(getTodayYmd(), row.expryCrtrDt),
});

/** 찾았어요 글은 다른 사용자에게 제목·상태·처리 시각만 준다(본문·사진·연락처·위치는 비운다) */
const hideIfFound = (row) =>
  row.lostTpofSttsCd === LOST_STTS.FOUND && row.mineYn !== 'Y'
    ? {
        ...row,
        pstCn: '',
        chrcCn: '',
        cnpl: '',
        wtnsPlcNm: '',
        wtnsPlcAddr: '',
        wtnsPlcLat: null,
        wtnsPlcLot: null,
        atchFiles: [],
        thmbUrlPath: null,
      }
    : row;

const normalize = (text) => text.replace(/\s/g, '').toLowerCase();

const paged = (matched, page, size) => {
  const totalPages = Math.ceil(matched.length / size);
  return {
    content: matched.slice((page - 1) * size, page * size),
    page,
    size,
    totalElements: matched.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/** 마지막 목격 날짜가 오늘로부터 며칠 전인지 */
const seenDaysAgo = (row) => diffDays(row.lastWtnsDt, getTodayYmd());

const matchesPeriod = (row, period) => {
  if (period === '') return true;
  const days = seenDaysAgo(row);
  if (period === '31') return days > 30;
  return days <= Number(period);
};

const matchesRegion = (row, sggNm, emdNm) => {
  if (!sggNm) return true;
  const sameRegion =
    sggNm === '전주시' ? row.sggNm.startsWith('전주시') : row.sggNm === sggNm;
  return sameRegion && (!emdNm || row.emdNm === emdNm);
};

/**
 * 목록: 상태(lostTpofSttsCd)·지역(sggNm, emdNm)·반려동물(petSeCd)·실종 기간(period)·키워드를 모두 만족(AND).
 * 정렬은 실종 먼저, 찾았어요는 뒤로, 같은 상태끼리는 최신순
 */
export const getMissingList = ({
  page = 1,
  size = 12,
  lostTpofSttsCd = '',
  sggNm = '',
  emdNm = '',
  petSeCd = '',
  period = '',
  keyword = '',
} = {}) => {
  const word = normalize(keyword);
  const matched = posts
    .filter(
      (row) =>
        (!lostTpofSttsCd || row.lostTpofSttsCd === lostTpofSttsCd) &&
        (!petSeCd || row.petSeCd === petSeCd) &&
        matchesRegion(row, sggNm, emdNm) &&
        matchesPeriod(row, period) &&
        (!word ||
          normalize(
            `${row.sggNm}${row.emdNm}${getBreedName(row)}${row.chrcCn}${row.petNm}`,
          ).includes(word)),
    )
    .toSorted((a, b) => {
      const foundA = a.lostTpofSttsCd === LOST_STTS.FOUND ? 1 : 0;
      const foundB = b.lostTpofSttsCd === LOST_STTS.FOUND ? 1 : 0;
      if (foundA !== foundB) return foundA - foundB;
      return b.regDt.localeCompare(a.regDt) || b.lostTpofSn - a.lostTpofSn;
    })
    .map((row) => hideIfFound(toSummary(row)));
  return Promise.resolve(paged(matched, page, size));
};

/** 오른쪽 레일: 최근 실종 소식 4건(실종·찾았어요 섞어 최신순)과 최근 찾은 반려동물 2건 */
export const getMissingRail = () => {
  const byNew = (a, b) => b.regDt.localeCompare(a.regDt);
  return Promise.resolve({
    news: posts
      .toSorted(byNew)
      .slice(0, RAIL_NEWS_COUNT)
      .map((row) => ({
        lostTpofSn: row.lostTpofSn,
        lostTpofSttsCd: row.lostTpofSttsCd,
        petNm: row.petNm,
        vrtyNm: row.vrtyNm,
        vrtyDrctInptNm: row.vrtyDrctInptNm,
        regDt: row.regDt,
      })),
    found: posts
      .filter((row) => row.lostTpofSttsCd === LOST_STTS.FOUND)
      .toSorted((a, b) => b.dscvSwtcDt.localeCompare(a.dscvSwtcDt))
      .slice(0, RAIL_FOUND_COUNT)
      .map((row) => ({ lostTpofSn: row.lostTpofSn, petNm: row.petNm })),
  });
};

/** 상세: 같은 사용자의 조회수는 한 번만 올린다(가짜는 새로고침 전까지) */
export const getMissing = (lostTpofSn) => {
  const target = findPost(lostTpofSn);
  if (!target) return Promise.reject(new Error('게시글을 찾지 못했어요'));
  if (!viewedSns.has(lostTpofSn)) {
    viewedSns.add(lostTpofSn);
    target.inqCnt += 1;
  }
  return Promise.resolve(hideIfFound(toSummary(target)));
};

/** 글쓰기에서 고른 장소로 실종 지역(sggNm, emdNm)을 정한다. 역지오코딩은 서버가 한다 */
export const createMissing = (values) => {
  const lostTpofSn = Math.max(0, ...posts.map((row) => row.lostTpofSn)) + 1;
  const pstSn = Math.max(0, ...posts.map((row) => row.pstSn)) + 1;
  posts = [
    ...posts,
    {
      ...values,
      lostTpofSn,
      pstSn,
      prvcRlsAgreYn: 'Y',
      pstgPrdUpdtNmtm: 0,
      mbrSn: MY_MBR_SN,
      wrtrNcknm: MY_NICKNAME,
      lostTpofSttsCd: LOST_STTS.LOST,
      expryCrtrDt: addDays(getTodayYmd(), POST_DAYS),
      dscvSwtcDt: null,
      inqCnt: 0,
      rcmdtnCnt: 0,
      regDt: now(),
      mdfcnDt: now(),
    },
  ];
  return Promise.resolve({ lostTpofSn });
};

/** 수정: 상태·게시 종료일·조회수·좋아요는 바꾸지 않는다 */
export const updateMissing = ({ lostTpofSn, ...values }) => {
  const target = findPost(lostTpofSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('수정 권한이 없어요'));
  }
  Object.assign(target, values, { mdfcnDt: now() });
  return Promise.resolve({ lostTpofSn });
};

export const deleteMissing = (lostTpofSn) => {
  const target = findPost(lostTpofSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('삭제 권한이 없어요'));
  }
  posts = posts.filter((row) => row.lostTpofSn !== lostTpofSn);
  comments = comments.filter((row) => row.pstSn !== target.pstSn);
  return Promise.resolve();
};

/** 좋아요 토글: 바뀐 상태와 수를 돌려준다 */
export const toggleMissingLike = (pstSn) => {
  const target = findPostByPst(pstSn);
  if (!target) return Promise.reject(new Error('게시글을 찾지 못했어요'));
  if (likedSns.has(pstSn)) {
    likedSns.delete(pstSn);
    target.rcmdtnCnt -= 1;
  } else {
    likedSns.add(pstSn);
    target.rcmdtnCnt += 1;
  }
  return Promise.resolve({
    likeYn: likedSns.has(pstSn) ? 'Y' : 'N',
    rcmdtnCnt: target.rcmdtnCnt,
  });
};

/** 게시글 신고: 같은 회원이 같은 글을 두 번 신고하면 막는다 */
export const reportMissing = ({ pstSn }) => {
  if (reportedSns.has(pstSn)) {
    return Promise.reject(new Error('이미 신고한 게시글입니다'));
  }
  reportedSns.add(pstSn);
  return Promise.resolve();
};

/**
 * 찾았어요 처리: 작성자만. 상태를 바꾸고 완료 안내 댓글을 자동으로 만든다(작성자명·확인 시각)
 * 취소(되돌리기)는 없다
 */
export const markMissingFound = (lostTpofSn) => {
  const target = findPost(lostTpofSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('처리 권한이 없어요'));
  }
  if (target.lostTpofSttsCd === LOST_STTS.FOUND) {
    return Promise.reject(new Error('이미 찾았어요로 바뀐 글이에요'));
  }
  target.lostTpofSttsCd = LOST_STTS.FOUND;
  target.dscvSwtcDt = now();
  comments = [
    ...comments,
    cmnt({
      pstSn: target.pstSn,
      mbrSn: MY_MBR_SN,
      wrtrNcknm: target.wrtrNcknm,
      cmntCn: foundCommentText(target.petNm),
      minutes: 0,
      sysAutoCrtYn: 'Y',
    }),
  ];
  return Promise.resolve();
};

/** 30일 연장: 작성자, 실종 상태, 종료 7일 전부터. 중복 요청은 한 번만 늘어난다 */
export const extendMissing = (lostTpofSn) => {
  const target = findPost(lostTpofSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('연장 권한이 없어요'));
  }
  const remain = diffDays(getTodayYmd(), target.expryCrtrDt);
  if (target.lostTpofSttsCd !== LOST_STTS.LOST || remain > EXTEND_BEFORE_DAYS) {
    return Promise.reject(new Error('지금은 연장할 수 없어요'));
  }
  target.expryCrtrDt = addDays(target.expryCrtrDt, EXTEND_DAYS);
  return Promise.resolve({ expryCrtrDt: target.expryCrtrDt });
};

/** 댓글: 찾았어요 안내 댓글은 목록 맨 위에 고정한다 */
export const getMissingComments = (pstSn) => {
  const authorSn = findPostByPst(pstSn)?.mbrSn;
  return Promise.resolve(
    comments
      .filter((row) => row.pstSn === pstSn)
      .map((row) => ({
        ...row,
        mineYn: row.mbrSn === MY_MBR_SN ? 'Y' : 'N',
        authorYn: row.mbrSn === authorSn ? 'Y' : 'N',
      }))
      .toSorted(
        (a, b) =>
          (b.sysAutoCrtYn === 'Y' ? 1 : 0) - (a.sysAutoCrtYn === 'Y' ? 1 : 0),
      ),
  );
};

export const createMissingComment = ({ targetSn, prntCmntSn, cmntCn }) => {
  if (!findPostByPst(targetSn)) {
    return Promise.reject(new Error('게시글을 찾지 못했어요'));
  }
  comments = [
    ...comments,
    cmnt({
      pstSn: targetSn,
      prntCmntSn: prntCmntSn ?? null,
      mbrSn: MY_MBR_SN,
      wrtrNcknm: MY_NICKNAME,
      cmntCn,
      minutes: 0,
    }),
  ];
  return Promise.resolve();
};

export const deleteMissingComment = ({ cmntSn }) => {
  const target = comments.find((row) => row.cmntSn === cmntSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('삭제 권한이 없어요'));
  }
  target.delYn = 'Y';
  return Promise.resolve();
};

/** 댓글 신고: 같은 회원이 같은 댓글을 두 번 신고하면 막는다 */
export const reportMissingComment = ({ cmntSn }) => {
  if (reportedCmntSns.has(cmntSn)) {
    return Promise.reject(new Error('이미 신고한 댓글입니다'));
  }
  reportedCmntSns.add(cmntSn);
  return Promise.resolve();
};

/** 품종 목록: 반려동물 구분별. 품종 마스터 API(vrtySn, vrtyNm)로 바뀐다 */
export const getBreeds = (petSeCd) => Promise.resolve(BREEDS[petSeCd] ?? []);
