import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_GROUP_SIZE = 10;

/** 게시판 페이지 번호: 10개 묶음, ‹는 2쪽부터, ›는 마지막 쪽 전까지 (page는 1부터) */
export default function BoardPagination({ page, totalPages, onChange }) {
  if (totalPages < 1) return null;

  const start = Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
  const end = Math.min(start + PAGE_GROUP_SIZE - 1, totalPages);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  /** 쪽 이동 + 목록 맨 위로 */
  const selectPage = (number) => {
    onChange(number);
    window.scrollTo(0, 0);
  };
  const buttonClass =
    'flex size-9 items-center justify-center rounded-full text-base font-medium text-[#3d4a4b] max-[760px]:size-8';
  /** hover 배경은 선택되지 않은 버튼에만: 선택된 쪽(진한 배경·흰 글자)에 겹치면 글자가 안 보인다 */
  const hoverClass = 'hover:bg-[#e9f2f2]';

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-center gap-1 max-[760px]:gap-0.5"
    >
      {page > 1 && (
        <button
          type="button"
          aria-label="이전 페이지"
          onClick={() => selectPage(page - 1)}
          className={`${buttonClass} ${hoverClass} mr-2`}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          aria-current={number === page ? 'page' : undefined}
          onClick={() => selectPage(number)}
          className={`${buttonClass} ${number === page ? 'bg-[#285a5c] font-bold text-white' : hoverClass}`}
        >
          {number}
        </button>
      ))}
      {page < totalPages && (
        <button
          type="button"
          aria-label="다음 페이지"
          onClick={() => selectPage(page + 1)}
          className={`${buttonClass} ${hoverClass} ml-2`}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </nav>
  );
}
