import { api } from '@/api/axios';
import { DOSE_ENDED, DOSING } from './checkup/checkupTypes';

/** 결과 확인 모달의 복용 상태(ING·END)를 서버 코드(HLTG06)로 */
const PRSC_STTS_CD = { ING: DOSING, END: DOSE_ENDED };

/**
 * [영수증 저장 API]
 * - 영수증 인식은 LJS의 SCR-AIM-008(features/ai)이 AI 서버(POST /ai/receipts)로 수행, 그 응답을 결과 확인 모달이 그대로 사용
 * - 저장 전 확인(save-check)과 일괄 저장(save)은 Java API. 검진기록·처방 약품·가계부 지출을 서버가 한 번에 만든다
 * entry: buildSaveEntries의 한 탭. entry.nearSchdlSn은 옮겨 연결할 예정 일정, entry.ledgerAmt는 가계부에 기록할 금액(없으면 null)
 */

/**
 * 저장 전 확인에 필요한 것을 일괄 조회
 * - dupTabIds: 가계부에 같은 지출이 이미 있는 탭 (FN-HLT-002-44)
 * - nears: 가까운 예정 병원 일정이 있는 탭과 그 일정 (FN-HLT-002-46, 서버가 반려동물마다 가장 가까운 1건만 준다)
 */
export const prepareReceiptSave = async ({ recptSn, ckupYmd, entries }) => {
  const { duplicateExpenses, nearbySchedules } = await api.post(
    `/receipts/${recptSn}/save-check`,
    {
      ckupYmd,
      pets: entries.map((entry) => ({
        petSn: entry.petSn,
        amt: entry.ledgerAmt,
        expenseYn: entry.ledgerAmt != null,
      })),
    },
  );
  const findTab = (petSn) => entries.find((entry) => entry.petSn === petSn);
  const dupTabIds = entries
    .filter((entry) =>
      duplicateExpenses.some((expense) => expense.petSn === entry.petSn),
    )
    .map((entry) => entry.tabId);
  const nears = nearbySchedules
    .filter((schedule) => findTab(schedule.petSn))
    .map((schedule) => ({
      tabId: findTab(schedule.petSn).tabId,
      schedule,
    }));
  return { dupTabIds, nears };
};

/**
 * 검진기록·처방 약품·가계부 지출을 서버가 한 번에 저장하고 [{ petSn, ckupRcdSn }]을 돌려준다
 * idmptDmndId: 중복 클릭·재전송 방지 ID. 다시 시도해도 같은 값을 보내야 같은 요청으로 처리된다
 */
export const saveReceiptCheckups = async ({
  recptSn,
  idmptDmndId,
  ckupYmd,
  hospNm,
  entries,
}) => {
  const { ckupRcds } = await api.post(`/receipts/${recptSn}/save`, {
    idmptDmndId,
    hsptlNm: hospNm,
    ckupYmd,
    expndPlcusNm: hospNm,
    pets: entries.map((entry) => ({
      petSn: entry.petSn,
      ckupTypeCd: entry.ckupTypeCd,
      ckupCn: entry.ckupCn,
      ckupMemoCn: entry.ckupMemoCn,
      amt: entry.ledgerAmt,
      expenseYn: entry.ledgerAmt != null,
      schdlSn: entry.nearSchdlSn,
      drugs: entry.drugs.map((drug) => ({
        mdcnNm: drug.drugNm,
        mdcnBgngYmd: drug.startYmd,
        mdcnEndYmd: drug.endYmd,
        dayMdcnNmtm: drug.perDay,
        prscSttsCd: PRSC_STTS_CD[drug.statusCd],
      })),
    })),
  });
  return ckupRcds;
};

/**
 * 인식 실패 뒤 [직접 입력]으로 쓴 검진기록 1건을 영수증에 연결해 저장한다(FN-HLT-002-31)
 * - 서버가 영수증을 저장완료로 바꾸고, 가계부 지출은 만들지 않는다
 * - body는 직접 등록과 같은 키에 idmptDmndId를 더한 것. 응답은 검진기록 1건(recptSn 포함)
 */
export const createReceiptCheckup = ({ recptSn, petSn, body }) =>
  api.post(`/receipts/${recptSn}/checkups`, body, { params: { petSn } });
