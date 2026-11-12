import { Search } from 'lucide-react';

/** 검색창: 입력값은 부모 보관, 제출할 때만 onSubmit 호출. compact: 높이 34px·글자 14px */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  compact = false,
  className = '',
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-md border border-[#d3dae2] bg-white pr-10 pl-[15px] ${compact ? 'h-[34px] text-sm' : 'h-10 text-base'} placeholder:text-[#8c9899] hover:border-[#b9c4c4] focus:border-[#285a5c] focus:outline-none focus:ring-focus`}
      />
      <button
        type="submit"
        aria-label="검색"
        className={`absolute right-[9px] text-[#566465] ${compact ? 'top-[7px]' : 'top-[9px]'}`}
      >
        <Search size={20} />
      </button>
    </form>
  );
}
