import {
  CalendarDays,
  CircleCheckBig,
  Eye,
  Info,
  ListChecks,
  NotebookTabs,
  Palette,
  PawPrint,
  Presentation,
  Star,
  Stethoscope,
  TrendingUp,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import PetFace from '@/components/PetFace';
import SearchInput from '@/components/SearchInput';
import { SHORTCUT_GROUPS, SHORTCUT_TYPES } from './shortcutTypes';

/** 메인 바로가기 최대 개수 */
export const SHORTCUT_MAX = 12;

const ICON_BY_CD = {
  MANC0008: Presentation,
  MANC0009: NotebookTabs,
  MANC0010: CalendarDays,
  MANC0011: TrendingUp,
  MANC0012: Eye,
  MANC0013: Stethoscope,
  MANC0014: CalendarDays,
  MANC0015: ListChecks,
  MANC0016: CircleCheckBig,
  MANC0017: Palette,
  MANC0018: PawPrint,
};

const TYPE_BY_CD = Object.fromEntries(
  SHORTCUT_TYPES.map((type) => [type.cd, type]),
);

/**
 * 검색어가 있으면 이름이 맞는 항목과 그 부모 줄을 남긴다
 * - 하위가 맞으면 부모 줄도, 부모가 맞으면 하위 전부
 */
const filterTypes = (keyword) => {
  if (!keyword) return SHORTCUT_TYPES;
  const isMatch = (type) => type.label.includes(keyword);
  return SHORTCUT_TYPES.filter((type) =>
    type.parentCd
      ? isMatch(type) || isMatch(TYPE_BY_CD[type.parentCd])
      : isMatch(type) ||
        SHORTCUT_TYPES.some(
          (child) => child.parentCd === type.cd && isMatch(child),
        ),
  );
};

/** 고른 바로가기 부가 글의 메뉴 이름: 하위면 부모 이름, 아니면 묶음 이름 */
const groupLabelOf = (type) =>
  type.parentCd ? TYPE_BY_CD[type.parentCd].label : type.group;

/**
 * 웹 두 목록의 막대 자리: 막대 모양은 공용 스크롤바(assets/index.css)를 따른다
 * - 막대 자리(10px)를 늘 비워 두고 오른쪽 여백을 24px→14px로 줄인다: 막대가 생겨도 목록 너비가 그대로이고
 *   막대는 오른쪽 여백 위에 보인다(사람 요청 2026-11-13). 웹 폭에서만(모바일 왼쪽 목록은 스크롤하지 않음)
 */
const SCROLL_SOFT = 'min-[761px]:pr-3.5 min-[761px]:scrollbar-stable';

const isSamePick = (a, b) => a.petSn === b.petSn && a.cd === b.cd;

/** 두 목록이 같은 바로가기를 같은 순서로 담고 있는지 */
const isSameList = (a, b) =>
  a.length === b.length && a.every((item, index) => isSamePick(item, b[index]));

/**
 * [바로가기 편집] 메인 바로가기 전체를 한 창에서 빼고 넣는다(사람 요청 2026-11-13, 명세 FN-MAN-010·011과 다름)
 * - 웹: 왼쪽 반려동물·메뉴 검색·메뉴 트리, 오른쪽 메인 바로가기 목록(× 빼기). 760px 이하는 바텀시트에 ☆ 넣기·빼기
 * - pets: 양육 중인 반려동물 목록(위 반려동물 줄)
 * - items: [{ petSn, cd }] 지금 메인 바로가기(메인 순서). 열 때 목록에 들어 있고, 새로 넣은 것은 뒤에 붙는다
 * - initialPetSn: 처음 골라 둘 반려동물(타일 ⋮에서 열 때). 없거나 목록에 없으면 첫 반려동물
 * - onSubmit(list): [{ petSn, cd }] 저장할 목록 전체. 바꾼 것이 없으면 [저장]이 막힌다
 */
export default function ShortcutEditModal({
  pets,
  items,
  initialPetSn,
  isPending,
  onSubmit,
  onClose,
}) {
  const [petSn, setPetSn] = useState(
    () =>
      pets.find((pet) => pet.petSn === initialPetSn)?.petSn ?? pets[0].petSn,
  );
  const [query, setQuery] = useState('');
  const [list, setList] = useState(items);

  const petBySn = Object.fromEntries(pets.map((pet) => [pet.petSn, pet]));
  const isFull = list.length >= SHORTCUT_MAX;
  const isChanged = !isSameList(list, items);
  const keyword = query.trim();
  const types = filterTypes(keyword);
  const groups = SHORTCUT_GROUPS.map((group) => ({
    group,
    items: types.filter((type) => type.group === group),
  })).filter((entry) => entry.items.length > 0);

  /** 목록에 있으면 빼고, 없으면 뒤에 넣는다 */
  const handleToggle = (cd) => {
    const pick = { petSn, cd };
    setList((prev) =>
      prev.some((item) => isSamePick(item, pick))
        ? prev.filter((item) => !isSamePick(item, pick))
        : [...prev, pick],
    );
  };

  const handleRemove = (pick) =>
    setList((prev) => prev.filter((item) => !isSamePick(item, pick)));

  const left = SHORTCUT_MAX - list.length;
  /** 몇 개 더 넣을 수 있는지: 가득 차면 빼는 길을 알려 준다 */
  const guideText = isFull
    ? '가득 참 · 빼야 더 추가 가능'
    : `${left}개 더 추가 가능 · 최대 ${SHORTCUT_MAX}개`;

  return (
    <Modal
      title="바로가기 편집"
      isLarge
      isSheet
      width={720}
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
          <span className="text-sm text-muted min-[761px]:hidden">
            {isFull ? (
              '가득 참'
            ) : (
              <>
                <b className="text-ink">{left}개</b> 남음
              </>
            )}
          </span>
          <div className="flex flex-1 gap-2 *:min-w-0 *:flex-1">
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              disabled={isPending || !isChanged}
              onClick={() => onSubmit(list)}
            >
              저장
            </button>
          </div>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col text-left">
        {/** 웹은 모달 전체 폭을 반려동물 수로 나눠 한 줄, 760px 이하는 가로 스크롤 */}
        <ul
          aria-label="반려동물"
          className="flex shrink-0 gap-2 overflow-x-auto border-b border-line-soft px-6 pt-5 pb-4 min-[761px]:overflow-visible"
        >
          {pets.map((pet) => {
            const isSelected = pet.petSn === petSn;
            return (
              <li
                key={pet.petSn}
                className="shrink-0 min-[761px]:min-w-0 min-[761px]:flex-1 min-[761px]:shrink"
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setPetSn(pet.petSn)}
                  className="flex w-14 flex-col items-center gap-1 min-[761px]:w-full"
                >
                  <PetFace
                    petSn={pet.petSn}
                    petSeCd={pet.petSeCd}
                    isError={pet.bscCharSbstYn}
                    iconClassName="size-5"
                    className={`aspect-square w-12 max-w-full rounded-full bg-surface-2 ${
                      isSelected
                        ? 'border-2 border-brand-500'
                        : 'border-2 border-transparent'
                    }`}
                  />
                  <span
                    className={`w-full truncate text-center text-xs ${
                      isSelected ? 'font-semibold text-ink' : 'text-ink-2'
                    }`}
                  >
                    {pet.petNm}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="grid min-h-0 flex-1 min-[761px]:grid-cols-2">
          <div
            className={`flex min-h-0 min-w-0 flex-col gap-3 px-6 pt-4 pb-5 min-[761px]:overflow-y-auto min-[761px]:border-r min-[761px]:border-line-soft ${SCROLL_SOFT}`}
          >
            <SearchInput
              value={query}
              onChange={setQuery}
              onSubmit={() => {}}
              placeholder="메뉴 검색"
            />
            <p className="flex items-center gap-1 text-xs text-muted min-[761px]:hidden">
              <Info className="size-3.5 shrink-0" aria-hidden="true" />
              {guideText}
            </p>
            {groups.length === 0 ? (
              <p className="py-3 text-sm text-muted">검색 결과가 없어요</p>
            ) : (
              groups.map(({ group, items }) => (
                <section key={group} aria-label={group}>
                  <h3 className="mb-1 text-sm text-muted">{group}</h3>
                  <ul className="flex flex-col gap-1">
                    {items.map((type) => {
                      const Icon = ICON_BY_CD[type.cd];
                      const isPicked = list.some((item) =>
                        isSamePick(item, { petSn, cd: type.cd }),
                      );
                      return (
                        <li
                          key={type.cd}
                          className={type.parentCd ? 'pl-6' : ''}
                        >
                          <button
                            type="button"
                            aria-pressed={isPicked}
                            disabled={isFull && !isPicked}
                            onClick={() => handleToggle(type.cd)}
                            className={`flex h-10 w-full items-center gap-2 rounded-md px-2 text-left disabled:cursor-not-allowed ${
                              isPicked
                                ? 'bg-brand-50'
                                : 'hover:enabled:bg-surface-2'
                            } text-ink`}
                          >
                            {Icon && (
                              <Icon
                                className="size-4 shrink-0 text-ink-2"
                                aria-hidden="true"
                              />
                            )}
                            <span className="flex-1 truncate">
                              {type.label}
                            </span>
                            {isPicked && (
                              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted max-[760px]:hidden">
                                추가됨
                              </span>
                            )}
                            <Star
                              aria-hidden="true"
                              className={`size-4 min-[761px]:hidden ${
                                isPicked
                                  ? 'fill-brand-500 text-brand-500'
                                  : 'text-ink-2'
                              }`}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
          </div>
          <div
            className={`hidden min-h-0 flex-col gap-3 overflow-y-auto px-6 pt-4 pb-5 min-[761px]:flex ${SCROLL_SOFT}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">메인 바로가기</h3>
                <span className="text-sm text-muted">
                  <b className="text-ink">{list.length}</b> / {SHORTCUT_MAX}개
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{guideText}</p>
            </div>
            {list.length === 0 && (
              <p className="rounded-box border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
                왼쪽 메뉴에서 바로가기를 골라 주세요
              </p>
            )}
            <ul aria-label="메인 바로가기" className="flex flex-col gap-2">
              {list.map((pick) => {
                const pet = petBySn[pick.petSn];
                const type = TYPE_BY_CD[pick.cd];
                const label = type.label;
                return (
                  <li
                    key={`${pick.petSn}-${pick.cd}`}
                    className="flex items-center gap-3 rounded-box border border-line px-3 py-2.5"
                  >
                    <PetFace
                      petSn={pet.petSn}
                      petSeCd={pet.petSeCd}
                      isError={pet.bscCharSbstYn}
                      iconClassName="size-4"
                      className="size-9 shrink-0 rounded-full bg-surface-2"
                    />
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{label}</b>
                      <span className="block truncate text-xs text-muted">
                        {pet.petNm} · {groupLabelOf(type)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(pick)}
                      aria-label={`${pet.petNm} ${label} 빼기`}
                      className="grid size-7 place-items-center rounded-md text-subtle hover:bg-surface-2"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}
