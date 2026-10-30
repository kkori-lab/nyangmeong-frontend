import { useState } from 'react';
import AmountInput from '@/components/AmountInput';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Card from '@/components/Card';
import { showToast } from '@/components/toastStore';
import { useUpdateAdminSettings } from '../queries';
import { SETTING_GROUPS, toBody, toDraft } from '../shared/settingFields';

/**
 * [운영 설정 수정 폼]
 * - 묶음 5개 카드 + 되돌리기·저장: 바뀐 값이 있을 때만 켜짐
 * - 저장은 바뀐 항목만 전송, 서버 입력값 오류는 해당 항목 아래에 표시
 */

const inputClass =
  'block h-10 w-full rounded-md border bg-white px-3 hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none';

/** 숫자 외 글자와 앞자리 0 제거 */
const toDigits = (raw, maxDigits) =>
  raw
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, maxDigits);

/** 항목 하나의 입력칸 */
function SettingInput({ field, value, error, onChange }) {
  const borderClass = error ? 'border-danger' : 'border-input-line';
  const describedBy = error ? `${field.key}-error` : undefined;

  const handleTextChange = (event) => onChange(field.key, event.target.value);
  const handleDigitsChange = (event) =>
    onChange(field.key, toDigits(event.target.value, field.maxDigits));
  const handleAmountChange = (next) => onChange(field.key, next);

  if (field.kind === 'text') {
    return (
      <input
        id={field.key}
        type="text"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        value={value}
        onChange={handleTextChange}
        className={`${inputClass} ${borderClass}`}
      />
    );
  }

  if (field.kind === 'amount') {
    return (
      <AmountInput
        id={field.key}
        label="최저시급 금액"
        maxDigits={field.maxDigits}
        value={value}
        onChange={handleAmountChange}
        className="w-44"
      />
    );
  }

  /** 쉼표는 숫자 항목에만 */
  const display =
    field.kind === 'number' && value !== ''
      ? Number(value).toLocaleString('ko-KR')
      : value;

  return (
    <div className="relative w-44">
      <input
        id={field.key}
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        value={display}
        onChange={handleDigitsChange}
        className={`${inputClass} ${borderClass} pr-14 text-right`}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
        {field.unit}
      </span>
    </div>
  );
}

/** 라벨 + 입력칸 + 오류 문구 한 줄 */
function SettingRow({ row, draft, fieldErrors, onChange }) {
  const [firstField] = row.fields;

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-x-4 gap-y-1.5 max-[760px]:grid-cols-1">
      <label
        htmlFor={firstField.key}
        className="flex min-h-10 flex-col justify-center text-base font-semibold text-ink-2"
      >
        {row.label}
        {row.hint && (
          <small className="font-normal text-subtle">{row.hint}</small>
        )}
      </label>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          {row.fields.map((field) => (
            <div
              key={field.key}
              className={field.kind === 'text' ? 'w-full' : undefined}
            >
              <SettingInput
                field={field}
                value={draft[field.key]}
                error={fieldErrors[field.key]}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
        {row.fields.map(
          (field) =>
            fieldErrors[field.key] && (
              <p
                key={field.key}
                id={`${field.key}-error`}
                role="alert"
                className="mt-1.5 text-sm text-danger"
              >
                {fieldErrors[field.key]}
              </p>
            ),
        )}
      </div>
    </div>
  );
}

export default function SettingForm({ settings }) {
  const base = toDraft(settings);
  const [draft, setDraft] = useState(base);
  const save = useUpdateAdminSettings();

  const body = toBody(draft, base);
  const isDirty = Object.keys(body).length > 0;
  const fieldErrors = Object.fromEntries(
    (save.error?.fields ?? []).map((item) => [item.field, item.message]),
  );
  const formError =
    save.isError && !save.error.fields ? save.error.message : null;

  const handleChange = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    setDraft(base);
    save.reset();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isDirty) return;
    save.mutate(body, { onSuccess: () => showToast('저장했어요') });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {SETTING_GROUPS.map((group) => (
        <Card key={group.title} title={group.title}>
          <div className="space-y-5">
            {group.rows.map((row) => (
              <SettingRow
                key={row.label}
                row={row}
                draft={draft}
                fieldErrors={fieldErrors}
                onChange={handleChange}
              />
            ))}
          </div>
        </Card>
      ))}
      {/** 되돌리기 · 저장 */}
      <div className="flex items-center justify-end gap-2">
        {formError && (
          <p role="alert" className="mr-2 text-sm text-danger">
            {formError}
          </p>
        )}
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={!isDirty || save.isPending}
          onClick={handleReset}
        >
          되돌리기
        </button>
        <button
          type="submit"
          className={BTN_PRIMARY}
          disabled={!isDirty || save.isPending}
        >
          저장
        </button>
      </div>
    </form>
  );
}
