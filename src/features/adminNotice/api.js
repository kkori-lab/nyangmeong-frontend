import { IS_DEV } from '@/api/env';
import {
  addDays,
  getNowHm,
  getTodayYmd,
  makeDateTime,
} from '@/utils/formatDate';

/**
 * [관리자 공지 가짜 API]
 * - 백엔드 /api/admin/notices 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 등록·수정은 새로고침 전까지만 남는다
 * - 개발 환경에서 ?fake=forbidden이면 403
 * - 미확정: 알림 발송 필드(ntfctnSndngYn·ntfctnSndngDt·ntfctnTrgtCnt), 대상 수 경로와 trgtCnt, 없는 공지 코드
 */

/** 가짜 공지 수 */
const NOTICE_CNT = 23;
/** 가짜 알림 대상 수(정상 회원) */
const TARGET_CNT = 1270;
/** 상단 고정 공지 번호(앞에서부터) */
const FIXED_INDEXES = [3, 10];
/** 비노출 공지 주기 */
const HIDDEN_CYCLE = 6;
/** 알림 발송 공지 주기 */
const SENT_CYCLE = 4;
/** 가짜 제목 */
const TITLES = [
  '서비스 점검 안내',
  '개인정보 처리방침 개정 안내',
  'AI 매니저 새 기능 안내',
  '커뮤니티 이용 수칙 안내',
  '포인트 정책 변경 안내',
];
/** 없는 공지 오류 */
const NOT_FOUND_ERROR = {
  code: 'NOTICE_NOT_FOUND',
  message: '공지사항을 찾을 수 없어요.',
  fields: null,
  data: null,
};

/** 가짜 공지 한 줄 */
const makeNotice = (index) => {
  const regDt = makeDateTime(addDays(getTodayYmd(), -index * 3), '10:00');
  const isSent = index % SENT_CYCLE === 0;
  return {
    ntcMttrSn: NOTICE_CNT - index,
    ntcMttrTtl: `${TITLES[index % TITLES.length]} ${NOTICE_CNT - index}`,
    ntcMttrCn: `${TITLES[index % TITLES.length]} 내용입니다.\n자세한 내용은 고객센터로 문의해 주세요.`,
    inqCnt: (NOTICE_CNT - index) * 53,
    upendFixYn: FIXED_INDEXES.includes(index),
    useYn: index % HIDDEN_CYCLE !== HIDDEN_CYCLE - 1,
    ntfctnSndngDt: isSent ? regDt : null,
    ntfctnTrgtCnt: isSent ? TARGET_CNT : null,
    regDt,
    mdfcnDt: regDt,
  };
};

/** 최신 등록순 가짜 공지 */
let notices = Array.from({ length: NOTICE_CNT }, (_, index) =>
  makeNotice(index),
);
let nextNtcMttrSn = NOTICE_CNT + 1;

/** 고정 먼저, 그다음 최신 등록순 */
const compareNotices = (a, b) =>
  Number(b.upendFixYn) - Number(a.upendFixYn) ||
  b.regDt.localeCompare(a.regDt) ||
  b.ntcMttrSn - a.ntcMttrSn;

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

/** 지금 일시 */
const getNowDateTime = () => makeDateTime(getTodayYmd(), getNowHm());

/** 번호에 맞는 공지, 없으면 오류 */
const findNotice = (ntcMttrSn) => {
  const notice = notices.find((item) => item.ntcMttrSn === ntcMttrSn);
  if (!notice) throw NOT_FOUND_ERROR;
  return notice;
};

/** 공지 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminNotices = async ({ page, size, keyword }) => {
  throwFakeError();
  const matched = notices
    .filter(({ ntcMttrTtl }) => !keyword || ntcMttrTtl.includes(keyword))
    .sort(compareNotices);
  return toPage(matched, page, size);
};

/** 공지 상세 */
export const getAdminNotice = async (ntcMttrSn) => {
  throwFakeError();
  return findNotice(ntcMttrSn);
};

/** 공지 알림 대상 수: { trgtCnt } */
export const getNoticeTargetCount = async () => {
  throwFakeError();
  return { trgtCnt: TARGET_CNT };
};

/** 공지 등록: 알림 발송을 체크하면 지금 정상 회원 전체에게 보낸다 */
export const createAdminNotice = async ({ ntfctnSndngYn, ...body }) => {
  throwFakeError();
  const now = getNowDateTime();
  const notice = {
    ...body,
    ntcMttrSn: nextNtcMttrSn,
    inqCnt: 0,
    ntfctnSndngDt: ntfctnSndngYn ? now : null,
    ntfctnTrgtCnt: ntfctnSndngYn ? TARGET_CNT : null,
    regDt: now,
    mdfcnDt: now,
  };
  nextNtcMttrSn += 1;
  notices = [notice, ...notices];
  return notice;
};

/** 공지 수정: 알림은 다시 보내지 않는다 */
export const updateAdminNotice = async ({ ntcMttrSn, ...body }) => {
  throwFakeError();
  const notice = {
    ...findNotice(ntcMttrSn),
    ...body,
    mdfcnDt: getNowDateTime(),
  };
  notices = notices.map((item) =>
    item.ntcMttrSn === ntcMttrSn ? notice : item,
  );
  return notice;
};
