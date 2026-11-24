import FieldError, { Required } from '@/components/FieldError';
import { INPUT, LABEL } from '@/components/formStyles';
import { LAB_NUMBER_MAX_LENGTH } from '../numberFormat';
import FieldFoot from '@/components/FieldFoot';
import ItemSelect, { DIRECT } from './ItemSelect';

const MAX_DIRECT_LENGTH = 40;
const MAX_UNIT_LENGTH = 20;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <Required />;

/**
 * [검사 종류 · 검사 항목 입력칸] (FN-HLT-007-01·02)
 * - 검사 종류는 "혈액검사" 고정, 수정 진입(isEdit)이면 검사 항목도 변경 불가
 * - errors: 보여 줄 오류 문구. { item, val, unit, range }
 */
export default function LabItemForm({ form, errors, isEdit, onChange }) {
  const isDirect = form.item === DIRECT;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lab-kind" className={LABEL}>
          검사 종류
        </label>
        <div className="relative">
          <input
            id="lab-kind"
            value="혈액검사"
            readOnly
            className={`${INPUT} bg-surface-2! pr-11 text-subtle!`}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
            고정
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="lab-item-label" className={LABEL}>
          검사 항목{REQUIRED}
        </span>
        <ItemSelect
          value={form.item}
          disabled={isEdit}
          labelId="lab-item-label"
          isInvalid={Boolean(errors.item)}
          onChange={(value) => onChange('item', value)}
        />
        {isDirect && (
          <input
            value={form.directNm}
            maxLength={MAX_DIRECT_LENGTH}
            disabled={isEdit}
            placeholder="검사 항목 직접 입력"
            aria-label="검사 항목 직접 입력"
            aria-invalid={Boolean(errors.item)}
            className={INPUT}
            onChange={(event) => onChange('directNm', event.target.value)}
          />
        )}
        {isDirect && !isEdit && (
          <FieldFoot value={form.directNm} max={MAX_DIRECT_LENGTH} />
        )}
        <p className="text-sm/[1.5] text-muted">
          {isEdit
            ? '수정할 때는 검사 항목을 바꿀 수 없어요'
            : '혈구·신장·간·당 4묶음 중 고르거나, 목록에 없으면 직접입력을 골라요'}
        </p>
        {errors.item && <FieldError>{errors.item}</FieldError>}
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-[760px]:grid-cols-1">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>검사 결과값{REQUIRED}</span>
          <input
            value={form.val}
            inputMode="decimal"
            maxLength={LAB_NUMBER_MAX_LENGTH}
            aria-invalid={Boolean(errors.val)}
            className={INPUT}
            onChange={(event) => onChange('val', event.target.value)}
          />
          {errors.val && <FieldError>{errors.val}</FieldError>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>단위{REQUIRED}</span>
          <input
            value={form.unit}
            maxLength={MAX_UNIT_LENGTH}
            aria-invalid={Boolean(errors.unit)}
            className={INPUT}
            onChange={(event) => onChange('unit', event.target.value)}
          />
          <FieldFoot
            value={form.unit}
            max={MAX_UNIT_LENGTH}
            error={errors.unit}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-[760px]:grid-cols-1">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL}>참고범위 최소값</span>
            <input
              value={form.rangeMin}
              inputMode="decimal"
              maxLength={LAB_NUMBER_MAX_LENGTH}
              aria-invalid={Boolean(errors.range)}
              className={INPUT}
              onChange={(event) => onChange('rangeMin', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL}>참고범위 최대값</span>
            <input
              value={form.rangeMax}
              inputMode="decimal"
              maxLength={LAB_NUMBER_MAX_LENGTH}
              aria-invalid={Boolean(errors.range)}
              className={INPUT}
              onChange={(event) => onChange('rangeMax', event.target.value)}
            />
          </label>
        </div>
        {errors.range && <FieldError>{errors.range}</FieldError>}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>메모</span>
        <input
          value={form.memo}
          maxLength={MAX_MEMO_LENGTH}
          className={INPUT}
          onChange={(event) => onChange('memo', event.target.value)}
        />
        <FieldFoot value={form.memo} max={MAX_MEMO_LENGTH} />
      </label>
    </div>
  );
}
