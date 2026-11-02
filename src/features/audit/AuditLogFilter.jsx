import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import { TARGET_OPTIONS } from './auditLabels';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 첫 항목 전체를 붙인 셀렉트 항목 */
const withAll = (options) => [{ value: '', label: '전체' }, ...options];

/**
 * [감사 로그 필터]
 * - 관리자·작업 유형·대상·기간, [조회]를 눌러야 적용
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function AuditLogFilter({
  filter,
  admins = [],
  taskTypes = [],
  onSearch,
}) {
  const [draft, setDraft] = useState(filter);
  const [hasRangeError, setHasRangeError] = useState(false);

  const adminOptions = withAll(
    admins.map(({ mbrSn, mbrNcnm }) => ({
      value: String(mbrSn),
      label: mbrNcnm,
    })),
  );
  const taskTypeOptions = withAll(
    taskTypes.map(({ comCd, comCdNm }) => ({ value: comCd, label: comCdNm })),
  );

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
          label="관리자"
          placeholder="관리자: 전체"
          value={draft.mbrSn}
          options={adminOptions}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('mbrSn', value)}
        />
        <Select
          label="작업 유형"
          placeholder="작업 유형: 전체"
          value={draft.taskTypeCd}
          options={taskTypeOptions}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('taskTypeCd', value)}
        />
        <Select
          label="대상"
          placeholder="대상: 전체"
          value={draft.trgtTblNm}
          options={withAll(TARGET_OPTIONS)}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('trgtTblNm', value)}
        />
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <input
            type="date"
            aria-label="기간 시작일"
            value={draft.bgngYmd}
            className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
            onChange={(event) => setField('bgngYmd', event.target.value)}
          />
          <span className="text-subtle">~</span>
          <input
            type="date"
            aria-label="기간 종료일"
            value={draft.endYmd}
            className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
            onChange={(event) => setField('endYmd', event.target.value)}
          />
        </div>
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
