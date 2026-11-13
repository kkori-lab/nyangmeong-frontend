import {
  Cat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dog,
  MoreVertical,
  Plus,
  X,
} from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import PetFace from '@/components/PetFace';
import { BRUP_ROLE, MAX_OWN_PETS, PET_SE } from '@/utils/petCodes';
import { useCaregiversOf } from '../queries';
import FamilySection, { OwnerLine } from './FamilySection';
import {
  formatBirthAge,
  formatWeight,
  getColrName,
  getGndrName,
  getPetSeName,
  getVrtyName,
  splitList,
} from '@/utils/petFormat';

/** 알레르기·기저질환 표시 개수 상한 */
const VISIBLE_LIST_COUNT = 2;

const NAV_BUTTON =
  'grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-2 hover:enabled:border-line-strong hover:enabled:text-ink';

/** 좌우로 밀어서 넘기는 최소 이동 거리(px) */
const SWIPE_DISTANCE = 50;

/** 슬라이드 높이 전환 시간(ms). SlideHeight의 duration과 같아야 한다 */
const TRANSITION_MS = 280;

/**
 * 슬라이드는 반려동물 + 마지막 등록 슬라이드(index === pets.length)
 * 양 끝에서 이동하면 반대쪽 끝으로 순환
 */
export default function PetSlide({
  pets,
  index,
  onMove,
  onEdit,
  onDelete,
  onUnlink,
  onInvite,
  onAdd,
  isFull,
}) {
  const total = pets.length + 1;
  /** 넘길 때 가족 영역이 캐시에서 바로 그려지도록 모든 동물의 양육자를 미리 받아 둔다 */
  useCaregiversOf(pets.map((pet) => pet.petSn));
  const isAddSlide = index === pets.length;
  const touchStartX = useRef(null);

  const move = (to) => onMove((to + total) % total);

  /** 모바일: 카드를 좌우로 밀어 이전·다음 슬라이드로 이동 */
  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (distance <= -SWIPE_DISTANCE) move(index + 1);
    else if (distance >= SWIPE_DISTANCE) move(index - 1);
  };

  const dots = (
    <PetDots pets={pets} index={index} isFull={isFull} onMove={onMove} />
  );

  return (
    <section aria-label="반려동물 슬라이드">
      <div
        className="relative"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <SlideHeight>
          {isAddSlide ? (
            <AddSlide isFull={isFull} onAdd={onAdd}>
              {dots}
            </AddSlide>
          ) : (
            <PetCard
              key={pets[index].petSn}
              pet={pets[index]}
              onEdit={onEdit}
              onDelete={onDelete}
              onUnlink={onUnlink}
              onInvite={onInvite}
            >
              {dots}
            </PetCard>
          )}
        </SlideHeight>
        <button
          type="button"
          onClick={() => move(index - 1)}
          aria-label="이전 반려동물"
          className={`${NAV_BUTTON} absolute top-1/2 -left-5 z-[2] -translate-y-1/2 shadow-depth-md max-[760px]:hidden`}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => move(index + 1)}
          aria-label="다음 반려동물"
          className={`${NAV_BUTTON} absolute top-1/2 -right-5 z-[2] -translate-y-1/2 border-brand-500 text-brand-600 shadow-depth-md hover:bg-brand-50 max-[760px]:hidden`}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}

/** 전환 중 그림자가 잘리지 않게 두는 여백(px). className의 -m-3·p-3과 같아야 한다 */
const HEIGHT_PAD = 12;

/**
 * 슬라이드를 넘기면 카드 높이가 달라지므로 높이를 부드럽게 바꾼다.
 * overflow-hidden은 전환 중에만 걸고 끝나면 풀어, 카드 안 팝업(⋮ 메뉴·"외 N개"·특징 레이어)이 잘리지 않게 한다.
 * prefers-reduced-motion이면 전환 없이 바로 바뀐다.
 */
function SlideHeight({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastHeight = null;
    let fallbackTimer = 0;

    const finish = () => {
      window.clearTimeout(fallbackTimer);
      outer.style.height = '';
      outer.style.overflow = '';
    };

    const observer = new ResizeObserver(() => {
      const nextHeight = inner.getBoundingClientRect().height + HEIGHT_PAD * 2;
      const prevHeight = lastHeight;
      lastHeight = nextHeight;
      if (prevHeight === null || prevHeight === nextHeight) return;
      if (reduceMotion.matches) {
        finish();
        return;
      }
      /** 전환 중이면 지금 보이는 높이에서, 아니면 직전 높이에서 시작한다(이 시점에 outer는 이미 새 높이다) */
      const fromHeight = outer.style.height
        ? outer.getBoundingClientRect().height
        : prevHeight;
      outer.style.overflow = 'hidden';
      outer.style.height = `${fromHeight}px`;
      void outer.offsetHeight;
      outer.style.height = `${nextHeight}px`;
      window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(finish, TRANSITION_MS + 120);
    });
    observer.observe(inner);

    const handleEnd = (event) => {
      if (event.target === outer && event.propertyName === 'height') finish();
    };
    outer.addEventListener('transitionend', handleEnd);

    return () => {
      observer.disconnect();
      outer.removeEventListener('transitionend', handleEnd);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      ref={outerRef}
      className="-m-3 p-3 transition-[height] duration-[280ms] ease-in-out motion-reduce:transition-none"
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

/** 현재 위치 점. 맨 끝은 + (한도에 차면 일반 점) */
function PetDots({ pets, index, isFull, onMove }) {
  const dotClass = (isCurrent) =>
    `h-2 rounded-full transition-[width] duration-200 ${isCurrent ? 'w-[22px] bg-brand-600' : 'w-2 bg-line-strong'}`;

  return (
    <nav
      aria-label="반려동물 선택"
      className="absolute inset-x-0 bottom-5 z-[1] flex items-center justify-center gap-2"
    >
      {pets.map((dotPet, dotIndex) => (
        <button
          key={dotPet.petSn}
          type="button"
          onClick={() => onMove(dotIndex)}
          aria-label={`${dotIndex + 1}번째 반려동물`}
          aria-current={dotIndex === index ? 'true' : undefined}
          className={dotClass(dotIndex === index)}
        />
      ))}
      {isFull ? (
        <button
          type="button"
          onClick={() => onMove(pets.length)}
          aria-label="등록 한도 안내"
          aria-current={index === pets.length ? 'true' : undefined}
          className={dotClass(index === pets.length)}
        />
      ) : (
        <button
          type="button"
          onClick={() => onMove(pets.length)}
          aria-label="반려동물 등록"
          aria-current={index === pets.length ? 'true' : undefined}
          className={`grid size-3.5 place-items-center ${index === pets.length ? 'text-brand-600' : 'text-line-strong'}`}
        >
          <Plus className="size-3.5" />
        </button>
      )}
    </nav>
  );
}

/** 마지막 슬라이드: 등록 / 한도 안내 */
function AddSlide({ isFull, onAdd, children }) {
  return (
    <article
      aria-labelledby="pet-add-title"
      className={`relative flex min-h-[470px] flex-col items-center justify-center gap-3 rounded-modal border-[1.5px] border-dashed border-line-strong p-5 pb-16 text-center max-[760px]:min-h-[360px] ${isFull ? 'bg-surface-2' : 'bg-white'}`}
    >
      <span
        aria-hidden="true"
        className={`mb-2 grid size-[72px] place-items-center rounded-full ${isFull ? 'bg-white text-[22px] font-bold' : 'bg-brand-50 text-brand-600'}`}
      >
        {isFull ? MAX_OWN_PETS : <Plus className="size-9" />}
      </span>
      <h2 id="pet-add-title" className="text-xl font-bold">
        {isFull ? '반려동물을 모두 등록했어요' : '새 반려동물 등록'}
      </h2>
      <p className="break-keep text-subtle">
        {isFull
          ? `반려동물은 최대 ${MAX_OWN_PETS}마리까지 등록할 수 있어요`
          : '함께 사는 반려동물을 추가하면 건강기록·케어미션을 같이 관리할 수 있어요'}
      </p>
      {!isFull && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 font-semibold text-white hover:bg-brand-600"
        >
          반려동물 등록하기
        </button>
      )}
      {children}
    </article>
  );
}

function PetCard({ pet, onEdit, onDelete, onUnlink, onInvite, children }) {
  const isCoParent = pet.brupRoleCd === BRUP_ROLE.CO_PARENT;
  const vrtyName = getVrtyName(pet);
  const birthText = formatBirthAge(pet.petBrdt);
  const gndrText = `${getGndrName(pet)}${pet.nutrYn ? '(중성화)' : ''}`;

  return (
    <article
      aria-labelledby="pet-name"
      className="relative grid gap-5 rounded-modal border border-line bg-white p-5 pt-10 pb-16 shadow-depth-sm max-[760px]:grid-cols-[84px_minmax(0,1fr)] max-[760px]:gap-x-4 max-[760px]:gap-y-0 min-[761px]:grid-cols-[140px_minmax(0,1fr)] min-[761px]:gap-x-8 min-[761px]:gap-y-6 min-[761px]:px-8 min-[1281px]:grid-cols-[220px_minmax(0,1fr)] min-[1281px]:gap-x-14 min-[1281px]:px-12"
    >
      <div className="flex items-center justify-center max-[760px]:self-center">
        <PetFace
          petSn={pet.petSn}
          petSeCd={pet.petSeCd}
          isError={pet.bscCharSbstYn}
          alt={`${pet.petNm} 캐릭터`}
          className="size-[140px] shrink-0 rounded-full bg-surface-2 text-line-strong shadow-[inset_0_0_0_1px_var(--color-line-strong)] max-[760px]:size-[84px] min-[1281px]:size-40"
          iconClassName="size-[70px] max-[760px]:size-9 min-[1281px]:size-20"
        />
      </div>
      <div className="flex min-w-0 flex-col max-[760px]:contents">
        <div className="flex items-start gap-3 pb-4 max-[760px]:items-center max-[760px]:pb-0">
          <div className="min-w-0 flex-1">
            <h2
              id="pet-name"
              className="flex flex-wrap items-center gap-3 text-xl font-bold tracking-[-0.02em] min-[761px]:text-page"
            >
              {pet.petNm}
              <span className="inline-flex flex-wrap gap-1 align-middle">
                {pet.rprsPetYn && (
                  <Badge className="bg-brand-500 text-white">대표</Badge>
                )}
                {isCoParent ? (
                  <Badge className="bg-tone-gray-bg text-tone-gray-fg">
                    공동양육
                  </Badge>
                ) : (
                  <Badge className="bg-tone-green-bg text-tone-green-fg">
                    주양육
                  </Badge>
                )}
              </span>
              {birthText && (
                <span className="text-base font-normal tracking-normal text-muted tabular-nums max-[760px]:hidden">
                  {birthText}
                </span>
              )}
            </h2>
            <p className="mt-1 hidden text-sm break-keep text-muted max-[760px]:block">
              {birthText && <span className="block">{birthText}</span>}
              <span className="block">{gndrText}</span>
            </p>
            {isCoParent && <OwnerLine pet={pet} />}
          </div>
          <PetMenu
            isCoParent={isCoParent}
            onEdit={() => onEdit(pet)}
            onRemove={() => (isCoParent ? onUnlink(pet) : onDelete(pet))}
          />
        </div>
        <InfoGrid pet={pet} vrtyName={vrtyName} />
        <MobileInfo pet={pet} />
      </div>
      <FamilySection pet={pet} onInvite={onInvite} />
      {children}
    </article>
  );
}

/** PC 상세: 2열 × 4행 grid 하나. 같은 행끼리 높이가 같아 좌우 구분선이 맞는다 */
function InfoGrid({ pet, vrtyName }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-x-6 max-[760px]:hidden min-[1281px]:gap-x-12">
      <InfoRow label="품종">{vrtyName || getPetSeName(pet)}</InfoRow>
      <InfoRow label="인식 번호" valueClassName="tabular-nums">
        <ChipNo value={pet.chipNo} />
      </InfoRow>
      <InfoRow label="성별">
        <span className="truncate">{getGndrName(pet)}</span>
        {pet.nutrYn && (
          <Badge className="shrink-0 bg-tone-blue-bg text-tone-blue-fg">
            중성화
          </Badge>
        )}
      </InfoRow>
      <ChrcRow value={pet.chrcCn} />
      <InfoRow label="체중">{formatWeight(pet.petBdwg)}</InfoRow>
      <ListRow label="알레르기" value={pet.algyCn} />
      <InfoRow label="털색">{getColrName(pet)}</InfoRow>
      <ListRow label="기저질환" value={pet.dssCn} />
    </dl>
  );
}

/** 이름 줄 오른쪽 ⋯ 메뉴 */
function PetMenu({ isCoParent, onEdit, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);
  const itemClass =
    'block w-full rounded-md px-3 py-2.5 text-left whitespace-nowrap hover:bg-surface-2';

  const choose = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative shrink-0 max-[760px]:self-start">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="반려동물 메뉴"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`grid size-10 place-items-center rounded-full border bg-white hover:border-line-strong hover:text-ink ${isOpen ? 'border-line-strong text-ink' : 'border-line text-ink-2'}`}
      >
        <MoreVertical className="size-5" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="menu"
            className="absolute top-[calc(100%+6px)] right-0 z-20 min-w-[168px] rounded-box border border-line bg-white p-1.5 shadow-depth-md"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => choose(onEdit)}
              className={itemClass}
            >
              반려동물 정보 수정
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => choose(onRemove)}
              className={`${itemClass} text-danger`}
            >
              {isCoParent ? '연동 해제' : '반려동물 삭제'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** 앱 전용: 필수 확인 4개만 보이고 [정보 더보기]로 털색·특징까지 펼침 */
function MobileInfo({ pet }) {
  const [isOpen, setIsOpen] = useState(false);
  const range =
    pet.minBdwg != null && pet.maxBdwg != null
      ? `정상 ${formatWeight(pet.minBdwg).slice(0, -2)}~${formatWeight(pet.maxBdwg)}`
      : null;

  return (
    <div className="col-span-full hidden max-[760px]:block">
      <dl className="m-0 mt-4 border-t border-line-strong">
        <MobileRow label="품종">
          {getVrtyName(pet) || getPetSeName(pet)}
        </MobileRow>
        <MobileRow label="체중">
          {formatWeight(pet.petBdwg)}
          {range && (
            <span className="text-badge font-medium text-subtle"> {range}</span>
          )}
        </MobileRow>
        <MobileRow label="인식 번호" empty={!pet.chipNo} emptyText="미등록">
          {pet.chipNo}
        </MobileRow>
        <MobileList label="알레르기" value={pet.algyCn} isOpen={isOpen} />
        <MobileList label="기저질환" value={pet.dssCn} isOpen={isOpen} />
        {isOpen && (
          <>
            <MobileRow label="털색">{getColrName(pet)}</MobileRow>
            <MobileRow label="특징">{pet.chrcCn}</MobileRow>
          </>
        )}
      </dl>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="mt-2 flex w-full items-center justify-center gap-1 p-1.5 font-semibold text-brand-600"
      >
        {isOpen ? '접기' : '정보 더보기'}
        <ChevronDown className={`size-4 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

function MobileRow({ label, empty, emptyText, children }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-line-soft px-0.5 py-[11px]">
      <dt className="w-[72px] shrink-0 text-subtle">{label}</dt>
      <dd
        className={`m-0 flex min-w-0 flex-1 items-baseline gap-1.5 break-keep ${empty ? 'text-muted' : 'font-semibold'}`}
      >
        {empty ? emptyText : children}
      </dd>
    </div>
  );
}

/** 알레르기·기저질환: 접으면 앞 2개 + "외 N개", 펼치면 전체 */
function MobileList({ label, value, isOpen }) {
  const items = splitList(value);
  const hiddenCount = items.length - VISIBLE_LIST_COUNT;

  return (
    <MobileRow label={label} empty={items.length === 0} emptyText="없음">
      {isOpen ? (
        items.join(', ')
      ) : (
        <>
          <span className="min-w-0 truncate">
            {items.slice(0, VISIBLE_LIST_COUNT).join(', ')}
          </span>
          {hiddenCount > 0 && (
            <em className="shrink-0 text-badge font-normal text-brand-600 not-italic">
              외 {hiddenCount}개
            </em>
          )}
        </>
      )}
    </MobileRow>
  );
}

function Badge({ className, children }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2.5 pt-[1.5px] text-badge leading-none font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

/** 한 줄 행. 위 두 칸은 위 선, 마지막 두 칸은 아래 선이 없다 */
const ROW =
  'flex h-14 min-w-0 items-center gap-6 border-b border-line-soft [&:nth-child(-n+2)]:border-t [&:nth-child(-n+2)]:border-t-line-strong [&:nth-last-child(-n+2)]:border-b-0';
const DT = 'w-20 shrink-0 text-subtle';
const DD = 'relative m-0 flex min-w-0 flex-1 items-center gap-2 font-semibold';

/** 인식 번호: 띄어쓰기 없이 이어 쓴다. 15자리는 국가번호(앞 3자리) 뒤에서만 줄이 바뀔 수 있다 */
function ChipNo({ value }) {
  if (!value) return null;
  const digits = value.replace(/\s/g, '');
  if (digits.length !== 15) return digits;
  return (
    <>
      {digits.slice(0, 3)}
      <wbr />
      {digits.slice(3)}
    </>
  );
}

function InfoRow({ label, valueClassName = '', children }) {
  return (
    <div className={ROW}>
      <dt className={DT}>{label}</dt>
      {children && (
        <dd className={`${DD} ${valueClassName}`}>
          {typeof children === 'string' ? (
            <span className="min-w-0 truncate" title={children}>
              {children}
            </span>
          ) : (
            children
          )}
        </dd>
      )}
    </div>
  );
}

/** 한 줄 초과 특징 말줄임·[더보기] */
function ChrcRow({ value }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return undefined;
    const check = () => setIsOverflow(el.scrollWidth > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className={ROW}>
      <dt className={DT}>특징</dt>
      {value && (
        <dd className={DD}>
          <span ref={textRef} className="min-w-0 truncate">
            {value}
          </span>
          {isOverflow && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="shrink-0 font-semibold text-brand-600 underline underline-offset-3"
            >
              더보기
            </button>
          )}
          {isOpen && (
            <ListLayer
              title="특징"
              text={value}
              onClose={() => setIsOpen(false)}
            />
          )}
        </dd>
      )}
    </div>
  );
}

function ListRow({ label, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = splitList(value);
  const hiddenCount = items.length - VISIBLE_LIST_COUNT;

  return (
    <div className={ROW}>
      <dt className={DT}>{label}</dt>
      {items.length > 0 && (
        <dd className={DD}>
          <span className="min-w-0 truncate">
            {items.slice(0, VISIBLE_LIST_COUNT).join(', ')}
          </span>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="shrink-0 font-semibold text-brand-600 underline underline-offset-3"
            >
              외 {hiddenCount}개
            </button>
          )}
          {isOpen && (
            <ListLayer
              title={`${label} (${items.length})`}
              items={items}
              onClose={() => setIsOpen(false)}
            />
          )}
        </dd>
      )}
    </div>
  );
}

/** 바깥 클릭 닫힘용 투명 막 */
function ListLayer({ title, items, text, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        role="dialog"
        aria-label={`${title} 전체 ${text ? '내용' : '목록'}`}
        className="absolute top-[calc(100%+8px)] right-0 z-20 w-60 max-w-[calc(100vw-32px)] rounded-box border border-line bg-white py-2 font-normal shadow-depth-sm"
      >
        <div className="flex items-center justify-between border-b border-line-soft pt-1 pr-2 pb-2 pl-4 font-semibold">
          <span>{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid size-8 place-items-center rounded-box text-muted hover:bg-surface-3 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        {text ? (
          <p className="max-h-60 overflow-y-auto px-4 py-3 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {text}
          </p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item} className="px-4 py-2">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
