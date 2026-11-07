import { useEffect, useRef, useState } from 'react';
import DiaryTabs from './DiaryTabs';

/**
 * [건강 일지 앵커 탭 막대]
 * - 1101px 이상: 탭 순서의 한 줄 막대. 상단 메뉴(h-16) 바로 아래에 붙어 따라옴
 * - 1100px 이하: 위에 붙지 않음
 * - 평소 배경은 투명, 아래 구분선만 둠. 상단 메뉴 아래에 붙었을 때만 페이지 바탕색을 깔아 아래 내용 비침 방지
 * - 반려동물 선택은 건강기록 공통 반려동물 카드(shared/PetSwitcher)가 맡는다 (※신규 정책)
 * - tabs: DiaryTabs의 items
 */
export default function DiaryPetBar({ tabs, activeTabId, onSelectTab }) {
  const barRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);

  /** 막대가 sticky 위치(top-16)에 닿았는지 확인. 값은 클래스에서 읽어 와 따로 적지 않음 */
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
      <DiaryTabs
        items={tabs}
        activeId={activeTabId}
        onSelect={onSelectTab}
        className=""
      />
    </div>
  );
}
