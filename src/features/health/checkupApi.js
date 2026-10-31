import { api } from '@/api/axios';
import { addDays, getTodayYmd } from '@/utils/formatDate';
import { getLinkedCareItem, getQueryParam, removeLinkedCareItem } from './api';
import {
  ATTACHMENT_IMAGE,
  ATTACHMENT_LAB,
  DOSE_ENDED,
  DOSING,
} from './checkup/checkupTypes';

/**
 * [검진상세 API]
 * - 검진상세 조회와 첨부·기타검사·처방약·반복 예방·혈액검사 삭제는 실제 API(JAJ 백엔드)
 * - 아래 가짜 저장소(getCheckupTabs)는 종합 건강기록(summaryApi)이, 검사 수치 저장·수정·PDF 분석 가짜는 검사 수치 입력이 쓴다
 * - 가짜 필드 이름은 ERD 약어 기준 가안이고 메모리 배열이라 새로고침하면 처음 상태로 돌아감
 * - 개발 환경에서만 ?fakeCheckupDetail=0으로 가짜 검사·첨부·처방약·반복 예방 0건, PDF 분석 실패는 파일 이름에 fail
 */

const today = getTodayYmd();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 첫 검진기록(500)에 설계서 목업 값, 두 번째(501)에 처방약·반복 예방 1건씩 */
const SEED_CHECKUP_SN = 500;
const SECOND_SEED_CHECKUP_SN = 501;

let nextInspSn = 1;
let nextEtcInspSn = 1;
let nextAtchSn = 1;

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
    makeAttachment('HLTC0062', '접종증명서_20260812.jpg', 'image/jpeg'),
    makeAttachment(
      ATTACHMENT_IMAGE,
      '복부초음파_01.png',
      'image/png',
      'HLTC0069',
      'HLTC0074',
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
      prvntItmCd: 'HLTC0012',
      rptCycleCd: 'HLTC0040',
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
      prvntItmCd: 'HLTC0013',
      rptCycleCd: 'HLTC0040',
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

/** 검사·첨부·처방약·반복 예방 가짜 탭: 복용 종료일이 지난 처방약은 "종료"로 바꾸고 투약 항목을 뺌 */
export const getCheckupTabs = (ckupRcdSn) => {
  const store = getStore(ckupRcdSn);
  store.prescriptions.forEach((prescription) => {
    if (prescription.dosSttsCd === DOSING && isExpired(prescription)) {
      prescription.dosSttsCd = DOSE_ENDED;
      removeLinkedCareItem({ lnkgTypeCd: 'PRSC', lnkgSn: prescription.rxSn });
    }
  });
  return {
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

/** 첨부 목록은 첫 페이지 50건(서버 최대, 페이지는 1부터)만 받고 넘기지 않는다 */
const ATTACHMENT_PAGE_SIZE = 50;

/** 검진상세 탭별 조회: 목록 API는 모두 검진기록 번호(ckupRcdSn)가 필요하다 */

export const getInspectionValues = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/inspection-values`, { params: { ckupRcdSn } });

export const getEtcInspections = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/etc-inspections`, { params: { ckupRcdSn } });

/** 첨부는 Page 응답이라 content만 쓴다 */
export const getCheckupAttachments = ({ petSn, ckupRcdSn }) =>
  api
    .get(`/pets/${petSn}/checkup-attachments`, {
      params: { ckupRcdSn, page: 1, size: ATTACHMENT_PAGE_SIZE },
    })
    .then((page) => page.content);

/** 복용중이 먼저 오는 서버 순서 그대로 */
export const getPrescriptions = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/prescriptions`, { params: { ckupRcdSn } });

export const getRepeatPreventions = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/repeat-preventions`, { params: { ckupRcdSn } });

/** 첨부 자료: 영상 사진이 아니면 영상 종류·촬영 부위는 보내지 않는다 */

export const createAttachment = ({
  petSn,
  ckupRcdSn,
  atchTypeCd,
  file,
  imgKndCd,
  shtRegnCd,
}) => {
  const body = new FormData();
  body.append('ckupRcdSn', ckupRcdSn);
  body.append('file', file);
  body.append('atchTypeCd', atchTypeCd);
  if (atchTypeCd === ATTACHMENT_IMAGE) {
    body.append('imgKndCd', imgKndCd);
    body.append('shtRegnCd', shtRegnCd);
  }
  return api.post(`/pets/${petSn}/checkup-attachments`, body);
};

/** 교체는 파일 1건만 대체: 유형·영상 종류·촬영 부위는 보내지 않아 그대로 */
export const replaceAttachment = ({ petSn, ckupRcdAtchSn, file }) => {
  const body = new FormData();
  body.append('file', file);
  return api.patch(`/pets/${petSn}/checkup-attachments/${ckupRcdAtchSn}`, body);
};

export const deleteAttachment = ({ petSn, ckupRcdAtchSn }) =>
  api.delete(`/pets/${petSn}/checkup-attachments/${ckupRcdAtchSn}`);

/** 첨부 원본 파일(Blob): 다운로드·PDF 열기용 */
export const getAttachmentFile = ({ petSn, ckupRcdAtchSn }) =>
  api.get(`/pets/${petSn}/checkup-attachments/${ckupRcdAtchSn}`, {
    responseType: 'blob',
  });

/** 검사결과지 PDF 분석 호출부(LJS)가 생기기 전의 가짜. 인식한 항목을 돌려줌 */
export const analyzeLabPdf = async ({ ckupRcdSn, atchSn }) => {
  const target = getStore(ckupRcdSn).attachments.find(
    (item) => item.atchSn === atchSn,
  );
  await wait(800);
  if (target?.fileNm.includes('fail')) {
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

/** 선택한 혈액검사 행 삭제: inspNvlSn=1&inspNvlSn=2 형태로 보낸다 */
export const deleteInspections = ({ petSn, inspNvlSns }) =>
  api.delete(`/pets/${petSn}/inspection-values`, {
    params: { inspNvlSn: inspNvlSns },
    paramsSerializer: { indexes: null },
  });

/** 기타검사 */

export const createEtcInspection = ({ petSn, ...body }) =>
  api.post(`/pets/${petSn}/etc-inspections`, body);

export const updateEtcInspection = ({ petSn, etcInspSn, ...body }) =>
  api.patch(`/pets/${petSn}/etc-inspections/${etcInspSn}`, body);

export const deleteEtcInspection = ({ petSn, etcInspSn }) =>
  api.delete(`/pets/${petSn}/etc-inspections/${etcInspSn}`);

/** 처방약: 투약 케어 항목은 서버가 주기 체크(careRfltYn)·복용 상태에 맞춰 만들고 지운다 */

export const createPrescription = ({ petSn, ...body }) =>
  api.post(`/pets/${petSn}/prescriptions`, body);

export const updatePrescription = ({ petSn, prscSn, ...body }) =>
  api.patch(`/pets/${petSn}/prescriptions/${prscSn}`, body);

export const deletePrescription = ({ petSn, prscSn }) =>
  api.delete(`/pets/${petSn}/prescriptions/${prscSn}`);

/** 반복 예방: 정기관리 케어 항목은 서버가 만들고 지운다 */

export const createPrevention = ({ petSn, ...body }) =>
  api.post(`/pets/${petSn}/repeat-preventions`, body);

export const cancelPrevention = ({ petSn, reptPrvntMngSn }) =>
  api.delete(`/pets/${petSn}/repeat-preventions/${reptPrvntMngSn}`);
