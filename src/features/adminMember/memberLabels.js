import { MEMBER_ROLE } from '@/constants/memberRole';

/** 회원 상태(mbrSttsCd) */
export const STATUS_OPTIONS = [
  { value: 'USRC0001', label: '정상' },
  { value: 'USRC0002', label: '정지' },
  { value: 'USRC0003', label: '탈퇴' },
];

/** 가입 경로(joinPathCd) */
export const JOIN_PATH_OPTIONS = [
  { value: 'USRC0006', label: '이메일' },
  { value: 'USRC0007', label: '네이버' },
  { value: 'USRC0008', label: '카카오' },
  { value: 'USRC0009', label: '구글' },
];

/** 권한(mbrAuthrtCd) */
export const ROLE_OPTIONS = [
  { value: MEMBER_ROLE.MEMBER, label: '일반회원' },
  { value: MEMBER_ROLE.ADMIN, label: '관리자' },
];

/** 정지 종류: 종료 일시가 없으면 영구 */
export const SUSPENSION_TYPE_OPTIONS = [
  { value: 'PERIOD', label: '기간' },
  { value: 'PERMANENT', label: '영구' },
];

/** 기간 정지 일수 */
export const SUSPENSION_DAY_OPTIONS = [7, 30];

/** 포인트 거래 유형(pntDlngTypeCd) */
export const POINT_TYPE_OPTIONS = [
  { value: 'MYPC0007', label: '미션' },
  { value: 'MYPC0008', label: '아이템 구매' },
  { value: 'MYPC0009', label: '관리자 조정' },
  { value: 'MYPC0021', label: '검진 기록' },
];

/** 코드 표시 이름: 없는 코드는 코드 그대로 */
export const getOptionLabel = (options, code) =>
  options.find(({ value }) => value === code)?.label ?? code;
