import { IS_DEV } from '@/api/env';
import {
  addDays,
  getTodayYmd,
  getYmdOf,
  makeDateTime,
} from '@/utils/formatDate';
import { API_TYPES, CALL_RSLT } from './apiUsageLabels';

/**
 * [외부 API 사용량 가짜 API]
 * - 백엔드 /api/admin/external-api-usage 나오기 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 개발 환경에서 ?fake=forbidden이면 403
 * - 미확정: 경로 3종, 집계 필드 이름(callCnt·failRt·avgRspnsMs·callYmd)
 */

/** 가짜 기록이 쌓인 일수 */
const HISTORY_DAYS = 60;
/** 종류별 하루 기본 호출 수 */
const BASE_CALL_CNT = 40;
/** 종류별 하루 기본 응답 시간 */
const BASE_RSPNS_MS = 200;
/** 호출 1건당 입력·출력 토큰 */
const INPUT_TOKEN_PER_CALL = 900;
const OUTPUT_TOKEN_PER_CALL = 300;
/** 하루 실패 건수 주기 */
const FAIL_CYCLE = 4;
/** 실패 사유 */
const FAIL_REASONS = ['502', '429', '응답 형식 오류'];

/** 종류·날짜별 집계 한 줄 */
const makeDailyRow = ({ extlApiSeCd, hasToken }, typeIndex, daysAgo) => {
  const callCnt = BASE_CALL_CNT * (typeIndex + 1) + ((daysAgo * 13) % 50);
  return {
    extlApiSeCd,
    callYmd: addDays(getTodayYmd(), -daysAgo),
    callCnt,
    failCnt: (daysAgo + typeIndex) % FAIL_CYCLE,
    rspnsMsSum: callCnt * BASE_RSPNS_MS * (typeIndex + 1),
    inptTknCnt: hasToken ? callCnt * INPUT_TOKEN_PER_CALL : 0,
    otptTknCnt: hasToken ? callCnt * OUTPUT_TOKEN_PER_CALL : 0,
  };
};

const dailyRows = API_TYPES.flatMap((type, typeIndex) =>
  Array.from({ length: HISTORY_DAYS }, (_, daysAgo) =>
    makeDailyRow(type, typeIndex, daysAgo),
  ),
);

/** 집계 한 줄의 실패 호출 */
const makeFailures = ({ extlApiSeCd, callYmd, failCnt }) =>
  Array.from({ length: failCnt }, (_, index) => {
    const isTimeout = index % 2 === 1;
    return {
      extlApiCallLogSn: `${extlApiSeCd}-${callYmd}-${index}`,
      extlApiSeCd,
      callRsltCd: isTimeout ? CALL_RSLT.TIMEOUT : CALL_RSLT.FAIL,
      callDt: makeDateTime(
        callYmd,
        `${String(10 + index).padStart(2, '0')}:40`,
      ),
      failRsn: isTimeout ? null : FAIL_REASONS[index % FAIL_REASONS.length],
    };
  });

/** 최신순 실패 호출 */
const failures = dailyRows
  .flatMap(makeFailures)
  .sort((a, b) => b.callDt.localeCompare(a.callDt));

const assertAdmin = () => {
  const fake = IS_DEV
    ? new URLSearchParams(window.location.search).get('fake')
    : null;
  if (fake === 'forbidden') {
    throw {
      code: 'ADMIN_ONLY',
      message: '관리자만 접근할 수 있습니다.',
      fields: null,
      data: null,
    };
  }
};

/** 기간·종류에 맞는 값인지 */
const isMatched = (ymd, cd, { bgngYmd, endYmd, extlApiSeCd }) =>
  ymd >= bgngYmd && ymd <= endYmd && (!extlApiSeCd || cd === extlApiSeCd);

/** 집계 줄 합산 */
const summarize = (rows) => {
  const callCnt = rows.reduce((sum, row) => sum + row.callCnt, 0);
  const failCnt = rows.reduce((sum, row) => sum + row.failCnt, 0);
  const rspnsMsSum = rows.reduce((sum, row) => sum + row.rspnsMsSum, 0);
  return {
    callCnt,
    failRt: (failCnt / callCnt) * 100,
    avgRspnsMs: rspnsMsSum / callCnt,
  };
};

/** 종류별 사용량: [{ extlApiSeCd, callCnt, failRt, avgRspnsMs }] */
export const getApiUsage = async (params) => {
  assertAdmin();
  const matched = dailyRows.filter((row) =>
    isMatched(row.callYmd, row.extlApiSeCd, params),
  );
  return API_TYPES.flatMap(({ extlApiSeCd }) => {
    const rows = matched.filter((row) => row.extlApiSeCd === extlApiSeCd);
    return rows.length > 0 ? [{ extlApiSeCd, ...summarize(rows) }] : [];
  });
};

/** 한 종류의 일별 사용량: [{ callYmd, callCnt, failRt, avgRspnsMs }] */
export const getApiUsageDaily = async (extlApiSeCd, params) => {
  assertAdmin();
  return dailyRows
    .filter(
      (row) =>
        row.extlApiSeCd === extlApiSeCd &&
        isMatched(row.callYmd, extlApiSeCd, { ...params, extlApiSeCd }),
    )
    .sort((a, b) => b.callYmd.localeCompare(a.callYmd))
    .map((row) => ({ callYmd: row.callYmd, ...summarize([row]) }));
};

/** AI 일별 토큰(날짜순): [{ callYmd, inptTknCnt, otptTknCnt }] */
export const getApiTokens = async (params) => {
  assertAdmin();
  const totals = new Map();
  dailyRows
    .filter(
      (row) =>
        row.inptTknCnt > 0 && isMatched(row.callYmd, row.extlApiSeCd, params),
    )
    .forEach(({ callYmd, inptTknCnt, otptTknCnt }) => {
      const total = totals.get(callYmd) ?? {
        callYmd,
        inptTknCnt: 0,
        otptTknCnt: 0,
      };
      totals.set(callYmd, {
        callYmd,
        inptTknCnt: total.inptTknCnt + inptTknCnt,
        otptTknCnt: total.otptTknCnt + otptTknCnt,
      });
    });
  return [...totals.values()].sort((a, b) =>
    a.callYmd.localeCompare(b.callYmd),
  );
};

/** 실패 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getApiFailures = async ({ page, size, ...params }) => {
  assertAdmin();
  const matched = failures.filter((failure) =>
    isMatched(getYmdOf(failure.callDt), failure.extlApiSeCd, params),
  );
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
