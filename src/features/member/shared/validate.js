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

/** 국내 휴대전화번호 최대 자릿수 */
const PHONE_MAX_DIGITS = 11;

/** 입력 중 표시 형식: 010-1234-5678, 10자리는 011-123-4567. +82 표기는 그대로 */
export const formatPhoneInput = (value) => {
  if (value.trimStart().startsWith('+')) return sanitizePhoneInput(value);
  const digits = value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length < PHONE_MAX_DIGITS) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

/** 커서 앞 숫자 개수 -> 표시 문자열 안 위치 */
const caretAfterDigits = (formatted, digitCount) => {
  let pos = 0;
  let count = 0;
  while (pos < formatted.length && count < digitCount) {
    if (/\d/.test(formatted[pos])) count += 1;
    pos += 1;
  }
  return pos;
};

/**
 * 휴대전화번호 칸 입력 처리 -> 표시 형식 값
 * - 하이픈만 지운 경우: 그 앞 숫자 삭제
 * - 하이픈이 끼어도 커서는 같은 숫자 뒤 유지
 */
export const typePhoneInput = (prev, raw) => {
  /** +82 표기: 형식·커서 손대지 않음 */
  if (raw.trimStart().startsWith('+')) return sanitizePhoneInput(raw);
  const input = document.activeElement;
  const caret =
    input instanceof HTMLInputElement && input.value === raw
      ? (input.selectionStart ?? raw.length)
      : raw.length;
  let digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
  let source = raw;
  const isHyphenOnlyDelete =
    raw.length < prev.length &&
    raw.replace(/\D/g, '') === prev.replace(/\D/g, '') &&
    digitsBefore > 0;
  if (isHyphenOnlyDelete) {
    const digits = raw.replace(/\D/g, '');
    source = digits.slice(0, digitsBefore - 1) + digits.slice(digitsBefore);
    digitsBefore -= 1;
  }
  const next = formatPhoneInput(source);
  if (input instanceof HTMLInputElement && input.value === raw) {
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      const pos = caretAfterDigits(input.value, digitsBefore);
      input.setSelectionRange(pos, pos);
    });
  }
  return next;
};

/** 영문·숫자를 함께 쓴 공백 없는 ASCII 8~64자 (서버 규칙과 같다) */
export const isValidPassword = (value) =>
  /^(?=.*[A-Za-z])(?=.*\d)[!-~]{8,64}$/.test(value);

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** 약관 내용보기가 없는 연령 확인 항목인지 */
export const hasTermsView = (trmsFixIdntfKey) => !/AGE/i.test(trmsFixIdntfKey);
