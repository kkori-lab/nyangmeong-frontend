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

/** 첨부유형 HLTG20 */
export const ATTACHMENT_LAB = 'HLTC0061';
export const ATTACHMENT_IMAGE = 'HLTC0064';

export const ATTACHMENT_TYPES = [
  { cd: ATTACHMENT_LAB, nm: '검사결과지' },
  { cd: 'HLTC0062', nm: '접종 증명서' },
  { cd: ATTACHMENT_IMAGE, nm: '영상 사진' },
];

/** 영상종류 HLTG23 */
export const IMAGING_KINDS = [
  { cd: 'HLTC0068', nm: '엑스레이' },
  { cd: 'HLTC0069', nm: '초음파' },
  { cd: 'HLTC0070', nm: 'CT' },
  { cd: 'HLTC0071', nm: 'MRI' },
  { cd: 'HLTC0072', nm: '기타' },
];

/** 촬영부위 HLTG24 */
export const IMAGING_PARTS = [
  { cd: 'HLTC0073', nm: '흉부' },
  { cd: 'HLTC0074', nm: '복부' },
  { cd: 'HLTC0075', nm: '관절' },
  { cd: 'HLTC0076', nm: '치아' },
  { cd: 'HLTC0077', nm: '기타' },
];

/** 반복예방항목 HLTG07 */
export const PREVENTION_ITEMS = [
  { cd: 'HLTC0012', nm: '심장사상충 예방' },
  { cd: 'HLTC0013', nm: '구충제' },
];

/** 처방상태 HLTG06 */
export const DOSING = 'HLTC0010';
export const DOSE_ENDED = 'HLTC0011';

/** 파일 확장자 FILG01의 PDF */
export const FILE_EXT_PDF = 'FILC0005';

export const DOSE_STATUSES = [
  { cd: DOSING, nm: '복용중' },
  { cd: DOSE_ENDED, nm: '종료' },
];

/** 첨부 파일 제한 */
export const ATTACHMENT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const findName = (list, cd) => list.find((item) => item.cd === cd)?.nm;

/** 혈액검사 직접입력 항목 코드(HLTG12) */
const INSPECTION_DIRECT = 'HLTC0035';

/** 혈액검사 행에 보여 줄 항목 이름: 직접입력이면 입력한 이름, 아니면 코드 이름(WBC 등) */
export const getInspectionName = (item) =>
  item.inspArtclCd === INSPECTION_DIRECT
    ? item.inspArtclDrctInptNm
    : item.inspArtclCdNm;
