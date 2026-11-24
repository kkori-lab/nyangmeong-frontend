import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import { API_TYPES } from './apiUsageLabels';
import { addDays } from '@/utils/formatDate';

/** 서버가 받는 최대 기간(끝 날짜 포함) */
const MAX_RANGE_DAYS = 92;

const RANGE_ERRORS = {
  reversed: '시작일은 종료일보다 늦을 수 없어요.',
  tooLong: `기간은 최대 ${MAX_RANGE_DAYS}일까지 조회할 수 있어요.`,
};

/** 기간 오류 종류(없으면 null) */
const getRangeError = ({ from, to }) => {
  if (!from || !to) return null;
  if (from > to) return 'reversed';
  if (addDays(from, MAX_RANGE_DAYS - 1) < to) return 'tooLong';
  return null;
};

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
 * - 시작일이 종료일보다 뒤거나 기간이 92일을 넘으면 요청 없이 안내
 */
export default function ApiUsageFilter({ filter, onSearch }) {
  const [draft, setDraft] = useState(filter);
  const [rangeError, setRangeError] = useState(null);

  /** 칸 하나 변경 */
  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setRangeError(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextError = getRangeError(draft);
    if (nextError) {
      setRangeError(nextError);
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
            value={draft.from}
            onChange={(value) => setField('from', value)}
            className="min-[760px]:w-40"
          />
          <span className="text-subtle">~</span>
          <DatePicker
            label="기간 종료일"
            value={draft.to}
            onChange={(value) => setField('to', value)}
            className="min-[760px]:w-40"
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
      {rangeError && (
        <p role="alert" className="text-sm text-danger">
          {RANGE_ERRORS[rangeError]}
        </p>
      )}
    </form>
  );
}
