import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';

/**
 * [관리자 알림 발송 이력 API]
 * - 유형·채널·결과 이름은 실제 공통코드 API, 이력 목록은 /api/admin/notification-logs 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 필드는 NOTI_SNDNG_LOG 컬럼 그대로(notiSndngLogSn·mbrSn·notiTypeCd·notiChnlCd·sndngRsltCd·rtryNmtm·failRsn·sndngDt), 수신 회원 닉네임 mbrNcnm은 가정
 * - 개발 환경에서 ?fake=forbidden이면 403, ?fake=error면 조회 오류
 * - 미확정: 경로, 기간 파라미터 이름(fromYmd·toYmd 가정)
 */

/** 알림 유형 공통코드 그룹 */
const TYPE_GROUP = 'AIMG02';
/** 알림 채널 공통코드 그룹 */
const CHANNEL_GROUP = 'AIMG03';
/** 발송 결과 공통코드 그룹 */
const RESULT_GROUP = 'AIMG04';

/** 발송 결과: 실패 코드(대시보드 "알림 발송 실패" 링크용) */
export const SNDNG_RSLT_FAIL = 'AIMC0019';

/** 알림 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getNotificationTypes = () =>
  api.get('/common-codes', { params: { prntComCd: TYPE_GROUP } });

/** 알림 채널 목록: [{ comCd, comCdNm, sortSeq }] */
export const getNotificationChannels = () =>
  api.get('/common-codes', { params: { prntComCd: CHANNEL_GROUP } });

/** 발송 결과 목록(성공·실패): [{ comCd, comCdNm, sortSeq }] */
export const getSendingResults = () =>
  api.get('/common-codes', { params: { prntComCd: RESULT_GROUP } });

const FAKE_NICKNAMES = ['초코맘', '나비집사', '보리아빠', '콩이네', '두부언니'];
const FAKE_TYPES = ['AIMC0008', 'AIMC0009', 'AIMC0010', 'AIMC0011'];
const FAKE_CHANNELS = ['AIMC0016', 'AIMC0017'];
const FAKE_FAIL_REASONS = [
  'SMTP 타임아웃',
  '수신 거부 주소',
  '메일 서버 응답 없음',
];

const pad = (value) => String(value).padStart(2, '0');

/** 가짜 이력 45건: 2026-10-30 09:00부터 1시간씩 거슬러, 7건마다 실패(재시도 3회) */
const fakeLogs = Array.from({ length: 45 }, (_, index) => {
  const time = new Date(2026, 9, 30, 9 - index, 0);
  const isFail = index % 7 === 1;
  return {
    notiSndngLogSn: 45 - index,
    mbrSn: 100 + (index % FAKE_NICKNAMES.length),
    mbrNcnm: FAKE_NICKNAMES[index % FAKE_NICKNAMES.length],
    notiTypeCd: FAKE_TYPES[index % FAKE_TYPES.length],
    notiChnlCd: isFail ? 'AIMC0016' : FAKE_CHANNELS[index % 2],
    sndngRsltCd: isFail ? SNDNG_RSLT_FAIL : 'AIMC0018',
    rtryNmtm: isFail ? 3 : 0,
    failRsn: isFail
      ? FAKE_FAIL_REASONS[index % FAKE_FAIL_REASONS.length]
      : null,
    sndngDt: `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}T${pad(time.getHours())}:00:00`,
  };
});

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

/**
 * 발송 이력 목록(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·fromYmd·toYmd·notiChnlCd·notiTypeCd·sndngRsltCd
 */
export const getAdminNotificationLogs = async ({
  page = 1,
  size = 20,
  fromYmd,
  toYmd,
  notiChnlCd,
  notiTypeCd,
  sndngRsltCd,
} = {}) => {
  throwFakeError();
  const filtered = fakeLogs
    .filter(({ sndngDt }) => !fromYmd || sndngDt.slice(0, 10) >= fromYmd)
    .filter(({ sndngDt }) => !toYmd || sndngDt.slice(0, 10) <= toYmd)
    .filter((log) => !notiChnlCd || log.notiChnlCd === notiChnlCd)
    .filter((log) => !notiTypeCd || log.notiTypeCd === notiTypeCd)
    .filter((log) => !sndngRsltCd || log.sndngRsltCd === sndngRsltCd)
    .sort((a, b) => b.sndngDt.localeCompare(a.sndngDt));
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const content = filtered
    .slice((page - 1) * size, page * size)
    .map((log) => ({ ...log }));
  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    hasNext: page < totalPages,
  };
};
