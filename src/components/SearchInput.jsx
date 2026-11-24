import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** 한글 조합 중에 입력이 이만큼(ms) 멈추면 자동 검색한다 */
const COMPOSING_DELAY = 500;

/**
 * 검색창: 입력값은 부모 보관, 제출할 때 onSubmit 호출. compact: 높이 34px·글자 14px
 * - liveDelay(ms): 주면 입력을 멈추고 그만큼 지나면 자동으로 onSubmit을 부른다(Enter·돋보기는 그대로 바로 검색).
 *   한글 조합 중에는 마지막 글자가 늘 조합 중이라 확정을 기다리면 띄어쓰기 전에는 검색되지 않으므로,
 *   조합 중이어도 입력이 COMPOSING_DELAY(0.5초) 멈추면 검색한다. 안 주면 제출할 때만(다른 화면 기본 동작)
 */
export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  compact = false,
  liveDelay,
  className = '',
}) {
  const submitRef = useRef(onSubmit);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    if (!liveDelay) return undefined;
    const delay = isComposing
      ? Math.max(liveDelay, COMPOSING_DELAY)
      : liveDelay;
    const timer = setTimeout(() => submitRef.current(), delay);
    return () => clearTimeout(timer);
  }, [value, liveDelay, isComposing]);

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
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-md border border-input-line bg-white pr-10 pl-3 ${compact ? 'h-[34px] text-sm' : 'h-10 text-base'} placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-focus`}
      />
      <button
        type="submit"
        aria-label="검색"
        className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center text-muted"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
