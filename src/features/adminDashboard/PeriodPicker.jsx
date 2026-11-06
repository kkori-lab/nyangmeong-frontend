import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import {
  getRangeError,
  PERIOD_CUSTOM,
  PERIOD_OPTIONS,
} from './dashboardPeriod';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/**
 * [통계 기간 선택]
 * - 최근 7일·30일은 누르면 바로 적용, 직접 입력은 [조회]를 눌러야 적용
 * - period: { periodKey, fromYmd, toYmd }, onChange(next)
 */
export default function PeriodPicker({ period, onChange }) {
  const [isCustomOpen, setIsCustomOpen] = useState(
    period.periodKey === PERIOD_CUSTOM,
  );
  const [draft, setDraft] = useState({
    fromYmd: period.fromYmd,
    toYmd: period.toYmd,
  });
  const [rangeError, setRangeError] = useState(null);

  const selectedKey = isCustomOpen ? PERIOD_CUSTOM : period.periodKey;

  const handleSelect = (key) => {
    setRangeError(null);
    if (key === PERIOD_CUSTOM) {
      setDraft({ fromYmd: period.fromYmd, toYmd: period.toYmd });
      setIsCustomOpen(true);
      return;
    }
    setIsCustomOpen(false);
    onChange({ periodKey: key });
  };

  /** 날짜 칸 하나 변경 */
  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setRangeError(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const error = getRangeError(draft.fromYmd, draft.toYmd);
    if (error) {
      setRangeError(error);
      return;
    }
    onChange({ periodKey: PERIOD_CUSTOM, ...draft });
  };

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="통계 기간"
        className="inline-flex rounded-md border border-line bg-white p-0.5"
      >
        {PERIOD_OPTIONS.map(({ key, label }) => {
          const isSelected = key === selectedKey;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              className={`h-9 rounded-[5px] px-3 text-sm whitespace-nowrap ${
                isSelected
                  ? 'bg-brand-900 font-bold text-white'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => handleSelect(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
      {isCustomOpen && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="flex items-center gap-2 max-[760px]:w-full">
            <input
              type="date"
              aria-label="통계 시작일"
              value={draft.fromYmd}
              className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
              onChange={(event) => setField('fromYmd', event.target.value)}
            />
            <span className="text-subtle">~</span>
            <input
              type="date"
              aria-label="통계 종료일"
              value={draft.toYmd}
              className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
              onChange={(event) => setField('toYmd', event.target.value)}
            />
          </div>
          <button type="submit" className={`${BTN_PRIMARY} max-[760px]:w-full`}>
            조회
          </button>
          {rangeError && (
            <p role="alert" className="w-full text-sm text-danger">
              {rangeError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
