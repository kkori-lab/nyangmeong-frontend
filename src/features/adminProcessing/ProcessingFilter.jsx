import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';

/** 공통코드를 셀렉트 항목으로, 첫 항목은 전체 */
const toOptions = (codes = []) => [
  { value: '', label: '전체' },
  ...codes.map(({ comCd, comCdNm }) => ({ value: comCd, label: comCdNm })),
];

/**
 * [처리 현황 필터]
 * - 기간 + selects(이름·라벨·코드 목록), [조회]를 눌러야 적용
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function ProcessingFilter({ filter, selects = [], onSearch }) {
  const [draft, setDraft] = useState(filter);
  const [hasRangeError, setHasRangeError] = useState(false);

  /** 칸 하나 변경 */
  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setHasRangeError(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draft.fromYmd && draft.toYmd && draft.fromYmd > draft.toYmd) {
      setHasRangeError(true);
      return;
    }
    onSearch(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <DatePicker
            label="기간 시작일"
            value={draft.fromYmd}
            onChange={(value) => setField('fromYmd', value)}
            className="min-[761px]:w-40"
          />
          <span className="text-subtle">~</span>
          <DatePicker
            label="기간 종료일"
            value={draft.toYmd}
            onChange={(value) => setField('toYmd', value)}
            className="min-[761px]:w-40"
          />
        </div>
        {selects.map(({ name, label, codes }) => (
          <Select
            key={name}
            label={label}
            placeholder={`${label}: 전체`}
            value={draft[name]}
            options={toOptions(codes)}
            className="w-40 max-[760px]:w-full"
            onChange={(value) => setField(name, value)}
          />
        ))}
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
