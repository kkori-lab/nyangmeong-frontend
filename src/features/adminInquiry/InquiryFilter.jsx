import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import { INQUIRY_CATEGORY_OPTIONS } from './inquiryLabels';
import { useAdminInquiryTypes } from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 첫 항목 전체를 붙인 셀렉트 항목 */
const withAll = (options) => [{ value: '', label: '전체' }, ...options];

/**
 * [1:1 문의 필터]
 * - 유형·내부 분류·접수일·삭제됨 포함, [검색]을 눌러야 적용
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function InquiryFilter({ filter, onSearch }) {
  const [draft, setDraft] = useState(filter);
  const [hasRangeError, setHasRangeError] = useState(false);
  const types = useAdminInquiryTypes();

  const typeOptions = (types.data ?? []).map(({ comCd, comCdNm }) => ({
    value: comCd,
    label: comCdNm,
  }));

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
          label="유형"
          placeholder="유형: 전체"
          value={draft.inqryTypeCd}
          options={withAll(typeOptions)}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('inqryTypeCd', value)}
        />
        <Select
          label="내부 분류"
          placeholder="내부 분류: 전체"
          value={draft.inqryCtgr}
          options={withAll(INQUIRY_CATEGORY_OPTIONS)}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('inqryCtgr', value)}
        />
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <input
            type="date"
            aria-label="접수일 시작일"
            value={draft.bgngYmd}
            className={`${INPUT_CLASS} tabular-nums min-w-0 flex-1 min-[761px]:w-40`}
            onChange={(event) => setField('bgngYmd', event.target.value)}
          />
          <span className="text-subtle">~</span>
          <input
            type="date"
            aria-label="접수일 종료일"
            value={draft.endYmd}
            className={`${INPUT_CLASS} tabular-nums min-w-0 flex-1 min-[761px]:w-40`}
            onChange={(event) => setField('endYmd', event.target.value)}
          />
        </div>
        <label className="inline-flex h-10 items-center gap-1.5 text-base text-ink">
          <input
            type="checkbox"
            className="size-4 accent-brand-500"
            checked={draft.inclDelYn === 'true'}
            onChange={(event) =>
              setField('inclDelYn', event.target.checked ? 'true' : '')
            }
          />
          삭제됨 포함
        </label>
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
