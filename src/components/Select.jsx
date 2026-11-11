import DropdownSelect from './DropdownSelect';

/**
 * 첫 항목을 '전체'처럼 쓰는 셀렉트. 목록은 DropdownSelect가 그린다(브라우저 기본 목록 아님)
 * options: [{ value, label }], value는 문자열 비교
 * placeholder: 첫 항목이 선택된 상태(선택 전)에서 닫힌 칸에 보여 줄 문구. 안 넘기면 선택한 항목의 라벨 그대로 표시
 * ref: 칸 버튼에 붙는다(바깥에서 포커스를 줄 때)
 */
export default function Select({
  ref,
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  className = '',
}) {
  return (
    <DropdownSelect
      ref={ref}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      placeholderValue={placeholder == null ? undefined : options[0]?.value}
      disabled={disabled}
      className={className}
    />
  );
}
