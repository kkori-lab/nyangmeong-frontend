import { X } from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Select from '@/components/Select';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/** 공통코드를 셀렉트 항목으로, 첫 항목은 전체 */
const toOptions = (codes = []) => [
  { value: '', label: '전체' },
  ...codes.map(({ comCd, comCdNm }) => ({ value: comCd, label: comCdNm })),
];

/**
 * [포인트 원장 필터]
 * - 회원 닉네임·거래 유형·기간, [조회]를 눌러야 적용
 * - ?mbrSn=으로 회원이 걸려 있으면 닉네임 칸 대신 그 회원 표시, [전체 회원]으로 풀기
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function PointLedgerFilter({
  filter,
  dealTypes,
  memberName,
  onSearch,
}) {
  const [draft, setDraft] = useState(filter);
  const [hasRangeError, setHasRangeError] = useState(false);

  /** 칸 하나 변경 */
  const setField = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: value }));
    setHasRangeError(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draft.fromDt && draft.toDt && draft.fromDt > draft.toDt) {
      setHasRangeError(true);
      return;
    }
    onSearch(draft);
  };

  const handleMemberClear = () => onSearch({ ...filter, mbrSn: '' });

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {filter.mbrSn ? (
          <div className="flex h-10 items-center gap-1 rounded-[6px] border border-line bg-surface-2 pr-1 pl-3 max-[760px]:w-full">
            <span className="min-w-0 truncate text-base leading-[1.3] text-ink">
              회원: {memberName ?? `#${filter.mbrSn}`}
            </span>
            <button
              type="button"
              className="ml-auto flex h-8 shrink-0 items-center gap-1 rounded-[6px] px-2 text-sm leading-[1.3] text-ink-2 hover:bg-surface-3"
              onClick={handleMemberClear}
            >
              <X size={16} aria-hidden="true" />
              전체 회원
            </button>
          </div>
        ) : (
          <input
            type="search"
            aria-label="회원 닉네임"
            placeholder="회원 닉네임"
            value={draft.mbrNcnm}
            className={`${INPUT_CLASS} min-[761px]:w-48`}
            onChange={(event) => setField('mbrNcnm', event.target.value)}
          />
        )}
        <Select
          label="거래 유형"
          placeholder="거래 유형: 전체"
          value={draft.pntDlngTypeCd}
          options={toOptions(dealTypes)}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('pntDlngTypeCd', value)}
        />
        <div className="flex items-center gap-2 max-[760px]:w-full">
          <input
            type="date"
            aria-label="기간 시작일"
            value={draft.fromDt}
            className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
            onChange={(event) => setField('fromDt', event.target.value)}
          />
          <span className="text-subtle">~</span>
          <input
            type="date"
            aria-label="기간 종료일"
            value={draft.toDt}
            className={`${INPUT_CLASS} tabular-nums min-[761px]:w-40`}
            onChange={(event) => setField('toDt', event.target.value)}
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
