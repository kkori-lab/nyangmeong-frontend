import { MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * [지출 ⋮ 메뉴] PC 날짜별 상세의 행 오른쪽 메뉴
 * - [수정]·[삭제](빨간색), 바깥을 누르거나 항목을 고르면 닫힘
 */
export default function ExpenseMenu({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const choose = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="지출 메뉴"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-3 hover:text-ink"
      >
        <MoreVertical className="size-[18px]" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-10 mt-1 flex min-w-24 flex-col rounded-box border border-line bg-white py-1 shadow-depth-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onEdit)}
            className="h-9 px-4 text-left hover:bg-surface-2"
          >
            수정
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onDelete)}
            className="h-9 px-4 text-left text-danger hover:bg-surface-2"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
