import { IS_DEV } from '@/api/env';
import { addDays, getTodayYmd, makeDateTime } from '@/utils/formatDate';
import {
  JOIN_PATH_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from './memberLabels';

/**
 * [관리자 회원 가짜 API]
 * - 백엔드 /api/admin/members 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 개발 환경에서 ?fake=forbidden이면 403
 * - 미확정: 조회 조건 이름(q·status·joinPath·role·bgngYmd·endYmd), maskedAcntEml
 */

/** 가짜 회원 수 */
const MEMBER_CNT = 57;
/** 닉네임 앞부분 */
const NICKNAMES = ['초코맘', '나비집사', '보리아빠', '콩이누나', '두부형'];
/** 메일 도메인 */
const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'kakao.com'];
/** 정지 회원 주기 */
const SUSPENDED_CYCLE = 7;
/** 탈퇴 회원 주기 */
const WITHDRAWN_CYCLE = 11;
/** 관리자 주기 */
const ADMIN_CYCLE = 19;

/** 번호에 맞는 상태 코드 */
const getStatusCode = (index) => {
  if (index % WITHDRAWN_CYCLE === WITHDRAWN_CYCLE - 1) {
    return STATUS_OPTIONS[2].value;
  }
  if (index % SUSPENDED_CYCLE === SUSPENDED_CYCLE - 1) {
    return STATUS_OPTIONS[1].value;
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

/** 회원 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminMembers = async ({ page, size, ...filter }) => {
  throwFakeError();
  const matched = members.filter((member) => matchesFilter(member, filter));
  const start = (page - 1) * size;
  const totalPages = Math.ceil(matched.length / size);
  return {
    content: matched
      .slice(start, start + size)
      .map(({ acntEml, ...member }) => ({
        ...member,
        maskedAcntEml: maskEmail(acntEml),
      })),
    page,
    size,
    totalElements: matched.length,
    totalPages,
    hasNext: page < totalPages,
  };
};
