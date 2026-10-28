import { useEffect, useRef, useState } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import DiaryTabs from './DiaryTabs';

/**
 * [건강 일지 반려동물 셀렉트박스 + 앵커 탭 막대]
 * - 1101px 이상: 셀렉트박스 | 세로 구분선 | 탭 순서의 한 줄 막대. 상단 메뉴(h-16) 바로 아래에 붙어 따라온다
 * - 1100px 이하: 첫 줄 셀렉트박스, 둘째 줄 탭의 두 줄 막대. 위에 붙지 않고 세로 구분선도 없다
 * - 평소 배경은 투명이고 아래 구분선만 둔다. 상단 메뉴 아래에 붙었을 때만 페이지 바탕색을 깔아 아래 내용이 비치지 않게 한다
 * - 반려동물이 1마리 이하면 셀렉트박스와 세로 구분선을 그리지 않는다
 * - pets: [{ petSn, petNm }], tabs: DiaryTabs의 items
 */
export default function DiaryPetBar({
  pets,
  selectedPetSn,
  onSelectPet,
  tabs,
  activeTabId,
  onSelectTab,
}) {
  const barRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);
  const hasPets = pets.length > 1;

  /** 막대가 sticky 위치(top-16)에 닿았는지 본다. 값은 클래스에서 읽어 와 따로 적지 않는다 */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const update = () => {
      // 1100px 이하에서는 sticky가 아니라 top이 auto(NaN)라 항상 false
      const stickTop = parseFloat(getComputedStyle(bar).top);
      setIsStuck(Math.round(bar.getBoundingClientRect().top) <= stickTop);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      ref={barRef}
      className={`z-30 flex flex-col gap-3 border-b border-line min-[1101px]:sticky min-[1101px]:top-16 min-[1101px]:flex-row min-[1101px]:items-center min-[1101px]:gap-5 ${
        isStuck ? 'bg-[#faf8f5]' : ''
      }`}
    >
      {hasPets && (
        <>
          <DropdownSelect
            label="반려동물 선택"
            isPill
            value={selectedPetSn}
            options={pets.map((pet) => ({
              value: pet.petSn,
              label: pet.petNm,
            }))}
            onChange={onSelectPet}
            className="my-0.5 w-[calc(3em+3.75rem)] shrink-0"
          />
          <span
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-line-strong min-[1101px]:block"
          />
        </>
      )}
      <DiaryTabs
        items={tabs}
        activeId={activeTabId}
        onSelect={onSelectTab}
        className=""
      />
    </div>
  );
}
