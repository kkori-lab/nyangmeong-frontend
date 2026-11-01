import { api } from '@/api/axios';

/** 배치 목록: [{ btchSeCd, btchNm, lastBgngDt, lastEndDt, lastRsltCd, prcsCnt, failRsn, runningYn, runnableYn }] */
export const getBatches = () => api.get('/admin/batches');

/** 실행 이력: { content, page, size, totalElements, totalPages, hasNext } */
export const getBatchHistory = (btchSeCd, params) =>
  api.get(`/admin/batches/${btchSeCd}/executions`, { params });

/** 수동 실행: { btchExcnHstrySn } */
export const runBatch = (btchSeCd) =>
  api.post(`/admin/batches/${btchSeCd}/run`);
