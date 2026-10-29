import FieldError from '../diary/FieldError';
import { INPUT_CLASS, LABEL_CLASS } from '../diary/formStyles';
import ItemSelect, { DIRECT } from './ItemSelect';

const MAX_DIRECT_LENGTH = 40;
const MAX_UNIT_LENGTH = 20;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <span className="ml-0.5 font-bold text-danger">*</span>;
const OPTIONAL = (
  <span className="ml-1 text-[13px] font-medium text-subtle">선택</span>
);

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
        <label htmlFor="lab-kind" className={LABEL_CLASS}>
          검사 종류
        </label>
        <div className="relative">
          <input
            id="lab-kind"
            value="혈액검사"
            readOnly
            className={`${INPUT_CLASS} bg-[#f4f6f6]! pr-11 text-[#667374]!`}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#667374]">
            고정
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="lab-item-label" className={LABEL_CLASS}>
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
            className={INPUT_CLASS}
            onChange={(event) => onChange('directNm', event.target.value)}
          />
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
          <span className={LABEL_CLASS}>검사 결과값{REQUIRED}</span>
          <input
            value={form.val}
            inputMode="decimal"
            aria-invalid={Boolean(errors.val)}
            className={INPUT_CLASS}
            onChange={(event) => onChange('val', event.target.value)}
          />
          {errors.val && <FieldError>{errors.val}</FieldError>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>단위{REQUIRED}</span>
          <input
            value={form.unit}
            maxLength={MAX_UNIT_LENGTH}
            aria-invalid={Boolean(errors.unit)}
            className={INPUT_CLASS}
            onChange={(event) => onChange('unit', event.target.value)}
          />
          {errors.unit && <FieldError>{errors.unit}</FieldError>}
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-[760px]:grid-cols-1">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>참고범위 최소값{OPTIONAL}</span>
            <input
              value={form.rangeMin}
              inputMode="decimal"
              aria-invalid={Boolean(errors.range)}
              className={INPUT_CLASS}
              onChange={(event) => onChange('rangeMin', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>참고범위 최대값{OPTIONAL}</span>
            <input
              value={form.rangeMax}
              inputMode="decimal"
              aria-invalid={Boolean(errors.range)}
              className={INPUT_CLASS}
              onChange={(event) => onChange('rangeMax', event.target.value)}
            />
          </label>
        </div>
        {errors.range && <FieldError>{errors.range}</FieldError>}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>메모{OPTIONAL}</span>
        <input
          value={form.memo}
          maxLength={MAX_MEMO_LENGTH}
          className={INPUT_CLASS}
          onChange={(event) => onChange('memo', event.target.value)}
        />
      </label>
    </div>
  );
}
