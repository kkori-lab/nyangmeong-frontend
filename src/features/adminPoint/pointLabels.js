/** 포인트 거래유형 공통코드 그룹 (PNT_GNLGR.PNT_DLNG_TYPE_CD) */
export const PNT_DLNG_TYPE_GROUP = 'MYPG03';

/** 관리자 조정 거래유형 */
export const PNT_DLNG_TYPE_ADMIN_ADJUST = 'MYPC0009';

/** 조정 한 번의 포인트 상한(가정, 연결 때 서버 값에 맞춘다) */
export const ADJUST_PNT_MAX = 100000;

/** 사유(메모) 글자 수 상한(가정) */
export const MEMO_CN_MAX = 200;

/** 증감 표시: 늘어난 값에 + */
export const formatPointChange = (dlngPnt) =>
  `${dlngPnt > 0 ? '+' : ''}${dlngPnt.toLocaleString()}`;
