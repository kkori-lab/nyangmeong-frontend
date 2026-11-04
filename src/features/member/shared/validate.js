/** 입력 중에는 한글 자모(ㄱ, ㅏ)도 허용. 조합 중인 글자를 지우면 한글을 칠 수 없음 */
const NICKNAME_TYPING_EXCLUDE = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g;
const NICKNAME_COMPLETE = /^[가-힣a-zA-Z0-9]+$/;
const PHONE_TYPING_EXCLUDE = /[^\d+\-\s]/g;
const PHONE_DOMESTIC = /^01[016789]\d{7,8}$/;

export const NICKNAME_MAX = 10;

export const sanitizeNickname = (value) =>
  value.replace(NICKNAME_TYPING_EXCLUDE, '').slice(0, NICKNAME_MAX);

export const isValidNickname = (value) => NICKNAME_COMPLETE.test(value);

export const sanitizePhoneInput = (value) =>
  value.replace(PHONE_TYPING_EXCLUDE, '');

/** 공백·하이픈을 빼고 +82 표기를 국내 번호(0으로 시작)로 통일 */
export const normalizePhone = (value) =>
  value.replace(/[\s-]/g, '').replace(/^\+82/, '0');

export const isValidPhone = (value) =>
  PHONE_DOMESTIC.test(normalizePhone(value));

/** 01012345678 -> 010-1234-5678 */
export const formatPhone = (digits = '') =>
  digits.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');

/** 8자 이상, 문자·숫자 조합 */
export const isValidPassword = (value) =>
  value.length >= 8 && /[a-zA-Z가-힣]/.test(value) && /\d/.test(value);

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** 가입용 비밀번호: 8~64자, 영문·숫자를 함께 쓰는 공백 없는 ASCII(서버 규칙) */
export const isValidJoinPassword = (value) =>
  /^[!-~]{8,64}$/.test(value) && /[a-zA-Z]/.test(value) && /\d/.test(value);

/** 약관 내용보기가 없는 연령 확인 항목인지 */
export const hasTermsView = (trmsFixIdntfKey) => !/AGE/i.test(trmsFixIdntfKey);
