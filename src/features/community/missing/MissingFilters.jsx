import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Select from '@/components/Select';
import {
  ALL_REGION,
  DONG_BY_REGION,
  hasDong,
  PERIOD_FILTERS,
  PET_FILTERS,
  REGION_OPTIONS,
} from '../missingCodes';

/**
 * 한 줄: 라벨 + 입력. 1280px 초과에서는 두 줄이 한 행에 나란히(라벨·입력 열을 가장 긴 라벨에 맞춘다),
 * 1280px 이하는 한 줄씩, 760px 이하는 라벨 위·입력 아래
 * - isWide: 1280px 초과에서도 한 행을 다 쓴다(실종 기간)
 * - index 1 이상은 위에 구분선, 1280px 초과의 첫 행 오른쪽 칸(index 1)만 선 없음
 */
function Row({ label, index, isWide = false, children }) {
  const border =
    index === 0
      ? ''
      : index === 1
        ? 'border-t border-line min-[1281px]:border-t-0'
        : 'border-t border-line';
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid min-w-0 grid-cols-1 items-center gap-2 py-3.5 min-[761px]:grid-cols-subgrid min-[761px]:gap-5 max-[1281px]:col-span-full ${isWide ? 'min-[1281px]:col-span-4' : 'min-[1281px]:col-span-2'} ${border}`}
    >
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <div className={`min-w-0 ${isWide ? 'min-[1281px]:col-span-3' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function Chips({ label, name, options, value, onChange, canClear = false }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex min-w-0 flex-wrap gap-1.5"
    >
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            onClick={() => {
              /** 이미 고른 칩을 다시 누르면 해제(전체) */
              if (canClear && option.value && value === option.value) {
                onChange('');
              }
            }}
            className="peer sr-only"
          />
          <span className="inline-flex h-9 cursor-pointer items-center rounded-full border border-input-line bg-white px-3.5 text-sm font-medium text-ink-2 peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:font-semibold peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30 hover:border-line-strong">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

const countActive = ({ region, pet, period }) =>
  Number(region !== ALL_REGION) + Number(pet !== '') + Number(period !== '');

/**
 * 빠른 필터: 지역(시·군·구 → 읍·면·동) · 반려동물 · 실종 기간. 바꾸면 바로 적용(AND)
 * - filters: { region, dong, pet, period }, onChange(바뀐 값만), onReset
 * - 760px 이하에서는 [상세 필터] 버튼으로 열고 닫음
 */
export default function MissingFilters({ filters, onChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const { region, dong, pet, period } = filters;
  const activeCount = countActive(filters);
  const dongOptions = [
    { value: '', label: '읍·면·동 전체' },
    ...(DONG_BY_REGION[region] ?? []).map((name) => ({
      value: name,
      label: name,
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="missing-filter"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-fit items-center gap-1.5 rounded-md border border-line bg-white px-4 font-semibold hover:border-line-strong hover:bg-surface-2 min-[761px]:hidden"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        상세 필터
        {activeCount > 0 && (
          <span
            aria-label={`적용된 필터 ${activeCount}개`}
            className="min-w-5 rounded-full bg-brand-500 px-1.5 text-xs leading-5 text-white"
          >
            {activeCount}
          </span>
        )}
      </button>
      <form
        id="missing-filter"
        aria-label="상세 필터"
        onSubmit={(event) => event.preventDefault()}
        className={`grid-cols-1 gap-x-8 rounded-[14px] border border-line bg-white px-6 py-2 max-[760px]:px-4 max-[760px]:py-1 min-[761px]:grid min-[761px]:grid-cols-[max-content_minmax(0,1fr)] min-[1281px]:grid-cols-[max-content_minmax(0,1fr)_max-content_minmax(0,1fr)] ${isOpen ? 'grid' : 'hidden'}`}
      >
        <Row label="실종 지역" index={0}>
          <div className="flex min-w-0 items-center gap-2">
            <Select
              label="시·군·구"
              value={region}
              options={REGION_OPTIONS}
              onChange={(next) => onChange({ region: next, dong: '' })}
              className="min-w-0 flex-[0_1_168px]"
            />
            {/* 전북 전체·전주시 전체는 읍·면·동을 고를 수 없다: fieldset disabled로 select를 함께 잠근다 */}
            <fieldset
              disabled={!hasDong(region)}
              className="m-0 min-w-[140px] flex-[0_1_200px] border-0 p-0 disabled:opacity-45"
            >
              <Select
                label="읍·면·동"
                value={dong}
                options={dongOptions}
                onChange={(next) => onChange({ dong: next })}
              />
            </fieldset>
          </div>
        </Row>
        <Row label="반려동물" index={1}>
          <Chips
            label="반려동물"
            name="pet"
            options={PET_FILTERS}
            value={pet}
            onChange={(next) => onChange({ pet: next })}
          />
        </Row>
        <Row label="실종 기간" index={2} isWide>
          <Chips
            label="실종 기간"
            name="period"
            options={PERIOD_FILTERS}
            canClear
            value={period}
            onChange={(next) => onChange({ period: next })}
          />
        </Row>
        <div className="col-span-full flex justify-end border-t border-line pt-1 pb-2.5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-muted hover:bg-surface-2"
          >
            <RotateCcw size={14} aria-hidden="true" />
            필터 초기화
          </button>
        </div>
      </form>
    </div>
  );
}
