import { api } from '@/api/axios';

/** 포인트 요약: 보유·이번 달 적립/사용·오늘 미션 */
export const getPointBalance = () => api.get('/members/me/points');

/** 월 내역(최신순, 한 달 전체, 페이지 없음). ym = 'YYYY-MM' */
export const getPointHistory = (ym) =>
  api.get('/point-ledgers', { params: { yearMonth: ym } });

/** 주양육 동물 한 마리의 그날 미션(출제 순서). ymd = 'YYYY-MM-DD' */
export const getCareMissions = (petSn, ymd) =>
  api.get(`/pets/${petSn}/daily-missions`, { params: { msnCrtrYmd: ymd } });
