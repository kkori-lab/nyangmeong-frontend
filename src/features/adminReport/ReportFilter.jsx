import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import {
  AUTO_BLIND_OPTIONS,
  REPORT_REASON_OPTIONS,
  TARGET_TYPE_OPTIONS,
} from './reportLabels';

/** 첫 항목 전체를 붙인 셀렉트 항목 */
const withAll = (options) => [{ value: '', label: '전체' }, ...options];

/**
 * [신고 필터]
 * - 사유·대상·자동 블라인드·접수일, [검색]을 눌러야 적용
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function ReportFilter({ filter, onSearch }) {
  const [draft, setDraft] = useState(filter);
  const [hasRangeError, setHasRangeError] = useState(false);

  /** 칸 하나 변경 */
  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setHasRangeError(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draft.bgngYmd && draft.endYmd && draft.bgngYmd > draft.endYmd) {
      setHasRangeError(true);
      return;
    }
    onSearch(draft);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          label="사유"
          placeholder="사유: 전체"
          value={draft.dclrRsnCd}
          options={withAll(REPORT_REASON_OPTIONS)}
          className="w-48 max-[760px]:w-full"
          onChange={(value) => setField('dclrRsnCd', value)}
        />
        <Select
          label="대상"
          placeholder="대상: 전체"
          value={draft.targetType}
          options={withAll(TARGET_TYPE_OPTIONS)}
          className="w-36 max-[760px]:w-full"
          onChange={(value) => setField('targetType', value)}
        />
        <Select
          label="자동 블라인드"
          placeholder="자동 블라인드: 전체"
          value={draft.autoBlindYn}
          options={withAll(AUTO_BLIND_OPTIONS)}
          className="w-48 max-[760px]:w-full"
          onChange={(value) => setField('autoBlindYn', value)}
        />
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <DatePicker
            label="접수일 시작일"
            value={draft.bgngYmd}
            onChange={(value) => setField('bgngYmd', value)}
            className="min-w-0 flex-1 min-[761px]:w-40"
          />
          <span className="text-subtle">~</span>
          <DatePicker
            label="접수일 종료일"
            value={draft.endYmd}
            onChange={(value) => setField('endYmd', value)}
            className="min-w-0 flex-1 min-[761px]:w-40"
          />
        </div>
        <button type="submit" className={`${BTN_PRIMARY} max-[760px]:w-full`}>
          검색
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
