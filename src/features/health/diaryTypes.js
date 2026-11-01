/**
 * [건강 일지 코드값]
 * - 코드값은 백엔드 공통코드(HLTG09 지표·HLTG10 배변상태)
 * - 일상 기록 종류·배변 상태·관찰 부위·관찰 변화
 */

/** 일상 기록 종류. tabNm은 건강기록 변화 지표 탭 이름 */
export const RECORD_TYPES = [
  { cd: 'HLTC0014', nm: '체중', tabNm: '체중', unit: 'kg', valueLabel: '무게' },
  {
    cd: 'HLTC0015',
    nm: '식사량',
    tabNm: '식사량',
    unit: 'g',
    valueLabel: '양',
  },
  {
    cd: 'HLTC0016',
    nm: '음수량',
    tabNm: '음수량',
    unit: 'ml',
    valueLabel: '양',
  },
  {
    cd: 'HLTC0017',
    nm: '배변상태',
    tabNm: '배변 상태',
    unit: '',
    valueLabel: '상태',
  },
  {
    cd: 'HLTC0018',
    nm: '산책',
    tabNm: '산책',
    unit: '분',
    valueLabel: '소요시간',
  },
];

export const WEIGHT = 'HLTC0014';
export const MEAL = 'HLTC0015';
export const WATER = 'HLTC0016';
export const STOOL = 'HLTC0017';
export const WALK = 'HLTC0018';

/** 오늘의 기록 줄 순서 */
export const TODAY_RECORD_ORDER = [MEAL, WATER, WALK, WEIGHT, STOOL];

/** 배변 상태. 막대 그래프의 고정 순서이며 첫 항목만 정상 */
export const STOOL_STATES = [
  { cd: 'HLTC0019', nm: '정상' },
  { cd: 'HLTC0020', nm: '딱딱함' },
  { cd: 'HLTC0021', nm: '무름' },
  { cd: 'HLTC0022', nm: '설사' },
  { cd: 'HLTC0023', nm: '변비' },
];

export const NORMAL_STOOL = 'HLTC0019';

/** 관찰 부위 대분류 */
export const OBSERVATION_PARTS = [
  { cd: 'HEAD', nm: '머리' },
  { cd: 'FACE', nm: '얼굴' },
  { cd: 'NECK', nm: '목' },
  { cd: 'BACK', nm: '등' },
  { cd: 'BELY', nm: '배' },
  { cd: 'FRLG', nm: '앞다리' },
  { cd: 'HDLG', nm: '뒷다리' },
  { cd: 'TAIL', nm: '꼬리' },
  { cd: 'ETC', nm: '기타' },
];

/** 관찰 변화 3단계 */
export const OBSERVATION_CHANGES = [
  { cd: 'SHRK', nm: '작아짐' },
  { cd: 'SAME', nm: '그대로' },
  { cd: 'GROW', nm: '커짐' },
];

/** 관찰 사진 규격. 공통 파일 업로드 규칙(REQ-NFR-003) */
export const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export const findRecordType = (cd) =>
  RECORD_TYPES.find((type) => type.cd === cd);

export const findStoolState = (cd) =>
  STOOL_STATES.find((state) => state.cd === cd);

export const findObservationPart = (cd) =>
  OBSERVATION_PARTS.find((part) => part.cd === cd);

export const findObservationChange = (cd) =>
  OBSERVATION_CHANGES.find((change) => change.cd === cd);
