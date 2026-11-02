import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import {
  addDays,
  getNowHm,
  getTodayYmd,
  makeDateTime,
} from '@/utils/formatDate';
import {
  JOIN_PATH_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from './memberLabels';

/**
 * [관리자 회원 가짜 API]
 * - 백엔드 /api/admin/members 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 개발 환경에서 ?fake=forbidden이면 403
 * - 미확정: 조회 조건 이름(q·status·joinPath·role·bgngYmd·endYmd·type), maskedAcntEml, 정지 필드(suspn*), 정지 목록 경로
 * - 미확정: 회원 상세·탭 경로와 필드(maskedMblTelno·snsOffrCds·blncPnt·jntBrupCnt·trmsVerNo 등)
 * - 탈퇴 회원 목록은 실제 API
 */

/** 가짜 회원 수 */
const MEMBER_CNT = 170;
/** 닉네임 앞부분 */
const NICKNAMES = ['초코맘', '나비집사', '보리아빠', '콩이누나', '두부형'];
/** 메일 도메인 */
const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'kakao.com'];
/** 정지 회원 주기 */
const SUSPENDED_CYCLE = 7;
/** 탈퇴 회원 주기 */
const WITHDRAWN_CYCLE = 4;
/** 관리자 주기 */
const ADMIN_CYCLE = 19;
/** 영구 정지 주기 */
const PERMANENT_CYCLE = 3;
/** 가짜 처리 관리자 */
const FAKE_ADMIN_NCNM = '관리자01';
/** 가짜 정지 사유 */
const SUSPENSION_REASONS = ['욕설 반복', '광고 도배', '허위 신고 반복'];
/** 정지 거절 오류 */
const SUSPEND_REJECTED_ERROR = {
  code: 'MEMBER_NOT_SUSPENDABLE',
  message: '정지할 수 없는 회원이에요.',
  fields: null,
  data: null,
};

/** 번호에 맞는 상태 코드 */
const getStatusCode = (index) => {
  if (index % ADMIN_CYCLE === 0) return STATUS_OPTIONS[0].value;
  if (index % SUSPENDED_CYCLE === SUSPENDED_CYCLE - 1) {
    return STATUS_OPTIONS[1].value;
  }
  if (index % WITHDRAWN_CYCLE === WITHDRAWN_CYCLE - 1) {
    return STATUS_OPTIONS[2].value;
  }
  return STATUS_OPTIONS[0].value;
};

/** 가짜 회원 한 줄 */
const makeMember = (index) => {
  const regYmd = addDays(getTodayYmd(), -index * 2);
  return {
    mbrSn: MEMBER_CNT - index,
    mbrNcnm: `${NICKNAMES[index % NICKNAMES.length]}${index + 1}`,
    acntEml: `user${index + 1}@${EMAIL_DOMAINS[index % EMAIL_DOMAINS.length]}`,
    joinPathCd: JOIN_PATH_OPTIONS[index % JOIN_PATH_OPTIONS.length].value,
    mbrSttsCd: getStatusCode(index),
    mbrAuthrtCd: ROLE_OPTIONS[index % ADMIN_CYCLE === 0 ? 1 : 0].value,
    regDt: makeDateTime(regYmd, '10:30'),
    lastLgnDt:
      index % 5 === 4 ? null : makeDateTime(addDays(regYmd, 1), '14:02'),
  };
};

/** 최신 가입순 가짜 회원 */
const members = Array.from({ length: MEMBER_CNT }, (_, index) =>
  makeMember(index),
);

/** 처음부터 정지 중인 회원의 가짜 정지 한 줄 */
const makeSuspension = ({ mbrSn, mbrNcnm }, index) => ({
  mbrSn,
  mbrNcnm,
  suspnDt: makeDateTime(addDays(getTodayYmd(), -index - 1), '10:00'),
  suspnEndDt:
    index % PERMANENT_CYCLE === PERMANENT_CYCLE - 1
      ? null
      : makeDateTime(addDays(getTodayYmd(), 7 + index), '00:00'),
  suspnRsn: SUSPENSION_REASONS[index % SUSPENSION_REASONS.length],
  prcrNcnm: FAKE_ADMIN_NCNM,
});

/** 최신 정지순 가짜 정지 회원 */
const suspensions = members
  .filter(({ mbrSttsCd }) => mbrSttsCd === STATUS_OPTIONS[1].value)
  .map(makeSuspension);

/** 처음부터 정지·탈퇴 상태인 회원의 가짜 상태 이력 */
const statusHistories = [
  ...suspensions.map(({ mbrSn, suspnDt, suspnRsn, prcrNcnm }) => ({
    mbrSn,
    bfrSttsCd: STATUS_OPTIONS[0].value,
    aftrSttsCd: STATUS_OPTIONS[1].value,
    chgRsn: suspnRsn,
    prcrNcnm,
    chgDt: suspnDt,
  })),
  ...members
    .filter(({ mbrSttsCd }) => mbrSttsCd === STATUS_OPTIONS[2].value)
    .map(({ mbrSn, regDt }) => ({
      mbrSn,
      bfrSttsCd: STATUS_OPTIONS[0].value,
      aftrSttsCd: STATUS_OPTIONS[2].value,
      chgRsn: '회원 탈퇴',
      prcrNcnm: null,
      chgDt: makeDateTime(addDays(regDt.slice(0, 10), 1), '09:00'),
    })),
];

/** 가짜 포인트 원장 한 줄의 증감·유형·메모 */
const POINT_ENTRIES = [
  { dlngPnt: 100, pntDlngTypeCd: 'MYPC0007', memoCn: '일일 미션' },
  { dlngPnt: 50, pntDlngTypeCd: 'MYPC0021', memoCn: '검진 기록 등록' },
  { dlngPnt: -100, pntDlngTypeCd: 'MYPC0008', memoCn: '아이템 구매' },
];
/** 가짜 포인트 원장 건수 */
const POINT_CNT = 45;

/** 최신순 가짜 포인트 원장: 번호가 3의 배수면 내역 없음 */
const getPointLedger = ({ mbrSn }) => {
  if (mbrSn % 3 === 0) return [];
  let dlngAftrBlncPnt = 0;
  return Array.from({ length: POINT_CNT }, (_, index) => {
    const entry = POINT_ENTRIES[index % POINT_ENTRIES.length];
    dlngAftrBlncPnt += entry.dlngPnt;
    return {
      ...entry,
      pntGnlgrSn: index + 1,
      dlngAftrBlncPnt,
      regDt: makeDateTime(addDays(getTodayYmd(), index - POINT_CNT), '09:00'),
    };
  }).reverse();
};

/** 쪽 나눈 응답: { content, page, size, totalElements, totalPages, hasNext } */
const toPage = (matched, page, size) => {
  const start = (page - 1) * size;
  const totalPages = Math.ceil(matched.length / size);
  return {
    content: matched.slice(start, start + size),
    page,
    size,
    totalElements: matched.length,
    totalPages,
    hasNext: page < totalPages,
  };
};

/** 번호에 맞는 회원: 없으면 404 */
const findMember = (mbrSn) => {
  const member = members.find((item) => item.mbrSn === mbrSn);
  if (member) return member;
  throw {
    code: 'MEMBER_NOT_FOUND',
    message: '회원을 찾을 수 없습니다.',
    fields: null,
    data: null,
  };
};

/** 소셜 연동 제공자: 이메일 가입 회원은 일부만 카카오 연동 */
const getSnsOffrCds = ({ mbrSn, joinPathCd }) => {
  if (joinPathCd !== JOIN_PATH_OPTIONS[0].value) return [joinPathCd];
  return mbrSn % 2 === 0 ? [JOIN_PATH_OPTIONS[2].value] : [];
};

/** 회원 상태 변경과 상태 이력 추가 */
const changeMemberStatus = (member, aftrSttsCd, chgRsn) => {
  statusHistories.unshift({
    mbrSn: member.mbrSn,
    bfrSttsCd: member.mbrSttsCd,
    aftrSttsCd,
    chgRsn,
    prcrNcnm: FAKE_ADMIN_NCNM,
    chgDt: makeDateTime(getTodayYmd(), getNowHm()),
  });
  member.mbrSttsCd = aftrSttsCd;
};

/** 앞 3자만 남긴 이메일 */
const maskEmail = (acntEml) => {
  const [local, domain] = acntEml.split('@');
  return `${local.slice(0, 3)}***@${domain}`;
};

/** 닉네임 부분 일치·이메일 완전 일치 */
const matchesKeyword = ({ mbrNcnm, acntEml }, q) => {
  if (!q) return true;
  return q.includes('@') ? acntEml === q : mbrNcnm.includes(q);
};

/** 검색·필터 전부 맞는 회원인지 */
const matchesFilter = (
  member,
  { q, status, joinPath, role, bgngYmd, endYmd },
) => {
  const regYmd = member.regDt.slice(0, 10);
  return (
    matchesKeyword(member, q) &&
    (!status || member.mbrSttsCd === status) &&
    (!joinPath || member.joinPathCd === joinPath) &&
    (!role || member.mbrAuthrtCd === role) &&
    (!bgngYmd || regYmd >= bgngYmd) &&
    (!endYmd || regYmd <= endYmd)
  );
};

/** ?fake= 값에 따른 가짜 오류 */
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
};

/** ?fake=suspendRejected 값인지 */
const isSuspendRejected = () =>
  IS_DEV &&
  new URLSearchParams(window.location.search).get('fake') === 'suspendRejected';

/** 정지 종류가 맞는지 */
const matchesSuspensionType = ({ suspnEndDt }, type) => {
  if (!type) return true;
  return (suspnEndDt === null) === (type === 'PERMANENT');
};

/** 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMembers = async ({ page, size, ...filter }) => {
  throwFakeError();
  const matched = members
    .filter((member) => matchesFilter(member, filter))
    .map(({ acntEml, ...member }) => ({
      ...member,
      maskedAcntEml: maskEmail(acntEml),
    }));
  return toPage(matched, page, size);
};

/** 회원 상세 기본 정보 */
export const getAdminMember = async (mbrSn) => {
  throwFakeError();
  const { acntEml, ...member } = findMember(mbrSn);
  return {
    ...member,
    maskedAcntEml: maskEmail(acntEml),
    maskedMblTelno: `010-****-${1000 + mbrSn}`,
    snsOffrCds: getSnsOffrCds(member),
    blncPnt: getPointLedger(member)[0]?.dlngAftrBlncPnt ?? 0,
    suspnEndDt:
      suspensions.find((item) => item.mbrSn === mbrSn)?.suspnEndDt ?? null,
  };
};

/** 회원의 반려동물 */
export const getAdminMemberPets = async (mbrSn) => {
  const { mbrSttsCd } = findMember(mbrSn);
  if (mbrSn % 5 === 0) return [];
  return [
    {
      petSn: mbrSn * 10 + 1,
      petNm: '나비',
      petSeNm: '고양이',
      vrtyNm: '코리안숏헤어',
      brupRoleNm: '주양육자',
      jntBrupCnt: 2,
      delYn: 'N',
    },
    {
      petSn: mbrSn * 10 + 2,
      petNm: '초코',
      petSeNm: '강아지',
      vrtyNm: '푸들',
      brupRoleNm: '공동양육자',
      jntBrupCnt: 3,
      delYn: mbrSttsCd === STATUS_OPTIONS[2].value ? 'Y' : 'N',
    },
  ];
};

/** 회원의 약관 동의 */
export const getAdminMemberTerms = async (mbrSn) => {
  const { regDt } = findMember(mbrSn);
  const isMarketingAgreed = mbrSn % 2 === 0;
  return [
    {
      trmsNm: '서비스 이용약관',
      trmsVerNo: 'v1.0',
      agreYn: 'Y',
      agreDt: regDt,
    },
    {
      trmsNm: '개인정보 처리방침',
      trmsVerNo: 'v1.1',
      agreYn: 'Y',
      agreDt: regDt,
    },
    {
      trmsNm: '마케팅 수신 동의',
      trmsVerNo: 'v1.0',
      agreYn: isMarketingAgreed ? 'Y' : 'N',
      agreDt: isMarketingAgreed ? regDt : null,
    },
  ];
};

/** 회원의 포인트 원장: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberPoints = async ({ mbrSn, page, size }) =>
  toPage(getPointLedger(findMember(mbrSn)), page, size);

/** 회원의 상태 이력: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberStatusHistories = async ({ mbrSn, page, size }) => {
  findMember(mbrSn);
  return toPage(
    statusHistories.filter((history) => history.mbrSn === mbrSn),
    page,
    size,
  );
};

/** 정지 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminSuspensions = async ({ page, size, q, type }) => {
  throwFakeError();
  const matched = suspensions.filter(
    (suspension) =>
      (!q || suspension.mbrNcnm.includes(q)) &&
      matchesSuspensionType(suspension, type),
  );
  return toPage(matched, page, size);
};

/** 탈퇴 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminWithdrawnMembers = (params) =>
  api.get('/admin/members/withdrawn', { params });

/** 회원 정지: suspnDayCnt가 null이면 영구 */
export const suspendMember = async ({ mbrSn, suspnDayCnt, suspnRsn }) => {
  const member = members.find((item) => item.mbrSn === mbrSn);
  const isSuspendable =
    member?.mbrSttsCd === STATUS_OPTIONS[0].value &&
    member.mbrAuthrtCd === ROLE_OPTIONS[0].value;
  if (isSuspendRejected() || !isSuspendable) throw SUSPEND_REJECTED_ERROR;

  changeMemberStatus(member, STATUS_OPTIONS[1].value, suspnRsn);
  const today = getTodayYmd();
  suspensions.unshift({
    mbrSn,
    mbrNcnm: member.mbrNcnm,
    suspnDt: makeDateTime(today, getNowHm()),
    suspnEndDt: suspnDayCnt
      ? makeDateTime(addDays(today, suspnDayCnt), '00:00')
      : null,
    suspnRsn,
    prcrNcnm: FAKE_ADMIN_NCNM,
  });
};

/** 정지 해제 */
export const releaseMember = async ({ mbrSn, rlsRsn }) => {
  const member = members.find((item) => item.mbrSn === mbrSn);
  changeMemberStatus(member, STATUS_OPTIONS[0].value, rlsRsn);
  suspensions.splice(
    suspensions.findIndex((item) => item.mbrSn === mbrSn),
    1,
  );
};

/** 관리자 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdmins = (params) => api.get('/admin/admins', { params });

/** 관리자 지정 대상 회원 검색: { content, page, size, totalElements, totalPages, hasNext } */
export const getAppointableMembers = (params) =>
  api.get('/admin/members', { params });

/** 관리자 지정 */
export const appointAdmin = (mbrSn) => api.post(`/admin/admins/${mbrSn}`);

/** 관리자 해제 */
export const releaseAdmin = (mbrSn) => api.delete(`/admin/admins/${mbrSn}`);
