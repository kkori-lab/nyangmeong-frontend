/** import.meta.env는 이 파일에서만 읽음 */
export const IS_DEV = import.meta.env.DEV;

// 카카오 JavaScript 키. 등록한 도메인에서만 동작하는 공개용 키라 VITE_로 둘 수 있다
export const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

// SNS 로그인 앱 ID. 인가 창 주소에 그대로 실리는 공개값이라 VITE_로 둘 수 있다. secret은 백엔드에만 둔다
export const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * 포트폴리오 데모 계정. 랜딩 팝업에서 고르면 이메일 로그인 칸에 미리 채운다(로그인은 사람이 직접 누른다).
 * 팝업을 본 누구나 쓰도록 일부러 공개하는 값이라 VITE_로 둔다. 실제 운영자·개인 계정은 넣지 않는다
 */
export const DEMO_ACCOUNTS = {
  member: {
    email: import.meta.env.VITE_DEMO_MEMBER_EMAIL ?? '',
    password: import.meta.env.VITE_DEMO_MEMBER_PASSWORD ?? '',
  },
  admin: {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL ?? '',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? '',
  },
};
