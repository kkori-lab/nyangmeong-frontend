import { api } from '@/api/axios';

/**
 * [관리자 알림 템플릿 API]
 * - 알림 유형·채널은 공통코드 API, 템플릿 목록·등록·수정은 /api/admin/notification-templates
 * - 필드는 NOTI_TMPLT 컬럼 그대로(notiTmpltSn·notiTypeCd·notiChnlCd·notiTtl·notiCn), useYn은 boolean
 */

/** 알림 유형 공통코드 그룹 */
const TYPE_GROUP = 'AIMG02';
/** 알림 채널 공통코드 그룹 */
const CHANNEL_GROUP = 'AIMG03';

/** 알림 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getNotificationTypes = () =>
  api.get('/common-codes', { params: { prntComCd: TYPE_GROUP } });

/** 알림 채널 목록(이메일·인앱): [{ comCd, comCdNm, sortSeq }] */
export const getNotificationChannels = () =>
  api.get('/common-codes', { params: { prntComCd: CHANNEL_GROUP } });

/** 템플릿 목록: 등록된 것만, notiChnlCd가 있으면 그 채널만. 모르는 채널은 400 */
export const getAdminNotificationTemplates = ({ notiChnlCd } = {}) =>
  api.get('/admin/notification-templates', {
    params: { notiChnlCd: notiChnlCd || undefined },
  });

/**
 * 템플릿 등록: { notiTypeCd, notiChnlCd, notiTtl, notiCn, useYn } -> 201 { notiTmpltSn }
 * - 같은 유형·채널 409, 템플릿을 쓰지 않는 유형·모르는 {{변수}} 400
 */
export const createAdminNotificationTemplate = (body) =>
  api.post('/admin/notification-templates', body);

/** 템플릿 수정: { notiTmpltSn, notiTtl, notiCn, useYn } 세 칸 덮어씀, 유형·채널은 바꾸지 않음. 없으면 404 */
export const updateAdminNotificationTemplate = ({ notiTmpltSn, ...body }) =>
  api.patch(`/admin/notification-templates/${notiTmpltSn}`, body);
