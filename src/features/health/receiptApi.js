import { findNearHospitalSchedule, getPets, getQueryParam } from './api';
import { createCheckup } from './diaryApi';

/**
 * [영수증 등록 API 가짜 응답]
 * - 영수증 인식(YAY)과 가계부 지출 생성·중복 확인(SJM)이 생기기 전까지 쓰는 가짜 응답
 * - 영수증 업로드·인식 요청 자체는 LJS의 SCR-AIM-008(features/ai)이 하고, 그 응답은
 *   { rcptSn, petSn, items:[{ ckupNm, ckupYmd, ckupAmt }] }뿐이다. 병원명·구역·약품 등
 *   나머지는 여기 getReceiptDetail이 채운다(YAY를 연결할 때 한 응답으로 합친다)
 * - 필드 이름은 ERD 약어 기준 가안이고 메모리 배열이라 새로고침하면 처음 상태로 돌아간다
 * - 개발 환경에서만 ?fakeReceipt=zones(구역 2개)·nozone(구역 없음), ?fakeLedgerDup=1(가계부 중복),
 *   ?fakeReceiptSave=fail(저장 실패)로 확인한다
 */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 검진상세(SCR-HLT-005) 전이라 저장한 처방 약품을 쌓아만 둔다. 주기 체크는 OFF */
const fakePrescriptions = [];

/**
 * 가계부 지출(SJM). 같은 반려동물·날짜·금액이면 중복
 * 키는 가계부 도메인(`expndYmd`·`expndAmt`·`dtlMttr`·`expndPlcusNm`)과 같다. 병원명은 사용처에 넣고 내용은 사용자가 적는 메모라 비운다
 */
const fakeLedger = [];

const ROUND_UNIT = 1000;

/** 영수증 인식 결과의 나머지 칸: 병원명·구역별 품목·약품·할인 */
export const getReceiptDetail = async ({ rcptSn, petSn, items }) => {
  await wait(300);
  const pets = await getPets();
  const uploadPetNm = pets.find((pet) => pet.petSn === petSn)?.petNm ?? '';
  const first = items[0] ?? {};
  const ckupYmd = first.ckupYmd ?? '';
  const common = {
    rcptSn,
    ckupYmd,
    hospNm: ckupYmd ? '메이 동물 메디컬 센터' : '',
    imgUrl: null,
  };
  const mode = getQueryParam('fakeReceipt');

  if (mode === 'nozone') {
    return {
      ...common,
      totalAmt: 63000,
      discountAmt: 0,
      ckupTypeCd: 'REG',
      zones: [],
      lines: [
        { lineSn: 1, nm: '진찰료', amt: 10000, kind: 'item' },
        { lineSn: 2, nm: '종합백신', amt: 35000, kind: 'item' },
        {
          lineSn: 3,
          nm: '심장사상충 예방약',
          amt: 18000,
          kind: 'drug',
          days: 30,
          perDay: 1,
        },
      ],
    };
  }

  const totalAmt = first.ckupAmt ?? null;
  const isTwoZones = mode === 'zones';
  const discountAmt = isTwoZones ? 5000 : 3000;
  const gross = totalAmt == null ? null : totalAmt + discountAmt;
  const firstSubtotal =
    gross == null
      ? null
      : isTwoZones
        ? Math.round((gross * 0.6) / ROUND_UNIT) * ROUND_UNIT
        : gross;
  const zones = [
    {
      zoneNm: uploadPetNm,
      ckupTypeCd: 'DISE',
      subtotal: firstSubtotal,
      items: [
        { itmNm: '진찰료' },
        { itmNm: '피부 세포검사' },
        { itmNm: '주사' },
      ],
      drugs: [{ drugNm: '아포퀠 5.4mg', days: 7, perDay: 2, amt: 21000 }],
    },
  ];
  if (isTwoZones) {
    zones.push({
      zoneNm: '린이',
      ckupTypeCd: 'VACC',
      subtotal: gross == null ? null : gross - firstSubtotal,
      items: [{ itmNm: '종합백신' }],
      drugs: [],
    });
  }
  return { ...common, totalAmt, discountAmt, zones, lines: [] };
};

const isLedgerDuplicate = ({ petSn, ckupYmd, ledgerAmt }) =>
  fakeLedger.some(
    (expense) =>
      expense.petSn === petSn &&
      expense.expndYmd === ckupYmd &&
      expense.expndAmt === ledgerAmt,
  );

/**
 * 저장 전 확인에 필요한 것을 한 번에 조회한다
 * - dupTabIds: 가계부에 같은 지출이 이미 있는 탭 (FN-HLT-002-44)
 * - nears: 가까운 예정 병원 일정이 있는 탭과 그 일정 (FN-HLT-002-46)
 */
export const prepareReceiptSave = async ({ ckupYmd, entries }) => {
  await wait(200);
  const isForcedDuplicate = getQueryParam('fakeLedgerDup') === '1';
  let hasForced = false;
  const dupTabIds = entries
    .filter((entry) => {
      if (entry.ledgerAmt == null) return false;
      if (isForcedDuplicate && !hasForced) {
        hasForced = true;
        return true;
      }
      return isLedgerDuplicate({
        petSn: entry.petSn,
        ckupYmd,
        ledgerAmt: entry.ledgerAmt,
      });
    })
    .map((entry) => entry.tabId);
  const found = await Promise.all(
    entries.map(async (entry) => ({
      tabId: entry.tabId,
      schedule: await findNearHospitalSchedule({
        petSn: entry.petSn,
        ckupYmd,
      }),
    })),
  );
  return { dupTabIds, nears: found.filter((row) => row.schedule) };
};

/**
 * 검진기록을 반려동물마다 만들고 처방 약품·가계부 지출·영수증 연결을 함께 남긴다
 * 서버가 한 번에 처리하는 것으로 가정해 하나라도 실패하면 아무것도 만들지 않는다
 * entry.nearSchdlSn: 옮겨 연결할 예정 일정, entry.ledgerAmt: 가계부에 기록할 금액(없으면 null)
 */
export const saveReceiptCheckups = async ({
  rcptSn,
  ckupYmd,
  hospNm,
  entries,
}) => {
  await wait(500);
  if (getQueryParam('fakeReceiptSave') === 'fail') {
    throw new Error('저장하지 못했어요');
  }
  const saved = [];
  for (const entry of entries) {
    const checkup = await createCheckup({
      petSn: entry.petSn,
      ckupYmd,
      hospNm,
      ckupTypeCd: entry.ckupTypeCd,
      ckupCn: entry.ckupCn,
      ckupMemoCn: entry.ckupMemoCn,
      nearSchdlSn: entry.nearSchdlSn,
      rcptSn,
    });
    entry.drugs.forEach((drug) =>
      fakePrescriptions.push({
        ckupRcdSn: checkup.ckupRcdSn,
        ...drug,
        cycleChkYn: false,
      }),
    );
    if (entry.ledgerAmt != null) {
      fakeLedger.push({
        petSn: entry.petSn,
        expndYmd: ckupYmd,
        expndAmt: entry.ledgerAmt,
        dtlMttr: '',
        expndPlcusNm: hospNm,
        expsCtgrCd: 'HOSP',
        inputMthdCd: 'OCR',
        rcptSn,
      });
    }
    saved.push({ petSn: entry.petSn, ckupRcdSn: checkup.ckupRcdSn });
  }
  return saved;
};
