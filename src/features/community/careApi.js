import { addDays, getTodayYmd, toYmd } from '@/utils/formatDate';
import { PET_SE } from '@/utils/petCodes';
import {
  CST_UNIT,
  PET_SIZE_OPTIONS,
  PRTC_SHP_OPTIONS,
  RCRT_STTS,
} from './careCodes';

/**
 * [우리동네 펫돌봄 가짜 응답]
 * - 돌봄 모집 게시글·좋아요·신고 API(KSJ 백엔드) 연결 전: api.get()·post()로 교체. 채팅은 LJS의 채팅 창(useChatWindow)으로 연결
 * - 키는 ERD(PST·PET_PRTC_RCRT·RCRT_PET_KND·RCRT_PRTC_SHP 컬럼)를 camelCase로 바꾼 것. 돌봄 글은 PST(1) + PET_PRTC_RCRT(1)를 서버가 합친다는 가정
 *   [PST] pstSn, pstTtl, pstCn, inqCnt, rcmdtnCnt, regDt, mdfcnDt
 *   [PET_PRTC_RCRT] petPrtcRcrtSn, rcrtSttsCd, cstUnitCd, cstAmt, rlsRgnNm, prtcBgngDt, prtcEndDt, schdlCnsltnPsbltyYn, utztnRulAgreYn
 *   [RCRT_PET_KND] petKnds: [{ petSeCd, petSizeCd(가정, ERD는 PET_BDWG 체중), vrtyNm(VRTY_SN의 품종명), vrtyDrctInptNm }]
 *   [RCRT_PRTC_SHP] prtcShpCds: [PRTC_SHP_CD]
 * - ERD에 없어 서버가 계산한다고 가정한 값: sggNm·emdNm(RGN_SN), wrtrNcknm, chatCnt(이 글로 채팅 중인 사람 수), chatYn(내가 채팅 중),
 *   likeYn, mineYn, thmbUrlPath, atchFiles, mtchSttrNcknm(매칭된 돌보미 닉네임)
 * - 상세 주소(PRTC_PLC_DADDR_ENC)와 정확한 좌표(PRTC_PLC_LAT·LOT)는 저장만 하고 응답에는 넣지 않는다(공개 응답 제외)
 * - 좋아요·신고·채팅은 pstSn, 상세·수정·삭제는 petPrtcRcrtSn 기준
 * - 로그인 전이라 내 회원번호는 MY_MBR_SN으로 고정
 */
const MY_MBR_SN = 1;
const MY_NICKNAME = '토리맘';

const pad = (value) => String(value).padStart(2, '0');

/** 지금부터 minutes분 전 시각 'YYYY-MM-DD HH:mm:00' */
const ago = (minutes) => {
  const date = new Date(Date.now() - minutes * 60000);
  return `${toYmd(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const now = () => ago(0);

/** 오늘로부터 days일 뒤 날짜의 hh:mm */
const at = (days, hhmm) => `${addDays(getTodayYmd(), days)} ${hhmm}:00`;

const SIZE = Object.fromEntries(
  PET_SIZE_OPTIONS.map((option) => [option.filter, option.code]),
);
const SHP = Object.fromEntries(
  PRTC_SHP_OPTIONS.map((option, index) => [
    ['visit', 'stay', 'walk', 'play', 'train', 'etc'][index],
    option.code,
  ]),
);

let nextRcrtSn = 1;
const rcrt = ({
  title,
  body,
  nickname,
  mbrSn,
  sggNm,
  emdNm,
  kinds,
  shapes,
  unit = CST_UNIT.CASE,
  amount,
  from = null,
  to = null,
  nego = 'N',
  status = RCRT_STTS.OPEN,
  minutes,
  chatCnt = 0,
  chatYn = 'N',
  sitter = null,
  inqCnt = 0,
  rcmdtnCnt = 0,
}) => {
  const petPrtcRcrtSn = nextRcrtSn++;
  return {
    petPrtcRcrtSn,
    pstSn: 200 + petPrtcRcrtSn,
    mbrSn,
    wrtrNcknm: nickname,
    pstTtl: title,
    pstCn: body,
    inqCnt,
    rcmdtnCnt,
    regDt: ago(minutes),
    mdfcnDt: ago(minutes),
    rcrtSttsCd: status,
    cstUnitCd: unit,
    cstAmt: amount,
    sggNm,
    emdNm,
    rlsRgnNm: `${emdNm} 인근`,
    prtcBgngDt: from,
    prtcEndDt: to,
    schdlCnsltnPsbltyYn: nego,
    utztnRulAgreYn: 'Y',
    petKnds: kinds,
    prtcShpCds: shapes.map((key) => SHP[key]),
    atchFiles: [],
    chatCnt,
    chatYn,
    mtchSttrNcknm: sitter,
    prtcPlcDaddr: `전북 ${sggNm} ${emdNm} 1-1`,
    prtcPlcLat: 35.8,
    prtcPlcLot: 127.1,
  };
};

const dog = (size, vrtyNm) => ({
  petSeCd: PET_SE.DOG,
  petSizeCd: SIZE[size],
  vrtyNm,
  vrtyDrctInptNm: null,
});
const cat = (vrtyNm) => ({
  petSeCd: PET_SE.CAT,
  petSizeCd: null,
  vrtyNm,
  vrtyDrctInptNm: null,
});

let posts = [
  rcrt({
    title: '보리(몰티즈) 저녁 산책 도와주실 분 구해요',
    body: '순하고 사람을 잘 따르는 아이예요. 목줄만 잡아주시면 크게 어려운 점 없어요.\n\n화·목 저녁에 정기적으로 부탁드리고 싶습니다. 산책 후 발 닦기까지 도와주시면 감사해요!',
    nickname: MY_NICKNAME,
    mbrSn: MY_MBR_SN,
    sggNm: '전주시 완산구',
    emdNm: '서곡동',
    kinds: [dog('s', '몰티즈')],
    shapes: ['walk'],
    unit: CST_UNIT.HOUR,
    amount: 15000,
    from: at(3, '19:00'),
    to: at(30, '19:30'),
    minutes: 60,
    chatCnt: 3,
    inqCnt: 64,
    rcmdtnCnt: 12,
  }),
  rcrt({
    title: '콩이(푸들) 주말 산책 도우미 구해요',
    body: '토·일 오전에 1시간 정도 산책 도와주실 분 찾아요. 공원 산책 위주라 크게 힘들지 않아요. 강아지 좋아하시는 분이면 더 좋아요!',
    nickname: '산책왕',
    mbrSn: 21,
    sggNm: '전주시 덕진구',
    emdNm: '인후동',
    kinds: [dog('m', '푸들')],
    shapes: ['walk', 'play'],
    amount: 15000,
    from: at(5, '10:00'),
    to: at(19, '11:00'),
    minutes: 180,
    chatCnt: 1,
    chatYn: 'Y',
    inqCnt: 31,
    rcmdtnCnt: 4,
  }),
  rcrt({
    title: '까망이(고양이) 하루 방문돌봄 구해요',
    body: '수요일 하루 집을 비워서 저녁에 밥과 물, 화장실 정리를 부탁드려요. 겁이 좀 많아서 천천히 다가가 주시면 좋아요.',
    nickname: '까망이집사',
    mbrSn: 22,
    sggNm: '전주시 덕진구',
    emdNm: '금암동',
    kinds: [cat('코리안 숏헤어')],
    shapes: ['visit'],
    amount: 20000,
    from: at(2, '18:00'),
    to: at(2, '19:00'),
    minutes: 300,
    inqCnt: 12,
  }),
  rcrt({
    title: '두부(믹스견) 평일 낮 산책 부탁드려요',
    body: '평일 낮 2시쯤 40분 정도 짧게 산책시켜 주실 분과 매칭됐어요. 문의 주셔서 감사합니다!',
    nickname: '효자동집사',
    mbrSn: 23,
    sggNm: '전주시 완산구',
    emdNm: '효자동',
    kinds: [dog('l', '믹스견')],
    shapes: ['walk'],
    unit: CST_UNIT.HOUR,
    amount: 12000,
    from: at(1, '14:00'),
    to: at(18, '14:40'),
    status: RCRT_STTS.MATCHED,
    minutes: 60 * 24,
    chatCnt: 5,
    inqCnt: 88,
    rcmdtnCnt: 6,
  }),
  rcrt({
    title: '출장 기간 4박 5일 위탁돌봄 부탁드려요',
    body: '출장이라 맡아주실 분을 찾아요. 배변 훈련 잘 되어 있고 혼자서도 잘 지내요. 사료와 간식은 챙겨 드려요.',
    nickname: '나운동콩떡',
    mbrSn: 24,
    sggNm: '군산시',
    emdNm: '나운동',
    kinds: [dog('s', '시츄')],
    shapes: ['stay'],
    amount: 150000,
    from: at(6, '10:00'),
    to: at(10, '18:00'),
    minutes: 60 * 26,
    chatCnt: 2,
    inqCnt: 40,
  }),
  rcrt({
    title: '별이(시츄) 이번 주 단기 산책 구해요',
    body: '이번 주 3회, 30분씩 짧게 산책 도와주실 분과 매칭됐어요. 관심 가져주신 모든 분들 감사드려요!',
    nickname: '서신동별이맘',
    mbrSn: 25,
    sggNm: '전주시 완산구',
    emdNm: '서신동',
    kinds: [dog('s', '시츄')],
    shapes: ['walk'],
    amount: 8000,
    from: at(-1, '17:00'),
    to: at(3, '17:30'),
    status: RCRT_STTS.MATCHED,
    minutes: 60 * 48,
    chatCnt: 4,
    chatYn: 'Y',
    sitter: '나의돌보미',
    inqCnt: 54,
  }),
  rcrt({
    title: '주말 이틀, 고양이 두 마리 방문돌봄',
    body: '토·일 하루 한 번 방문해서 밥 주고 20분 정도 놀아주실 분 구해요. 사람을 좋아하는 아이들이라 금방 친해질 거예요.',
    nickname: '영등동냥집사',
    mbrSn: 26,
    sggNm: '익산시',
    emdNm: '영등동',
    kinds: [cat('러시안 블루'), cat('샴')],
    shapes: ['visit', 'play'],
    amount: 25000,
    from: at(4, '10:00'),
    to: at(5, '11:00'),
    minutes: 60 * 50,
    chatCnt: 0,
    inqCnt: 9,
  }),
  rcrt({
    title: '나비(고양이) 산책 동행 완료했어요',
    body: '지난주에 무사히 산책 동행 마쳤어요. 시간 맞춰 꼼꼼하게 챙겨주셔서 정말 감사했습니다. 다음에 또 부탁드릴게요!',
    nickname: '중화산동나비',
    mbrSn: 27,
    sggNm: '전주시 완산구',
    emdNm: '중화산동',
    kinds: [cat('브리티시 숏헤어')],
    shapes: ['walk'],
    amount: 6000,
    from: at(-8, '16:00'),
    to: at(-8, '16:40'),
    status: RCRT_STTS.DONE,
    minutes: 60 * 24 * 7,
    chatCnt: 3,
    sitter: '고양이친구',
    inqCnt: 77,
    rcmdtnCnt: 9,
  }),
  rcrt({
    title: '푸들 두 마리 훈련 도와주실 훈련사님',
    body: '기본 훈련(앉아·기다려)을 복습시켜 주실 분을 찾아요. 간식 보상 위주로 부탁드려요.',
    nickname: '삼천동푸들',
    mbrSn: 28,
    sggNm: '전주시 완산구',
    emdNm: '삼천동',
    kinds: [dog('s', '푸들')],
    shapes: ['train'],
    unit: CST_UNIT.HOUR,
    amount: 20000,
    nego: 'Y',
    minutes: 60 * 55,
    chatCnt: 1,
    inqCnt: 21,
  }),
  rcrt({
    title: '완주 봉동 대형견 산책 부탁드려요',
    body: '체력이 좋은 아이라 30분 이상 걸을 수 있는 분이면 좋겠어요.',
    nickname: '봉동골든',
    mbrSn: 29,
    sggNm: '완주군',
    emdNm: '봉동읍',
    kinds: [dog('l', '골든 리트리버')],
    shapes: ['walk'],
    unit: CST_UNIT.HOUR,
    amount: 11000,
    from: at(7, '08:00'),
    to: at(21, '08:30'),
    minutes: 60 * 60,
    chatCnt: 0,
    inqCnt: 15,
  }),
  rcrt({
    title: '말티푸 하루 위탁돌봄 가능하신 분',
    body: '당일치기 위탁돌봄이 필요해요. 사료와 배변패드는 챙겨 드려요.',
    nickname: '덕진동말티푸',
    mbrSn: 30,
    sggNm: '전주시 덕진구',
    emdNm: '덕진동',
    kinds: [
      {
        petSeCd: PET_SE.DOG,
        petSizeCd: SIZE.s,
        vrtyNm: null,
        vrtyDrctInptNm: '말티푸',
      },
    ],
    shapes: ['stay'],
    amount: 40000,
    from: at(8, '09:00'),
    to: at(8, '18:00'),
    minutes: 60 * 70,
    chatCnt: 2,
    inqCnt: 19,
  }),
  rcrt({
    title: '고양이 두 마리 주 2회 방문 급여',
    body: '월·목 저녁에 방문해서 밥과 물을 챙겨 주세요. 현관 비밀번호는 채팅에서 알려 드려요.',
    nickname: '송천동냥이',
    mbrSn: 31,
    sggNm: '전주시 덕진구',
    emdNm: '송천동',
    kinds: [cat('먼치킨')],
    shapes: ['visit'],
    amount: 12000,
    from: at(9, '19:00'),
    to: at(30, '19:30'),
    minutes: 60 * 80,
    chatCnt: 1,
    inqCnt: 11,
  }),
];

const likedSns = new Set();
const reportedSns = new Set();
const viewedSns = new Set();

const findPost = (petPrtcRcrtSn) =>
  posts.find((row) => row.petPrtcRcrtSn === petPrtcRcrtSn);

const findPostByPst = (pstSn) => posts.find((row) => row.pstSn === pstSn);

/** 응답에서 상세 주소·정확한 좌표 제외 */
const PRIVATE_KEYS = ['prtcPlcDaddr', 'prtcPlcLat', 'prtcPlcLot'];

const toSummary = (row) => ({
  ...Object.fromEntries(
    Object.entries(row).filter(([key]) => !PRIVATE_KEYS.includes(key)),
  ),
  likeYn: likedSns.has(row.pstSn) ? 'Y' : 'N',
  mineYn: row.mbrSn === MY_MBR_SN ? 'Y' : 'N',
  thmbUrlPath: row.atchFiles[0]?.url ?? null,
});

const matchesRegion = (row, sggNm, emdNm) => {
  if (!sggNm) return true;
  const sameRegion =
    sggNm === '전주시' ? row.sggNm.startsWith('전주시') : row.sggNm === sggNm;
  return sameRegion && (!emdNm || row.emdNm === emdNm);
};

/** 돌봄 기간이 고른 날짜 범위와 하루라도 겹치는지. 일정 미정 글은 날짜를 고르면 제외 */
const matchesDates = (row, fromDate, toDate) => {
  if (!fromDate && !toDate) return true;
  if (!row.prtcBgngDt) return false;
  return (
    (!fromDate || row.prtcEndDt.slice(0, 10) >= fromDate) &&
    (!toDate || row.prtcBgngDt.slice(0, 10) <= toDate)
  );
};

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

/** 목록: 상태·지역·돌봄 날짜·반려동물·반려견 크기·내 글만 보기를 모두 만족(AND), 최신순 */
export const getCareList = ({
  page = 1,
  size = 10,
  rcrtSttsCd = '',
  sggNm = '',
  emdNm = '',
  fromDate = '',
  toDate = '',
  petSeCd = '',
  petSizeCd = '',
  mineOnly = false,
} = {}) => {
  const matched = posts
    .filter(
      (row) =>
        (!rcrtSttsCd || row.rcrtSttsCd === rcrtSttsCd) &&
        (!mineOnly || row.mbrSn === MY_MBR_SN) &&
        (!petSeCd || row.petKnds.some((kind) => kind.petSeCd === petSeCd)) &&
        (!petSizeCd ||
          row.petKnds.some((kind) => kind.petSizeCd === petSizeCd)) &&
        matchesRegion(row, sggNm, emdNm) &&
        matchesDates(row, fromDate, toDate),
    )
    .toSorted(
      (a, b) =>
        b.regDt.localeCompare(a.regDt) || b.petPrtcRcrtSn - a.petPrtcRcrtSn,
    )
    .map(toSummary);
  return Promise.resolve(paged(matched, page, size));
};

/** 상세: 같은 사용자의 조회수는 한 번만 올린다(가짜는 새로고침 전까지) */
export const getCare = (petPrtcRcrtSn) => {
  const target = findPost(petPrtcRcrtSn);
  if (!target) return Promise.reject(new Error('게시글을 찾지 못했어요'));
  if (!viewedSns.has(petPrtcRcrtSn)) {
    viewedSns.add(petPrtcRcrtSn);
    target.inqCnt += 1;
  }
  return Promise.resolve(toSummary(target));
};

/** 등록: 모집중 상태로 생성. 돌봄 지역(sggNm, emdNm)은 고른 장소에서 결정(역지오코딩은 서버) */
export const createCare = (values) => {
  const petPrtcRcrtSn =
    Math.max(0, ...posts.map((row) => row.petPrtcRcrtSn)) + 1;
  const pstSn = Math.max(0, ...posts.map((row) => row.pstSn)) + 1;
  posts = [
    ...posts,
    {
      ...values,
      petPrtcRcrtSn,
      pstSn,
      mbrSn: MY_MBR_SN,
      wrtrNcknm: MY_NICKNAME,
      rcrtSttsCd: RCRT_STTS.OPEN,
      utztnRulAgreYn: 'Y',
      chatCnt: 0,
      chatYn: 'N',
      mtchSttrNcknm: null,
      inqCnt: 0,
      rcmdtnCnt: 0,
      regDt: now(),
      mdfcnDt: now(),
    },
  ];
  return Promise.resolve({ petPrtcRcrtSn });
};

/** 수정: 상태·조회수·좋아요·채팅은 변경 없음. 장소를 다시 고르지 않으면 장소 값 유지 */
export const updateCare = ({ petPrtcRcrtSn, ...values }) => {
  const target = findPost(petPrtcRcrtSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('수정 권한이 없어요'));
  }
  Object.assign(target, values, { mdfcnDt: now() });
  return Promise.resolve({ petPrtcRcrtSn });
};

export const deleteCare = (petPrtcRcrtSn) => {
  const target = findPost(petPrtcRcrtSn);
  if (!target || target.mbrSn !== MY_MBR_SN) {
    return Promise.reject(new Error('삭제 권한이 없어요'));
  }
  posts = posts.filter((row) => row.petPrtcRcrtSn !== petPrtcRcrtSn);
  return Promise.resolve();
};

/** 좋아요 토글: 바뀐 상태와 수 반환 */
export const toggleCareLike = (pstSn) => {
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

/** 게시글 신고: 같은 회원이 같은 글을 두 번 신고하면 차단 */
export const reportCare = ({ pstSn }) => {
  if (reportedSns.has(pstSn)) {
    return Promise.reject(new Error('이미 신고한 게시글이에요'));
  }
  reportedSns.add(pstSn);
  return Promise.resolve();
};
