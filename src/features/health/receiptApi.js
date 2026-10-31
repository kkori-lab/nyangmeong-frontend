import { findNearHospitalSchedule, getQueryParam } from './api';
import { createCheckup } from './diaryApi';

/**
 * [영수증 등록 API 가짜 응답]
 * - 영수증 인식은 LJS의 SCR-AIM-008(features/ai)이 AI 서버(POST /ai/receipts)로 수행, 그 응답을 결과 확인 모달이 그대로 사용
 * - 가까운 예정 일정 확인과 검진기록 저장은 실제 API, 처방 약품·가계부 지출 생성·중복 확인(SJM)은 Java API가 생기기 전까지 가짜
 * - 필드 이름은 ERD 약어 기준 가안, 메모리 배열이라 새로고침하면 처음 상태로 복귀
 * - 개발 환경에서만 ?fakeLedgerDup=1(가계부 중복), ?fakeReceiptSave=fail(저장 실패)로 확인
 */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 검진상세(SCR-HLT-005) 전이라 저장한 처방 약품을 쌓아만 둔다. 주기 체크는 OFF */
const fakePrescriptions = [];

/**
 * 가계부 지출(SJM). 같은 반려동물·날짜·금액이면 중복
 * 키는 가계부 도메인(`expndYmd`·`expndAmt`·`dtlMttr`·`expndPlcusNm`)과 같다. 병원명은 사용처에 넣고 내용은 사용자가 적는 메모라 비움
 */
const fakeLedger = [];

const isLedgerDuplicate = ({ petSn, ckupYmd, ledgerAmt }) =>
  fakeLedger.some(
    (expense) =>
      expense.petSn === petSn &&
      expense.expndYmd === ckupYmd &&
      expense.expndAmt === ledgerAmt,
  );

/**
 * 저장 전 확인에 필요한 것을 일괄 조회
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
 * 검진기록을 반려동물마다 실제 API로 만들고 처방 약품·가계부 지출은 가짜로 기록
 * 검진기록 API에 영수증 번호가 없어 영수증 연결은 아직 하지 않음. 반려동물마다 따로 저장해 중간에 실패하면 앞의 검진기록은 남음
 * entry.nearSchdlSn: 옮겨 연결할 예정 일정, entry.ledgerAmt: 가계부에 기록할 금액(없으면 null)
 */
export const saveReceiptCheckups = async ({
  recptSn,
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
      body: {
        ckupYmd,
        hsptlNm: hospNm,
        ckupTypeCd: entry.ckupTypeCd,
        ckupCn: entry.ckupCn,
        ckupMemoCn: entry.ckupMemoCn,
        schdlSn: entry.nearSchdlSn,
      },
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
        rcptSn: recptSn,
      });
    }
    saved.push({ petSn: entry.petSn, ckupRcdSn: checkup.ckupRcdSn });
  }
  return saved;
};
