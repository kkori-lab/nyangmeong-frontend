import FieldError from './FieldError';

/**
 * [입력칸 아래 한 줄] 왼쪽 오류 문구, 오른쪽 글자 수 "n / 최대"(사람 피드백 2026-11-23: 두 줄로 따로 놓지 않는다)
 * - error가 없으면 글자 수만 오른쪽. max가 없으면 글자 수를 그리지 않는다(수정할 수 없는 칸)
 * - 오류 문구가 길면 왼쪽 칸 안에서 줄바꿈하고, 글자 수는 첫 줄 오른쪽에 남는다
 */
export default function FieldFoot({ value = '', max, error, errorId }) {
  const hasCount = max != null;
  if (!error && !hasCount) return null;

  return (
    <div className="flex items-start gap-2">
      <FieldError id={errorId} className="min-w-0 flex-1">
        {error}
      </FieldError>
      {hasCount && (
        <span className="ml-auto shrink-0 text-sm leading-normal text-subtle tabular-nums">
          {value.length} / {max}
        </span>
      )}
    </div>
  );
}
