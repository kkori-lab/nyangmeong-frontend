import Icon from '@/components/Icon';
import { SELECT_ARROW_STYLE } from './formStyles';
import { SKIP } from './receiptUtils';

const chipClass = (isActive) =>
  `inline-flex h-9 items-center gap-1 rounded-full border px-3.5 ${
    isActive
      ? 'border-brand-100 bg-brand-50 font-semibold text-brand-600'
      : 'border-line bg-white text-ink hover:bg-surface-2'
  }`;

/**
 * [반려동물별 기록 탭] (FN-HLT-002-36)
 * - 구역 이름이 등록된 이름과 같으면 "○○ · 자동 연결" 탭, 다르거나 추가한 탭은 [반려동물 선택 ▾]로 선택
 * - 같은 반려동물은 두 탭에 둘 수 없어 다른 탭에서 고른 반려동물은 선택 불가
 * - 탭이 1개이고 자동 연결됐으면 탭 머리를 숨김, 구역이 없는 영수증이라 더 추가할 수 있을 때만 [＋ 반려동물 추가] 표시
 */
export default function ReceiptPetTab({
  tabs,
  pets,
  activeId,
  canAdd,
  onSelect,
  onPetChange,
  onAdd,
}) {
  /** 탭이 1개여도 반려동물을 직접 골라야 하면(자동 연결 실패) 선택칸 표시 */
  const hasTabHead = tabs.length > 1 || !tabs[0].isAutoLinked;
  if (!hasTabHead && !canAdd) return null;

  const findPetNm = (petSn) => pets.find((pet) => pet.petSn === petSn)?.petNm;

  return (
    <div
      role="group"
      aria-label="반려동물별 기록"
      className="mt-2 flex flex-wrap gap-2"
    >
      {hasTabHead &&
        tabs.map((tab) => {
          const isActive = tab.id === activeId;
          if (tab.isAutoLinked) {
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                className={chipClass(isActive)}
                onClick={() => onSelect(tab.id)}
              >
                {findPetNm(tab.petSn)} · 자동 연결
              </button>
            );
          }
          const usedByOthers = new Set(
            tabs.filter((other) => other.id !== tab.id).map((o) => o.petSn),
          );
          return (
            <span key={tab.id} className={chipClass(isActive)}>
              {tab.sectionNm && <span>영수증 &apos;{tab.sectionNm}&apos; →</span>}
              <select
                aria-label={
                  tab.sectionNm
                    ? `영수증 '${tab.sectionNm}' 반려동물 선택`
                    : '반려동물 선택'
                }
                value={tab.petSn ?? ''}
                style={SELECT_ARROW_STYLE}
                className="cursor-pointer appearance-none bg-transparent pr-6 outline-none"
                onFocus={() => onSelect(tab.id)}
                onChange={(event) => {
                  const { value } = event.target;
                  onPetChange(
                    tab.id,
                    value === '' ? null : value === SKIP ? SKIP : Number(value),
                  );
                }}
              >
                <option value="">반려동물 선택</option>
                {pets.map((pet) => (
                  <option
                    key={pet.petSn}
                    value={pet.petSn}
                    disabled={usedByOthers.has(pet.petSn)}
                  >
                    {pet.petNm}
                  </option>
                ))}
                <option value={SKIP}>저장 안 함</option>
              </select>
            </span>
          );
        })}
      {canAdd && (
        <button
          type="button"
          className={`${chipClass(false)} border-dashed`}
          onClick={onAdd}
        >
          <Icon name="add" className="text-lg" />
          반려동물 추가
        </button>
      )}
    </div>
  );
}
