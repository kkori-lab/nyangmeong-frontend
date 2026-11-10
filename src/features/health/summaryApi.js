import { api } from '@/api/axios';
import { getTodayYmd, getYmdOf } from '@/utils/formatDate';
import { DOSING } from './checkup/checkupTypes';
import { getCheckupAttachments } from './checkupApi';
import { getCheckups, getObservationItems } from './diaryApi';
import { OBSERVATION_ONGOING, WEIGHT } from './diaryTypes';
import { findBloodItem } from './labInput/bloodItems';
import { HOSPITAL } from './scheduleTypes';

/**
 * [종합 건강기록 API]
 * - 반려동물 한 마리의 프로필·일상 기록·검진기록·검사 수치·처방약·첨부·지속 관찰·병원 일정을 한꺼번에 받아 히어로·대시보드 카드 묶음으로 합침
 * - 검사 수치·처방약·첨부는 ckupRcdSn을 빼고 불러 반려동물 전체를 받음
 * - 서버 필드 이름은 바꾸지 않음. 합치기·정렬·자르기만 화면 몫
 */

/** 히어로 최근 검진을 고를 최근 검진기록 수(미래 날짜를 거른 뒤 첫 건) */
const RECENT_CHECKUP_COUNT = 5;
/** 검사 수치 카드 항목별 최근 회수 */
const TREND_COUNT = 5;
const ATTACHMENT_COUNT = 4;
const VACCINATION = 'HLTC0002';
const REGULAR = 'HLTC0001';

/** 검사 항목 이름: 직접입력이면 입력한 이름 */
export const getInspectionName = (item) =>
  item.inspArtclDrctInptNm ?? item.inspArtclCdNm;

const getPet = (petSn) => api.get(`/pets/${petSn}`);

/** 최신 체중 일상 기록 1건의 값. 없으면 null */
const getLatestWeight = async (petSn) => {
  const records = await api.get(`/pets/${petSn}/daily-health-records`, {
    params: { dailyRcdIdctCd: WEIGHT, size: 1 },
  });
  return records.length > 0 ? records[records.length - 1].rcdNvl : null;
};

const getCheckupList = (petSn, params) =>
  getCheckups({ petSn, ...params }).then((page) => page.content);

/** 같은 검진유형의 오늘 이후 가장 가까운 병원 일정 날짜. 없으면 null */
const getNextHospitalYmd = async (petSn, ckupTypeCd, today) => {
  const schedules = await api.get(`/pets/${petSn}/care-schedules`, {
    params: { fromYmd: today, schdlKndCd: HOSPITAL, ckupTypeCd, size: 1 },
  });
  return schedules.length > 0 ? getYmdOf(schedules[0].schdlDt) : null;
};

/** 검사 수치 전체(검진일 오름차순) → 최근 1회차(히어로)와 항목별 추이(최근 5회, 검사 수치 카드) */
const buildLab = (petSn, values) => {
  const latestSn = values.reduce(
    (latest, value) =>
      latest === null || value.schdlDt >= latest.schdlDt ? value : latest,
    null,
  )?.ckupRcdSn;
  const latestItems = values
    .filter((value) => value.ckupRcdSn === latestSn)
    .sort((a, b) => a.sortSeq - b.sortSeq);
  const lab =
    latestItems.length > 0
      ? {
          petSn,
          ckupRcdSn: latestSn,
          ckupYmd: getYmdOf(latestItems[0].schdlDt),
          items: latestItems,
        }
      : null;

  const trends = {};
  values.forEach((value) => {
    const nm = getInspectionName(value);
    const trend = (trends[nm] ??= {
      inspNm: nm,
      fnctTagCd: findBloodItem(nm)?.fnctTagCd,
      points: [],
    });
    trend.unitNm = value.unitNm;
    trend.refLlmtNvl = value.refLlmtNvl;
    trend.refUplmtNvl = value.refUplmtNvl;
    trend.points.push({
      ckupRcdSn: value.ckupRcdSn,
      ckupYmd: getYmdOf(value.schdlDt),
      rsltNvl: value.rsltNvl,
    });
  });
  Object.values(trends).forEach((trend) => {
    trend.points = trend.points.slice(-TREND_COUNT);
  });
  return { lab, trends };
};

export const getHealthSummary = async (petSn) => {
  const today = getTodayYmd();
  const [
    pet,
    latestWeight,
    recentCheckups,
    vaccinationCheckups,
    regularCheckups,
    nextVaccinationYmd,
    nextRegularYmd,
    inspectionValues,
    prescriptions,
    attachments,
    observationItems,
  ] = await Promise.all([
    getPet(petSn),
    getLatestWeight(petSn),
    getCheckupList(petSn, { size: RECENT_CHECKUP_COUNT }),
    getCheckupList(petSn, { ckupTypeCd: VACCINATION, size: 2 }),
    getCheckupList(petSn, { ckupTypeCd: REGULAR, size: 1 }),
    getNextHospitalYmd(petSn, VACCINATION, today),
    getNextHospitalYmd(petSn, REGULAR, today),
    api.get(`/pets/${petSn}/inspection-values`),
    api.get(`/pets/${petSn}/prescriptions`),
    getCheckupAttachments({ petSn, size: ATTACHMENT_COUNT }),
    getObservationItems({ petSn, obsrvSttsCd: OBSERVATION_ONGOING }),
  ]);

  const isPast = (checkup) => checkup.ckupYmd <= today;
  const pastCheckups = recentCheckups.filter(isPast);

  const { lab, trends } = buildLab(petSn, inspectionValues);

  return {
    baseYmd: today,
    pet,
    /** 요약 바 몸무게: 일상 기록의 최신 체중, 없으면 프로필 체중 */
    weight: latestWeight ?? pet.petBdwg,
    latestCheckup: pastCheckups[0] ?? null,
    prevention: {
      vaccinations: vaccinationCheckups.filter(isPast),
      nextVaccinationYmd,
      latestRegularYmd: regularCheckups.find(isPast)?.ckupYmd ?? null,
      nextRegularYmd,
    },
    lab,
    trends,
    prescriptions: prescriptions.map((prescription) => ({
      ...prescription,
      petSn,
    })),
    dosingCount: prescriptions.filter(
      (prescription) => prescription.prscSttsCd === DOSING,
    ).length,
    attachments,
    observations: observationItems,
  };
};
