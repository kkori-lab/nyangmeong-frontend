import { addDays, addMonths, diffDays, getTodayYmd } from '@/utils/formatDate';

// 케어 구역 공통코드(HLTG13)
export const CARE_ZONE = { DAILY: 'HLTC0036', REGULAR: 'HLTC0037' };

// 케어 주기 공통코드(HLTG15)
export const CUSTOM_CYCLE = 'HLTC0042';

export const CARE_CYCLES = [
  { cd: 'HLTC0038', nm: '1주' },
  { cd: 'HLTC0039', nm: '2주' },
  { cd: 'HLTC0040', nm: '한달' },
  { cd: 'HLTC0041', nm: '1년' },
  { cd: CUSTOM_CYCLE, nm: '직접입력' },
];

export const MAX_MAIN_CARE = 6;

/** 검진상세 반복 예방(가짜 응답 필드)의 주기 이름 */
export const getCycleName = (item) =>
  item.rptCycleCd === CUSTOM_CYCLE
    ? `${item.rptCycleDayCnt}일`
    : CARE_CYCLES.find((cycle) => cycle.cd === item.rptCycleCd)?.nm;

/** 케어 항목의 주기 이름: 직접입력은 일수, 나머지는 서버가 준 이름 */
export const getCareCycleName = (item) =>
  item.careCycleCd === CUSTOM_CYCLE
    ? `${item.cycleDrctInptDayCnt}일`
    : item.careCycleCdNm;

export const addCycle = (ymd, careCycleCd, cycleDrctInptDayCnt) => {
  switch (careCycleCd) {
    case 'HLTC0038':
      return addDays(ymd, 7);
    case 'HLTC0039':
      return addDays(ymd, 14);
    case 'HLTC0040':
      return addMonths(ymd, 1);
    case 'HLTC0041':
      return addMonths(ymd, 12);
    default:
      return addDays(ymd, Number(cycleDrctInptDayCnt));
  }
};

// 정기관리 상태 배지. 지난 예정일은 오류가 아니라 안내라 빨강 대신 주황 "+n일"로 쓴다
export const getDueBadge = (nxtmPrnmntYmd) => {
  const days = diffDays(getTodayYmd(), nxtmPrnmntYmd);
  if (days === 0) return { label: '오늘', tone: 'today' };
  if (days > 0) return { label: `D-${days}`, tone: 'upcoming' };
  return { label: `+${-days}일`, tone: 'late' };
};
