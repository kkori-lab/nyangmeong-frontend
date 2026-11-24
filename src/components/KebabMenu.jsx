import { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

/** 메뉴 항목 1개 높이(h-9) + 위아래 여백(py-1) */
const ITEM_HEIGHT = 36;
const MENU_PADDING = 8;

/** 모양별 클래스 */
const VARIANTS = {
  reveal: {
    root: '',
    button:
      'grid size-6 place-items-center rounded-full text-subtle hover:text-ink',
    icon: 'size-4',
    menu: 'min-w-28 text-sm',
  },
  row: {
    root: 'relative',
    button:
      'grid size-8 place-items-center rounded-full text-subtle hover:bg-surface-3 hover:text-ink',
    icon: 'size-4.5',
    menu: 'min-w-24',
  },
};

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
 * [⋮ 메뉴] 앱 공용 ⋮ 메뉴
 * - variant 'reveal'(기본): 24px 버튼·14px 글자. 부모에 `group`을 주면 hover 기기는 그 부모 hover·초점 때만 보이고, 터치 기기는 항상 보임. 자리는 className(absolute 등)으로 (메인 바로가기·AI 대화 목록)
 * - variant 'row': 32px 버튼(hover 회색 바탕)·16px 글자, 항상 보임. 줄 끝에 그대로 놓음 (케어 항목·지출 행)
 * - 바깥을 누르거나 Esc·항목을 고르면 닫힘
 * - 아래 공간이 모자라면 위로 펼침
 * - items: [{ label, onSelect, isDanger }]
 */
export default function KebabMenu({
  label,
  items,
  variant = 'reveal',
  className = '',
}) {
  const style = VARIANTS[variant];
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
        ? Math.min(
            scrollParent.getBoundingClientRect().bottom,
            window.innerHeight,
          )
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
      className={`${style.root} ${className} ${
        isOpen || variant === 'row'
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
        className={style.button}
      >
        <MoreVertical className={style.icon} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 z-30 flex flex-col rounded-box border border-line bg-white py-1 shadow-depth-md ${style.menu} ${
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
