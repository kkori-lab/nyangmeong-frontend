import { addDays, getTodayYmd } from '@/utils/formatDate';
import {
  createLinkedPreventionItem,
  getLinkedCareItem,
  getQueryParam,
  removeLinkedCareItem,
  saveLinkedDoseItem,
} from './api';
import {
  ATTACHMENT_IMAGE,
  ATTACHMENT_LAB,
  DOSE_ENDED,
  DOSING,
  PREVENTION_ITEMS,
  findName,
} from './checkup/checkupTypes';
import { getCheckup } from './diaryApi';

/**
 * [검진상세 API 가짜 응답]
 * - 검사 결과·첨부 자료·처방약·반복 예방 API(JAJ 백엔드)와 PDF 분석(LJS)이 생기기 전까지 쓰는 가짜 응답
 * - 필드 이름은 ERD 약어 기준 가안이고 메모리 배열이라 새로고침하면 처음 상태로 돌아감
 * - 개발 환경에서만 ?fakeCheckupDetail=0으로 검사·첨부·처방약·반복 예방 0건, PDF 분석 실패는 파일 이름에 fail
 */

const today = getTodayYmd();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 첫 검진기록(500)에 설계서 목업 값, 두 번째(501)에 처방약·반복 예방 1건씩 */
const SEED_CHECKUP_SN = 500;
const SECOND_SEED_CHECKUP_SN = 501;

let nextInspSn = 1;
let nextEtcInspSn = 1;
let nextAtchSn = 1;
let nextRxSn = 100;
let nextPrvntSn = 100;

const makeBlood = (fnctTagCd, inspItmNm, rsltVal, unitNm, min, max) => ({
  inspSn: nextInspSn++,
  fnctTagCd,
  inspItmNm,
  rsltVal,
  unitNm,
  refMinVal: min,
  refMaxVal: max,
});

const makeEtc = (inspNm, rsltCn, memoCn) => ({
  etcInspSn: nextEtcInspSn++,
  inspNm,
  rsltCn,
  memoCn,
});

const makeAttachment = (
  atchTypeCd,
  fileNm,
  mimeType,
  imgKindCd,
  imgPartCd,
) => ({
  atchSn: nextAtchSn++,
  atchTypeCd,
  fileNm,
  mimeType,
  fileUrl: null,
  imgKindCd: imgKindCd ?? null,
  imgPartCd: imgPartCd ?? null,
});

const makeEmptyStore = () => ({
  blood: [],
  etc: [],
  attachments: [],
  prescriptions: [],
  preventions: [],
});

const buildSeedStore = () => ({
  blood: [
    makeBlood('CBC', 'WBC', 8.2, 'K/μL', 5.5, 19.5),
    makeBlood('CBC', 'RBC', 7.1, 'M/μL', 5.0, 10.0),
    makeBlood('CBC', 'HGB', 14.5, 'g/dL', 12.0, 18.0),
    makeBlood('KID', 'BUN', 32, 'mg/dL', 7, 27),
    makeBlood('KID', 'CREA', 1.8, 'mg/dL', 0.8, 1.5),
    makeBlood('LIV', 'ALT', 45, 'U/L', 10, 100),
    makeBlood('GLU', 'GLU', 62, 'mg/dL', 70, 150),
  ],
  etc: [
    makeEtc('체온', '38.4℃, 정상 범위라고 설명 들음', '내원 직후 측정'),
    makeEtc(
      '소변검사',
      '요비중 약간 높음, 단백뇨 음성',
      '물 더 마시게 하라고 함',
    ),
    makeEtc('알레르기 검사', '닭고기 양성, 소고기 음성', ''),
  ],
  attachments: [
    makeAttachment(ATTACHMENT_LAB, '검사결과_20260812.pdf', 'application/pdf'),
    makeAttachment('VACC', '접종증명서_20260812.jpg', 'image/jpeg'),
    makeAttachment(
      ATTACHMENT_IMAGE,
      '복부초음파_01.png',
      'image/png',
      'US',
      'ABDM',
    ),
  ],
  prescriptions: [
    {
      rxSn: 1,
      medNm: '소염제(멜록시캄) 1정',
      dosBgnYmd: addDays(today, -5),
      dosEndYmd: addDays(today, 5),
      dayDosCnt: 2,
      dosSttsCd: DOSING,
      cycleChckYn: true,
    },
  ],
  preventions: [
    {
      prvntSn: 1,
      prvntItmCd: 'HW',
      rptCycleCd: '1M',
      rptCycleDayCnt: null,
      startYmd: addDays(today, -16),
    },
  ],
});

const buildSecondSeedStore = () => ({
  ...makeEmptyStore(),
  prescriptions: [
    {
      rxSn: 2,
      medNm: '영양제',
      dosBgnYmd: addDays(today, -10),
      dosEndYmd: addDays(today, 40),
      dayDosCnt: 1,
      dosSttsCd: DOSING,
      cycleChckYn: true,
    },
  ],
  preventions: [
    {
      prvntSn: 2,
      prvntItmCd: 'DWM',
      rptCycleCd: '1M',
      rptCycleDayCnt: null,
      startYmd: addDays(today, -20),
    },
  ],
});

/** 종합 건강기록 검사 수치 추이용: 502·503에 신장 수치 이력(검진기록 500의 CREA·BUN과 이어짐) */
const buildHistorySeedStore = (crea, bun) => ({
  ...makeEmptyStore(),
  blood: [
    makeBlood('KID', 'BUN', bun, 'mg/dL', 7, 27),
    makeBlood('KID', 'CREA', crea, 'mg/dL', 0.8, 1.5),
  ],
});

const stores = new Map();

const getStore = (ckupRcdSn) => {
  if (!stores.has(ckupRcdSn)) {
    const isSeedOff = getQueryParam('fakeCheckupDetail') === '0';
    let store = makeEmptyStore();
    if (!isSeedOff && ckupRcdSn === SEED_CHECKUP_SN) store = buildSeedStore();
    if (!isSeedOff && ckupRcdSn === SECOND_SEED_CHECKUP_SN) {
      store = buildSecondSeedStore();
    }
    if (!isSeedOff && ckupRcdSn === 502) store = buildHistorySeedStore(1.2, 26);
    if (!isSeedOff && ckupRcdSn === 503) store = buildHistorySeedStore(1.4, 29);
    stores.set(ckupRcdSn, store);
  }
  return stores.get(ckupRcdSn);
};

const isExpired = (prescription) => prescription.dosEndYmd < today;

/** 처방약 저장 뒤 투약 케어 항목 맞춤: 주기 체크 ON·복용중이면 추가·갱신, 아니면 삭제(완료 기록은 유지) */
const syncDoseItem = (checkup, prescription) => {
  const link = { lnkgTypeCd: 'PRSC', lnkgSn: prescription.rxSn };
  if (prescription.cycleChckYn && prescription.dosSttsCd === DOSING) {
    saveLinkedDoseItem({
      ckupRcdSn: checkup.ckupRcdSn,
      petSn: checkup.petSn,
      lnkgSn: prescription.rxSn,
      careItemNm: prescription.medNm,
      dayGoalCnt: prescription.dayDosCnt,
      dosEndYmd: prescription.dosEndYmd,
    });
  } else {
    removeLinkedCareItem(link);
  }
};

/** 검진상세 한 번에 조회: 복용 종료일이 지난 처방약은 "종료"로 바꾸고 투약 항목을 뺌 */
export const getCheckupDetail = async (ckupRcdSn) => {
  const checkup = await getCheckup(ckupRcdSn);
  const store = getStore(ckupRcdSn);
  store.prescriptions.forEach((prescription) => {
    if (prescription.dosSttsCd === DOSING && isExpired(prescription)) {
      prescription.dosSttsCd = DOSE_ENDED;
      removeLinkedCareItem({ lnkgTypeCd: 'PRSC', lnkgSn: prescription.rxSn });
    }
  });
  return {
    checkup,
    bloodInspections: store.blood.map((item) => ({ ...item })),
    etcInspections: store.etc.map((item) => ({ ...item })),
    attachments: store.attachments.map((item) => ({ ...item })),
    prescriptions: store.prescriptions.map((item) => ({ ...item })),
    preventions: store.preventions.map((item) => ({
      ...item,
      nextSchdYmd:
        getLinkedCareItem({ lnkgTypeCd: 'PRVNT', lnkgSn: item.prvntSn })
          ?.nextSchdYmd ?? null,
    })),
  };
};

/** 첨부 자료 */

export const createAttachment = async ({
  ckupRcdSn,
  atchTypeCd,
  file,
  imgKindCd,
  imgPartCd,
}) => {
  const attachment = {
    atchSn: nextAtchSn++,
    atchTypeCd,
    fileNm: file.name,
    mimeType: file.type,
    fileUrl: URL.createObjectURL(file),
    imgKindCd: atchTypeCd === ATTACHMENT_IMAGE ? imgKindCd : null,
    imgPartCd: atchTypeCd === ATTACHMENT_IMAGE ? imgPartCd : null,
  };
  getStore(ckupRcdSn).attachments.push(attachment);
  return { ...attachment };
};

/** 교체는 해당 파일 1건만 대체: 유형·영상 종류·촬영 부위는 그대로 */
export const replaceAttachment = async ({ ckupRcdSn, atchSn, file }) => {
  const target = getStore(ckupRcdSn).attachments.find(
    (item) => item.atchSn === atchSn,
  );
  if (target.fileUrl) URL.revokeObjectURL(target.fileUrl);
  Object.assign(target, {
    fileNm: file.name,
    mimeType: file.type,
    fileUrl: URL.createObjectURL(file),
  });
  return { ...target };
};

export const deleteAttachment = async ({ ckupRcdSn, atchSn }) => {
  const store = getStore(ckupRcdSn);
  const target = store.attachments.find((item) => item.atchSn === atchSn);
  if (target?.fileUrl) URL.revokeObjectURL(target.fileUrl);
  store.attachments = store.attachments.filter(
    (item) => item.atchSn !== atchSn,
  );
};

/** 검사결과지 PDF 분석 호출부(LJS)가 생기기 전의 가짜. 인식한 항목을 돌려줌 */
export const analyzeLabPdf = async ({ ckupRcdSn, atchSn }) => {
  const target = getStore(ckupRcdSn).attachments.find(
    (item) => item.atchSn === atchSn,
  );
  await wait(800);
  if (target.fileNm.includes('fail')) {
    throw {
      code: 'PDF_ANALYSIS_FAILED',
      message: 'PDF를 분석하지 못했어요. 잠시 뒤 다시 시도해 주세요',
      fields: null,
    };
  }
  return {
    atchSn,
    items: [
      {
        inspItmNm: 'SDMA',
        rsltVal: 12,
        unitNm: 'μg/dL',
        refMinVal: 0,
        refMaxVal: 14,
      },
      {
        inspItmNm: 'AST',
        rsltVal: 32,
        unitNm: 'U/L',
        refMinVal: 13,
        refMaxVal: 50,
      },
      {
        inspItmNm: 'PLT',
        rsltVal: null,
        unitNm: null,
        refMinVal: null,
        refMaxVal: null,
      },
      {
        inspItmNm: 'CREA',
        rsltVal: 1.8,
        unitNm: 'mg/dL',
        refMinVal: 0.8,
        refMaxVal: 1.5,
      },
      {
        inspItmNm: 'USG',
        rsltVal: 1.035,
        unitNm: null,
        refMinVal: null,
        refMaxVal: null,
        bloodYn: false,
      },
    ],
  };
};

/** 검사 결과 */

/** 혈액검사 여러 건 저장(수동 추가 1건 또는 PDF 분석 결과). 서버가 한 번에 처리한다고 보고 전체 성공·실패로 처리 */
export const createInspections = async ({ ckupRcdSn, items }) => {
  const store = getStore(ckupRcdSn);
  const created = items.map((item) => ({ inspSn: nextInspSn++, ...item }));
  store.blood.push(...created);
  return created.map((item) => ({ ...item }));
};

/** 저장된 행을 갱신: 검사 항목은 바꾸지 않고 결과값·단위·참고범위·메모만 */
export const updateInspection = async ({ ckupRcdSn, inspSn, ...body }) => {
  const target = getStore(ckupRcdSn).blood.find(
    (item) => item.inspSn === inspSn,
  );
  Object.assign(target, body);
  return { ...target };
};

export const deleteInspections = async ({ ckupRcdSn, inspSns }) => {
  const store = getStore(ckupRcdSn);
  store.blood = store.blood.filter((item) => !inspSns.includes(item.inspSn));
};

export const createEtcInspection = async ({ ckupRcdSn, ...body }) => {
  const etc = makeEtc(body.inspNm, body.rsltCn, body.memoCn);
  getStore(ckupRcdSn).etc.push(etc);
  return { ...etc };
};

export const updateEtcInspection = async ({
  ckupRcdSn,
  etcInspSn,
  ...body
}) => {
  const target = getStore(ckupRcdSn).etc.find(
    (item) => item.etcInspSn === etcInspSn,
  );
  Object.assign(target, body);
  return { ...target };
};

export const deleteEtcInspection = async ({ ckupRcdSn, etcInspSn }) => {
  const store = getStore(ckupRcdSn);
  store.etc = store.etc.filter((item) => item.etcInspSn !== etcInspSn);
};

/** 처방약 */

export const createPrescription = async ({ ckupRcdSn, ...body }) => {
  const checkup = await getCheckup(ckupRcdSn);
  const prescription = { rxSn: nextRxSn++, ...body };
  getStore(ckupRcdSn).prescriptions.push(prescription);
  syncDoseItem(checkup, prescription);
  return { ...prescription };
};

export const updatePrescription = async ({ ckupRcdSn, rxSn, ...body }) => {
  const checkup = await getCheckup(ckupRcdSn);
  const target = getStore(ckupRcdSn).prescriptions.find(
    (item) => item.rxSn === rxSn,
  );
  Object.assign(target, body);
  syncDoseItem(checkup, target);
  return { ...target };
};

/** 처방약을 지우면 자동 추가된 투약 항목도 삭제 */
export const deletePrescription = async ({ ckupRcdSn, rxSn }) => {
  const store = getStore(ckupRcdSn);
  removeLinkedCareItem({ lnkgTypeCd: 'PRSC', lnkgSn: rxSn });
  store.prescriptions = store.prescriptions.filter(
    (item) => item.rxSn !== rxSn,
  );
};

/** 반복 예방 */

export const createPrevention = async ({ ckupRcdSn, ...body }) => {
  const checkup = await getCheckup(ckupRcdSn);
  const prevention = { prvntSn: nextPrvntSn++, ...body };
  getStore(ckupRcdSn).preventions.push(prevention);
  createLinkedPreventionItem({
    ckupRcdSn,
    petSn: checkup.petSn,
    lnkgSn: prevention.prvntSn,
    careItemNm: findName(PREVENTION_ITEMS, prevention.prvntItmCd),
    rptCycleCd: prevention.rptCycleCd,
    rptCycleDayCnt: prevention.rptCycleDayCnt,
    startYmd: prevention.startYmd,
  });
  return { ...prevention };
};

/** 해지하면 자동 추가된 정기관리 항목을 삭제하고 완료 기록은 유지 */
export const cancelPrevention = async ({ ckupRcdSn, prvntSn }) => {
  const store = getStore(ckupRcdSn);
  removeLinkedCareItem({ lnkgTypeCd: 'PRVNT', lnkgSn: prvntSn });
  store.preventions = store.preventions.filter(
    (item) => item.prvntSn !== prvntSn,
  );
};
