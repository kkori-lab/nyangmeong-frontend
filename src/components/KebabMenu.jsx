import { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

/** 메뉴 항목 1개 높이(h-9) + 위아래 여백(py-1) */
const ITEM_HEIGHT = 36;
const MENU_PADDING = 8;

/** 가장 가까운 세로 스크롤 영역: 메뉴가 그 아래로 잘리는지 볼 때 씀 */
const findScrollParent = (element) => {
  let node = element.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
};

/**
 * [⋮ 메뉴] 바로가기·케어 항목 ⋮ 메뉴(ShortcutMenu·CareItemMenu)와 같은 모양
 * - 부모에 `group`을 주면 hover 기기는 그 부모 hover·초점 때만 보이고, 터치 기기는 항상 보임
 * - 바깥을 누르거나 Esc·항목을 고르면 닫힘
 * - 아래 공간이 모자라면 위로 펼침
 * - items: [{ label, onSelect, isDanger }]
 */
export default function KebabMenu({ label, items, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpward, setIsUpward] = useState(false);
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

  const handleToggle = () => {
    if (!isOpen) {
      const rect = rootRef.current.getBoundingClientRect();
      const scrollParent = findScrollParent(rootRef.current);
      const bottomLimit = scrollParent
        ? Math.min(scrollParent.getBoundingClientRect().bottom, window.innerHeight)
        : window.innerHeight;
      const menuHeight = items.length * ITEM_HEIGHT + MENU_PADDING;
      setIsUpward(rect.bottom + menuHeight > bottomLimit);
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (onSelect) => {
    setIsOpen(false);
    onSelect();
  };

  return (
    <div
      ref={rootRef}
      className={`${className} ${
        isOpen
          ? ''
          : '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100'
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="grid size-6 place-items-center rounded-full text-subtle hover:text-ink"
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 z-10 flex min-w-28 flex-col rounded-box border border-line bg-white py-1 text-sm shadow-depth-md ${
            isUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(item.onSelect)}
              className={`h-9 px-4 text-left whitespace-nowrap hover:bg-surface-2 ${
                item.isDanger ? 'text-danger' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
