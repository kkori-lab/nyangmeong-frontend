/** import.meta.env는 이 파일에서만 읽음 */
export const IS_DEV = import.meta.env.DEV;

// 카카오 JavaScript 키. 등록한 도메인에서만 동작하는 공개용 키라 VITE_로 둘 수 있다
export const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

// SNS 로그인 앱 ID. 인가 창 주소에 그대로 실리는 공개값이라 VITE_로 둘 수 있다. secret은 백엔드에만 둔다
export const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
export const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
