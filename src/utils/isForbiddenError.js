/** 서버 403 오류 코드: 관리자 아님(ADMIN_ONLY)·권한 없음(FORBIDDEN) */
const FORBIDDEN_CODES = ['ADMIN_ONLY', 'FORBIDDEN'];

/** 인터셉터가 정리한 오류가 403인지 */
export const isForbiddenError = (error) =>
  FORBIDDEN_CODES.includes(error?.code);
