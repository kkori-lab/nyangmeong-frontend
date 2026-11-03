import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/**
 * [공지 검색]
 * - 제목, [검색]을 눌러야 적용
 */
export default function NoticeSearch({ keyword, onSearch }) {
  const [draft, setDraft] = useState(keyword);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-w-[200px] flex-1 flex-wrap items-center gap-2 max-[760px]:w-full max-[760px]:flex-none"
    >
      <div className="min-w-[200px] flex-1 max-[760px]:w-full max-[760px]:flex-none">
        <input
          type="search"
          aria-label="제목"
          placeholder="제목"
          value={draft}
          className={INPUT_CLASS}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>
      <button type="submit" className={`${BTN_PRIMARY} max-[760px]:w-full`}>
        검색
      </button>
    </form>
  );
}
