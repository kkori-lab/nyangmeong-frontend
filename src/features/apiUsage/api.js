import { api } from '@/api/axios';

/**
 * [외부 API 사용량 API] GET /admin/external-api-usage (관리자만, 아니면 403)
 * - params: bgngYmd·endYmd(yyyy-MM-dd, 끝 날짜 포함)·extlApiSeCd, 모두 선택. 기본 최근 7일, 최대 92일
 * - 기간이 뒤집혔거나 92일을 넘거나 없는 종류 코드면 400 INVALID_INPUT_VALUE
 */

const BASE_URL = '/admin/external-api-usage';

/** 값이 있는 칸만 남긴 쿼리(종류 전체면 extlApiSeCd를 보내지 않음) */
const pickFilled = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value));

/** 종류별 사용량(호출 없는 종류도 0): [{ extlApiSeCd, extlApiNm, callCnt, failCnt, failRate, avgRspnsMs }] */
export const getApiUsage = (params) =>
  api.get(BASE_URL, { params: pickFilled(params) });

/** 한 종류의 일별 사용량(최신순, 호출 있는 날만): [{ callYmd, extlApiSeCd, extlApiNm, callCnt, failCnt, failRate, avgRspnsMs }] */
export const getApiUsageDaily = (extlApiSeCd, params) =>
  api.get(`${BASE_URL}/daily`, {
    params: pickFilled({ ...params, extlApiSeCd }),
  });

/** AI 일별 토큰: [{ callYmd, inptTknCnt, otptTknCnt }]. 서버는 최신순이라 그래프용으로 날짜 오름차순으로 뒤집음 */
export const getApiTokens = async (params) => {
  const tokens = await api.get(`${BASE_URL}/tokens`, {
    params: pickFilled(params),
  });
  return [...tokens].sort((a, b) => a.callYmd.localeCompare(b.callYmd));
};

/** 실패·시간초과 목록(최신순, page 1부터): { content: [{ extlApiCallLogSn, callDt, extlApiSeCd, extlApiNm, callRsltCd, failRsn }], page, size, totalElements, totalPages, hasNext } */
export const getApiFailures = (params) =>
  api.get(`${BASE_URL}/failures`, { params: pickFilled(params) });
