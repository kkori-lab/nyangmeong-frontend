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
 * [발송 이력 필터]
 * - 기간·채널·유형·결과, [조회]를 눌러야 적용
 * - 시작일이 종료일보다 뒤면 요청 없이 안내
 */
export default function NotificationLogFilter({
  filter,
  channels,
  types,
  results,
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
    if (draft.bgngYmd && draft.endYmd && draft.bgngYmd > draft.endYmd) {
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
            value={draft.bgngYmd}
            onChange={(value) => setField('bgngYmd', value)}
            className="min-[761px]:w-40"
          />
          <span className="text-subtle">~</span>
          <DatePicker
            label="기간 종료일"
            value={draft.endYmd}
            onChange={(value) => setField('endYmd', value)}
            className="min-[761px]:w-40"
          />
        </div>
        <Select
          label="채널"
          placeholder="채널: 전체"
          value={draft.notiChnlCd}
          options={toOptions(channels)}
          className="w-36 max-[760px]:w-full"
          onChange={(value) => setField('notiChnlCd', value)}
        />
        <Select
          label="유형"
          placeholder="유형: 전체"
          value={draft.notiTypeCd}
          options={toOptions(types)}
          className="w-44 max-[760px]:w-full"
          onChange={(value) => setField('notiTypeCd', value)}
        />
        <Select
          label="결과"
          placeholder="결과: 전체"
          value={draft.sndngRsltCd}
          options={toOptions(results)}
          className="w-36 max-[760px]:w-full"
          onChange={(value) => setField('sndngRsltCd', value)}
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
