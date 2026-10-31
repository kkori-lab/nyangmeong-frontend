import { api } from '@/api/axios';
import { addDays, getTodayYmd, getYear } from '@/utils/formatDate';
import {
  findNearHospitalSchedule,
  getQueryParam,
  moveLinkedCareItems,
} from './api';
import { MEAL, STOOL, WALK, WATER, WEIGHT } from './diaryTypes';

/**
 * [건강 일지 API]
 * - 검진기록은 실제 API(JAJ 백엔드). 종합 건강기록은 아직 아래 가짜 검진기록(getFakeCheckups)을 쓴다
 * - 일상 기록·지속 관찰 API(JAJ 백엔드)가 생기기 전까지 쓰는 가짜 응답
 * - 필드 이름은 ERD 약어 기준 가안이고 메모리 배열이라 새로고침하면 처음 상태로 돌아감
 * - 개발 환경에서만 ?fakeDaily=0(일상 기록 0건), ?fakeDaily=1(종류마다 1건)
 */

const today = getTodayYmd();

/** 일상 기록 */

let nextDlyRcdSn = 1000;

const makeRecord = (petSn, rcdTypeCd, dayOffset, rcdTm, value) => ({
  dlyRcdSn: nextDlyRcdSn++,
  petSn,
  rcdTypeCd,
  rcdYmd: addDays(today, dayOffset),
  rcdTm,
  rcdVal: rcdTypeCd === STOOL ? null : value,
  stlSttsCd: rcdTypeCd === STOOL ? value : null,
});

const buildFakeRecords = () => {
  const mode = getQueryParam('fakeDaily');
  if (mode === '0') return [];
  if (mode === '1') {
    return [
      makeRecord(1, WEIGHT, -1, '08:15', 3.8),
      makeRecord(1, MEAL, -1, '09:10', 180),
      makeRecord(1, WATER, -1, '10:20', 150),
      makeRecord(1, STOOL, -1, '11:00', 'NRML'),
      makeRecord(1, WALK, -1, '12:30', 15),
    ];
  }
  const records = [
    ...[
      [-13, 3.5],
      [-10, 3.6],
      [-8, 3.6],
      [-6, 3.7],
      [-4, 3.9],
      [-2, 3.8],
      [0, 3.8],
    ].map(([offset, value]) => makeRecord(1, WEIGHT, offset, '08:15', value)),
    ...[
      ['09:10', 180],
      ['13:30', 154],
      ['18:30', 130],
      ['19:40', 95],
      ['21:00', 80],
      ['22:10', 40],
      ['23:00', 30],
    ].map(([tm, value]) => makeRecord(1, MEAL, 0, tm, value)),
    makeRecord(1, WATER, 0, '10:20', 150),
    makeRecord(1, WATER, 0, '20:10', 170),
    makeRecord(1, WALK, 0, '12:30', 15),
    makeRecord(1, WALK, 0, '19:00', 20),
  ];
  for (let offset = -1; offset >= -9; offset -= 1) {
    records.push(
      makeRecord(1, MEAL, offset, '09:00', 70 + ((offset * -7) % 5) * 5),
      makeRecord(1, MEAL, offset, '14:00', 60 + ((offset * -3) % 4) * 10),
      makeRecord(1, MEAL, offset, '19:00', 65 + ((offset * -5) % 3) * 8),
      makeRecord(1, WATER, offset, '10:00', 120 + ((offset * -3) % 4) * 15),
      makeRecord(1, WATER, offset, '20:00', 110 + ((offset * -5) % 3) * 20),
      makeRecord(1, WALK, offset, '17:30', 20 + ((offset * -7) % 5) * 5),
      makeRecord(1, STOOL, offset, '08:40', offset === -4 ? 'SOFT' : 'NRML'),
    );
  }
  records.push(
    makeRecord(2, WEIGHT, -1, '08:00', 4.4),
    makeRecord(2, MEAL, 0, '09:00', 110),
    makeRecord(2, WALK, -1, '18:00', 25),
    makeRecord(3, WEIGHT, -2, '08:30', 9.1),
    makeRecord(3, WALK, 0, '07:30', 35),
    makeRecord(3, WALK, 0, '19:30', 40),
  );
  return records;
};

let fakeRecords = buildFakeRecords();

export const getDailyRecords = ({ petSn }) =>
  Promise.resolve({
    content: fakeRecords
      .filter((record) => record.petSn === petSn)
      .map((record) => ({ ...record })),
  });

const pickRecordFields = (body) => ({
  rcdTm: body.rcdTm,
  rcdVal: body.rcdTypeCd === STOOL ? null : Number(body.rcdVal),
  stlSttsCd: body.rcdTypeCd === STOOL ? body.stlSttsCd : null,
});

export const createDailyRecord = (body) => {
  const record = {
    dlyRcdSn: nextDlyRcdSn++,
    petSn: body.petSn,
    rcdTypeCd: body.rcdTypeCd,
    rcdYmd: body.rcdYmd,
    ...pickRecordFields(body),
  };
  fakeRecords = [...fakeRecords, record];
  return Promise.resolve({ ...record });
};

/** 종류·날짜는 바꾸지 않고 시각과 값만 수정 */
export const updateDailyRecord = ({ dlyRcdSn, ...body }) => {
  const target = fakeRecords.find((record) => record.dlyRcdSn === dlyRcdSn);
  Object.assign(
    target,
    pickRecordFields({ ...body, rcdTypeCd: target.rcdTypeCd }),
  );
  return Promise.resolve({ ...target });
};

export const deleteDailyRecord = (dlyRcdSn) => {
  fakeRecords = fakeRecords.filter((record) => record.dlyRcdSn !== dlyRcdSn);
  return Promise.resolve();
};

/** 지속 관찰 */

let nextObsvItmSn = 10;
let nextObsvRndSn = 100;

const makeRound = (obsvItmSn, dayOffset, extra = {}) => ({
  obsvRndSn: nextObsvRndSn++,
  obsvItmSn,
  obsvYmd: addDays(today, dayOffset),
  photoPath: null,
  obsvSizeMm: null,
  obsvChgCd: null,
  obsvMemoCn: '',
  ...extra,
});

const buildFakeObservations = () => {
  if (getQueryParam('fakeDaily') === '0') return { items: [], rounds: [] };
  if (getQueryParam('fakeDaily') === '1') {
    return {
      items: [
        {
          obsvItmSn: 1,
          petSn: 1,
          obsvItmNm: '피부 점',
          obsvPrtCd: 'BACK',
          obsvPrtDtlNm: '오른쪽 어깨',
          obsvEndYmd: null,
        },
      ],
      rounds: [makeRound(1, -13, { obsvSizeMm: 3.0 })],
    };
  }
  return {
    items: [
      {
        obsvItmSn: 1,
        petSn: 1,
        obsvItmNm: '피부 점',
        obsvPrtCd: 'BACK',
        obsvPrtDtlNm: '오른쪽 어깨',
        obsvEndYmd: null,
      },
      {
        obsvItmSn: 2,
        petSn: 1,
        obsvItmNm: '눈 분비물',
        obsvPrtCd: 'FACE',
        obsvPrtDtlNm: '왼쪽 눈',
        obsvEndYmd: null,
      },
      {
        obsvItmSn: 3,
        petSn: 1,
        obsvItmNm: '피부 발진',
        obsvPrtCd: 'BELY',
        obsvPrtDtlNm: '아랫배',
        obsvEndYmd: null,
      },
      {
        obsvItmSn: 4,
        petSn: 1,
        obsvItmNm: '발바닥 상처',
        obsvPrtCd: 'FRLG',
        obsvPrtDtlNm: '왼쪽 앞발',
        obsvEndYmd: addDays(today, -40),
      },
    ],
    rounds: [
      makeRound(1, -46, { obsvSizeMm: 3.0 }),
      makeRound(1, -39, { obsvSizeMm: 3.2 }),
      makeRound(1, -36),
      makeRound(1, -30, {
        obsvSizeMm: 3.5,
        obsvChgCd: 'GROW',
        obsvMemoCn: '색이 조금 진해진 듯함',
      }),
      makeRound(2, -41),
      makeRound(3, -35, { obsvChgCd: 'SHRK' }),
      makeRound(4, -80),
      makeRound(4, -40),
    ],
  };
};

const fakeObservation = buildFakeObservations();
let fakeObsvItems = fakeObservation.items;
let fakeObsvRounds = fakeObservation.rounds;

const compareRounds = (a, b) =>
  a.obsvYmd === b.obsvYmd
    ? a.obsvRndSn - b.obsvRndSn
    : a.obsvYmd < b.obsvYmd
      ? -1
      : 1;

/** 관찰 중인 항목이 앞, 종료한 항목이 뒤 */
export const getObservations = ({ petSn }) => {
  const items = fakeObsvItems
    .filter((item) => item.petSn === petSn)
    .map((item) => ({
      ...item,
      rounds: fakeObsvRounds
        .filter((round) => round.obsvItmSn === item.obsvItmSn)
        .sort(compareRounds)
        .map((round) => ({ ...round })),
    }))
    .sort(
      (a, b) =>
        Number(a.obsvEndYmd !== null) - Number(b.obsvEndYmd !== null) ||
        a.obsvItmSn - b.obsvItmSn,
    );
  return Promise.resolve({ content: items });
};

const pickRoundFields = (body) => ({
  obsvYmd: body.obsvYmd,
  photoPath: body.photoPath,
  obsvSizeMm: body.obsvSizeMm === '' ? null : Number(body.obsvSizeMm),
  obsvChgCd: body.obsvChgCd || null,
  obsvMemoCn: body.obsvMemoCn ?? '',
});

/** 새 항목과 1회차를 함께 저장 */
export const createObservation = (body) => {
  const item = {
    obsvItmSn: nextObsvItmSn++,
    petSn: body.petSn,
    obsvItmNm: body.obsvItmNm,
    obsvPrtCd: body.obsvPrtCd,
    obsvPrtDtlNm: body.obsvPrtDtlNm,
    obsvEndYmd: null,
  };
  const round = {
    obsvRndSn: nextObsvRndSn++,
    obsvItmSn: item.obsvItmSn,
    ...pickRoundFields({ ...body, obsvChgCd: null }),
  };
  fakeObsvItems = [...fakeObsvItems, item];
  fakeObsvRounds = [...fakeObsvRounds, round];
  return Promise.resolve({
    obsvItmSn: item.obsvItmSn,
    obsvRndSn: round.obsvRndSn,
  });
};

export const createObservationRound = ({ obsvItmSn, ...body }) => {
  const item = fakeObsvItems.find((target) => target.obsvItmSn === obsvItmSn);
  if (item.obsvEndYmd !== null) {
    return Promise.reject(
      new Error('종료한 관찰 항목에는 기록을 추가할 수 없어요'),
    );
  }
  const round = {
    obsvRndSn: nextObsvRndSn++,
    obsvItmSn,
    ...pickRoundFields(body),
  };
  fakeObsvRounds = [...fakeObsvRounds, round];
  return Promise.resolve({ obsvItmSn, obsvRndSn: round.obsvRndSn });
};

export const updateObservationRound = ({ obsvRndSn, ...body }) => {
  const target = fakeObsvRounds.find((round) => round.obsvRndSn === obsvRndSn);
  Object.assign(target, pickRoundFields(body));
  return Promise.resolve({
    obsvItmSn: target.obsvItmSn,
    obsvRndSn: target.obsvRndSn,
  });
};

/** 회차가 하나뿐이면 항목까지 삭제 */
export const deleteObservationRound = (obsvRndSn) => {
  const target = fakeObsvRounds.find((round) => round.obsvRndSn === obsvRndSn);
  fakeObsvRounds = fakeObsvRounds.filter(
    (round) => round.obsvRndSn !== obsvRndSn,
  );
  const hasMore = fakeObsvRounds.some(
    (round) => round.obsvItmSn === target.obsvItmSn,
  );
  if (!hasMore) {
    fakeObsvItems = fakeObsvItems.filter(
      (item) => item.obsvItmSn !== target.obsvItmSn,
    );
  }
  return Promise.resolve({
    obsvItmSn: target.obsvItmSn,
    isItemDeleted: !hasMore,
  });
};

export const endObservation = (obsvItmSn) => {
  const target = fakeObsvItems.find((item) => item.obsvItmSn === obsvItmSn);
  target.obsvEndYmd = today;
  return Promise.resolve();
};

/** 종합 건강기록용 가짜 검진기록: SCR-HLT-011 API 연결 때 지운다 */

let nextCkupRcdSn = 500;

const makeCheckup = (petSn, schdlSn, ckupYmd, hospNm, ckupTypeCd, ckupCn) => ({
  ckupRcdSn: nextCkupRcdSn++,
  petSn,
  schdlSn,
  ckupYmd,
  hospNm,
  ckupTypeCd,
  ckupCn,
  ckupMemoCn: '',
});

const buildFakeCheckups = () => {
  if (getQueryParam('fakeDaily') === '0') return [];
  const year = getYear(today);
  return [
    makeCheckup(
      1,
      1,
      addDays(today, -10),
      '늘봄동물병원',
      'HLTC0001',
      '전반적으로 양호, 체중 소폭 증가 관찰',
    ),
    makeCheckup(
      1,
      11,
      `${year - 1}-12-14`,
      '행복동물병원',
      'HLTC0002',
      '종합백신 5차 접종 완료',
    ),
    makeCheckup(
      1,
      12,
      `${year}-05-02`,
      '늘봄동물병원',
      'HLTC0003',
      '피부 가려움 증상으로 내원, 연고 처방',
    ),
    makeCheckup(
      1,
      13,
      `${year}-03-20`,
      '행복동물병원',
      'HLTC0004',
      '혈액검사 진행',
    ),
    makeCheckup(
      1,
      14,
      `${year}-02-08`,
      '늘봄동물병원',
      'HLTC0002',
      '코로나장염 백신 접종',
    ),
    makeCheckup(
      1,
      15,
      `${year}-01-15`,
      '행복동물병원',
      'ETC',
      '발톱 부러짐으로 내원, 응급 처치',
    ),
    makeCheckup(3, 16, `${year}-04-11`, '해맑은동물병원', 'HLTC0001', ''),
    ...[
      ['01-05', '늘봄동물병원', 'HLTC0001', '신년 정기검진, 이상 없음'],
      ['01-28', '행복동물병원', 'HLTC0002', '광견병 추가 접종'],
      ['02-19', '늘봄동물병원', 'HLTC0003', '구토 증상으로 내원'],
      ['03-07', '행복동물병원', 'HLTC0004', '소변검사 진행'],
      ['04-02', '늘봄동물병원', 'ETC', '발톱 정리 상담'],
      ['04-25', '행복동물병원', 'HLTC0001', '체중 변화 확인'],
      ['05-18', '늘봄동물병원', 'HLTC0002', '켄넬코프 백신 접종'],
      ['06-03', '행복동물병원', 'HLTC0003', '귀 염증 치료'],
    ].map(([md, hosp, type, cn], index) =>
      makeCheckup(1, 20 + index, `${year}-${md}`, hosp, type, cn),
    ),
  ];
};

const fakeCheckups = buildFakeCheckups();

/** 종합 건강기록용: 조회 연도의 가짜 검진기록(최신 순)과 그 반려동물의 검진기록이 있는 연도 목록 */
export const getFakeCheckups = ({ petSn, year }) => {
  const petCheckups = fakeCheckups.filter((checkup) => checkup.petSn === petSn);
  const content = petCheckups
    .filter((checkup) => getYear(checkup.ckupYmd) === year)
    .sort((a, b) =>
      a.ckupYmd === b.ckupYmd
        ? b.ckupRcdSn - a.ckupRcdSn
        : a.ckupYmd < b.ckupYmd
          ? 1
          : -1,
    )
    .map((checkup) => ({ ...checkup }));
  const years = [
    ...new Set(petCheckups.map((checkup) => getYear(checkup.ckupYmd))),
  ].sort((a, b) => b - a);
  return Promise.resolve({ content, years, hasAnyCheckup: years.length > 0 });
};

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
  const oldestYear = getYear(
    (oldest.content[0] ?? newest.content[0]).ckupYmd,
  );
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
 * - 검진상세 가짜 연동 케어 항목도 함께 옮긴다
 */
export const updateCheckup = async ({ petSn, ckupRcdSn, body }) => {
  const checkup = await api.patch(
    `/pets/${petSn}/checkups/${ckupRcdSn}`,
    body,
  );
  if (checkup.petSn !== petSn) {
    moveLinkedCareItems({ ckupRcdSn, petSn: checkup.petSn });
  }
  return checkup;
};
