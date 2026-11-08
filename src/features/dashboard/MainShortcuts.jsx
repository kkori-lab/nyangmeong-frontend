import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import PetFace from '@/components/PetFace';
import Select from '@/components/Select';
import Skeleton from '@/components/Skeleton';
import { useMainShortcuts, useSaveMainShortcuts } from './queries';
import { DEFAULT_SHORTCUT_CDS, SHORTCUT_TYPES } from './shortcutTypes';

const TYPE_BY_CD = Object.fromEntries(
  SHORTCUT_TYPES.map((type) => [type.cd, type]),
);

const TILE =
  'flex w-[80px] flex-col items-center gap-1.5 rounded-box px-1 py-2 text-center hover:bg-brand-50';
const CIRCLE = 'size-[52px] rounded-full';

/** 반려동물별 바로가기 코드: 저장한 적 없으면 기본(종합 건강기록) */
const toShortcutMap = (pets, saved) =>
  pets.map((pet) => ({
    pet,
    shrtcCds:
      saved.find((item) => item.petSn === pet.petSn)?.shrtcCds ??
      DEFAULT_SHORTCUT_CDS,
  }));

/** 아직 넣지 않은 종류가 남은 반려동물 */
const toAddable = (rows) =>
  rows
    .map(({ pet, shrtcCds }) => ({
      pet,
      types: SHORTCUT_TYPES.filter((type) => !shrtcCds.includes(type.cd)),
    }))
    .filter(({ types }) => types.length > 0);

/**
 * [메인 반려동물 바로가기]
 * - 누르면 그 반려동물로 건강기록 화면을 연다(?petSn=)
 * - [바로가기 추가]로 반려동물과 종류를 골라 더한다. 목록은 서버에 저장(지금은 가짜 응답)
 */
export default function MainShortcuts({ pets }) {
  const { data: saved, isError } = useMainShortcuts();
  const save = useSaveMainShortcuts();
  const [isAdding, setIsAdding] = useState(false);

  if (!saved && !isError) {
    return (
      <div aria-busy="true" className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[96px] w-[80px] rounded-box" />
        ))}
      </div>
    );
  }

  const rows = toShortcutMap(pets, saved ?? []);
  const addable = toAddable(rows);

  const handleAdd = (petSn, cd) => {
    const next = rows.map(({ pet, shrtcCds }) => ({
      petSn: pet.petSn,
      shrtcCds: pet.petSn === petSn ? [...shrtcCds, cd] : shrtcCds,
    }));
    save.mutate(next, { onSuccess: () => setIsAdding(false) });
  };

  return (
    <>
      <ul
        aria-label="반려동물 바로가기"
        className="flex flex-wrap justify-center gap-2"
      >
        {rows.flatMap(({ pet, shrtcCds }) =>
          shrtcCds
            .filter((cd) => TYPE_BY_CD[cd])
            .map((cd) => (
              <li key={`${pet.petSn}-${cd}`}>
                <Link
                  to={`${TYPE_BY_CD[cd].path}?${new URLSearchParams({ petSn: pet.petSn })}`}
                  className={TILE}
                >
                  <PetFace
                    petSn={pet.petSn}
                    petSeCd={pet.petSeCd}
                    isError={pet.bscCharSbstYn}
                    className={`${CIRCLE} border-2 border-brand-100 bg-white`}
                  />
                  <b className="w-full truncate text-xs text-ink">
                    {pet.petNm}
                  </b>
                  <span className="w-full truncate text-[11px] text-muted">
                    {TYPE_BY_CD[cd].label}
                  </span>
                </Link>
              </li>
            )),
        )}
        {addable.length > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className={TILE}
            >
              <span
                className={`${CIRCLE} grid place-items-center bg-surface-3 text-ink-2`}
              >
                <Plus className="size-4" aria-hidden="true" />
              </span>
              <span className="text-xs whitespace-nowrap text-ink-2">
                바로가기 추가
              </span>
            </button>
          </li>
        )}
      </ul>
      {isAdding && (
        <ShortcutAddModal
          addable={addable}
          isPending={save.isPending}
          onAdd={handleAdd}
          onClose={() => setIsAdding(false)}
        />
      )}
    </>
  );
}

/** [바로가기 추가] 반려동물·종류 고르기 */
function ShortcutAddModal({ addable, isPending, onAdd, onClose }) {
  const [petSn, setPetSn] = useState(String(addable[0].pet.petSn));
  const types = addable.find(
    ({ pet }) => String(pet.petSn) === petSn,
  ).types;
  const [cd, setCd] = useState(types[0].cd);
  const selectedCd = types.some((type) => type.cd === cd) ? cd : types[0].cd;

  return (
    <Modal
      title="바로가기 추가"
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
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
            disabled={isPending}
            onClick={() => onAdd(Number(petSn), selectedCd)}
          >
            추가
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Select
          label="반려동물"
          value={petSn}
          onChange={setPetSn}
          options={addable.map(({ pet }) => ({
            value: String(pet.petSn),
            label: pet.petNm,
          }))}
        />
        <Select
          label="바로가기"
          value={selectedCd}
          onChange={setCd}
          options={types.map((type) => ({
            value: type.cd,
            label: type.label,
          }))}
        />
      </div>
    </Modal>
  );
}
