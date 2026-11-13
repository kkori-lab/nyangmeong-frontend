import { useState } from 'react';
import Select from '@/components/Select';
import SearchInput from '@/components/SearchInput';
import { ALL_REGION, PERIOD_FILTERS, PET_FILTERS } from '../missingCodes';
import { useJeonbukRegions, useSubRegions } from '../missingQueries';
import {
  CheckOption,
  Chips,
  FilterActions,
  FilterField,
  FilterToggle,
} from '../ListFilterParts';

const countActive = ({ mine, region, pet, period, keyword }) =>
  Number(mine) +
  Number(region !== ALL_REGION) +
  Number(pet !== '') +
  Number(period !== '') +
  Number(keyword !== '');

/**
 * 필터: 검색 · 실종일 · 실종 지역(시·군·구 → 읍·면·동) · 반려동물. 바꾸면 바로 적용(AND). 배경 없이 위 라벨 + 아래 입력
 * - 761px 이상은 2열(왼쪽 검색·지역, 오른쪽 실종일·반려동물), 760px 이하는 1열. 검색은 항상 보이고 나머지는 [상세 필터]로 열고 닫음
 * - filters: { region, dong, pet, period, keyword }, onChange(바뀐 값만), onReset
 * - search: { value, onChange, onSubmit } 검색창 입력값은 부모가 보관
 * - 지역은 서버 지역 목록. region·dong은 지역 번호(rgnSn) 문자열
 */
export default function MissingFilters({ filters, search, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const { region, dong, pet, period } = filters;
  const { data: sggs = [] } = useJeonbukRegions();
  const { data: dongs = [] } = useSubRegions(region);
  const regionOptions = [
    { value: ALL_REGION, label: '전북 전체' },
    ...sggs.map((row) => ({ value: String(row.rgnSn), label: row.sggNm })),
  ];
  const dongOptions = [
    { value: '', label: '읍·면·동 전체' },
    ...dongs.map((row) => ({ value: String(row.rgnSn), label: row.emdNm })),
  ];
  /** 760px 이하에서 닫혀 있으면 숨기는 칸(검색은 항상 보임) */
  const foldClass = isOpen ? '' : 'max-[760px]:hidden';

  return (
    <div
      id="missing-filter"
      role="group"
      aria-label="필터"
      className="grid grid-cols-2 gap-x-9 gap-y-5 max-[760px]:grid-cols-1 max-[760px]:gap-y-4"
    >
      <FilterField label="검색">
        <SearchInput
          value={search.value}
          onChange={search.onChange}
          onSubmit={search.onSubmit}
          placeholder="지역, 품종, 특징으로 검색"
        />
      </FilterField>
      <FilterToggle
        controls="missing-filter"
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        activeCount={countActive(filters)}
      />
      <FilterField label="실종일" className={foldClass}>
        <Select
          label="실종일"
          placeholder="실종일"
          value={period}
          options={PERIOD_FILTERS}
          onChange={(next) => onChange({ period: next })}
        />
      </FilterField>
      <FilterField label="실종 지역" className={foldClass}>
        <div className="flex min-w-0 items-center gap-2">
          <Select
            label="시·군·구"
            value={region}
            options={regionOptions}
            onChange={(next) => onChange({ region: next, dong: '' })}
            className="min-w-0 flex-1"
          />
          {/* 전북 전체이거나 하위 읍·면·동이 없으면 고를 수 없다: fieldset disabled로 select를 함께 잠근다 */}
          <fieldset
            disabled={dongs.length === 0}
            className="m-0 min-w-0 flex-1 border-0 p-0 disabled:opacity-45"
          >
            <Select
              label="읍·면·동"
              value={dong}
              options={dongOptions}
              onChange={(next) => onChange({ dong: next })}
            />
          </fieldset>
        </div>
      </FilterField>
      <FilterField label="반려동물" className={foldClass}>
        <Chips
          label="반려동물"
          name="pet"
          options={PET_FILTERS}
          value={pet}
          onChange={(next) => onChange({ pet: next })}
        />
      </FilterField>
      <FilterActions onReset={onReset} className={foldClass}>
        <CheckOption
          checked={filters.mine}
          onChange={(checked) => onChange({ mine: checked })}
        >
          내 글만 보기
        </CheckOption>
      </FilterActions>
    </div>
  );
}
