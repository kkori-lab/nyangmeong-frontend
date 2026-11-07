import { api } from '@/api/axios';
import { CARE_ZONE } from './careDue';
import { getCheckupAttachments } from './checkupApi';
import { getCheckups, getObservationItems } from './diaryApi';
import { OBSERVATION_ONGOING, STOOL } from './diaryTypes';

/**
 * [건강기록 대시보드 API]
 * - 지표: GET /pets/{petSn}/health-indicators (JAJ 백엔드, 메인 위젯과 같은 API를 features/health에 따로 둠)
 * - 기록 있는 항목: 반려동물마다 여러 API로 확인. 백엔드 B1 응답에 "기록 있는 항목"이 생기면 그 값으로 교체
 */

const VACCINATION = 'HLTC0002';
const REGULAR = 'HLTC0001';

/** 배변 상태 카드의 최근 기록 수 */
export const STOOL_RECENT_COUNT = 14;

/** 체중·식사량·음수량·산책·크레아티닌 지표 { weight, meal, water, walk, creatinine } */
export const getHealthIndicators = (petSn) =>
  api.get(`/pets/${petSn}/health-indicators`);

/** 배변 상태 최근 기록(기록일시 오름차순) */
export const getRecentStools = (petSn) =>
  api.get(`/pets/${petSn}/daily-health-records`, {
    params: { dailyRcdIdctCd: STOOL, size: STOOL_RECENT_COUNT },
  });

const hasText = (text) => (text ?? '').trim() !== '';

/** 반려동물 한 마리의 기록 있는 항목 키 */
const getPetRecordedIds = async (petSn) => {
  const [
    indicators,
    stools,
    checkups,
    prescriptions,
    observations,
    pet,
    vaccinations,
    regulars,
    careItems,
    inspectionValues,
    attachments,
  ] = await Promise.all([
    getHealthIndicators(petSn),
    api.get(`/pets/${petSn}/daily-health-records`, {
      params: { dailyRcdIdctCd: STOOL, size: 1 },
    }),
    getCheckups({ petSn, size: 1 }),
    api.get(`/pets/${petSn}/prescriptions`),
    getObservationItems({ petSn, obsrvSttsCd: OBSERVATION_ONGOING }),
    api.get(`/pets/${petSn}`),
    getCheckups({ petSn, ckupTypeCd: VACCINATION, size: 1 }),
    getCheckups({ petSn, ckupTypeCd: REGULAR, size: 1 }),
    api.get(`/pets/${petSn}/care-items`),
    api.get(`/pets/${petSn}/inspection-values`),
    getCheckupAttachments({ petSn, size: 1 }),
  ]);
  const flags = {
    weight: indicators.weight != null,
    meal: indicators.meal != null,
    water: indicators.water != null,
    walk: indicators.walk != null,
    poop: stools.length > 0,
    ckup: checkups.totalElements > 0,
    insp: inspectionValues.length > 0,
    presc: prescriptions.length > 0,
    atch: attachments.length > 0,
    obsv: observations.length > 0,
    allergy: hasText(pet.algyCn) || hasText(pet.dssCn),
    vacc: vaccinations.totalElements > 0 || regulars.totalElements > 0,
    care: careItems.some((item) => item.careZoneCd === CARE_ZONE.DAILY),
  };
  return Object.keys(flags).filter((id) => flags[id]);
};

/** 반려동물별 기록 있는 항목 { [petSn]: 항목 키[] } (D10) */
export const getRecordedItems = async (petSns) => {
  const results = await Promise.all(petSns.map(getPetRecordedIds));
  return Object.fromEntries(petSns.map((petSn, i) => [petSn, results[i]]));
};
