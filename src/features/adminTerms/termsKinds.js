/**
 * [관리 대상 약관 종류]
 * - 가입 약관 필수 3종·선택 1종(FN-ADM-051-04). 값은 TRMS.TRMS_FIX_IDNTF_KEY
 * - 기능별 동의 2종(펫돌봄 이용수칙·실종 개인정보 공개 동의)은 아직 TRMS에 없어 뺐다. 생기면 여기 넣는다
 */
export const TERMS_KINDS = [
  { trmsFixIdntfKey: 'SERVICE', name: '서비스 이용약관' },
  { trmsFixIdntfKey: 'PRIVACY', name: '개인정보 수집 및 이용' },
  { trmsFixIdntfKey: 'AGE_14', name: '만 14세 이상 확인' },
  { trmsFixIdntfKey: 'MARKETING', name: '마케팅 수신 동의' },
];

/** 종류 키 → 표시 이름, 모르는 키는 키 그대로 */
export const getTermsKindName = (trmsFixIdntfKey) =>
  TERMS_KINDS.find((kind) => kind.trmsFixIdntfKey === trmsFixIdntfKey)?.name ??
  trmsFixIdntfKey;

export const isTermsKind = (trmsFixIdntfKey) =>
  TERMS_KINDS.some((kind) => kind.trmsFixIdntfKey === trmsFixIdntfKey);

/** 개정해도 기존 회원 재동의는 받지 않는다(FN-ADM-051-05) */
export const TERMS_REAGREE_GUIDE =
  '기존 회원에게 다시 동의를 받지 않아요. 새 버전을 등록한 뒤 공지사항으로 안내해 주세요.';
