import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PetFace from '@/components/PetFace';

/**
 * [건강 일지 반려동물 선택 버튼 + 전체 반려동물 패널] (추가 요청)
 * - 닫힌 버튼: 캐릭터 얼굴 + 이름 + 아래 화살표(열리면 위). 색·모양은 이전 알약형 셀렉트와 같음
 * - 패널: 버튼 왼쪽 아래. "반려동물 / N마리" 머리 + 4칸 격자(얼굴 + 이름)
 * - 칸을 누르면 그 반려동물로 바꾸고 닫음. 바깥 클릭·Esc로도 닫음(Esc는 버튼으로 초점 되돌림)
 * - pets: GET /pets 행({ petSn, petNm, petSeCd, bscCharSbstYn })
 */
export default function DiaryPetPicker({ pets, selectedPetSn, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const selectedPet =
    pets.find((pet) => pet.petSn === selectedPetSn) ?? pets[0];

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      buttonRef.current.focus();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const select = (petSn) => {
    setIsOpen(false);
    if (petSn !== selectedPet.petSn) onSelect(petSn);
  };

  return (
    <div
      ref={rootRef}
      className="relative shrink-0 self-start min-[1101px]:self-auto"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={`반려동물 선택, ${selectedPet.petNm}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`my-0.5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-brand-500 bg-brand-500 pr-4 pl-1.25 text-base font-semibold text-white hover:bg-brand-600 focus:outline-none max-[760px]:h-11 ${
          isOpen ? 'shadow-[0_0_0_3px_rgba(249,234,166,0.6)]' : ''
        }`}
      >
        <PetFace
          petSn={selectedPet.petSn}
          petSeCd={selectedPet.petSeCd}
          isError={selectedPet.bscCharSbstYn}
          className="size-7.5 shrink-0 overflow-hidden rounded-full bg-white/18 text-current"
          iconClassName="size-3/5"
        />
        <span className="max-w-40 truncate">{selectedPet.petNm}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="반려동물 선택"
          className="absolute top-full left-0 z-30 mt-2 w-80 rounded-card border border-line bg-white p-3 shadow-depth-sm"
        >
          <div className="flex items-center justify-between px-1 pb-2 text-sm">
            <span className="font-semibold text-ink">반려동물</span>
            <span className="text-subtle">{pets.length}마리</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {pets.map((pet) => {
              const isSelected = pet.petSn === selectedPet.petSn;
              return (
                <button
                  key={pet.petSn}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => select(pet.petSn)}
                  className={`flex min-w-0 flex-col items-center gap-1 rounded-box px-1 py-2 text-sm ${
                    isSelected
                      ? 'bg-brand-50 font-bold text-brand-600'
                      : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <PetFace
                    petSn={pet.petSn}
                    petSeCd={pet.petSeCd}
                    isError={pet.bscCharSbstYn}
                    className="size-12 shrink-0 overflow-hidden rounded-full border border-line bg-white text-subtle"
                    iconClassName="size-3/5"
                  />
                  <span className="w-full truncate text-center">
                    {pet.petNm}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
