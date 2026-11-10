import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronsUpDown, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import PetFace from '@/components/PetFace';
import { PATHS } from '@/routes/paths';
import { BRUP_ROLE, MAX_OWN_PETS } from '@/utils/petCodes';
import { formatAge, getPetSeName } from '@/utils/petFormat';
import { useSelectedPet } from './selectedPet';

const CELL_FACE_CLASS =
  'size-12 shrink-0 overflow-hidden rounded-full border border-line bg-white text-subtle';

/** 마이페이지 반려동물 등록 모달로 보낸다. 등록을 마치면 returnTo로 돌아오고 새 아이가 선택된다(마이페이지 쪽 연결 필요) */
const getRegisterPath = (returnTo) =>
  `${PATHS.MYPAGE_PETS}?${new URLSearchParams({ register: '1', returnTo })}`;

/**
 * 1101px 이상: 바로 앞 사이드 메뉴(sticky)가 스크롤에 붙을 때 이 카드도 메뉴 바로 아래에 같이 붙는다
 * - 붙는 높이 = 메뉴의 계산된 top + 메뉴 높이 + 이 카드의 위 여백. 값은 화면에서 읽어 따로 적지 않는다
 * - 메뉴가 sticky가 아니면(1100px 이하 등 top이 auto) 비워 둔다
 */
const useStickBelowMenu = (ref, isEnabled, layoutKey) => {
  useLayoutEffect(() => {
    const element = ref.current;
    const menu = element?.previousElementSibling;
    if (!isEnabled || !menu) return undefined;
    const update = () => {
      const menuTop = parseFloat(getComputedStyle(menu).top);
      if (Number.isNaN(menuTop)) {
        element.style.top = '';
        return;
      }
      const marginTop = parseFloat(getComputedStyle(element).marginTop) || 0;
      element.style.top = `${menuTop + menu.offsetHeight + marginTop}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(menu);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, isEnabled, layoutKey]);
};

/**
 * [건강기록 공통 반려동물 카드] (※신규 정책)
 * - 건강기록 3개 화면(종합 건강기록·건강 일지·케어 캘린더)이 같은 아이를 보게 하는 선택 위치
 * - variant="card": 1101px 이상, 사이드 메뉴 아래. 사진 + 「보고 있는 아이」 + 이름 + 「종 · 나이」 + ⇅. 팝오버는 카드 아래에 왼쪽 끝을 맞춰 열림
 * - variant="pill": 1100px 이하, 페이지 제목 아래 알약 버튼(사진 + 이름 + ▾). 같은 팝오버가 버튼 아래에 열림
 * - 반려동물 1마리여도 눌러서 팝오버를 열 수 있다(그 아이 1칸 + 「+ 등록」)
 * - 반려동물 0마리면 카드 대신 점선 박스와 [반려동물 등록]
 * - 접근성: 버튼 aria-haspopup="dialog"·aria-expanded, 칸 모음 role="listbox"·칸 role="option"·aria-selected
 */
export default function PetSwitcher({ variant }) {
  const { pets, pet, selectPet, isPending, isError } = useSelectedPet();
  const { pathname, search, hash } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  const isCard = variant === 'card';
  const visibility = isCard ? 'max-[1100px]:hidden' : 'min-[1101px]:hidden';
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
          isCard ? 'mt-6 min-[1101px]:sticky' : ''
        }`}
      >
        <p className="font-semibold text-ink">등록된 반려동물이 없어요</p>
        <p className="text-sm text-muted">
          등록하면 건강기록을 시작할 수 있어요
        </p>
        <Link
          to={getRegisterPath(returnTo)}
          className="inline-flex h-8 items-center rounded-box bg-brand-500 px-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          반려동물 등록
        </Link>
      </div>
    );
  }

  const isFull =
    pets.filter((item) => item.brupRoleCd === BRUP_ROLE.PRIMARY).length >=
    MAX_OWN_PETS;
  const handleSelect = (petSn) => {
    setIsOpen(false);
    if (petSn !== pet.petSn) selectPet(petSn);
  };
  const meta = [getPetSeName(pet), formatAge(pet.petBrdt)]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      ref={rootRef}
      className={`${visibility} relative ${
        isCard
          ? 'z-20 mt-6 border-t border-line pt-6 min-[1101px]:sticky'
          : 'self-start'
      }`}
    >
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
            <span className="block text-badge text-subtle">보고 있는 아이</span>
            <span className="block truncate font-bold text-ink">
              {pet.petNm}
            </span>
            <span className="block truncate text-sm text-muted">{meta}</span>
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
          aria-label={`보고 있는 아이 ${pet.petNm}, 반려동물 바꾸기`}
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
          <div className="grid grid-cols-4 gap-1">
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
            {!isFull && (
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
                <span className="w-full truncate text-center">등록</span>
              </Link>
            )}
          </div>
          <p className="mt-2 border-t border-line px-1 pt-2 text-sm text-subtle">
            고른 반려동물은 건강기록 모든 화면에 함께 적용돼요
          </p>
        </div>
      )}
    </div>
  );
}
