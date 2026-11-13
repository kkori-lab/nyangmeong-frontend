import { MoreVertical, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PetFace from '@/components/PetFace';
import Skeleton from '@/components/Skeleton';
import { useMainShortcuts, useSaveMainShortcuts } from './queries';
import ShortcutEditModal, { SHORTCUT_MAX } from './ShortcutEditModal';
import {
  applyShortcutOrder,
  pruneShortcutOrder,
  readShortcutOrder,
  shortcutKey,
  writeShortcutOrder,
} from './shortcutOrder';
import { SHORTCUT_TYPES, shortcutHref } from './shortcutTypes';

const TYPE_BY_CD = Object.fromEntries(
  SHORTCUT_TYPES.map((type) => [type.cd, type]),
);

/** 배경은 li(group) 기준: ⋮(Link의 형제)에 마우스를 올려도 타일 배경이 유지된다(추가-7) */
const TILE =
  'flex w-24 flex-col items-center gap-1.5 rounded-box p-3 text-center group-hover:bg-brand-50';
const CIRCLE = 'size-[52px] rounded-full';
/** 모바일(760px 이하, Modal isSheet와 같은 경계)에서 보이는 바로가기 수. 마지막 칸은 [바로가기 편집] */
const MOBILE_VISIBLE = 5;
/** 끌어 놓기는 웹만(761px 이상). 모바일 폭에서는 끌기를 시작하지 않는다 */
const MOBILE_QUERY = '(max-width: 760px)';

/** 반려동물별 바로가기 코드: 서버가 양육 중인 반려동물 전부를 주므로 응답에 없으면 빈 목록 */
const toShortcutMap = (pets, saved) =>
  pets.map((pet) => ({
    pet,
    shrtcCds: saved.find((item) => item.petSn === pet.petSn)?.shrtcCds ?? [],
  }));

/** 아직 넣지 않은 종류가 남은 반려동물 */
const toChoices = (rows) =>
  rows.filter(({ shrtcCds }) =>
    SHORTCUT_TYPES.some((type) => !shrtcCds.includes(type.cd)),
  );

/** 서버에 있는 바로가기 키 전부(저장 본문 모양 [{ petSn, shrtcCds }]도 받는다) */
const toLiveKeys = (pets, saved) =>
  toShortcutMap(pets, saved).flatMap(({ pet, shrtcCds }) =>
    shrtcCds.map((cd) => shortcutKey({ pet, cd })),
  );

/** 저장 본문: 반려동물별 코드 목록. 비어도 보내서 그 반려동물 바로가기를 비운다 */
const toBody = (rows, change) =>
  rows.map(({ pet, shrtcCds }) => ({
    petSn: pet.petSn,
    shrtcCds: change(pet.petSn, shrtcCds),
  }));

/**
 * [메인 반려동물 바로가기]
 * - 누르면 그 반려동물로 건강기록 화면을 연다(?petSn=)
 * - [바로가기 편집]에서 메인 바로가기 전체를 빼고 넣어 [저장]한다(ShortcutEditModal). 목록은 서버에 저장
 * - 배치: 웹은 한 줄 6칸·최대 SHORTCUT_MAX개, 12개가 차면 [바로가기 편집] 칸이 없다
 *   모바일은 한 줄 3칸, 앞 MOBILE_VISIBLE개 + [바로가기 편집](항상 보임)
 * - 타일 오른쪽 위 ⋮: [바로가기 편집](그 반려동물이 골라진 편집 창)·[삭제](확인 없이 뺌) (추가-5)
 *   편집 창은 지금 바로가기를 담고 열려 빼기·넣기가 된다(사람 요청 2026-11-13, 명세 FN-MAN-010·011과 다름)
 *   마우스가 있는 기기는 올리거나 포커스할 때만 보이고, 터치 기기는 항상 보인다
 * - 웹은 타일을 끌어 놓아 순서를 바꾼다. 순서는 이 브라우저에 회원별로 보관(shortcutOrder.js), 서버 요청 없음
 * - mbrSn: 회원 번호(페이지가 features/member의 useMe로 받아 넘긴다). 아직 모르면 undefined
 */
export default function MainShortcuts({ pets, mbrSn }) {
  const { data: saved, isError } = useMainShortcuts();
  const save = useSaveMainShortcuts();
  /** 열린 편집 창: null | { petSn } (petSn이 없으면 첫 반려동물로 연다) */
  const [form, setForm] = useState(null);
  /** 이번 화면에서 끌어 놓은 순서: null | { mbrSn, keys }. 없으면 저장소 값 */
  const [movedOrder, setMovedOrder] = useState(null);
  /** 끄는 바로가기 키·놓을 자리 키 */
  const [draggingKey, setDraggingKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  // 서버 목록이 바뀔 때(삭제·수정·다른 기기 저장) 브라우저 저장 순서에서 없는 키를 뺀다
  useEffect(() => {
    if (!saved) return;
    const stored = readShortcutOrder(mbrSn);
    const pruned = pruneShortcutOrder(stored, toLiveKeys(pets, saved));
    if (pruned !== stored) writeShortcutOrder(mbrSn, pruned);
  }, [saved, pets, mbrSn]);

  if (!saved && !isError) {
    return (
      <div aria-busy="true" className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[120px] w-24 rounded-box" />
        ))}
      </div>
    );
  }

  const rows = toShortcutMap(pets, saved ?? []);
  const addable = toChoices(rows);
  const closeForm = () => setForm(null);
  const order =
    movedOrder?.mbrSn === mbrSn ? movedOrder.keys : readShortcutOrder(mbrSn);
  // 순서를 맞춘 뒤에 자른다: 서버에 13개 이상이면 맞춘 순서의 앞 12개
  const tiles = applyShortcutOrder(
    rows.flatMap(({ pet, shrtcCds }) =>
      shrtcCds.filter((cd) => TYPE_BY_CD[cd]).map((cd) => ({ pet, cd })),
    ),
    order,
  ).slice(0, SHORTCUT_MAX);
  const savedCount = tiles.length;
  const canAddOnWeb = addable.length > 0 && savedCount < SHORTCUT_MAX;

  /** 서버에 저장하고, 성공하면 이번 화면에서 끌어 놓은 순서에서도 빠진 키를 뺀다 */
  const saveShortcuts = (body, onDone) =>
    save.mutate(body, {
      onSuccess: () => {
        setMovedOrder((prev) => {
          if (!prev) return prev;
          const keys = pruneShortcutOrder(prev.keys, toLiveKeys(pets, body));
          return keys === prev.keys ? prev : { ...prev, keys };
        });
        onDone?.();
      },
    });

  /** 편집 창의 목록 전체를 저장한다: 반려동물별로 나눠 목록 순서대로 */
  const handleSave = (list) =>
    saveShortcuts(
      toBody(rows, (rowPetSn) =>
        list.filter((item) => item.petSn === rowPetSn).map((item) => item.cd),
      ),
      closeForm,
    );

  const endDrag = () => {
    setDraggingKey(null);
    setOverKey(null);
  };

  /** 끈 바로가기를 놓은 칸 자리로 옮기고 이 브라우저에 보관한다 */
  const handleDrop = (event, targetKey) => {
    event.preventDefault();
    const keys = tiles.map(shortcutKey);
    if (draggingKey && draggingKey !== targetKey) {
      const next = keys.filter((key) => key !== draggingKey);
      next.splice(keys.indexOf(targetKey), 0, draggingKey);
      setMovedOrder({ mbrSn, keys: next });
      writeShortcutOrder(mbrSn, next);
    }
    endDrag();
  };

  const handleDelete = (petSn, cd) =>
    saveShortcuts(
      toBody(rows, (rowPetSn, shrtcCds) =>
        rowPetSn === petSn ? shrtcCds.filter((item) => item !== cd) : shrtcCds,
      ),
    );

  return (
    <>
      <ul
        aria-label="반려동물 바로가기"
        className="mx-auto flex w-fit max-w-[304px] flex-wrap justify-start gap-2 min-[761px]:max-w-[616px]"
      >
        {tiles.map(({ pet, cd }, index) => {
          const key = shortcutKey({ pet, cd });
          const isDragging = key === draggingKey;
          const isOver = key === overKey && draggingKey !== null && !isDragging;
          return (
            <li
              key={key}
              draggable
              onDragStart={(event) => {
                if (window.matchMedia(MOBILE_QUERY).matches) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', key);
                // 얼굴 이미지에서 끌기 시작해도 타일 전체를 끄는 모양으로 보인다
                event.dataTransfer.setDragImage(event.currentTarget, 48, 48);
                setDraggingKey(key);
              }}
              onDragOver={(event) => {
                if (draggingKey === null) return;
                event.preventDefault();
                setOverKey(key);
              }}
              onDrop={(event) => handleDrop(event, key)}
              onDragEnd={endDrag}
              className={`group relative rounded-box ${
                isOver ? 'outline-2 -outline-offset-2 outline-brand-500' : ''
              } ${isDragging ? 'opacity-40' : ''} ${
                index >= MOBILE_VISIBLE ? 'max-[760px]:hidden' : ''
              }`}
            >
              <Link
                to={shortcutHref(TYPE_BY_CD[cd], pet.petSn)}
                draggable={false}
                className={TILE}
              >
                <PetFace
                  petSn={pet.petSn}
                  petSeCd={pet.petSeCd}
                  isError={pet.bscCharSbstYn}
                  className={`${CIRCLE} border-2 border-brand-100 bg-white`}
                />
                <b className="w-full truncate text-xs text-ink">{pet.petNm}</b>
                {/* 종류 이름은 두 줄까지 단어 단위로 줄바꿈(사람 요청 2026-11-13). 반려동물 이름은 한 줄 */}
                <span className="line-clamp-2 w-full text-xs leading-4 tracking-[-0.01em] break-keep whitespace-pre-line text-muted">
                  {TYPE_BY_CD[cd].tileLabel ?? TYPE_BY_CD[cd].label}
                </span>
              </Link>
              <ShortcutMenu
                label={`${pet.petNm} ${TYPE_BY_CD[cd].label} 바로가기 메뉴`}
                onEdit={() => setForm({ petSn: pet.petSn })}
                onDelete={() => handleDelete(pet.petSn, cd)}
              />
            </li>
          );
        })}
        {/* 모바일은 항상, 웹은 더할 수 있을 때만 */}
        <li className={`group ${canAddOnWeb ? '' : 'min-[761px]:hidden'}`}>
          <button type="button" onClick={() => setForm({})} className={TILE}>
            <PlusTileBody label="바로가기 편집" />
          </button>
        </li>
      </ul>
      {form && (
        <ShortcutEditModal
          pets={pets}
          items={tiles.map(({ pet, cd }) => ({ petSn: pet.petSn, cd }))}
          initialPetSn={form.petSn}
          isPending={save.isPending}
          onSubmit={handleSave}
          onClose={closeForm}
        />
      )}
    </>
  );
}

/**
 * [바로가기 ⋮ 메뉴] 건강기록 케어 항목 ⋮ 메뉴(CareItemMenu)와 같은 방식·모양
 * - 바깥을 누르거나 Esc·항목을 고르면 닫힘
 */
function ShortcutMenu({ label, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const choose = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div
      ref={rootRef}
      className={`absolute top-1 right-1 ${
        isOpen
          ? ''
          : '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="grid size-6 place-items-center rounded-full text-subtle hover:text-ink"
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-10 mt-1 flex min-w-28 flex-col rounded-box border border-line bg-white py-1 text-sm shadow-depth-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onEdit)}
            className="h-9 px-4 text-left whitespace-nowrap hover:bg-surface-2"
          >
            바로가기 편집
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onDelete)}
            className="h-9 px-4 text-left text-danger hover:bg-surface-2"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

/** [바로가기 편집]·[반려동물 등록하기] 칸 안쪽: 회색 원 + 아이콘, 아래 이름 */
function PlusTileBody({ label }) {
  return (
    <>
      <span
        className={`${CIRCLE} grid place-items-center bg-surface-3 text-ink-2`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </span>
      <span className="text-xs whitespace-nowrap text-ink-2">{label}</span>
    </>
  );
}

/**
 * [반려동물 등록하기] 반려동물이 없을 때 메인 바로가기 자리에 둔다
 * - [바로가기 편집] 칸과 같은 모양(사람 결정 2026-11-13). 누르면 마이페이지 반려동물 관리에서 등록 창이 열린 채로 간다
 * - to: 갈 주소(페이지가 routes/paths로 만들어 넘긴다)
 */
export function PetRegisterTile({ to }) {
  return (
    <Link to={to} className={`${TILE} hover:bg-brand-50`}>
      <PlusTileBody label="반려동물 등록하기" />
    </Link>
  );
}
