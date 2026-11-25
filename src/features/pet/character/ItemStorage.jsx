import { useState } from 'react';
import ItemImage from './ItemImage';
import PartTabs, { ALL } from './PartTabs';

/**
 * [보관함 · 부위 탭] (FN-MYP-010-14)
 * - [전체]가 기본이고, 보유 아이템을 전체 또는 부위별 4열로 보여 주고 2줄(8개) 높이를 넘으면 안에서 스크롤
 */
export default function ItemStorage({ items, worn, onToggle }) {
  const [part, setPart] = useState(ALL);
  const partItems =
    part === ALL ? items : items.filter((item) => item.itemRegnCd === part);

  return (
    <div className="flex flex-col gap-4">
      <PartTabs value={part} onChange={setPart} />
      {partItems.length === 0 ? (
        <p className="text-center text-base font-normal text-muted">
          보유한 아이템이 없어요
        </p>
      ) : (
        <div className="grid max-h-[296px] grid-cols-4 gap-2 overflow-y-auto">
          {partItems.map((item) => {
            const isOn = worn[item.itemRegnCd]?.hldItemSn === item.hldItemSn;
            return (
              <button
                key={item.hldItemSn}
                type="button"
                aria-pressed={isOn}
                onClick={() => onToggle(item)}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 pt-2 pb-3 text-center text-sm text-ink-2 ${
                  isOn
                    ? 'bg-brand-50 shadow-[inset_0_0_0_2px_var(--color-brand-500)]'
                    : 'bg-surface-2 hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
                }`}
              >
                <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-sm bg-white text-xs text-subtle">
                  <ItemImage item={item} />
                </span>
                <span className="break-keep [overflow-wrap:anywhere]">
                  {item.itemNm}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
