import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';
import { ALL_REGION, PET_FILTERS, SIZE_FILTERS } from '../careCodes';
import { useJeonbukRegions, useSubRegions } from '../missingQueries';
import {
  CheckOption,
  Chips,
  FilterActions,
  FilterField,
  FilterToggle,
} from '../ListFilterParts';

const countActive = ({ stts, mine, region, from, to, pet, size }) =>
  Number(stts === 'open') +
  Number(mine) +
  Number(region !== ALL_REGION) +
  Number(from !== '' || to !== '') +
  Number(pet !== '') +
  Number(size !== '');

/**
 * 필터: 돌봄 지역(시·군·구 → 읍·면·동) · 돌봄 날짜 · 반려동물 · 반려견 크기. 바꾸면 바로 적용(AND). 배경 없이 위 라벨 + 아래 입력
 * - 761px 이상은 2열(왼쪽 지역·반려동물, 오른쪽 날짜·크기), 760px 이하는 1열이고 [상세 필터]로 열고 닫음
 * - filters: { region, dong, from, to, pet, size }, onChange(바뀐 값만), onReset
 * - 고양이를 고르면 반려견 크기는 비활성(값은 비움)
 */
export default function CareFilters({ filters, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const { region, dong, from, to, pet, size } = filters;
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
  /** 760px 이하에서 닫혀 있으면 숨기는 칸 */
  const foldClass = isOpen ? '' : 'max-[760px]:hidden';

  return (
    <div
      id="care-filter"
      role="group"
      aria-label="필터"
      className="grid grid-cols-2 gap-x-9 gap-y-5 max-[760px]:grid-cols-1 max-[760px]:gap-y-4"
    >
      <FilterToggle
        controls="care-filter"
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        activeCount={countActive(filters)}
      />
      <FilterField label="돌봄 지역" className={foldClass}>
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
      <FilterField label="돌봄 날짜" className={foldClass}>
        <div className="flex min-w-0 items-center gap-2">
          <DatePicker
            label="시작 날짜"
            placeholder="돌봄 날짜"
            value={from}
            max={to || undefined}
            onChange={(value) => onChange({ from: value })}
            className="min-w-0 flex-1"
          />
          <span aria-hidden="true" className="shrink-0 text-subtle">
            ~
          </span>
          <DatePicker
            label="종료 날짜"
            placeholder="돌봄 날짜"
            value={to}
            min={from || undefined}
            onChange={(value) => onChange({ to: value })}
            className="min-w-0 flex-1"
          />
        </div>
      </FilterField>
      <FilterField label="반려동물" className={foldClass}>
        <Chips
          name="care-pet"
          label="반려동물"
          options={PET_FILTERS}
          value={pet}
          onChange={(next) =>
            onChange(next === 'cat' ? { pet: next, size: '' } : { pet: next })
          }
        />
      </FilterField>
      <FilterField label="반려견 크기" className={foldClass}>
        <fieldset disabled={pet === 'cat'} className="m-0 min-w-0 border-0 p-0">
          <Chips
            name="care-size"
            label="반려견 크기"
            options={SIZE_FILTERS}
            value={size}
            onChange={(next) => onChange({ size: next })}
          />
        </fieldset>
      </FilterField>
      <FilterActions onReset={onReset} className={foldClass}>
        <CheckOption
          checked={filters.stts === 'open'}
          onChange={(checked) => onChange({ stts: checked ? 'open' : '' })}
        >
          모집중만 보기
        </CheckOption>
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
