import { BTN_SECONDARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import { formatYm } from '@/utils/yearMonth';
import { RANGE_MODE } from '../shared/expenseCodes';

/** 편집 모드 삭제 범위 */
export default function ExpenseRangeSelect({
  baseYm,
  range,
  months,
  onChange,
  onCancel,
}) {
  const modeOptions = [
    { value: RANGE_MODE.MONTH, label: formatYm(baseYm) },
    { value: RANGE_MODE.PERIOD, label: '기간 지정' },
    { value: RANGE_MODE.ALL, label: '전체 기간' },
  ];
  const monthOptions = months.map((ym) => ({ value: ym, label: formatYm(ym) }));

  const handleChangeMode = (mode) =>
    onChange({ mode, fromYm: baseYm, toYm: baseYm });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-brand-100 bg-brand-50 px-4 py-3">
      <b className="text-brand-600">편집 중</b>
      <span className="text-muted">범위</span>
      <Select
        label="삭제 범위"
        value={range.mode}
        options={modeOptions}
        onChange={handleChangeMode}
        className="w-44"
      />
      {range.mode === RANGE_MODE.PERIOD && (
        <div className="flex items-center gap-2">
          <Select
            label="시작 월"
            value={range.fromYm}
            options={monthOptions}
            onChange={(fromYm) => onChange({ ...range, fromYm })}
            className="w-40"
          />
          <span className="text-subtle">~</span>
          <Select
            label="종료 월"
            value={range.toYm}
            options={monthOptions}
            onChange={(toYm) => onChange({ ...range, toYm })}
            className="w-40"
          />
        </div>
      )}
      <button
        type="button"
        onClick={onCancel}
        className={`${BTN_SECONDARY} ml-auto`}
      >
        나가기
      </button>
    </div>
  );
}
