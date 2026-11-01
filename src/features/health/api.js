import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import {
  addDays,
  diffDays,
  getYmdOf,
} from '@/utils/formatDate';
import { CHRC_STTS, PET_REL, PET_SE } from '@/utils/petCodes';
import { HOSPITAL, compareSchedules } from './scheduleTypes';

// 케어 캘린더 일정·토탈 케어리스트(JAJ 백엔드)와 반려동물 목록(SJM)은 실제 API

export const getQueryParam = (name) =>
  IS_DEV ? new URLSearchParams(window.location.search).get(name) : null;

/** 내 반려동물 목록 GET /pets (SJM 백엔드, 케어 캘린더) */
export const getMyPets = () => api.get('/pets');

/**
 * 반려동물들의 일정 목록(FN-HLT-003-29·31·40)
 * - 서버가 반려동물 단위 조회라 반려동물 수만큼 요청 후 합침
 * - size: 반려동물마다의 최대 건수
 * - 볼 수 없는 반려동물(없음·권한 없음)은 빼고 나머지만 합침. 모두 실패하면 첫 오류
 */
const SKIPPED_PET_CODES = ['PET_NOT_FOUND', 'PET_ACCESS_DENIED'];

export const getSchedules = async ({ petSns, fromYmd, toYmd, size }) => {
  const results = await Promise.allSettled(
    petSns.map((petSn) =>
      api.get(`/pets/${petSn}/care-schedules`, {
        params: { fromYmd, toYmd, size },
      }),
    ),
  );
  const failed = results.filter((result) => result.status === 'rejected');
  const unexpected = failed.find(
    (result) => !SKIPPED_PET_CODES.includes(result.reason?.code),
  );
  if (unexpected) throw unexpected.reason;
  if (failed.length > 0 && failed.length === results.length) {
    throw failed[0].reason;
  }
  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value)
    .sort(compareSchedules);
};

export const createSchedule = ({ petSn, body }) =>
  api.post(`/pets/${petSn}/care-schedules`, body);

/** 경로는 원래 반려동물, body.petSn은 옮길 반려동물(FN-HLT-003-37) */
export const updateSchedule = ({ petSn, schdlSn, body }) =>
  api.patch(`/pets/${petSn}/care-schedules/${schdlSn}`, body);

export const deleteSchedule = ({ petSn, schdlSn }) =>
  api.delete(`/pets/${petSn}/care-schedules/${schdlSn}`);

const NEAR_SCHEDULE_DAYS = 7;

/**
 * 가까운 예정 병원 일정 1건(FN-HLT-002-46)
 * - 같은 날 병원 일정이 있으면 서버가 그 일정에 연결하므로 null
 * - 없으면 앞뒤 7일 안의 검진기록 없는 병원 일정 중 가장 가까운 것(거리가 같으면 먼저 등록된 일정)
 */
export const findNearHospitalSchedule = async ({ petSn, ckupYmd }) => {
  const schedules = await api.get(`/pets/${petSn}/care-schedules`, {
    params: {
      fromYmd: addDays(ckupYmd, -NEAR_SCHEDULE_DAYS),
      toYmd: addDays(ckupYmd, NEAR_SCHEDULE_DAYS),
      schdlKndCd: HOSPITAL,
    },
  });
  const distance = (schedule) =>
    Math.abs(diffDays(ckupYmd, getYmdOf(schedule.schdlDt)));
  if (schedules.some((schedule) => distance(schedule) === 0)) return null;
  return (
    schedules
      .filter((schedule) => schedule.ckupRcdCnt === 0)
      .sort((a, b) => distance(a) - distance(b) || a.schdlSn - b.schdlSn)[0] ??
    null
  );
};

// 토탈 케어리스트(FN-HLT-003-12·13·21~24·38)는 실제 API. 서버가 기본 항목 11개를 처음 조회 때 만든다

/** 항목(정기관리 먼저)과 완료 기록(완료일 최신순)을 한 번에. 투약 기록은 하루 횟수를 채운 날만 온다 */
export const getCareItems = async (petSn) => {
  const [careItems, careRecords] = await Promise.all([
    api.get(`/pets/${petSn}/care-items`),
    api.get(`/pets/${petSn}/care-completions`),
  ]);
  return { careItems, careRecords };
};

/** 오늘 완료 체크. 투약 항목은 1회씩 오른다 */
export const checkCareItem = ({ petSn, careArtclSn }) =>
  api.post(`/pets/${petSn}/care-completions`, { careArtclSn });

/** 투약 항목 오늘 마지막 1회 취소 */
export const cancelLastDose = ({ petSn, careArtclSn }) =>
  api.delete(`/pets/${petSn}/care-items/${careArtclSn}/today-completion/last`);

/** 그날 완료 기록 취소. 투약은 그날 체크 전부가 취소된다 */
export const cancelCareRecord = ({ petSn, careCmptnHstrySn }) =>
  api.delete(`/pets/${petSn}/care-completions/${careCmptnHstrySn}`);

/** 메인 표시(★) 항목 전체 저장: 배열 순서가 메인 정렬 순서 */
export const saveCareMain = ({ petSn, careArtclSns }) =>
  api.put(`/pets/${petSn}/care-item-exposures`, { careArtclSns });

export const createCareItem = ({ petSn, body }) =>
  api.post(`/pets/${petSn}/care-items`, body);

/** 보낸 값만 바꾼다. 기본 정기관리 항목은 주기만 */
export const updateCareItem = ({ petSn, careArtclSn, body }) =>
  api.patch(`/pets/${petSn}/care-items/${careArtclSn}`, body);

export const deleteCareItem = ({ petSn, careArtclSn }) =>
  api.delete(`/pets/${petSn}/care-items/${careArtclSn}`);

