import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';

/**
 * [관리자 알림 템플릿 API]
 * - 알림 유형·채널은 실제 공통코드 API, 템플릿 목록·등록·수정은 /api/admin/notification-templates 나오기 전까지 메모리 가짜 -> 나오면 본문만 api 요청으로 교체
 * - 필드는 NOTI_TMPLT 컬럼 그대로(notiTmpltSn·notiTypeCd·notiChnlCd·notiTtl·notiCn·useYn)
 * - 개발 환경에서 ?fake=forbidden이면 403
 * - 미확정: 경로 3종, useYn 모양('Y'|'N' 가정), 유형별 치환 변수
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

/** 가짜 템플릿: 케어 일정 이메일·인앱(서버 기본 문구와 같은 내용), 커뮤니티 인앱은 사용 안 함 */
let fakeTemplates = [
  {
    notiTmpltSn: 1,
    notiTypeCd: 'AIMC0008',
    notiChnlCd: 'AIMC0016',
    notiTtl: '[냥멍케어] {{반려동물명}}의 {{검진유형}} 일정이 {{D-N}} 남았어요',
    notiCn:
      '{{닉네임}}님, {{반려동물명}}의 {{검진유형}} 일정을 알려 드려요.\n\n일정: {{일정일}} {{시간}}\n병원: {{병원명}}\n\n캘린더에서 확인하기: {{캘린더링크}}',
    useYn: 'Y',
  },
  {
    notiTmpltSn: 2,
    notiTypeCd: 'AIMC0008',
    notiChnlCd: 'AIMC0017',
    notiTtl: '[케어 일정] {{반려동물명}} {{검진유형}} 일정이 {{D-N}} 남았어요',
    notiCn: '{{일정일}} {{시간}} · {{병원명}}',
    useYn: 'Y',
  },
  {
    notiTmpltSn: 3,
    notiTypeCd: 'AIMC0010',
    notiChnlCd: 'AIMC0017',
    notiTtl: '[커뮤니티] 내 글에 새 댓글이 달렸어요',
    notiCn: '{{닉네임}}님의 글에 새 댓글이 있어요.',
    useYn: 'N',
  },
];

const assertAdmin = () => {
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

/** 템플릿 목록: 등록된 것만, notiChnlCd가 있으면 그 채널만 */
export const getAdminNotificationTemplates = async ({ notiChnlCd } = {}) => {
  assertAdmin();
  return fakeTemplates
    .filter((template) => !notiChnlCd || template.notiChnlCd === notiChnlCd)
    .map((template) => ({ ...template }));
};

/** 템플릿 등록: { notiTypeCd, notiChnlCd, notiTtl, notiCn, useYn }, 201 { notiTmpltSn }. 같은 유형·채널이 있으면 409 */
export const createAdminNotificationTemplate = async (body) => {
  assertAdmin();
  const isDuplicate = fakeTemplates.some(
    (template) =>
      template.notiTypeCd === body.notiTypeCd &&
      template.notiChnlCd === body.notiChnlCd,
  );
  if (isDuplicate) {
    throw {
      code: 'NOTI_TMPLT_DUPLICATED',
      message: '이미 등록된 알림 유형과 채널입니다.',
      fields: null,
      data: null,
    };
  }
  const notiTmpltSn =
    Math.max(0, ...fakeTemplates.map((template) => template.notiTmpltSn)) + 1;
  fakeTemplates = [...fakeTemplates, { notiTmpltSn, ...body }];
  return { notiTmpltSn };
};

/** 템플릿 수정: { notiTmpltSn, notiTtl, notiCn, useYn }, 유형·채널은 바꾸지 않음 */
export const updateAdminNotificationTemplate = async ({
  notiTmpltSn,
  ...body
}) => {
  assertAdmin();
  const target = fakeTemplates.find(
    (template) => template.notiTmpltSn === notiTmpltSn,
  );
  if (!target) {
    throw {
      code: 'NOTI_TMPLT_NOT_FOUND',
      message: '알림 템플릿을 찾을 수 없습니다.',
      fields: null,
      data: null,
    };
  }
  fakeTemplates = fakeTemplates.map((template) =>
    template.notiTmpltSn === notiTmpltSn ? { ...template, ...body } : template,
  );
  return null;
};
