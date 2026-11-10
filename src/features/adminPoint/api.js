import { api } from '@/api/axios';
import { PNT_DLNG_TYPE_GROUP } from './pointLabels';

/**
 * [관리자 포인트 API]
 * - 계약: 백엔드 `docs/api/pet.md` `/admin/points` 두 행
 * - 원장 행(AdminPointLedgerRow): pntGnlgrSn, mbrSn, mbrNcnm, pntDlngTypeCd, pntDlngTypeCdNm,
 *   dlngPnt, dlngAftrBlncPnt, memoCn, regDt
 */

/** 거래 유형 목록: [{ comCd, comCdNm, sortSeq }] */
export const getPointDealTypes = () =>
  api.get('/common-codes', { params: { prntComCd: PNT_DLNG_TYPE_GROUP } });

/** 회원 검색(조정 모달): 닉네임·이메일 검색어로 앞 10명 */
export const searchAdminPointMembers = async (q) => {
  const data = await api.get('/admin/members', {
    params: { q, page: 1, size: 10 },
  });
  return data.content;
};

/** 회원 한 명(?mbrSn= 필터 표시용): { mbrSn, mbrNcnm, hldPnt, ... } */
export const getAdminPointMember = (mbrSn) =>
  api.get(`/admin/members/${mbrSn}`);

/** 회원 보유 포인트: 회원 상세의 hldPnt */
export const getAdminPointBalance = async (mbrSn) => {
  const data = await getAdminPointMember(mbrSn);
  return data.hldPnt ?? 0;
};

/**
 * 포인트 원장(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·mbrSn·mbrNcnm(부분 일치)·pntDlngTypeCd·fromDt·toDt(YYYY-MM-DD)
 * - 값이 없는 칸은 보내지 않는다
 */
export const getAdminPointLedgers = (params = {}) =>
  api.get('/admin/points', {
    params: Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    ),
  });

/**
 * 포인트 수동 조정(201): 거래 유형 '관리자 조정', 사유는 메모. 응답은 원장 한 줄
 * - dlngPnt: 지급 +, 차감 -
 * - 같은 요청을 두 번 보내면 두 건이 되므로 화면은 요청 중 버튼을 잠근다
 * - 오류: 차감 후 잔액 부족 400 POINT_NOT_ENOUGH, 형식 400 INVALID_INPUT_VALUE,
 *   없는·탈퇴 회원 404 MEMBER_NOT_FOUND
 */
export const adjustAdminPoint = ({ mbrSn, dlngPnt, memoCn }) =>
  api.post('/admin/points/adjustments', { mbrSn, dlngPnt, memoCn });
