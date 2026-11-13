import { Search } from 'lucide-react';

// 검색 버튼 없이 Enter로 검색한다. q나 category가 바뀌면 입력칸을 새 값으로 다시 채운다.
// onType은 치는 글자를 알린다('이 지도에서 다시 검색'이 입력칸 글자로 찾는다)
export default function PlaceSearchForm({
  id,
  q,
  category,
  onSearch,
  onType,
  className = '',
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(new FormData(event.currentTarget).get('q'));
  };

  return (
    <form
      key={`${category}|${q}`}
      role="search"
      onSubmit={handleSubmit}
      onChange={(event) => onType(event.target.value)}
      className={`group flex h-12 items-center gap-2.5 rounded-xl border border-brand-500 bg-white px-3.5 focus-within:ring-focus ${className}`}
    >
      <Search className="size-5 shrink-0 text-subtle group-focus-within:text-brand-500" />
      <label htmlFor={id} className="sr-only">
        지역 · 장소 이름 · 키워드 검색
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={q}
        placeholder="지역, 장소 이름, 키워드로 검색"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-placeholder"
      />
    </form>
  );
}
