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

/** 코드 표시 이름: 없는 코드는 코드 그대로 */
export const getOptionLabel = (options, code) =>
  options.find(({ value }) => value === code)?.label ?? code;
