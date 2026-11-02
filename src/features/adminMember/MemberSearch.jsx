import { useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './memberLabels';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 검색 결과 한 번에 보여 줄 수 */
const SEARCH_SIZE = 20;

/**
 * [회원 검색]
 * - 정상 일반회원만 검색 -> 한 명 선택
 * - useMembers: 화면마다 다른 조회 훅
 */
export default function MemberSearch({
  selected,
  onSelect,
  useMembers,
  placeholder,
  emptyText,
}) {
  const [keyword, setKeyword] = useState('');
  const [q, setQ] = useState('');

  const members = useMembers(
    {
      q,
      status: STATUS_OPTIONS[0].value,
      role: ROLE_OPTIONS[0].value,
      page: 1,
      size: SEARCH_SIZE,
    },
    { enabled: Boolean(q) },
  );

  const handleSearch = () => {
    setQ(keyword.trim());
    onSelect(null);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleSearch();
  };

  /** 검색 결과: 로딩 / 오류 / 없음 / 목록 */
  const renderResult = () => {
    if (members.isPending) return <Skeleton className="h-10 w-full" />;
    if (members.isError) {
      return (
        <p role="alert" className="text-sm text-danger">
          {members.error.message}
        </p>
      );
    }
    if (members.data.content.length === 0) {
      return <p className="text-sm text-subtle">{emptyText}</p>;
    }
    return (
      <ul className="max-h-44 overflow-y-auto rounded-[6px] border border-line">
        {members.data.content.map((member) => (
          <li key={member.mbrSn}>
            <label className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-surface-2">
              <input
                type="radio"
                name="search-member"
                className="accent-brand-500"
                checked={selected?.mbrSn === member.mbrSn}
                onChange={() => onSelect(member)}
              />
              <span className="text-base text-ink">{member.mbrNcnm}</span>
              <span className="min-w-0 truncate text-sm text-subtle">
                {member.maskedAcntEml}
              </span>
            </label>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="search"
          aria-label={placeholder}
          placeholder={placeholder}
          value={keyword}
          className={INPUT_CLASS}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={`${BTN_SECONDARY} shrink-0`}
          onClick={handleSearch}
        >
          검색
        </button>
      </div>
      {q && renderResult()}
    </div>
  );
}
