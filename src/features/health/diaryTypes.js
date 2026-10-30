/**
 * [건강 일지 코드값]
 * - 코드값은 공통코드가 정해지기 전의 가안, 백엔드 코드값이 나오면 맞춤
 * - 일상 기록 종류·배변 상태·관찰 부위·관찰 변화
 */

/** 일상 기록 종류. tabNm은 건강기록 변화 지표 탭 이름 */
export const RECORD_TYPES = [
  { cd: 'WGT', nm: '체중', tabNm: '체중', unit: 'kg', valueLabel: '무게' },
  { cd: 'MEAL', nm: '식사량', tabNm: '식사량', unit: 'g', valueLabel: '양' },
  { cd: 'WATR', nm: '음수량', tabNm: '음수량', unit: 'ml', valueLabel: '양' },
  {
    cd: 'STL',
    nm: '배변상태',
    tabNm: '배변 상태',
    unit: '',
    valueLabel: '상태',
  },
  {
    cd: 'WALK',
    nm: '산책',
    tabNm: '산책',
    unit: '분',
    valueLabel: '소요시간',
  },
];

export const WEIGHT = 'WGT';
export const MEAL = 'MEAL';
export const WATER = 'WATR';
export const STOOL = 'STL';
export const WALK = 'WALK';

/** 오늘의 기록 줄 순서 */
export const TODAY_RECORD_ORDER = [MEAL, WATER, WALK, WEIGHT, STOOL];

/** 배변 상태. 막대 그래프의 고정 순서이며 첫 항목만 정상 */
export const STOOL_STATES = [
  { cd: 'NRML', nm: '정상' },
  { cd: 'HARD', nm: '딱딱함' },
  { cd: 'SOFT', nm: '무름' },
  { cd: 'DIAR', nm: '설사' },
  { cd: 'CNST', nm: '변비' },
];

export const NORMAL_STOOL = 'NRML';

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
