import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { getNowHm, getTodayYmd, makeDateTime } from '@/utils/formatDate';
import { DAILY_ITEMS, keepWidgetOrder } from '../dashboard/widgetItems';
import {
  NORMAL_STOOL,
  RECORD_TYPES,
  STOOL,
  STOOL_STATES,
  findRecordType,
} from '../diaryTypes';
import { useCreateDailyRecord, useSaveHealthWidgets } from '../queries';
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
 * - 카드(컨테이너) 폭이 넓으면 종류·시간·값·등록하기를 한 줄에, 좁으면 종류 / 나머지 두 줄로 배치
 *   더 좁으면(모바일) 종류 버튼이 줄 전체를 나눠 채우고, 둘째 줄은 칸이 모자라면 줄바꿈
 * - [신규 정책] 마지막 입력칸에서 Enter를 누르면 등록하기와 같이 등록하고, 등록이 끝나면 값을 비우고
 *   시간을 현재 시각으로 다시 채우고 마지막 입력칸에 커서를 둔다 (화면설계서에 없는 동작)
 * - 대시보드에서 고른 매일 기록만 종류로 보임 (※신규 정책, D11). widgetIds가 null(고른 적 없음)이면 5종 모두, [항목 편집] 없음
 * - [항목 편집]: 종류 줄 아래에 매일 기록 5개 칩을 펼침. 칩을 누를 때마다 켜고 끄며 바로 저장(대시보드 기록 항목과 같은 저장소).
 *   마지막으로 켜 둔 하나는 끌 수 없음. [완료]로 접음 (※신규 정책, 2026-11-08)
 */
export default function TodayRecordForm({
  petSn,
  initialTypeCd,
  mbrSn,
  widgetIds,
}) {
  const formRef = useRef(null);
  const timeRef = useRef(null);
  const valueRef = useRef(null);
  const stoolRef = useRef(null);
  const [pickedTypeCd, setTypeCd] = useState(initialTypeCd);
  const [rcdTm, setRcdTm] = useState(getNowHm);
  const [value, setValue] = useState('');
  const [crsdSttsCd, setCrsdSttsCd] = useState(NORMAL_STOOL);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const createRecord = useCreateDailyRecord();
  const saveWidgets = useSaveHealthWidgets();

  const isFiltered = widgetIds != null;
  const shownTypeCds = isFiltered
    ? DAILY_ITEMS.filter((item) => widgetIds.includes(item.id)).map(
        (item) => item.typeCd,
      )
    : RECORD_TYPES.map((item) => item.cd);
  const recordTypes = RECORD_TYPES.filter((item) =>
    shownTypeCds.includes(item.cd),
  );
  const typeCd = shownTypeCds.includes(pickedTypeCd)
    ? pickedTypeCd
    : (recordTypes[0]?.cd ?? null);

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    timeRef.current?.focus({ preventScroll: true });
  }, []);

  /** 켠 매일 기록 수: 마지막 하나는 끌 수 없음 */
  const onCount = isFiltered
    ? DAILY_ITEMS.filter((item) => widgetIds.includes(item.id)).length
    : 0;

  /** 매일 기록 켜고 끄기: 대시보드 카드도 같이 생기거나 빠짐. 켠 종류는 바로 고름 */
  const handleToggle = (item) => {
    const isOn = widgetIds.includes(item.id);
    if (isOn && onCount <= 1) return;
    const nextIds = isOn
      ? widgetIds.filter((id) => id !== item.id)
      : [...widgetIds, item.id];
    saveWidgets.mutate(
      { mbrSn, widgetIds: keepWidgetOrder(nextIds) },
      {
        onSuccess: () => {
          if (isOn) return;
          setTypeCd(item.typeCd);
          setValue('');
        },
      },
    );
  };
  const type = typeCd ? findRecordType(typeCd) : null;
  const isStool = typeCd === STOOL;
  const canSubmit =
    type != null &&
    rcdTm !== '' &&
    (isStool || (value !== '' && Number(value) > 0));

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
        body: {
          dailyRcdIdctCd: typeCd,
          rcdDt: makeDateTime(getTodayYmd(), rcdTm),
          ...(isStool ? { crsdSttsCd } : { rcdNvl: Number(value) }),
        },
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
        <div className="flex flex-col gap-4 @4xl:flex-row @4xl:flex-wrap @4xl:items-end">
          <div className="relative flex flex-col gap-1.5 @4xl:shrink-0">
            <span className={LABEL_CLASS}>종류</span>
            <div className="flex flex-wrap items-center gap-2">
              {recordTypes.length > 0 && (
                <div
                  role="radiogroup"
                  aria-label="기록 종류"
                  className="flex h-10 w-full rounded-[6px] border border-[#e6eaeb] bg-[#f1f3f4] p-[3px] @lg:w-auto @lg:self-start"
                >
                  {recordTypes.map((item) => {
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
              )}
              {isFiltered && (
                <button
                  type="button"
                  aria-expanded={isEditOpen}
                  aria-controls="hlt002-record-edit"
                  className={`inline-flex h-10 items-center gap-1 rounded-full border px-3.5 whitespace-nowrap ${
                    isEditOpen
                      ? 'border-brand-500 bg-brand-500 font-semibold text-white'
                      : 'border-line-strong bg-white text-ink-2 hover:border-brand-500 hover:text-brand-600'
                  }`}
                  onClick={() => setIsEditOpen((isOpen) => !isOpen)}
                >
                  <Icon name="tune" className="text-lg" />
                  항목 편집
                </button>
              )}
            </div>
          </div>

          {/** 종류 줄 바로 아래 줄. 넓은 칸(한 줄 배치)에서는 맨 뒤로 보내 종류·입력 줄 아래 전체 폭 */}
          {isFiltered && isEditOpen && (
            <div
              id="hlt002-record-edit"
              className="flex flex-col gap-2 border-l-2 border-brand-100 pl-3 @4xl:order-last @4xl:basis-full"
            >
              <div
                role="group"
                aria-label="오늘 기록하기 항목"
                className="flex flex-wrap items-center gap-2"
              >
                {DAILY_ITEMS.map((item) => {
                  const isOn = widgetIds.includes(item.id);
                  const isLastOn = isOn && onCount <= 1;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isOn}
                      disabled={saveWidgets.isPending || isLastOn}
                      className={`inline-flex h-9 items-center gap-1 rounded-full border px-3.5 whitespace-nowrap disabled:cursor-not-allowed ${
                        isOn
                          ? 'border-brand-500 bg-brand-500 font-semibold text-white'
                          : 'border-line bg-white text-subtle hover:border-line-strong hover:text-ink'
                      }`}
                      onClick={() => handleToggle(item)}
                    >
                      <Icon name={isOn ? 'check' : 'add'} className="text-lg" />
                      {item.nm}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-full px-3.5 font-semibold whitespace-nowrap text-brand-600 hover:underline hover:underline-offset-4"
                  onClick={() => setIsEditOpen(false)}
                >
                  완료
                </button>
              </div>
              <p className="text-sm text-muted">
                켠 항목은 여기와 종합 건강기록 대시보드에 함께 보여요
              </p>
            </div>
          )}

          {type && (
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
                    value={crsdSttsCd}
                    className={SELECT_CLASS}
                    style={SELECT_ARROW_STYLE}
                    onChange={(event) => setCrsdSttsCd(event.target.value)}
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
          )}
        </div>
      </div>
    </form>
  );
}
