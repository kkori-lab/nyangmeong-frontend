import { api } from '@/api/axios';

/**
 * [관리자 알림 발송 이력 API]
 * - 유형·채널·결과 이름은 공통코드 API, 이력 목록은 /api/admin/notification-logs
 * - 재발송 API는 없다(FN-ADM-091-02)
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

/**
 * 발송 이력 목록(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page·size·bgngYmd·endYmd(그날 끝까지)·notiChnlCd·notiTypeCd·sndngRsltCd, 모두 선택
 * - 행: { notiSndngLogSn, mbrSn, mbrNcnm, notiTypeCd, notiChnlCd, sndngRsltCd, rtryNmtm, failRsn, sndngDt }
 * - 모르는 코드·기간 역전은 400 INVALID_INPUT_VALUE
 */
export const getAdminNotificationLogs = (params) =>
  api.get('/admin/notification-logs', { params });
