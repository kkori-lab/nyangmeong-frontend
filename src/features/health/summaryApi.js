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
 * - 반려동물 한 마리의 프로필·일상 기록·검진기록·반복 예방·검사 수치·처방약·첨부·지속 관찰·병원 일정을 한꺼번에 받아 화면 묶음으로 합친다
 * - 검사 수치·처방약·첨부·반복 예방은 ckupRcdSn을 빼고 불러 반려동물 전체를 받는다(반복 예방 전체 조회에만 hsptlNm이 채워진다)
 * - 서버 필드 이름은 바꾸지 않는다. 합치기·정렬·자르기만 화면이 한다
 */

const TIMELINE_COUNT = 5;
const TREND_COUNT = 4;
const ATTACHMENT_COUNT = 4;
const VACCINATION = 'HLTC0002';
const REGULAR = 'HLTC0001';

/** 타임라인 항목 종류 */
export const TIMELINE_CHECKUP = 'CKUP';
export const TIMELINE_PREVENTION = 'PRVNT';

const compareDesc = (a, b) => (a === b ? 0 : a < b ? 1 : -1);

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

/** 검사 수치 전체(검진일 오름차순)로 최근 1회차 표와 항목별 추이(최근 4회)를 만든다 */
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
    repeatPreventions,
    nextVaccinationYmd,
    nextRegularYmd,
    inspectionValues,
    prescriptions,
    attachments,
    observationItems,
  ] = await Promise.all([
    getPet(petSn),
    getLatestWeight(petSn),
    getCheckupList(petSn, { size: TIMELINE_COUNT }),
    getCheckupList(petSn, { ckupTypeCd: VACCINATION, size: 2 }),
    getCheckupList(petSn, { ckupTypeCd: REGULAR, size: 1 }),
    api.get(`/pets/${petSn}/repeat-preventions`),
    getNextHospitalYmd(petSn, VACCINATION, today),
    getNextHospitalYmd(petSn, REGULAR, today),
    api.get(`/pets/${petSn}/inspection-values`),
    api.get(`/pets/${petSn}/prescriptions`),
    getCheckupAttachments({ petSn, size: ATTACHMENT_COUNT }),
    getObservationItems({ petSn, obsrvSttsCd: OBSERVATION_ONGOING }),
  ]);

  const isPast = (checkup) => checkup.ckupYmd <= today;
  const pastCheckups = recentCheckups.filter(isPast);

  /** 건강 이력 타임라인: 검진기록과 반복 예방(시작일)을 날짜순으로 섞은 최신 5건 */
  const timeline = [
    ...pastCheckups.map((checkup) => ({
      tlKey: `ckup-${checkup.ckupRcdSn}`,
      tlTypeCd: TIMELINE_CHECKUP,
      ymd: checkup.ckupYmd,
      petSn,
      ckupRcdSn: checkup.ckupRcdSn,
      ckupTypeCd: checkup.ckupTypeCd,
      hsptlNm: checkup.hsptlNm,
      // 진료 내용: 목록 응답에 아직 없음(백엔드 연결 대기). 오면 타임라인 상세 줄
      ckupCn: checkup.ckupCn,
    })),
    ...repeatPreventions
      .filter((prevention) => prevention.bgngYmd <= today)
      .map((prevention) => ({
        tlKey: `prvnt-${prevention.reptPrvntMngSn}`,
        tlTypeCd: TIMELINE_PREVENTION,
        ymd: prevention.bgngYmd,
        petSn,
        ckupRcdSn: prevention.ckupRcdSn,
        hsptlNm: prevention.hsptlNm,
        reptPrvntArtclCdNm: prevention.reptPrvntArtclCdNm,
      })),
  ]
    .sort(
      (a, b) =>
        compareDesc(a.ymd, b.ymd) ||
        (a.tlTypeCd === b.tlTypeCd
          ? 0
          : a.tlTypeCd === TIMELINE_CHECKUP
            ? -1
            : 1),
    )
    .slice(0, TIMELINE_COUNT);

  const { lab, trends } = buildLab(petSn, inspectionValues);

  return {
    baseYmd: today,
    pet,
    /** 요약 바 몸무게: 일상 기록의 최신 체중, 없으면 프로필 체중 */
    weight: latestWeight ?? pet.petBdwg,
    latestCheckup: pastCheckups[0] ?? null,
    timeline,
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
