import { api } from '@/api/axios';
import { IS_DEV } from '@/api/env';
import profile1 from '@/assets/pets/profile1.png';
import profile2 from '@/assets/pets/profile2.png';
import profile3 from '@/assets/pets/profile3.png';
import {
  addDays,
  diffDays,
  getTodayYmd,
  getYmdOf,
  makeDateTime,
} from '@/utils/formatDate';
import { CHRC_STTS, PET_REL, PET_SE } from '@/utils/petCodes';
import { CARE_ZONE, CUSTOM_CYCLE } from './careDue';
import { HOSPITAL, compareSchedules } from './scheduleTypes';

// 케어 캘린더 일정·토탈 케어리스트(JAJ 백엔드)와 반려동물 목록(SJM)은 실제 API. 다른 건강 화면의 반려동물 목록·검진기록 연결용 일정·검진상세 연동 케어 항목은 아직 가짜 응답
// 필드 이름은 ERD 약어 기준 가안이다. 메모리 배열이라 새로고침하면 처음 상태로 돌아간다
// 개발 환경에서만 (케어 캘린더 제외) ?fakePets=1로 반려동물 1마리를, ?fakePets=8로 8마리(캐릭터 미생성·공동양육 포함)를, ?fakeSchedules=0으로 일정 0건을 확인할 수 있다

export const getQueryParam = (name) =>
  IS_DEV ? new URLSearchParams(window.location.search).get(name) : null;

const today = getTodayYmd();

const fakePets = [
  {
    petSn: 1,
    petNm: '나비',
    petSeCd: PET_SE.CAT,
    chrcSttsCd: CHRC_STTS.DONE,
    petRelCd: PET_REL.OWNER,
    petSpcsCdNm: '고양이',
    chrctrImgPath: profile1,
    nrmlWghtMinVal: 3.6,
    nrmlWghtMaxVal: 4.4,
    goalWghtVal: 4.0,
  },
  {
    petSn: 2,
    petNm: '초코',
    petSeCd: PET_SE.CAT,
    // 캐릭터 미생성 예시. 종합 건강기록 히어로만 상태를 보고, 다른 화면 칩은 이미지를 그대로 쓴다
    chrcSttsCd: CHRC_STTS.NONE,
    petRelCd: PET_REL.OWNER,
    petSpcsCdNm: '고양이',
    chrctrImgPath: profile2,
    nrmlWghtMinVal: 4.0,
    nrmlWghtMaxVal: 5.0,
    goalWghtVal: 4.5,
  },
  {
    petSn: 3,
    petNm: '두리',
    petSeCd: PET_SE.DOG,
    chrcSttsCd: CHRC_STTS.DONE,
    petRelCd: PET_REL.OWNER,
    petSpcsCdNm: '강아지',
    chrctrImgPath: profile3,
    nrmlWghtMinVal: 8.0,
    nrmlWghtMaxVal: 10.0,
    goalWghtVal: 9.0,
  },
];

/** ?fakePets=8에서만 더하는 반려동물. 일정·케어 가짜 데이터 없음 */
const extraPets = [
  ['보리', PET_SE.DOG, '강아지', CHRC_STTS.DONE, PET_REL.OWNER, profile3],
  ['모모', PET_SE.CAT, '고양이', CHRC_STTS.NONE, PET_REL.OWNER, null],
  ['콩이', PET_SE.DOG, '강아지', CHRC_STTS.DONE, PET_REL.CO_PARENT, profile3],
  ['율무', PET_SE.CAT, '고양이', CHRC_STTS.NONE, PET_REL.CO_PARENT, null],
  ['까미', PET_SE.CAT, '고양이', CHRC_STTS.DONE, PET_REL.OWNER, profile2],
].map(
  (
    [petNm, petSeCd, petSpcsCdNm, chrcSttsCd, petRelCd, chrctrImgPath],
    index,
  ) => ({
    petSn: 4 + index,
    petNm,
    petSeCd,
    chrcSttsCd,
    petRelCd,
    petSpcsCdNm,
    chrctrImgPath,
    nrmlWghtMinVal: null,
    nrmlWghtMaxVal: null,
    goalWghtVal: null,
  }),
);

const getFakePets = () => {
  const mode = getQueryParam('fakePets');
  if (mode === '1') return fakePets.slice(0, 1);
  if (mode === '8') return [...fakePets, ...extraPets];
  return fakePets;
};

const findPetNm = (petSn) => fakePets.find((pet) => pet.petSn === petSn)?.petNm;

// 건강 일지·검진상세·종합 건강기록용 가짜 반려동물 목록. 각 화면 API 연결 때 getMyPets로 바꾼다
export const getPets = () =>
  Promise.resolve(getFakePets().map((pet) => ({ ...pet })));

/** 내 반려동물 목록 GET /pets (SJM 백엔드, 케어 캘린더) */
export const getMyPets = () => api.get('/pets');

let nextSchdlSn = 100;

const fakeSchedules = [
  {
    schdlSn: 1,
    petSn: 1,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0001',
    hsptlNm: '늘봄동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(addDays(today, -10), '10:30'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 1,
  },
  {
    schdlSn: 2,
    petSn: 3,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0003',
    hsptlNm: '해맑은동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(addDays(today, -3), null),
    hrInptYn: false,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 3,
    petSn: 2,
    schdlKndCd: 'HLTC0058',
    ckupTypeCd: null,
    hsptlNm: null,
    schdlNm: '집 목욕',
    schdlDt: makeDateTime(today, '15:00'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 4,
    petSn: 1,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0001',
    hsptlNm: '늘봄동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(today, '10:00'),
    hrInptYn: true,
    memoCn: '오전 예약, 공복 방문',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 5,
    petSn: 1,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0002',
    hsptlNm: '늘봄동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(addDays(today, 3), '11:00'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 6,
    petSn: 3,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0001',
    hsptlNm: '해맑은동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(addDays(today, 6), null),
    hrInptYn: false,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 7,
    petSn: 2,
    schdlKndCd: 'HLTC0058',
    ckupTypeCd: null,
    hsptlNm: null,
    schdlNm: '미용',
    schdlDt: makeDateTime(addDays(today, 10), null),
    hrInptYn: false,
    memoCn: '',
    cldrBadgeColrCd: '#f59e0b',
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 8,
    petSn: 1,
    schdlKndCd: 'HLTC0060',
    ckupTypeCd: null,
    hsptlNm: null,
    schdlNm: '사료 주문',
    schdlDt: makeDateTime(addDays(today, 20), null),
    hrInptYn: false,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  // 일정이 5건인 날(캘린더 +n 확인용)
  {
    schdlSn: 9,
    petSn: 1,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0002',
    hsptlNm: '늘봄동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(addDays(today, 2), '09:30'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 10,
    petSn: 2,
    schdlKndCd: 'HLTC0058',
    ckupTypeCd: null,
    hsptlNm: null,
    schdlNm: '미용',
    schdlDt: makeDateTime(addDays(today, 2), '11:00'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 11,
    petSn: 3,
    schdlKndCd: 'HLTC0057',
    ckupTypeCd: 'HLTC0001',
    hsptlNm: '해맑은동물병원',
    schdlNm: null,
    schdlDt: makeDateTime(addDays(today, 2), '13:30'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 12,
    petSn: 1,
    schdlKndCd: 'HLTC0060',
    ckupTypeCd: null,
    hsptlNm: null,
    schdlNm: '사료 수령',
    schdlDt: makeDateTime(addDays(today, 2), '16:00'),
    hrInptYn: true,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
  {
    schdlSn: 13,
    petSn: 2,
    schdlKndCd: 'HLTC0060',
    ckupTypeCd: null,
    hsptlNm: null,
    schdlNm: '장난감 사기',
    schdlDt: makeDateTime(addDays(today, 2), null),
    hrInptYn: false,
    memoCn: '',
    cldrBadgeColrCd: null,
    ckupRcdCnt: 0,
  },
];

const getFakeSchedules = () => {
  if (getQueryParam('fakeSchedules') === '0') return [];
  const petSns = getFakePets().map((pet) => pet.petSn);
  return fakeSchedules.filter((schedule) => petSns.includes(schedule.petSn));
};

const toScheduleResponse = (schedule) => ({
  ...schedule,
  petNm: findPetNm(schedule.petSn),
});

/** 종합 건강기록 가짜 응답용 일정(summaryApi) */
export const getFakeScheduleList = () =>
  Promise.resolve(getFakeSchedules().map(toScheduleResponse));

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

/** 일정 삭제 알림을 받을 곳: 검진기록의 연결 일정 해제용(diaryApi) */
const scheduleDeletedListeners = [];

export const onScheduleDeleted = (listener) =>
  scheduleDeletedListeners.push(listener);

export const deleteSchedule = async ({ petSn, schdlSn }) => {
  await api.delete(`/pets/${petSn}/care-schedules/${schdlSn}`);
  scheduleDeletedListeners.forEach((listener) => listener(schdlSn));
};

const NEAR_SCHEDULE_DAYS = 7;

const isFakeHospital = (schedule) => schedule.schdlKndCd === HOSPITAL;

const findSameDayHospital = (petSn, ymd) =>
  fakeSchedules
    .filter(
      (schedule) =>
        schedule.petSn === petSn &&
        isFakeHospital(schedule) &&
        getYmdOf(schedule.schdlDt) === ymd,
    )
    .sort((a, b) => a.schdlSn - b.schdlSn)[0];

/** 가까운 예정 병원 일정 1건: 같은 날 병원 일정이 없고 앞뒤 7일 안에 검진기록 없는 일정(FN-HLT-002-46) */
export const findNearHospitalSchedule = ({ petSn, ckupYmd }) => {
  if (findSameDayHospital(petSn, ckupYmd)) return Promise.resolve(null);
  const distance = (schedule) =>
    Math.abs(diffDays(ckupYmd, getYmdOf(schedule.schdlDt)));
  const near = fakeSchedules
    .filter(
      (schedule) =>
        schedule.petSn === petSn &&
        isFakeHospital(schedule) &&
        schedule.ckupRcdCnt === 0 &&
        distance(schedule) <= NEAR_SCHEDULE_DAYS,
    )
    .sort((a, b) => distance(a) - distance(b) || a.schdlSn - b.schdlSn)[0];
  return Promise.resolve(near ? toScheduleResponse(near) : null);
};

/** 검진기록의 병원 일정 연결: 같은 날 일정 → 옮겨 연결(nearSchdlSn) → 새 일정 순, 연결한 일정 번호 반환 */
export const linkCheckupToSchedule = ({
  petSn,
  ckupYmd,
  hospNm,
  ckupTypeCd,
  nearSchdlSn,
}) => {
  let target = findSameDayHospital(petSn, ckupYmd);
  if (!target && nearSchdlSn != null) {
    target = fakeSchedules.find((schedule) => schedule.schdlSn === nearSchdlSn);
    target.schdlDt = makeDateTime(ckupYmd, null);
    target.hrInptYn = false;
  }
  if (!target) {
    target = {
      schdlSn: nextSchdlSn++,
      petSn,
      schdlKndCd: HOSPITAL,
      ckupTypeCd,
      hsptlNm: hospNm,
      schdlNm: null,
      schdlDt: makeDateTime(ckupYmd, null),
      hrInptYn: false,
      memoCn: '',
      cldrBadgeColrCd: null,
      ckupRcdCnt: 0,
    };
    fakeSchedules.push(target);
  }
  target.ckupRcdCnt += 1;
  return target.schdlSn;
};

/** 검진기록 삭제 시 연결 일정은 남기고 검진기록 수만 감소 */
export const unlinkCheckupFromSchedule = (schdlSn) => {
  const target = fakeSchedules.find((schedule) => schedule.schdlSn === schdlSn);
  if (target) target.ckupRcdCnt = Math.max(0, target.ckupRcdCnt - 1);
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

/** 검진상세 처방약·반복 예방과 이어진 케어 항목: 검진상세 가짜 응답이 쓰는 동안만 남긴 가짜(토탈 케어리스트에는 안 보인다) */

const fakeLinkedItems = [];

const findLinkedItem = ({ lnkgTypeCd, lnkgSn }) =>
  fakeLinkedItems.find(
    (item) => item.lnkgTypeCd === lnkgTypeCd && item.lnkgSn === lnkgSn,
  );

/** 연동 케어 항목 1건: 없으면 null. 반복 예방은 시작일이 다음 예정일 */
export const getLinkedCareItem = (link) => {
  const item = findLinkedItem(link);
  return item ? { ...item, nextSchdYmd: item.firstDueYmd ?? null } : null;
};

export const removeLinkedCareItem = (link) => {
  const item = findLinkedItem(link);
  if (item) fakeLinkedItems.splice(fakeLinkedItems.indexOf(item), 1);
};

/** 처방약 투약 항목 추가·갱신 */
export const saveLinkedDoseItem = ({
  ckupRcdSn,
  petSn,
  lnkgSn,
  careItemNm,
  dayGoalCnt,
  dosEndYmd,
}) => {
  const item = findLinkedItem({ lnkgTypeCd: 'PRSC', lnkgSn });
  if (item) {
    Object.assign(item, { careItemNm, dayGoalCnt, dosEndYmd });
    return;
  }
  fakeLinkedItems.push({
    lnkgTypeCd: 'PRSC',
    lnkgSn,
    ckupRcdSn,
    petSn,
    careItemNm,
    careZoneCd: CARE_ZONE.DAILY,
    dayGoalCnt,
    dosEndYmd,
  });
};

/** 반복 예방 정기관리 항목 추가: 시작일이 첫 예정일 */
export const createLinkedPreventionItem = ({
  ckupRcdSn,
  petSn,
  lnkgSn,
  careItemNm,
  rptCycleCd,
  rptCycleDayCnt,
  startYmd,
}) => {
  fakeLinkedItems.push({
    lnkgTypeCd: 'PRVNT',
    lnkgSn,
    ckupRcdSn,
    petSn,
    careItemNm,
    careZoneCd: CARE_ZONE.REGULAR,
    rptCycleCd,
    rptCycleDayCnt: rptCycleCd === CUSTOM_CYCLE ? Number(rptCycleDayCnt) : null,
    firstDueYmd: startYmd,
  });
};

/** 검진기록의 반려동물이 바뀌면 연동 케어 항목도 함께 옮김 */
export const moveLinkedCareItems = ({ ckupRcdSn, petSn }) => {
  fakeLinkedItems.forEach((item) => {
    if (item.ckupRcdSn === ckupRcdSn) item.petSn = petSn;
  });
};
