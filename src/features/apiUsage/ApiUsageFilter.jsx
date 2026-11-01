import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import { API_TYPES } from './apiUsageLabels';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

const TYPE_OPTIONS = [
  { value: '', label: '전체' },
  ...API_TYPES.map(({ extlApiSeCd, extlApiSeNm }) => ({
    value: extlApiSeCd,
    label: extlApiSeNm,
  })),
];

/**
 * [외부 API 사용량 필터]
 * - 기간·종류, [조회]를 눌러야 적용
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function ApiUsageFilter({ filter, onSearch }) {
  const [draft, setDraft] = useState(filter);
  const [hasRangeError, setHasRangeError] = useState(false);

  /** 칸 하나 변경 */
  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setHasRangeError(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) {
      setHasRangeError(true);
      return;
    }
    onSearch(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <input
            type="date"
            aria-label="기간 시작일"
            value={draft.from}
            className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
            onChange={(event) => setField('from', event.target.value)}
          />
          <span className="text-subtle">~</span>
          <input
            type="date"
            aria-label="기간 종료일"
            value={draft.to}
            className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
            onChange={(event) => setField('to', event.target.value)}
          />
        </div>
        <Select
          label="종류"
          placeholder="종류: 전체"
          value={draft.type}
          options={TYPE_OPTIONS}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('type', value)}
        />
        <button type="submit" className={`${BTN_PRIMARY} max-[760px]:w-full`}>
          조회
        </button>
      </div>
      {hasRangeError && (
        <p role="alert" className="text-sm text-danger">
          시작일은 종료일보다 늦을 수 없어요.
        </p>
      )}
    </form>
  );
}
