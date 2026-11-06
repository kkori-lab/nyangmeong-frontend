import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, PawPrint } from 'lucide-react';
import PetFace from '@/components/PetFace';

const BUTTON_FACE_CLASS =
  'size-7.5 shrink-0 overflow-hidden rounded-full bg-white/18 text-current';
const CELL_FACE_CLASS =
  'size-12 shrink-0 overflow-hidden rounded-full border border-line bg-white text-subtle';
const cellClass = (isSelected) =>
  `flex min-w-0 flex-col items-center gap-1 rounded-box px-1 py-2 text-sm ${
    isSelected
      ? 'bg-brand-50 font-bold text-brand-600'
      : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink'
  }`;

/** 다중 선택 닫힌 버튼 글자: 전체 / 이름 / "첫 이름 외 n" */
const getMultiLabel = (selectedPets) => {
  if (selectedPets.length === 0) return '전체';
  if (selectedPets.length === 1) return selectedPets[0].petNm;
  return `${selectedPets[0].petNm} 외 ${selectedPets.length - 1}`;
};

/**
 * [건강 일지 반려동물 선택 버튼 + 전체 반려동물 패널] (추가 요청)
 * - 닫힌 버튼: 캐릭터 얼굴 + 이름 + 아래 화살표(열리면 위). 색·모양은 이전 알약형 셀렉트와 같음
 * - 패널: 버튼 왼쪽 아래. "반려동물 / N마리" 머리 + 4칸 격자(얼굴 + 이름)
 * - 칸을 누르면 그 반려동물로 바꾸고 닫음. 바깥 클릭·Esc로도 닫음(Esc는 버튼으로 초점 되돌림)
 * - pets: GET /pets 행({ petSn, petNm, petSeCd, bscCharSbstYn })
 * - isMulti(케어 캘린더 표시 반려동물 필터, FN-HLT-003-39): selectedPetSns가 null이면 전체.
 *   격자 첫 칸 [전체], 칸을 누를 때마다 선택/해제(체크 배지)하고 패널은 열어 둠. 하나도 안 남으면 전체.
 *   하단 [선택 해제]도 전체로. onChange(petSns | null)
 */
export default function DiaryPetPicker({
  pets,
  selectedPetSn,
  onSelect,
  isMulti = false,
  selectedPetSns = null,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const selectedPet =
    pets.find((pet) => pet.petSn === selectedPetSn) ?? pets[0];
  const multiPets = isMulti
    ? pets.filter((pet) => selectedPetSns?.includes(pet.petSn))
    : [];
  const isAllPets = multiPets.length === 0;

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

  const toggle = (petSn) => {
    const current = selectedPetSns ?? [];
    const next = current.includes(petSn)
      ? current.filter((sn) => sn !== petSn)
      : [...current, petSn];
    onChange(next.length === 0 ? null : next);
  };

  const buttonLabel = isMulti ? getMultiLabel(multiPets) : selectedPet.petNm;

  return (
    <div
      ref={rootRef}
      className="relative shrink-0 self-start min-[1101px]:self-auto"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={`반려동물 선택, ${buttonLabel}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`my-0.5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-brand-500 bg-brand-500 pr-4 pl-1.25 text-base font-semibold text-white hover:bg-brand-600 focus:outline-none max-[760px]:h-11 ${
          isOpen ? 'shadow-[0_0_0_3px_rgba(249,234,166,0.6)]' : ''
        }`}
      >
        {!isMulti && (
          <PetFace
            petSn={selectedPet.petSn}
            petSeCd={selectedPet.petSeCd}
            isError={selectedPet.bscCharSbstYn}
            className={BUTTON_FACE_CLASS}
            iconClassName="size-3/5"
          />
        )}
        {isMulti && isAllPets && (
          <span
            aria-hidden="true"
            className={`grid place-items-center ${BUTTON_FACE_CLASS}`}
          >
            <PawPrint className="size-3/5" />
          </span>
        )}
        {isMulti && !isAllPets && (
          <span className="flex shrink-0 items-center">
            {multiPets.slice(0, 2).map((pet, index) => (
              <PetFace
                key={pet.petSn}
                petSn={pet.petSn}
                petSeCd={pet.petSeCd}
                isError={pet.bscCharSbstYn}
                className={`${BUTTON_FACE_CLASS} ring-2 ring-brand-500 ${
                  index > 0 ? '-ml-3' : ''
                }`}
                iconClassName="size-3/5"
              />
            ))}
          </span>
        )}
        <span className="max-w-40 truncate">{buttonLabel}</span>
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
            {isMulti && (
              <button
                type="button"
                aria-pressed={isAllPets}
                onClick={() => onChange(null)}
                className={cellClass(isAllPets)}
              >
                <span
                  aria-hidden="true"
                  className={`grid place-items-center ${CELL_FACE_CLASS}`}
                >
                  <PawPrint className="size-3/5" />
                </span>
                <span className="w-full truncate text-center">전체</span>
              </button>
            )}
            {pets.map((pet) => {
              const isSelected = isMulti
                ? multiPets.includes(pet)
                : pet.petSn === selectedPet.petSn;
              return (
                <button
                  key={pet.petSn}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    isMulti ? toggle(pet.petSn) : select(pet.petSn)
                  }
                  className={`${cellClass(isSelected)} ${isMulti ? 'relative' : ''}`}
                >
                  <PetFace
                    petSn={pet.petSn}
                    petSeCd={pet.petSeCd}
                    isError={pet.bscCharSbstYn}
                    className={CELL_FACE_CLASS}
                    iconClassName="size-3/5"
                  />
                  <span className="w-full truncate text-center">
                    {pet.petNm}
                  </span>
                  {isMulti && isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-brand-500 text-white"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {isMulti && (
            <div className="mt-2 flex justify-end border-t border-line pt-2">
              <button
                type="button"
                onClick={() => onChange(null)}
                className="px-1 text-sm font-medium text-subtle underline underline-offset-2 hover:text-ink"
              >
                선택 해제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
