import { useCallback, useEffect, useRef, useState } from 'react';
import DiaryTabs from './DiaryTabs';

/**
 * [건강 일지 반려동물 칩 + 앵커 탭 막대]
 * - 1101px 이상: 칩 칸 | 세로 구분선 | 탭 순서의 한 줄 막대. 상단 메뉴(h-16) 바로 아래에 붙어 따라온다
 * - 1100px 이하: 첫 줄 칩 칸(폭 전체), 둘째 줄 탭의 두 줄 막대. 위에 붙지 않고 세로 구분선도 없다
 * - 평소 배경은 투명이고 아래 구분선만 둔다. 상단 메뉴 아래에 붙었을 때만 페이지 바탕색을 깔아 아래 내용이 비치지 않게 한다
 * - 선택한 반려동물만 노란 이름 칩(이름 길이만큼만 차지), 나머지는 사진 원(마우스를 올리면 이름표). 순서는 목록 그대로
 * - 칩 칸은 1101px 이상에서 폭이 고정(2~3글자 이름 기준 3마리가 들어가는 폭), 1100px 이하에서는 줄 전체 폭이다. 넘치면 줄바꿈 없이 칸 안에서만 가로로 민다. 넘친 쪽 끝은 흐리게 한다
 * - 반려동물이 1마리 이하면 칩 칸과 세로 구분선을 그리지 않는다
 * - pets: [{ petSn, petNm, chrctrImgPath }], tabs: DiaryTabs의 items
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
          <PetChipTrack
            pets={pets}
            selectedPetSn={selectedPetSn}
            onSelect={onSelectPet}
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

function PetChipTrack({ pets, selectedPetSn, onSelect }) {
  const scrollRef = useRef(null);
  const chipRefs = useRef({});
  const dragRef = useRef({
    startX: 0,
    startLeft: 0,
    moved: false,
  });
  const isFirstRef = useRef(true);
  const [edge, setEdge] = useState({ left: false, right: false });
  const [tip, setTip] = useState(null);

  /** 가로로 더 볼 것이 있는 쪽을 알아낸다(흐림 처리용) */
  const updateEdge = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdge({
      left: el.scrollLeft > 0,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  /** 선택 칩이 칸 안에 다 보이지 않으면 칸 가운데로 가져온다(페이지 스크롤은 건드리지 않는다) */
  useEffect(() => {
    const el = scrollRef.current;
    const chip = chipRefs.current[selectedPetSn];
    if (el && chip) {
      const left = chip.offsetLeft;
      const right = left + chip.offsetWidth;
      if (left < el.scrollLeft || right > el.scrollLeft + el.clientWidth) {
        el.scrollTo({
          left: left - (el.clientWidth - chip.offsetWidth) / 2,
          behavior: isFirstRef.current ? 'auto' : 'smooth',
        });
      }
    }
    isFirstRef.current = false;
    updateEdge();
  }, [selectedPetSn, pets, updateEdge]);

  /** 세로 휠을 가로 이동으로 바꾼다(넘칠 때만). 패시브가 아니어야 막을 수 있어 직접 단다 */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const handleWheel = (event) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (event) => {
    const el = scrollRef.current;
    if (!el || event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    const handleMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragRef.current.startX;
      if (Math.abs(dx) > 4) dragRef.current.moved = true;
      el.scrollLeft = dragRef.current.startLeft - dx;
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  /** 끌고 난 뒤의 클릭은 선택으로 치지 않는다 */
  const handleClickCapture = (event) => {
    if (!dragRef.current.moved) return;
    dragRef.current.moved = false;
    event.stopPropagation();
    event.preventDefault();
  };

  const showTip = (event, name) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ name, x: rect.left + rect.width / 2, y: rect.bottom });
  };

  return (
    <div className="relative my-0.5 w-full shrink-0 overflow-hidden min-[1101px]:w-52">
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="반려동물 선택"
        className="relative flex cursor-grab items-center gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={updateEdge}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
      >
        {pets.map((pet, index) => {
          const isSelected = pet.petSn === selectedPetSn;
          return (
            <PetChipItem
              key={pet.petSn}
              pet={pet}
              isSelected={isSelected}
              showDividerBefore={isSelected && index > 0}
              showDividerAfter={isSelected && index < pets.length - 1}
              chipRef={(node) => {
                chipRefs.current[pet.petSn] = node;
              }}
              onSelect={onSelect}
              onShowTip={showTip}
              onHideTip={() => setTip(null)}
            />
          );
        })}
      </div>
      {edge.left && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#faf8f5] to-transparent"
        />
      )}
      {edge.right && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#faf8f5] to-transparent"
        />
      )}
      {tip && (
        <span
          role="tooltip"
          style={{ left: tip.x, top: tip.y }}
          className="pointer-events-none fixed z-50 mt-1.5 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-sm whitespace-nowrap text-white"
        >
          {tip.name}
        </span>
      )}
    </div>
  );
}

function PetChipItem({
  pet,
  isSelected,
  showDividerBefore,
  showDividerAfter,
  chipRef,
  onSelect,
  onShowTip,
  onHideTip,
}) {
  const photo = pet.chrctrImgPath ? (
    <img src={pet.chrctrImgPath} alt="" className="size-full object-cover" />
  ) : (
    pet.petNm.slice(0, 1)
  );

  return (
    <>
      {showDividerBefore && <ChipDivider />}
      <button
        ref={chipRef}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-label={pet.petNm}
        className={
          isSelected
            ? 'inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-accent-300 pr-3.5 pl-1 text-base font-semibold text-ink'
            : 'grid size-9 shrink-0 place-items-center rounded-full p-1 hover:bg-surface-2 focus-visible:bg-surface-2'
        }
        onClick={() => {
          onHideTip();
          onSelect(pet.petSn);
        }}
        onMouseEnter={isSelected ? undefined : (e) => onShowTip(e, pet.petNm)}
        onMouseLeave={onHideTip}
        onFocus={isSelected ? undefined : (e) => onShowTip(e, pet.petNm)}
        onBlur={onHideTip}
      >
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-white text-sm font-bold text-brand-500"
        >
          {photo}
        </span>
        {isSelected && <span className="max-w-24 truncate">{pet.petNm}</span>}
      </button>
      {showDividerAfter && <ChipDivider />}
    </>
  );
}

function ChipDivider() {
  return (
    <span aria-hidden="true" className="h-5 w-px shrink-0 bg-line-strong" />
  );
}
