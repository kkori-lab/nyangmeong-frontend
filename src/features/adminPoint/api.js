import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import { PNT_DLNG_TYPE_ADMIN_ADJUST, PNT_DLNG_TYPE_GROUP } from './pointLabels';

/**
 * [관리자 포인트 API]
 * - 거래 유형 이름·회원 검색·회원 기본 정보는 실제 API
 * - 원장 목록·수동 조정은 백엔드 `/api/admin/points` 없음 -> 가짜 응답
 *   - 연결 때: GET /api/admin/points?mbrSn=&mbrNcnm=&pntDlngTypeCd=&fromDt=&toDt=&page=&size=,
 *     POST /api/admin/points/adjustments { mbrSn, dlngPnt, memoCn }, 회원 보유 포인트 응답 필드
 * - 원장 필드는 백엔드 `AdminPointLedgerSummary` 그대로 + 회원 mbrSn·mbrNcnm
 * - 조정한 값은 이 탭의 sessionStorage에 두어 새로고침해도 남음(연결 때 지움)
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 */

const STORAGE_KEY = 'fakeAdminPointLedgers';

/** 거래 유형 이름(가짜 원장용, 공통코드 MYPG03과 같다) */
const TYPE_NAMES = {
  MYPC0007: '케어미션 달성',
  MYPC0008: '아이템 구매',
  MYPC0009: '관리자 조정',
  MYPC0021: '검진기록 등록',
};

/** 가짜 회원(실제 회원 번호와 겹치지 않게 9001부터) */
const FAKE_MEMBERS = [
  { mbrSn: 9001, mbrNcnm: '초코맘' },
  { mbrSn: 9002, mbrNcnm: '나비집사' },
  { mbrSn: 9003, mbrNcnm: '보리아빠' },
  { mbrSn: 9004, mbrNcnm: '콩이네' },
  { mbrSn: 9005, mbrNcnm: '두부언니' },
];

/** 순서대로 돌려 쓰는 [유형, 증감, 메모] */
const FAKE_PATTERN = [
  ['MYPC0007', 10, '화장실 청소하기'],
  ['MYPC0007', 5, '양치하기'],
  ['MYPC0021', 20, null],
  ['MYPC0007', 10, '체중 기록하기'],
  ['MYPC0008', -30, null],
  ['MYPC0007', 20, '목욕하기'],
  ['MYPC0009', 100, '이벤트 당첨 지급'],
  ['MYPC0007', 5, '빗질하기'],
  ['MYPC0009', -50, '중복 지급 회수'],
];

const pad = (value) => String(value).padStart(2, '0');

const toDateTime = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

/** 가짜 원장 48건: 2026-10-15 09:00부터 7시간씩, 회원마다 잔액을 이어서 계산 */
const seedLedgers = () => {
  const balances = {};
  return Array.from({ length: 48 }, (_, index) => {
    const member = FAKE_MEMBERS[index % FAKE_MEMBERS.length];
    const [pntDlngTypeCd, dlngPnt, memoCn] =
      FAKE_PATTERN[index % FAKE_PATTERN.length];
    const balance = (balances[member.mbrSn] ?? 500) + dlngPnt;
    balances[member.mbrSn] = balance;
    return {
      pntGnlgrSn: index + 1,
      ...member,
      pntDlngTypeCd,
      pntDlngTypeCdNm: TYPE_NAMES[pntDlngTypeCd],
      dlngPnt,
      dlngAftrBlncPnt: balance,
      memoCn,
      regDt: toDateTime(new Date(2026, 9, 15, 9 + index * 7, 0)),
    };
  });
};

/** 저장된 가짜 값: 없거나 읽지 못하면 처음 값 */
const loadLedgers = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 못 쓰면 처음 값
  }
  return seedLedgers();
};

let fakeLedgers = loadLedgers();

const saveLedgers = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fakeLedgers));
  } catch {
    // 저장소를 못 쓰면 이 탭 메모리에만 남음
  }
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

const throwFakeError = () => {
  const fake = IS_DEV
    ? new URLSearchParams(window.location.search).get('fake')
    : null;
  if (fake === 'forbidden') {
    throw fakeError('ADMIN_ONLY', '관리자만 접근할 수 있습니다.');
  }
  if (fake === 'error') {
    throw fakeError('INTERNAL_ERROR', '서버 오류가 발생했습니다.');
  }
};

/** 그 회원의 가장 최근 원장 줄 */
const findLatestLedger = (mbrSn) =>
  fakeLedgers
    .filter((ledger) => ledger.mbrSn === mbrSn)
    .sort((a, b) => b.pntGnlgrSn - a.pntGnlgrSn)[0];

/** 거래 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getPointDealTypes = () =>
  api.get('/common-codes', { params: { prntComCd: PNT_DLNG_TYPE_GROUP } });

/** 회원 검색(조정 모달): 닉네임·이메일 검색어로 앞 10명 */
export const searchAdminPointMembers = async (q) => {
  const data = await api.get('/admin/members', {
    params: { q, page: 1, size: 10 },
  });
  return data.content;
};

/** 회원 한 명(?mbrSn= 필터 표시용): { mbrSn, mbrNcnm, ... } */
export const getAdminPointMember = async (mbrSn) => {
  const fakeMember = FAKE_MEMBERS.find((member) => member.mbrSn === mbrSn);
  if (fakeMember) return { ...fakeMember };
  return api.get(`/admin/members/${mbrSn}`);
};

/**
 * 회원 보유 포인트(가짜): 가짜 원장에 있으면 그 마지막 잔액,
 * 없으면 실제 회원 원장(회원 상세 포인트 탭 API)의 마지막 잔액, 내역이 없으면 0
 */
export const getAdminPointBalance = async (mbrSn) => {
  const latest = findLatestLedger(mbrSn);
  if (latest) {
    await delay();
    return latest.dlngAftrBlncPnt;
  }
  const data = await api.get(`/admin/members/${mbrSn}/point-ledgers`, {
    params: { page: 1, size: 1 },
  });
  return data.content[0]?.dlngAftrBlncPnt ?? 0;
};

/**
 * 포인트 원장(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·mbrSn·mbrNcnm(부분 일치)·pntDlngTypeCd·fromDt·toDt(YYYY-MM-DD)
 */
export const getAdminPointLedgers = async ({
  page = 1,
  size = 20,
  mbrSn,
  mbrNcnm,
  pntDlngTypeCd,
  fromDt,
  toDt,
} = {}) => {
  await delay();
  throwFakeError();
  const keyword = mbrNcnm?.trim();
  const filtered = fakeLedgers
    .filter((ledger) => !mbrSn || ledger.mbrSn === Number(mbrSn))
    .filter((ledger) => !keyword || ledger.mbrNcnm.includes(keyword))
    .filter(
      (ledger) => !pntDlngTypeCd || ledger.pntDlngTypeCd === pntDlngTypeCd,
    )
    .filter(({ regDt }) => !fromDt || regDt.slice(0, 10) >= fromDt)
    .filter(({ regDt }) => !toDt || regDt.slice(0, 10) <= toDt)
    .sort((a, b) => b.pntGnlgrSn - a.pntGnlgrSn);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const content = filtered
    .slice((page - 1) * size, page * size)
    .map((ledger) => ({ ...ledger }));
  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/**
 * 포인트 수동 조정(가짜): 거래 유형 '관리자 조정', 사유는 메모
 * - dlngPnt: 지급 +, 차감 -. 조정 후 잔액이 0보다 작으면 거절
 */
export const adjustAdminPoint = async ({ mbrSn, dlngPnt, memoCn }) => {
  const [balance, member] = await Promise.all([
    getAdminPointBalance(mbrSn),
    getAdminPointMember(mbrSn),
  ]);
  await delay();
  const nextBalance = balance + dlngPnt;
  if (nextBalance < 0) {
    throw fakeError(
      'POINT_BALANCE_NOT_ENOUGH',
      '보유 포인트보다 많이 차감할 수 없어요.',
    );
  }
  const pntGnlgrSn =
    Math.max(0, ...fakeLedgers.map((ledger) => ledger.pntGnlgrSn)) + 1;
  fakeLedgers = [
    {
      pntGnlgrSn,
      mbrSn,
      mbrNcnm: member.mbrNcnm,
      pntDlngTypeCd: PNT_DLNG_TYPE_ADMIN_ADJUST,
      pntDlngTypeCdNm: TYPE_NAMES[PNT_DLNG_TYPE_ADMIN_ADJUST],
      dlngPnt,
      dlngAftrBlncPnt: nextBalance,
      memoCn,
      regDt: toDateTime(new Date()),
    },
    ...fakeLedgers,
  ];
  saveLedgers();
  return null;
};
