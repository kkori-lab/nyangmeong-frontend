import { api } from '@/api/axios';
import { addDays, getTodayYmd, getYear, getYmdOf } from '@/utils/formatDate';
import { findNearHospitalSchedule } from './api';
import { RECENT_RECORD_COUNT } from './diary/recordUtils';
import { MEAL, NORMAL_STOOL, STOOL, WALK, WATER, WEIGHT } from './diaryTypes';

/**
 * [건강 일지 API]
 * - 일상 기록·검진기록·지속 관찰은 실제 API(JAJ 백엔드)
 */

/** 최근 건강기록 표의 가장 긴 조회기간(일) */
const RECENT_DAYS = 14;

/**
 * 일상 기록 목록(기록일시 오름차순). 날짜 범위만 주면 그 기간 전체, size를 주면 지표별 최신 N건
 * - 서버는 날짜별로 묶지 않는다
 */
const searchDailyRecords = ({ petSn, ...params }) =>
  api.get(`/pets/${petSn}/daily-health-records`, { params });

/** 오늘의 기록·최근 건강기록 표: 오늘을 포함한 최근 14일 전부 */
export const getDailyRecords = ({ petSn }) =>
  searchDailyRecords({
    petSn,
    fromYmd: addDays(getTodayYmd(), -(RECENT_DAYS - 1)),
    toYmd: getTodayYmd(),
  });

/**
 * 그래프용 한 지표의 최근 기록 14개
 * - 식사량·음수량·산책은 하루 합계로 그리므로 받은 기록 중 가장 이른 날짜의 기록을 모두 받아 합친다
 */
export const getDailyTrend = async ({ petSn, dailyRcdIdctCd }) => {
  const recent = await searchDailyRecords({
    petSn,
    dailyRcdIdctCd,
    size: RECENT_RECORD_COUNT,
  });
  if (
    recent.length === 0 ||
    dailyRcdIdctCd === WEIGHT ||
    dailyRcdIdctCd === STOOL
  ) {
    return recent;
  }
  return searchDailyRecords({
    petSn,
    dailyRcdIdctCd,
    fromYmd: getYmdOf(recent[0].rcdDt),
  });
};

export const createDailyRecord = ({ petSn, body }) =>
  api.post(`/pets/${petSn}/daily-health-records`, body);

/** 지표·반려동물은 바꾸지 않고 시각과 값만 수정 */
export const updateDailyRecord = ({ petSn, dailyHlthRcdSn, body }) =>
  api.patch(`/pets/${petSn}/daily-health-records/${dailyHlthRcdSn}`, body);

export const deleteDailyRecord = ({ petSn, dailyHlthRcdSn }) =>
  api.delete(`/pets/${petSn}/daily-health-records/${dailyHlthRcdSn}`);

/** 지속 관찰 */

/** 관찰일 'YYYY-MM-DD'를 서버 일시로: 시각은 쓰지 않아 0시 */
const toObservationDt = (ymd) => `${ymd}T00:00:00`;

/** 관찰 항목 목록(관찰중 먼저). 항목마다 첫·마지막 회차 요약과 직전 대비 크기 차이를 준다 */
export const getObservationItems = ({ petSn, obsrvSttsCd }) =>
  api.get(`/pets/${petSn}/observation-items`, { params: { obsrvSttsCd } });

/** 한 항목의 회차 목록(관찰일 오름차순) */
export const getObservationCycles = ({ petSn, obsrvArtclSn }) =>
  api.get(`/pets/${petSn}/observation-cycles`, { params: { obsrvArtclSn } });

/** 비어 있는 선택 값은 보내지 않는다 */
const appendIfFilled = (body, key, value) => {
  if (value !== '' && value != null) body.append(key, value);
};

/** 새 항목과 1회차를 함께 저장 -> { obsrvArtclSn, obsrvCyclSn, ... } */
export const createObservationItem = ({
  petSn,
  obsrvArtclNm,
  obsrvRegnCd,
  obsrvRegnDtlNm,
  file,
  obsrvYmd,
  obsrvSz,
  memoCn,
}) => {
  const body = new FormData();
  body.append('obsrvArtclNm', obsrvArtclNm);
  body.append('obsrvRegnCd', obsrvRegnCd);
  appendIfFilled(body, 'obsrvRegnDtlNm', obsrvRegnDtlNm);
  body.append('file', file);
  body.append('obsrvDt', toObservationDt(obsrvYmd));
  appendIfFilled(body, 'obsrvSz', obsrvSz);
  appendIfFilled(body, 'memoCn', memoCn);
  return api.post(`/pets/${petSn}/observation-items`, body);
};

/** 종료한 항목은 서버가 400 OBSERVATION_ITEM_ENDED로 막는다 */
export const createObservationCycle = ({
  petSn,
  obsrvArtclSn,
  file,
  obsrvYmd,
  obsrvSz,
  obsrvChgCd,
  memoCn,
}) => {
  const body = new FormData();
  body.append('obsrvArtclSn', obsrvArtclSn);
  body.append('file', file);
  body.append('obsrvDt', toObservationDt(obsrvYmd));
  appendIfFilled(body, 'obsrvSz', obsrvSz);
  appendIfFilled(body, 'obsrvChgCd', obsrvChgCd);
  appendIfFilled(body, 'memoCn', memoCn);
  return api.post(`/pets/${petSn}/observation-cycles`, body);
};

const isBlank = (value) => value === '' || value == null;

/** 수정 전(before)과 견줘 바뀐 값만 보내고, 값이 있던 칸을 비웠으면 이름을 clearFields로 보낸다 */
const appendChanged = (body, key, value, before) => {
  if (isBlank(value)) {
    if (!isBlank(before)) body.append('clearFields', key);
    return;
  }
  if (String(value) !== String(before ?? '')) body.append(key, value);
};

/**
 * 회차 수정: 보낸 값만 바뀐다
 * - 사진은 새로 고른 때만(file). 비울 수 없고 보내면 교체
 * - 크기·변화·메모는 cycle(수정 전 회차)과 견줘 손대지 않은 칸은 보내지 않는다
 * - 1회차는 변화 칸이 없으므로 obsrvChgCd를 보내지 않는다(isFirstCycle)
 */
export const updateObservationCycle = ({
  petSn,
  obsrvCyclSn,
  cycle,
  isFirstCycle,
  file,
  obsrvYmd,
  obsrvSz,
  obsrvChgCd,
  memoCn,
}) => {
  const body = new FormData();
  if (file) body.append('file', file);
  body.append('obsrvDt', toObservationDt(obsrvYmd));
  appendChanged(body, 'obsrvSz', obsrvSz, cycle.obsrvSz);
  if (!isFirstCycle)
    appendChanged(body, 'obsrvChgCd', obsrvChgCd, cycle.obsrvChgCd);
  appendChanged(body, 'memoCn', memoCn, cycle.memoCn);
  return api.patch(`/pets/${petSn}/observation-cycles/${obsrvCyclSn}`, body);
};

/** 마지막 회차를 지우면 항목도 함께 사라진다 */
export const deleteObservationCycle = ({ petSn, obsrvCyclSn }) =>
  api.delete(`/pets/${petSn}/observation-cycles/${obsrvCyclSn}`);

export const endObservationItem = ({ petSn, obsrvArtclSn }) =>
  api.post(`/pets/${petSn}/observation-items/${obsrvArtclSn}/end`);

/** 검진기록(FN-HLT-002-05·06·14·26~31·46) */

/** 검진기록 목록(최신 순 PageResponse). year를 빼면 전체 연도 */
export const getCheckups = ({ petSn, year, ckupTypeCd, page, size }) =>
  api.get(`/pets/${petSn}/checkups`, {
    params: { year, ckupTypeCd, page, size },
  });

/**
 * 검진기록이 있는 연도 범위(최신 순). 0건이면 빈 배열
 * - 서버가 연도 목록을 주지 않아 가장 최근 기록부터 가장 오래된 기록까지의 연도를 모두 넣는다
 */
export const getCheckupYears = async (petSn) => {
  const newest = await getCheckups({ petSn, size: 1 });
  if (newest.totalElements === 0) return [];
  const oldest = await getCheckups({
    petSn,
    size: 1,
    page: newest.totalElements,
  });
  const newestYear = getYear(newest.content[0].ckupYmd);
  const oldestYear = getYear((oldest.content[0] ?? newest.content[0]).ckupYmd);
  return Array.from(
    { length: newestYear - oldestYear + 1 },
    (_, index) => newestYear - index,
  );
};

export const findNearSchedule = findNearHospitalSchedule;

/** 같은 날 병원 일정 연결·새 일정 생성은 서버가 한다. body.schdlSn이 있으면 그 일정을 검진일로 옮겨 연결 */
export const createCheckup = ({ petSn, body }) =>
  api.post(`/pets/${petSn}/checkups`, body);

/** 연결된 병원 일정은 남는다 */
export const deleteCheckup = ({ petSn, ckupRcdSn }) =>
  api.delete(`/pets/${petSn}/checkups/${ckupRcdSn}`);

/** 검진기록 1건: 없으면 CHECKUP_NOT_FOUND */
export const getCheckup = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/checkups/${ckupRcdSn}`);

/**
 * 경로는 원래 반려동물, body.petSn은 옮길 반려동물
 * - 검진일·반려동물이 바뀌면 서버가 이 검진기록만 바뀐 날짜의 병원 일정에 다시 연결한다
 */
export const updateCheckup = ({ petSn, ckupRcdSn, body }) =>
  api.patch(`/pets/${petSn}/checkups/${ckupRcdSn}`, body);
