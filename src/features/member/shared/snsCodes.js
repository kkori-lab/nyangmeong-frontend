/** 소셜 로그인 종류(snsTyCd) -> 표시 이름. 값은 백엔드 확정 전 추정 */
export const SNS_NAME = {
  KAKAO: '카카오',
  NAVER: '네이버',
  GOOGLE: '구글',
};

/** 가입경로(mbrJoinPathCd) -> 가입 방식 표기. 값은 백엔드 확정 전 추정 */
export const JOIN_PATH_NAME = {
  EMAIL: '이메일 가입',
  KAKAO: '카카오 간편 가입',
  NAVER: '네이버 간편 가입',
  GOOGLE: '구글 간편 가입',
};

/** 제공자 표시 색은 각 서비스의 브랜드 색 사용 */
export const SNS_BADGE = {
  KAKAO: 'bg-[#fee500] text-[#191600]',
  NAVER: 'bg-[#03c75a] text-white',
  GOOGLE: 'border border-line bg-white text-ink',
};
