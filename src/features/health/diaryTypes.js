import { getNowHm, getTodayYmd, makeDateTime } from '@/utils/formatDate';
import { round2 } from './numberFormat';

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

/** 체중 입력 상한(kg). 200은 허용, 넘으면 저장 요청을 보내지 않음 (※신규 정책, 백엔드도 400) */
export const WEIGHT_MAX = 200;
export const WEIGHT_MAX_MESSAGE = `체중은 ${WEIGHT_MAX}kg 이하로 입력해 주세요`;

/** 산책 1회 상한(분), 음수량·식사량 1회 상한 배율(프로필 체중 1kg당 ml·g) (※신규 정책, FN-HLT-002-11, 백엔드도 400) */
export const WALK_MAX = 120;
export const WATER_PER_KG = 100;
export const MEAL_PER_KG = 50;

/**
 * 1회 상한을 넘으면 안내 문구, 아니면 null
 * - 음수량·식사량 상한은 반려동물 프로필 체중(petBdwg) × 배율을 소수 둘째 자리로 반올림 (5.3kg → 530ml·265g)
 * - 프로필 체중이 없으면 음수량·식사량은 검사하지 않음
 */
export const getOnceMaxMessage = (typeCd, value, petBdwg) => {
  if (value === '' || value == null) return null;
  if (typeCd === WALK)
    return Number(value) > WALK_MAX
      ? `산책은 한 번에 ${WALK_MAX}분까지 입력해 주세요`
      : null;
  const perKg =
    typeCd === WATER ? WATER_PER_KG : typeCd === MEAL ? MEAL_PER_KG : null;
  if (perKg == null || petBdwg == null) return null;
  const max = round2(Number(petBdwg) * perKg);
  if (!(Number(value) > max)) return null;
  const { nm, unit } = findRecordType(typeCd);
  return `${nm}은 한 번에 ${max}${unit}까지 입력해 주세요`;
};

/** 일상 기록은 지난 일만 기록: 지금(분 단위) 이후 시각은 막음. 지난 날짜는 시각 제한 없음 (※신규 정책, FN-HLT-002-11, 백엔드도 400) */
export const FUTURE_TIME_MESSAGE = '지금 이후 시각은 기록할 수 없어요';

/** ymd 날짜의 hm 시각이 지금보다 늦으면 true. 부를 때마다 현재 시각으로 판단 */
export const isAfterNow = (ymd, hm) =>
  hm !== '' && makeDateTime(ymd, hm) > makeDateTime(getTodayYmd(), getNowHm());

/** 오늘의 기록 줄 순서 */
export const TODAY_RECORD_ORDER = [MEAL, WATER, WALK, WEIGHT, STOOL];

/** 종류를 구별하는 Material Symbols 아이콘 이름(오늘의 기록 카드·기록 수정 모달) */
export const TYPE_ICONS = {
  [WEIGHT]: 'monitor_weight',
  [MEAL]: 'restaurant',
  [WATER]: 'water_drop',
  [STOOL]: 'wc',
  [WALK]: 'directions_walk',
};

/** 배변 상태. 막대 그래프의 고정 순서이며 첫 항목만 정상 */
export const STOOL_STATES = [
  { cd: 'HLTC0019', nm: '정상' },
  { cd: 'HLTC0020', nm: '딱딱함' },
  { cd: 'HLTC0021', nm: '무름' },
  { cd: 'HLTC0022', nm: '설사' },
  { cd: 'HLTC0023', nm: '변비' },
];

export const NORMAL_STOOL = 'HLTC0019';

/** 관찰 부위 대분류(공통코드 HLTG16) */
export const OBSERVATION_PARTS = [
  { cd: 'HLTC0043', nm: '머리' },
  { cd: 'HLTC0044', nm: '얼굴' },
  { cd: 'HLTC0045', nm: '목' },
  { cd: 'HLTC0046', nm: '등' },
  { cd: 'HLTC0047', nm: '배' },
  { cd: 'HLTC0048', nm: '앞다리' },
  { cd: 'HLTC0049', nm: '뒷다리' },
  { cd: 'HLTC0050', nm: '꼬리' },
  { cd: 'HLTC0051', nm: '기타' },
];

/** 관찰 변화 3단계(공통코드 HLTG17) */
export const OBSERVATION_CHANGES = [
  { cd: 'HLTC0052', nm: '작아짐' },
  { cd: 'HLTC0053', nm: '그대로' },
  { cd: 'HLTC0054', nm: '커짐' },
];

/** 관찰 상태(공통코드 HLTG18) */
export const OBSERVATION_ONGOING = 'HLTC0055';
export const OBSERVATION_ENDED = 'HLTC0056';

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
