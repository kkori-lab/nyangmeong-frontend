/**
 * [감사 로그 표시 이름]
 * - 서버 trgtTblNm이 테이블명이라 화면 이름은 프론트 변환표로 표시
 * - 변환표에 없는 테이블명은 서버 값 그대로
 */

/** 로그인 작업 유형 코드 */
const LOGIN_TASK_TYPE = 'SYSC0005';

/** 대상 칸 빈 값 */
export const EMPTY_LABEL = '—';

/** 대상 필터 항목 */
export const TARGET_OPTIONS = [
  { value: 'SYS_STNG', label: '운영 설정' },
  { value: 'MBR', label: '회원' },
];

/** 목록 대상 칸 이름 */
export const getTargetLabel = ({ taskTypeCd, trgtTblNm }) => {
  if (taskTypeCd === LOGIN_TASK_TYPE) return EMPTY_LABEL;
  const target = TARGET_OPTIONS.find((option) => option.value === trgtTblNm);
  return target?.label ?? trgtTblNm;
};
