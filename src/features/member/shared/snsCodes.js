/** 가입경로 중 이메일 가입(joinPathCd, 서버 공통코드 USRG03). 이 값이 아니면 SNS 회원 */
export const JOIN_PATH_EMAIL = 'USRC0006';

/** 소셜 가입경로(joinPathCd, 서버 공통코드 USRG03) -> 표시 이름 */
export const SNS_NAME = {
  USRC0007: '네이버',
  USRC0008: '카카오',
  USRC0009: '구글',
};

/** 가입경로(joinPathCd) -> 가입 방식 표기 */
export const JOIN_PATH_NAME = {
  [JOIN_PATH_EMAIL]: '이메일 가입',
  USRC0008: '카카오 간편 가입',
  USRC0007: '네이버 간편 가입',
  USRC0009: '구글 간편 가입',
};

/** 제공자 표시 색은 각 서비스의 브랜드 색 사용 */
export const SNS_BADGE = {
  USRC0008: 'bg-[#fee500] text-[#191600]',
  USRC0007: 'bg-[#03c75a] text-white',
  USRC0009: 'border border-line bg-white text-ink',
};
