import DropdownSelect from '@/components/DropdownSelect';
import Icon from '@/components/Icon';
import { FILTER_CHIP, FILTER_CHIP_ON } from '@/components/buttonStyles';
import { SKIP } from './receiptUtils';

const chipClass = (isActive) => (isActive ? FILTER_CHIP_ON : FILTER_CHIP);

/**
 * [반려동물별 기록 탭] (FN-HLT-002-36)
 * - 구역 이름이 등록된 이름과 같으면 "○○ · 자동 연결" 탭, 다르거나 추가한 탭은 [반려동물 선택 ▾]로 선택
 * - 같은 반려동물은 두 탭에 둘 수 없어 다른 탭에서 고른 반려동물은 선택 불가
 * - 탭이 1개이고 자동 연결됐으면 탭 머리를 숨김, 구역이 없는 영수증이라 더 추가할 수 있을 때만 [＋ 반려동물 추가] 표시
 * - isLinkedAbove(구역이 있는 영수증): 반려동물은 맨 위 [반려동물 연결]에서 고르고, 여기는 전환 탭만. 1개면 숨김
 *   칩 글자는 「고른 아이」만. 영수증 구역 이름이 그와 다를 때만 안내 「영수증에 적힌 이름: '구역 이름'」:
 *   760px 이상은 칩에 마우스를 올리면(title), 760px 미만은 고른 칩일 때 칩 줄 아래 ⓘ 한 줄 (※신규 정책, 2026-11-23)
 *   「기록 안 함」·「반려동물 선택」 칩도 영수증 구역 이름 안내 (※신규 정책, 2026-11-23)
 */
export default function ReceiptPetTab({
  tabs,
  pets,
  activeId,
  canAdd,
  isLinkedAbove = false,
  onSelect,
  onPetChange,
  onAdd,
}) {
  const findPetNm = (petSn) => pets.find((pet) => pet.petSn === petSn)?.petNm;

  if (isLinkedAbove) {
    if (tabs.length < 2) return null;
    const tabLabel = (tab) =>
      tab.petSn === SKIP
        ? '기록 안 함'
        : (findPetNm(tab.petSn) ?? '반려동물 선택');
    const activeTab = tabs.find((tab) => tab.id === activeId);
    const activeHint =
      activeTab && sectionHint(tabLabel(activeTab), activeTab.sectionNm);
    return (
      <div className="mt-2">
        <div
          role="group"
          aria-label="반려동물별 기록"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={tab.id === activeId}
              title={sectionHint(tabLabel(tab), tab.sectionNm)}
              className={chipClass(tab.id === activeId)}
              onClick={() => onSelect(tab.id)}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>
        {activeHint && (
          <p className="mt-2 flex items-center gap-1 text-sm text-subtle min-[760px]:hidden">
            <Icon name="info" className="text-base" />
            {activeHint}
          </p>
        )}
      </div>
    );
  }

  /** 탭이 1개여도 반려동물을 직접 골라야 하면(자동 연결 실패) 선택칸 표시 */
  const hasTabHead = tabs.length > 1 || !tabs[0].isAutoLinked;
  if (!hasTabHead && !canAdd) return null;

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
            <span
              key={tab.id}
              className={chipClass(isActive)}
              onFocus={() => onSelect(tab.id)}
            >
              {tab.sectionNm && (
                <span>영수증 &apos;{tab.sectionNm}&apos; →</span>
              )}
              <DropdownSelect
                label={
                  tab.sectionNm
                    ? `영수증 '${tab.sectionNm}' 반려동물 선택`
                    : '반려동물 선택'
                }
                variant="text"
                value={tab.petSn ?? ''}
                options={[
                  { value: '', label: '반려동물 선택' },
                  ...pets.map((pet) => ({
                    value: pet.petSn,
                    label: pet.petNm,
                    disabled: usedByOthers.has(pet.petSn),
                  })),
                  { value: SKIP, label: '저장 안 함' },
                ]}
                onChange={(value) =>
                  onPetChange(tab.id, value === '' ? null : value)
                }
              />
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

/** 영수증 구역 이름이 칩 글자와 다를 때만 안내 문구. 같거나 없으면 undefined. 조사 없는 문구로 (※신규 정책, 2026-11-23) */
function sectionHint(petLabel, sectionNm) {
  if (!sectionNm || sectionNm === petLabel) return undefined;
  return `영수증에 적힌 이름: '${sectionNm}'`;
}
