import { Search } from 'lucide-react';

/** 검색창: 입력값은 부모 보관, 제출할 때만 onSubmit 호출 */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder,
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
        className="h-10 w-full rounded-md border border-[#d3dae2] bg-white pr-10 pl-[15px] text-base placeholder:text-[#8c9899]"
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute top-[9px] right-[9px] text-[#566465]"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
