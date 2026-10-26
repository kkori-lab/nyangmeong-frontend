import { useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { getNowHm, getTodayYmd } from '@/utils/formatDate';
import {
  NORMAL_STOOL,
  RECORD_TYPES,
  STOOL,
  STOOL_STATES,
  findRecordType,
} from '../diaryTypes';
import { useCreateDailyRecord } from '../queries';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
} from './formStyles';

/**
 * [오늘 기록하기]
 * - 기록 종류를 고르고 시간·값을 입력해 오늘 기록으로 등록 (FN-HLT-002-11)
 * - 열릴 때 이 영역으로 스크롤하고 첫 입력칸에 포커스
 * - 카드(컨테이너) 폭이 넓으면 종류·시간·값·등록하기를 한 줄에, 좁으면 종류 / 나머지 두 줄로 놓는다
 *   더 좁으면(모바일) 종류 버튼이 줄 전체를 나눠 채우고, 둘째 줄은 칸이 모자라면 줄바꿈된다
 * - [신규 정책] 마지막 입력칸에서 Enter를 누르면 등록하기와 같이 등록하고, 등록이 끝나면 값을 비우고
 *   시간을 현재 시각으로 다시 채우고 마지막 입력칸에 커서를 둔다 (화면설계서에 없는 동작)
 */
export default function TodayRecordForm({ petSn, initialTypeCd }) {
  const formRef = useRef(null);
  const timeRef = useRef(null);
  const valueRef = useRef(null);
  const stoolRef = useRef(null);
  const [typeCd, setTypeCd] = useState(initialTypeCd);
  const [rcdTm, setRcdTm] = useState(getNowHm);
  const [value, setValue] = useState('');
  const [stlSttsCd, setStlSttsCd] = useState(NORMAL_STOOL);
  const createRecord = useCreateDailyRecord();

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    timeRef.current.focus({ preventScroll: true });
  }, []);

  const type = findRecordType(typeCd);
  const isStool = typeCd === STOOL;
  const canSubmit =
    rcdTm !== '' && (isStool || (value !== '' && Number(value) > 0));

  const handleTypeChange = (nextTypeCd) => {
    setTypeCd(nextTypeCd);
    setValue('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || createRecord.isPending) return;
    createRecord.mutate(
      {
        petSn,
        rcdTypeCd: typeCd,
        rcdYmd: getTodayYmd(),
        rcdTm,
        rcdVal: value,
        stlSttsCd,
      },
      {
        onSuccess: () => {
          // [신규 정책] 연속 입력: 값 비우기·시간 현재 시각·마지막 입력칸 포커스
          setValue('');
          setRcdTm(getNowHm());
          (isStool ? stoolRef : valueRef).current?.focus();
        },
      },
    );
  };

  return (
    <form
      ref={formRef}
      id="hlt002-record-form"
      className="rounded-[14px] border border-line bg-white px-6 py-5 shadow-[0_1px_2px_rgba(26,50,52,0.04)]"
      onSubmit={handleSubmit}
    >
      <h3 className="text-lg/[1.6] font-semibold text-ink">오늘 기록하기</h3>
      <p className="mt-1 text-subtle">
        기록 종류를 선택하고 내용을 입력해주세요
      </p>

      <div className="@container mt-3">
        <div className="flex flex-col gap-4 @4xl:flex-row @4xl:items-end">
          <div className="flex flex-col gap-1.5 @4xl:shrink-0">
            <span className={LABEL_CLASS}>종류</span>
            <div
              role="radiogroup"
              aria-label="기록 종류"
              className="flex h-10 w-full rounded-[6px] border border-[#e6eaeb] bg-[#f1f3f4] p-[3px] @lg:w-auto @lg:self-start"
            >
              {RECORD_TYPES.map((item) => {
                const isSelected = item.cd === typeCd;
                return (
                  <button
                    key={item.cd}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`flex flex-1 items-center justify-center rounded-[4px] whitespace-nowrap @lg:flex-none @lg:px-3 ${
                      isSelected
                        ? 'bg-white font-semibold text-brand-600 shadow-[0_1px_2px_rgba(26,50,52,0.08),0_0_0_1px_rgba(40,90,92,0.18)]'
                        : 'font-medium text-muted hover:text-ink'
                    }`}
                    onClick={() => handleTypeChange(item.cd)}
                  >
                    {item.nm}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 @4xl:min-w-0 @4xl:flex-1 @4xl:flex-nowrap">
            <label className="flex min-w-40 flex-1 flex-col gap-1.5">
              <span className={LABEL_CLASS}>시간</span>
              <input
                ref={timeRef}
                type="time"
                value={rcdTm}
                className={`${INPUT_CLASS} tabular-nums`}
                onChange={(event) => setRcdTm(event.target.value)}
              />
            </label>
            {isStool ? (
              <label className="flex min-w-40 flex-1 flex-col gap-1.5">
                <span className={LABEL_CLASS}>{type.valueLabel}</span>
                <select
                  ref={stoolRef}
                  value={stlSttsCd}
                  className={SELECT_CLASS}
                  style={SELECT_ARROW_STYLE}
                  onChange={(event) => setStlSttsCd(event.target.value)}
                >
                  {STOOL_STATES.map((state) => (
                    <option key={state.cd} value={state.cd}>
                      {state.nm}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="flex min-w-40 flex-1 flex-col gap-1.5">
                <span className={LABEL_CLASS}>{type.valueLabel}</span>
                <span className="relative block">
                  <input
                    ref={valueRef}
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={value}
                    className={`${INPUT_CLASS} pr-12 text-right tabular-nums`}
                    onChange={(event) => setValue(event.target.value)}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">
                    {type.unit}
                  </span>
                </span>
              </label>
            )}
            <button
              type="submit"
              disabled={!canSubmit || createRecord.isPending}
              className={`${BTN_PRIMARY} ml-auto min-w-24 @4xl:ml-0 @4xl:shrink-0`}
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
