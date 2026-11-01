import { IS_DEV } from '@/api/env';
import {
  addDays,
  getNowHm,
  getTodayYmd,
  makeDateTime,
} from '@/utils/formatDate';
import { EXCN_RSLT, EXCN_SE, isRunning } from './batchLabels';

/**
 * [배치 현황 가짜 API]
 * - 백엔드 /api/admin/batches 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 메모리 값이라 새로고침하면 처음 상태로 돌아감. 개발 환경에서 ?fake=forbidden이면 403, ?fake=run-rejected면 수동 실행 거절
 * - 미확정: 이력·실행 경로, 응답 필드 이름, failCnt(BTCH_EXCN_HSTRY에 컬럼 없음), 거절 오류 코드
 */

/** 공통코드 SYSG02 배치 */
const BATCHES = [
  { btchSeCd: 'SYSC0006', btchSeNm: '케어미션 출제', bgngHm: '00:10' },
  { btchSeCd: 'SYSC0007', btchSeNm: '케어 일정 사전 알림', bgngHm: '09:00' },
  { btchSeCd: 'SYSC0008', btchSeNm: 'AI 대화 정리', bgngHm: '03:00' },
  { btchSeCd: 'SYSC0009', btchSeNm: '처방 만료', bgngHm: '00:00' },
];

/** 이력 쌓인 일수 */
const HISTORY_DAYS = 23;
/** 첫 화면의 실행 중 배치 */
const RUNNING_SEED_CD = 'SYSC0009';
/** 첫 화면의 실패 배치 */
const FAILED_SEED_CD = 'SYSC0006';
/** 첫 화면 실행 중 배치의 남은 시간 */
const RUNNING_SEED_MS = 60_000;
/** 수동 실행 걸리는 시간 */
const MANUAL_RUN_MS = 3_000;
/** 수동 실행 처리 건수 */
const MANUAL_PRCS_CNT = 12;

let nextHistorySn = 1;

const getQueryParam = (name) =>
  IS_DEV ? new URLSearchParams(window.location.search).get(name) : null;

/** 지난 실행 한 줄 */
const makePastHistory = ({ btchSeCd, bgngHm }, daysAgo) => {
  const ymd = addDays(getTodayYmd(), -daysAgo);
  const isFailed = btchSeCd === FAILED_SEED_CD && daysAgo === 0;
  return {
    btchExcnHstrySn: nextHistorySn++,
    btchSeCd,
    excnSeCd: EXCN_SE.AUTO,
    excnRsltCd: isFailed ? EXCN_RSLT.FAIL : EXCN_RSLT.SUCCESS,
    excnBgngDt: makeDateTime(ymd, bgngHm),
    excnEndDt: makeDateTime(ymd, bgngHm),
    prcsCnt: isFailed ? 0 : 100 + daysAgo,
    failCnt: isFailed ? 1 : 0,
    failRsn: isFailed ? '출제 대상 조회 응답 없음' : null,
    mbrNcnm: null,
  };
};

/** 실행 시작 한 줄 */
const makeRunningHistory = (btchSeCd, excnSeCd, mbrNcnm, runMs) => ({
  btchExcnHstrySn: nextHistorySn++,
  btchSeCd,
  excnSeCd,
  excnRsltCd: EXCN_RSLT.RUNNING,
  excnBgngDt: makeDateTime(getTodayYmd(), getNowHm()),
  excnEndDt: null,
  prcsCnt: null,
  failCnt: null,
  failRsn: null,
  mbrNcnm,
  finishAt: Date.now() + runMs,
});

/** 최신순 이력 */
let histories = [
  makeRunningHistory(RUNNING_SEED_CD, EXCN_SE.AUTO, null, RUNNING_SEED_MS),
  ...Array.from({ length: HISTORY_DAYS }, (_, daysAgo) =>
    BATCHES.map((batch) => makePastHistory(batch, daysAgo)),
  ).flat(),
];

/** 시간이 지난 실행 중 이력을 성공으로 마감 */
const settleHistories = () => {
  histories = histories.map((history) =>
    isRunning(history) && Date.now() >= history.finishAt
      ? {
          ...history,
          excnRsltCd: EXCN_RSLT.SUCCESS,
          excnEndDt: makeDateTime(getTodayYmd(), getNowHm()),
          prcsCnt: MANUAL_PRCS_CNT,
          failCnt: 0,
        }
      : history,
  );
};

/** 배치 목록: [{ btchSeCd, btchSeNm, excnRsltCd, excnBgngDt, prcsCnt, failRsn }] */
export const getBatches = async () => {
  if (getQueryParam('fake') === 'forbidden') {
    throw {
      code: 'ADMIN_ONLY',
      message: '관리자만 접근할 수 있습니다.',
      fields: null,
      data: null,
    };
  }
  settleHistories();
  return BATCHES.map(({ btchSeCd, btchSeNm }) => {
    const latest = histories.find((history) => history.btchSeCd === btchSeCd);
    return {
      btchSeCd,
      btchSeNm,
      excnRsltCd: latest?.excnRsltCd ?? null,
      excnBgngDt: latest?.excnBgngDt ?? null,
      prcsCnt: latest?.prcsCnt ?? null,
      failRsn: latest?.failRsn ?? null,
    };
  });
};

/** 실행 이력: { content, page, size, totalElements, totalPages, hasNext } */
export const getBatchHistory = async (btchSeCd, { page, size }) => {
  settleHistories();
  const matched = histories.filter((history) => history.btchSeCd === btchSeCd);
  const start = (page - 1) * size;
  return {
    content: matched.slice(start, start + size),
    page,
    size,
    totalElements: matched.length,
    totalPages: Math.ceil(matched.length / size),
    hasNext: start + size < matched.length,
  };
};

/** 수동 실행 */
export const runBatch = async (btchSeCd) => {
  settleHistories();
  const isAlreadyRunning = histories.some(
    (history) => history.btchSeCd === btchSeCd && isRunning(history),
  );
  if (isAlreadyRunning || getQueryParam('fake') === 'run-rejected') {
    throw {
      code: 'BATCH_ALREADY_RUNNING',
      message: '이미 실행 중인 배치예요.',
      fields: null,
      data: null,
    };
  }
  histories = [
    makeRunningHistory(btchSeCd, EXCN_SE.MANUAL, '관리자', MANUAL_RUN_MS),
    ...histories,
  ];
};
