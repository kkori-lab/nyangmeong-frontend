export * from '@/utils/petCodes';

/** 초대 상태 (PETG06, 대기·수락·거절·만료는 서버가 판정) */
export const INVTN_STTS = {
  WAIT: 'PETC0020',
  ACPT: 'PETC0021',
  RJCT: 'PETC0022',
  EXPR: 'PETC0023',
};
