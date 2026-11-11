/**
 * [입력칸 글자 수 표시] "n / 최대"
 * - 입력칸 바로 아래 오른쪽. 세로 flex 안에서 self-end로 붙는다
 * - 수정할 수 없는 칸에는 넣지 않는다
 */
export default function CharCount({ value, max }) {
  return (
    <span className="self-end text-sm text-subtle tabular-nums">
      {value.length} / {max}
    </span>
  );
}
