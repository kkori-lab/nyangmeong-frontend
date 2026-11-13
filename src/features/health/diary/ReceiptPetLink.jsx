import { useId } from 'react';
import Badge from '@/components/Badge';
import DropdownSelect from '@/components/DropdownSelect';
import PetFace from '@/components/PetFace';
import { SKIP } from './receiptUtils';

/** 선택칸·목록에 쓰는 아이 캐릭터 원 + 이름 */
function PetOption({ pet }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <PetFace
        petSn={pet.petSn}
        petSeCd={pet.petSeCd}
        isError={pet.bscCharSbstYn}
        className="size-6 shrink-0 overflow-hidden rounded-full bg-brand-50 text-subtle"
        iconClassName="size-4"
      />
      <span className="truncate">{pet.petNm}</span>
    </span>
  );
}

/**
 * [반려동물 연결] 구역이 있는 영수증의 맨 위 상자 (※신규 정책, 2026-11-08)
 * - 영수증에서 읽은 이름(구역)마다 한 줄: 이름 태그 + 진료 건수 → 반려동물 선택칸
 * - 한 아이를 여러 줄에 고를 수 있음. 저장할 때 같은 아이의 줄은 검진기록 1건으로 합침
 *   (receiptUtils buildSaveEntries, ※신규 정책 2026-11-09). 그 줄 아래에 합침 안내
 * - 목록 맨 아래 「기록 안 함」은 여러 줄에서 고를 수 있고, 그 줄을 저장하지 않음
 * - 고른 칸은 청록 테두리 + 아이 캐릭터 원, 안 고른 칸은 회색 「반려동물 선택」
 * - isErrorShown: [저장]를 눌렀는데 안 고른 줄이 있으면 그 칸을 오류 색으로
 * - rowRefs: 안 고른 첫 줄로 옮겨 가려고 화면이 줄 요소를 tab.id로 받음
 */
export default function ReceiptPetLink({
  tabs,
  pets,
  isErrorShown,
  rowRefs,
  onPetChange,
}) {
  const titleId = useId();
  const linkedCount = tabs.filter((tab) => tab.petSn != null).length;
  const options = [
    ...pets.map((pet) => ({
      value: pet.petSn,
      label: <PetOption pet={pet} />,
    })),
    { value: SKIP, label: '기록 안 함' },
  ];
  /** 그 줄과 같은 아이를 다른 줄에서도 골랐는지(「기록 안 함」·미선택은 빼고) */
  const isMergedTab = (target) =>
    target.petSn != null &&
    target.petSn !== SKIP &&
    tabs.some((tab) => tab.id !== target.id && tab.petSn === target.petSn);
  const findPetNm = (petSn) => pets.find((pet) => pet.petSn === petSn)?.petNm;

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-box border border-line"
    >
      <div className="flex items-center justify-between gap-3 rounded-t-box bg-surface-2 px-4 py-2.5">
        <h3 id={titleId} className="font-semibold text-ink-2">
          반려동물 연결
          <span className="ml-0.5 font-bold text-danger">*</span>
        </h3>
        <span className="text-sm text-subtle tabular-nums">
          {linkedCount} / {tabs.length} 연결됨
        </span>
      </div>
      <ul>
        {tabs.map((tab) => {
          const isLinked = tab.petSn != null;
          const isError = isErrorShown && !isLinked;
          return (
            <li
              key={tab.id}
              ref={(element) => {
                rowRefs.current[tab.id] = element;
              }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line px-4 py-3"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Badge tone="brand" className="max-w-full min-w-0">
                  <span className="truncate">{tab.sectionNm}</span>
                </Badge>
                <span className="shrink-0 text-sm text-subtle tabular-nums">
                  진료 {tab.itemCnt}건
                </span>
              </span>
              <DropdownSelect
                value={tab.petSn}
                options={options}
                placeholder="반려동물 선택"
                label={`영수증 '${tab.sectionNm}' 반려동물 선택`}
                className={`w-48 max-sm:w-full ${
                  isError
                    ? '[&>button]:border-danger [&>button]:ring-error'
                    : isLinked
                      ? '[&>button]:border-brand-500'
                      : ''
                }`}
                onChange={(value) => onPetChange(tab.id, value)}
              />
              {isMergedTab(tab) && (
                <p className="w-full text-sm text-subtle">
                  {findPetNm(tab.petSn)}의 다른 줄과 합쳐 검진기록 1건으로
                  저장돼요
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
