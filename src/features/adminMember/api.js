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
 * - 회원 상세·탭, 탈퇴 회원 목록은 실제 API
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
export const getAdminMember = (mbrSn) => api.get(`/admin/members/${mbrSn}`);

/** 회원의 반려동물: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberPets = ({ mbrSn, ...params }) =>
  api.get(`/admin/members/${mbrSn}/pets`, { params });

/** 회원의 약관 동의 */
export const getAdminMemberTerms = (mbrSn) =>
  api.get(`/admin/members/${mbrSn}/terms-agreements`);

/** 회원의 포인트 원장: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberPoints = ({ mbrSn, ...params }) =>
  api.get(`/admin/members/${mbrSn}/point-ledgers`, { params });

/** 회원의 상태 이력: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMemberStatusHistories = ({ mbrSn, ...params }) =>
  api.get(`/admin/members/${mbrSn}/status-histories`, { params });

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

  member.mbrSttsCd = STATUS_OPTIONS[1].value;
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
export const releaseMember = async ({ mbrSn }) => {
  const member = members.find((item) => item.mbrSn === mbrSn);
  member.mbrSttsCd = STATUS_OPTIONS[0].value;
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
