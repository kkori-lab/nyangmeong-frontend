/** 원 단위 금액 입력: 숫자 문자열 값 */
export default function AmountInput({
  id,
  value,
  onChange,
  label,
  maxDigits = 13,
  className = '',
}) {
  const handleChange = (event) =>
    onChange(
      event.target.value
        .replace(/\D/g, '')
        .replace(/^0+/, '')
        .slice(0, maxDigits),
    );

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        aria-label={label}
        inputMode="numeric"
        autoComplete="off"
        value={value === '' ? '' : Number(value).toLocaleString('ko-KR')}
        onChange={handleChange}
        className="block h-10 w-full rounded-md border border-input-line bg-white pr-9 pl-3 text-right tabular-nums hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
        원
      </span>
    </div>
  );
}
