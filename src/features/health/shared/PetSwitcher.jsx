import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronsUpDown, Plus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import PetFace from '@/components/PetFace';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_ACTION,
} from '@/components/buttonStyles';
import useStickBelowMenu from '@/hooks/useStickBelowMenu';
import { formatAge, getVrtyName } from '@/utils/petFormat';
import { usePetLimit } from '../queries';
import HealthGuideModal from './HealthGuideModal';
import { getRegisterPath } from './registerPath';
import { useSelectedPet } from './selectedPet';

/** 이름 아래 나이·품종 줄. 비어 있는 값은 줄을 그리지 않음 */
const getPetMetaLines = (pet) =>
  [formatAge(pet.petBrdt), getVrtyName(pet)].filter(Boolean);

const CELL_FACE_CLASS =
  'size-12 shrink-0 overflow-hidden rounded-full border border-line bg-white text-subtle';

/**
 * [건강기록 공통 반려동물 카드] (※신규 정책)
 * - 건강기록 3개 화면(종합 건강기록·건강 일지·케어 캘린더)이 같은 아이를 보게 하는 선택 위치
 * - variant="card": 1100px 이상, 사이드 메뉴 아래. 사진 + 「선택한 아이」 + 이름 / 나이 / 품종(줄마다 하나) + ⇅. 팝오버는 카드 아래에 왼쪽 끝을 맞춰 열림
 * - variant="pill": 1100px 이하, 페이지 제목 아래 알약 버튼(사진 + 이름 + ▾). 같은 팝오버가 버튼 아래에 열림
 * - 반려동물 1마리여도 눌러서 팝오버를 열 수 있다(그 아이 1칸 + 「+ 등록」)
 * - 반려동물 0마리면 카드 대신 점선 박스와 [반려동물 등록]
 * - 접근성: 버튼 aria-haspopup="dialog"·aria-expanded, 칸 모음 role="listbox"·칸 role="option"·aria-selected
 * - 아이 말풍선 (※신규 정책): card는 카드 바로 아래 연한 민트 말풍선(꼬리는 카드 속 캐릭터) + [같이 둘러보기], pill은 알약 아래 한 줄.
 *   누르면 「건강기록 둘러보기」 1장부터. 닫기·진행 표시 없이 항상 같은 모양, 0마리면 없음
 * - onOpenDashboardEdit: 종합 건강기록만 넘김. 둘러보기 3장 「대시보드 편집 바로 열기 ›」에 씀
 * - 둘러보기 모달은 카드·알약이 너비에 따라 숨겨져도 보이게 document.body에 portal로 그림
 */
export default function PetSwitcher({ variant, onOpenDashboardEdit }) {
  const { pets, pet, selectPet, isPending, isError } = useSelectedPet();
  const { data: limit } = usePetLimit();
  const { pathname, search, hash } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const isCard = variant === 'card';
  const visibility = isCard ? 'max-[1100px]:hidden' : 'min-[1100px]:hidden';
  const returnTo = `${pathname}${search}${hash}`;

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

  useStickBelowMenu(
    rootRef,
    isCard && !isPending && !isError,
    pet ? 'card' : 'empty',
  );

  // 목록을 받는 중이거나 못 받았으면 아무것도 그리지 않는다(0마리 안내가 잠깐 비치지 않게)
  if (isPending || isError) return null;
  if (!pet) {
    return (
      <div
        ref={rootRef}
        className={`${visibility} flex flex-col items-start gap-2 rounded-card border border-dashed border-line-strong p-4 ${
          isCard ? 'mt-6 min-[1100px]:sticky' : ''
        }`}
      >
        <p className="font-semibold text-ink">등록된 반려동물이 없어요</p>
        <p className="text-sm text-muted">
          등록하면 건강기록을 시작할 수 있어요
        </p>
        <Link to={getRegisterPath(returnTo)} className={BTN_PRIMARY}>
          반려동물 등록
        </Link>
      </div>
    );
  }

  // 한도를 못 불러왔으면(불러오는 중·실패) [등록]을 숨긴다
  const canRegister = limit?.remainingPetCount > 0;
  const handleSelect = (petSn) => {
    setIsOpen(false);
    if (petSn !== pet.petSn) selectPet(petSn);
  };
  return (
    <div
      ref={rootRef}
      className={`${visibility} ${
        isCard
          ? 'z-20 mt-6 border-t border-line pt-6 min-[1100px]:sticky'
          : 'flex flex-col items-start gap-2 self-start'
      }`}
    >
      <div className="relative">
        {isCard ? (
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-card border border-line bg-white p-3 text-left hover:bg-surface-2"
          >
            <PetFace
              petSn={pet.petSn}
              petSeCd={pet.petSeCd}
              isError={pet.bscCharSbstYn}
              className="size-12 shrink-0 overflow-hidden rounded-full bg-brand-50 text-subtle"
              iconClassName="size-3/5"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-badge text-subtle">선택한 아이</span>
              <span className="block truncate font-bold text-ink">
                {pet.petNm}
              </span>
              {getPetMetaLines(pet).map((line) => (
                <span key={line} className="block truncate text-sm text-muted">
                  {line}
                </span>
              ))}
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="size-5 shrink-0 text-subtle"
            />
          </button>
        ) : (
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            aria-label={`선택한 아이 ${pet.petNm}, 반려동물 바꾸기`}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-white pr-3 pl-1.25 font-semibold text-ink hover:bg-surface-2 max-[760px]:h-11"
          >
            <PetFace
              petSn={pet.petSn}
              petSeCd={pet.petSeCd}
              isError={pet.bscCharSbstYn}
              className="size-7.5 shrink-0 overflow-hidden rounded-full border border-line bg-white text-subtle"
              iconClassName="size-3/5"
            />
            <span className="max-w-40 truncate">{pet.petNm}</span>
            <ChevronDown
              aria-hidden="true"
              className={`size-5 shrink-0 text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {isOpen && (
          <div
            id={panelId}
            role="dialog"
            aria-label="반려동물 선택"
            className="absolute top-full left-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-line bg-white p-3 shadow-depth-sm"
          >
            <div className="flex items-center justify-between px-1 pb-2 text-sm">
              <span className="font-semibold text-ink">반려동물</span>
              <span className="text-subtle">{pets.length}마리</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              <div role="listbox" aria-label="반려동물" className="contents">
                {pets.map((item) => {
                  const isSelected = item.petSn === pet.petSn;
                  return (
                    <button
                      key={item.petSn}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item.petSn)}
                      className={`flex min-w-0 flex-col items-center gap-1 rounded-box px-1 py-2 text-sm ${
                        isSelected
                          ? 'bg-brand-50 font-bold text-brand-600'
                          : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink'
                      }`}
                    >
                      <PetFace
                        petSn={item.petSn}
                        petSeCd={item.petSeCd}
                        isError={item.bscCharSbstYn}
                        className={CELL_FACE_CLASS}
                        iconClassName="size-3/5"
                      />
                      <span className="w-full truncate text-center">
                        {item.petNm}
                      </span>
                    </button>
                  );
                })}
              </div>
              {canRegister && (
                <Link
                  to={getRegisterPath(returnTo)}
                  className="flex min-w-0 flex-col items-center gap-1 rounded-box px-1 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-full border border-dashed border-line-strong text-subtle"
                  >
                    <Plus className="size-5" />
                  </span>
                  <span className="w-full truncate text-center">등록하기</span>
                </Link>
              )}
            </div>
            <p className="mt-2 border-t border-line px-1 pt-2 text-sm text-subtle">
              고른 반려동물은 건강기록 모든 화면에 함께 적용돼요
            </p>
          </div>
        )}
      </div>

      {isCard ? (
        <div className="relative mt-3 rounded-card bg-brand-50 px-4 py-3.5 text-center">
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-7.5 size-3 rotate-45 bg-brand-50"
          />
          <p className="text-sm leading-[1.6] font-semibold text-ink-2">
            {pet.petNm} 기록하는 법,
            <br />
            같이 둘러볼까요?
          </p>
          <button
            type="button"
            aria-haspopup="dialog"
            className={`${BTN_SECONDARY} mt-2.5 w-full text-brand-600`}
            onClick={() => setIsGuideOpen(true)}
          >
            같이 둘러보기
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          className={`${TEXT_ACTION} max-w-full gap-1.5`}
          onClick={() => setIsGuideOpen(true)}
        >
          <span className="min-w-0 truncate">{pet.petNm} 기록하는 법</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold whitespace-nowrap text-brand-600">
            같이 둘러보기 ›
          </span>
        </button>
      )}

      {isGuideOpen &&
        createPortal(
          <HealthGuideModal
            onOpenDashboardEdit={onOpenDashboardEdit}
            onClose={() => setIsGuideOpen(false)}
          />,
          document.body,
        )}
    </div>
  );
}

/**
 * [건강기록 상세 화면 반려동물 표시] (※신규 정책) FN-HLT-005-16 · 007-07 — 보기 전용, 공통 선택값 변경 없음
 * - 검진상세·검사 수치 입력에서 주소의 petSn 아이를 보여 준다. 누를 수 없는 정보 칸(div, 포커스 없음)
 * - 배치·크기는 PetSwitcher와 같고, 면 bg-surface-3·테두리 없음, ⇅·▾·팝오버 없음
 * - variant="card": 1100px 이상, 사이드 메뉴 아래. 사진 + 「이 기록의 아이」 + 이름 / 나이 / 품종(줄마다 하나)
 * - variant="pill": 1100px 이하, 페이지 제목 아래. 사진 + 이름
 * - pet이 없으면(목록을 받는 중·실패·목록에 없음) 그리지 않는다
 */
export function PetBadge({ pet, variant }) {
  const rootRef = useRef(null);
  const isCard = variant === 'card';
  const visibility = isCard ? 'max-[1100px]:hidden' : 'min-[1100px]:hidden';

  useStickBelowMenu(rootRef, isCard && Boolean(pet), 'card');

  if (!pet) return null;
  if (!isCard) {
    return (
      <div
        ref={rootRef}
        className={`${visibility} inline-flex h-10 items-center gap-2 self-start rounded-full border border-transparent bg-surface-3 pr-3 pl-1.25 font-semibold text-ink max-[760px]:h-11`}
      >
        <PetFace
          petSn={pet.petSn}
          petSeCd={pet.petSeCd}
          isError={pet.bscCharSbstYn}
          className="size-7.5 shrink-0 overflow-hidden rounded-full border border-line bg-white text-subtle"
          iconClassName="size-3/5"
        />
        <span className="max-w-40 truncate">{pet.petNm}</span>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`${visibility} z-20 mt-6 border-t border-line pt-6 min-[1100px]:sticky`}
    >
      <div className="flex w-full items-center gap-3 rounded-card border border-transparent bg-surface-3 p-3">
        <PetFace
          petSn={pet.petSn}
          petSeCd={pet.petSeCd}
          isError={pet.bscCharSbstYn}
          className="size-12 shrink-0 overflow-hidden rounded-full bg-brand-50 text-subtle"
          iconClassName="size-3/5"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-badge text-subtle">이 기록의 아이</p>
          <p className="truncate font-bold text-ink">{pet.petNm}</p>
          {getPetMetaLines(pet).map((line) => (
            <p key={line} className="truncate text-sm text-muted">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
