/**
 * 서버 400 칸별 오류: { 필드명: 메시지 }
 * - api/axios.js가 INVALID_INPUT_VALUE의 data를 error.fields([{ field, message }])로 둔다
 * - fields가 없으면 빈 객체
 */
export const toFieldErrors = (error) =>
  Object.fromEntries(
    (error?.fields ?? []).map((item) => [item.field, item.message]),
  );

/**
 * 폼 아래 오류 줄 문구
 * - fields가 없으면 서버 message
 * - fields가 있으면 폼에 없는 칸(shownFields 밖)의 message만 잇는다. 모두 칸 아래에 보이면 null
 */
export const toFormError = (error, shownFields = []) => {
  if (!error) return null;
  if (!error.fields?.length) return error.message;
  const hidden = error.fields
    .filter((item) => !shownFields.includes(item.field))
    .map((item) => item.message);
  return hidden.length > 0 ? [...new Set(hidden)].join(' ') : null;
};
