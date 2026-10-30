/**
 * [검진상세 코드값]
 * - 코드값은 공통코드가 정해지기 전의 가안, 백엔드 코드값이 나오면 맞춤
 * - 검사 종류·검사 항목 기능 태그·첨부 유형·영상 종류·촬영 부위·반복 예방 항목·복용 상태
 */

/** 상세 탭. key는 ?tab= 값(케어 캘린더 [출처 보기]가 prescription·prevention으로 들어옴) */
export const DETAIL_TABS = [
  { key: 'result', nm: '검사 결과' },
  { key: 'attachments', nm: '첨부 자료' },
  { key: 'prescription', nm: '처방약' },
  { key: 'prevention', nm: '반복 예방' },
];

/** 탭 id·패널 id 연결 */
export const getTabId = (key) => `checkup-tab-${key}`;
export const getPanelId = (key) => `checkup-panel-${key}`;

/** 검사 종류 칩 */
export const INSPECTION_KINDS = [
  { key: 'blood', nm: '혈액검사' },
  { key: 'img', nm: '영상검사' },
  { key: 'etc', nm: '기타검사' },
];

/** 혈액검사 항목의 기능 태그 */
export const FUNCTION_TAGS = [
  { cd: 'CBC', nm: '혈구' },
  { cd: 'KID', nm: '신장' },
  { cd: 'LIV', nm: '간' },
  { cd: 'GLU', nm: '당' },
];

export const ATTACHMENT_LAB = 'LAB';
export const ATTACHMENT_IMAGE = 'IMG';

export const ATTACHMENT_TYPES = [
  { cd: ATTACHMENT_LAB, nm: '검사결과지' },
  { cd: 'VACC', nm: '접종 증명서' },
  { cd: ATTACHMENT_IMAGE, nm: '영상 사진' },
];

export const IMAGING_KINDS = [
  { cd: 'XRAY', nm: '엑스레이' },
  { cd: 'US', nm: '초음파' },
  { cd: 'CT', nm: 'CT' },
  { cd: 'MRI', nm: 'MRI' },
  { cd: 'ETC', nm: '기타' },
];

export const IMAGING_PARTS = [
  { cd: 'CHST', nm: '흉부' },
  { cd: 'ABDM', nm: '복부' },
  { cd: 'JOINT', nm: '관절' },
  { cd: 'TEETH', nm: '치아' },
  { cd: 'ETC', nm: '기타' },
];

export const PREVENTION_ITEMS = [
  { cd: 'HW', nm: '심장사상충 예방' },
  { cd: 'DWM', nm: '구충제' },
];

export const DOSING = 'ING';
export const DOSE_ENDED = 'END';

export const DOSE_STATUSES = [
  { cd: DOSING, nm: '복용중' },
  { cd: DOSE_ENDED, nm: '종료' },
];

/** 첨부 파일 제한 */
export const ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const findName = (list, cd) => list.find((item) => item.cd === cd)?.nm;
