import { IS_DEV } from '@/api/env';
import { getNowHm, getTodayYmd, makeDateTime } from '@/utils/formatDate';
import { MB, TEXT_MAX_LENGTH } from './shared/settingFields';

/**
 * [운영 설정 가짜 API]
 * - 백엔드 GET·PUT /api/admin/settings 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 메모리 값이라 새로고침하면 처음 상태로 돌아감. 개발 환경에서 ?fake=forbidden이면 403 응답
 * - 미확정: 오류 응답 fields 모양, 항목별 허용 범위(설계서 제안값)
 */

/** SYS_STNG 기본값 */
let settings = {
  petMaxCnt: 10,
  jntBrupMaxNope: 5,
  invtnVldDayCnt: 7,
  lgnFailLmtNmtm: 5,
  whdwlMbrKpngDayCnt: 30,
  pstImgMaxCnt: 10,
  blindDclrAcmlCnt: 5,
  lostTpofExpryCrtrDayCnt: 30,
  mtchNoRspnsEndCrtrDayCnt: 14,
  lowstHrwgAplcnYr: 2026,
  lowstHrwgAmt: 0,
  dscvAutoCmntCn: '[펫이름]가 무사히 가족 품으로 돌아왔어요.',
  aiCmtryBscCn: '오늘도 반려동물과 행복한 하루 보내세요.',
  notiHideCrtrDayCnt: 7,
  aiCnvrsTurnCnt: 6,
  aiTknUplmtCnt: 4500,
  fileMaxSz: 10 * MB,
  mdfcnDt: '2026-10-30T14:02:00',
  mdfrId: 'admin01',
};

/** 숫자 항목 허용 범위: 일수 2자리 항목 99, 나머지 9,999 */
const DAY_RANGE = [1, 99];
const COUNT_RANGE = [1, 9999];
const RANGES = {
  invtnVldDayCnt: DAY_RANGE,
  whdwlMbrKpngDayCnt: DAY_RANGE,
  lostTpofExpryCrtrDayCnt: DAY_RANGE,
  mtchNoRspnsEndCrtrDayCnt: DAY_RANGE,
  notiHideCrtrDayCnt: DAY_RANGE,
  lowstHrwgAplcnYr: [1000, 9999],
  lowstHrwgAmt: [0, 9999999],
  fileMaxSz: [1, 9999 * MB],
};

/** 문구 항목 */
const TEXT_KEYS = ['dscvAutoCmntCn', 'aiCmtryBscCn'];

const getQueryParam = (name) =>
  IS_DEV ? new URLSearchParams(window.location.search).get(name) : null;

/** 항목 하나의 오류 문구: 통과하면 null */
const validate = (key, value) => {
  if (TEXT_KEYS.includes(key)) {
    if (value.trim() === '') return '비워 둘 수 없어요';
    if (value.length > TEXT_MAX_LENGTH) return '1,000자 이내로 입력해 주세요';
    return null;
  }
  const [min, max] = RANGES[key] ?? COUNT_RANGE;
  if (key === 'lowstHrwgAplcnYr' && (value < min || value > max)) {
    return '4자리 연도를 입력해 주세요';
  }
  if (value < min)
    return min === 0 ? '0 이상 입력해 주세요' : `${min} 이상 입력해 주세요`;
  if (value > max) return `${max.toLocaleString('ko-KR')} 이하로 입력해 주세요`;
  return null;
};

export const getAdminSettings = async () => {
  if (getQueryParam('fake') === 'forbidden') {
    throw {
      code: 'ADMIN_ONLY',
      message: '관리자만 접근할 수 있습니다.',
      fields: null,
      data: null,
    };
  }
  return { ...settings };
};

export const updateAdminSettings = async (body) => {
  const fields = Object.entries(body)
    .map(([field, value]) => ({ field, message: validate(field, value) }))
    .filter((item) => item.message);
  if (fields.length > 0) {
    throw {
      code: 'INVALID_INPUT_VALUE',
      message: '입력값이 올바르지 않아요.',
      fields,
      data: null,
    };
  }
  settings = {
    ...settings,
    ...body,
    mdfcnDt: makeDateTime(getTodayYmd(), getNowHm()),
    mdfrId: 'admin01',
  };
};
