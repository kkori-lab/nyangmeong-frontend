import { useEffect, useReducer, useRef, useState } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import Modal from '@/components/Modal';
import TimeSelect from '@/components/TimeSelect';
import Icon from '@/components/Icon';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { getNowHm, getTodayYmd, makeDateTime } from '@/utils/formatDate';
import { DAILY_ITEMS, keepWidgetOrder } from '../dashboard/widgetItems';
import {
  FUTURE_TIME_MESSAGE,
  NORMAL_STOOL,
  RECORD_TYPES,
  STOOL,
  STOOL_STATES,
  WEIGHT,
  WEIGHT_MAX,
  WEIGHT_MAX_MESSAGE,
  findRecordType,
  getOnceMaxMessage,
  isAfterNow,
} from '../diaryTypes';
import { useCreateDailyRecord, useSaveHealthWidgets } from '../queries';
import { DECIMAL_MESSAGE, hasOverTwoDecimals } from '../numberFormat';
import FieldError from './FieldError';
import { INPUT_CLASS, LABEL_CLASS } from './formStyles';

/**
 * [오늘 기록하기 모달] (※신규 정책, 2026-11-14 페이지 영역 → 모달)
 * - 기록 종류를 고르고 시간·값을 입력해 오늘 기록으로 등록 (FN-HLT-002-11)
 * - 공통 Modal(✕, isWide 688px). 배치: 설명 / 종류 탭 + [항목 편집] 한 줄 / 시간·양 한 줄 / [등록하기] 오른쪽 아래(푸터)
 *   좁은 화면에서는 종류 탭이 줄 전체를 나눠 채우고 [항목 편집]은 다음 줄
 * - 열릴 때 첫 입력칸에 포커스. 등록하면(마지막 입력칸 Enter 포함) 모달을 닫음
 * - 지금(분 단위) 이후 시각은 시간 칸 아래 안내하고 등록을 막음. [등록하기] 순간에도 현재 시각으로 다시 봄 (※신규 정책)
 * - petBdwg: 선택된 반려동물의 프로필 체중(kg). 음수량·식사량 1회 상한 계산용 (※신규 정책)
 * - 대시보드에서 고른 매일 기록만 종류로 보임 (※신규 정책, D11). widgetIds가 null(고른 적 없음)이면 5종 모두, [항목 편집] 없음
 * - [항목 편집]: 종류 줄 아래에 매일 기록 5개 칩을 펼침. 칩을 누를 때마다 켜고 끄며 바로 저장(대시보드 기록 항목과 같은 저장소).
 *   마지막으로 켜 둔 하나는 끌 수 없음. [완료](칩 줄 끝 세로 구분선 뒤 청록 네모 버튼)로 접음 (※신규 정책, 2026-11-08)
 */
export default function TodayRecordForm({
  petSn,
  petBdwg,
  initialTypeCd,
  mbrSn,
  widgetIds,
  onClose,
}) {
  const timeRef = useRef(null);
  const [pickedTypeCd, setTypeCd] = useState(initialTypeCd);
  const [rcdTm, setRcdTm] = useState(getNowHm);
  const [value, setValue] = useState('');
  const [crsdSttsCd, setCrsdSttsCd] = useState(NORMAL_STOOL);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const createRecord = useCreateDailyRecord();
  const saveWidgets = useSaveHealthWidgets();
  /** 다시 그리기만 한다: 시각 검사는 그릴 때마다 현재 시각으로 하므로, 등록 순간 검사 결과를 화면에 맞춘다 */
  const [, rerender] = useReducer((count) => count + 1, 0);

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
    timeRef.current?.focus({ preventScroll: true });
  }, []);

  /** 켠 매일 기록 수: 마지막 하나는 끌 수 없음 */
  const onCount = isFiltered
    ? DAILY_ITEMS.filter((item) => widgetIds.includes(item.id)).length
    : 0;

  /** 매일 기록 켜고 끄기: 대시보드 카드도 같이 생기거나 빠짐. 켠 종류는 바로 고름 */
  const handleToggle = (item) => {
    /** 서버 저장 중에는 누름 무시: 끝나기 전 값으로 다시 저장하면 앞 저장을 덮어씀 */
    if (saveWidgets.isPending) return;
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
  /** 체중 상한·산책·음수량·식사량 1회 상한 초과, 소수 셋째 자리 이상은 입력하는 동안 바로 안내하고 등록을 막음 */
  const valueError = isStool
    ? null
    : typeCd === WEIGHT && Number(value) > WEIGHT_MAX
      ? WEIGHT_MAX_MESSAGE
      : (getOnceMaxMessage(typeCd, value, petBdwg) ??
        (hasOverTwoDecimals(value) ? DECIMAL_MESSAGE : null));
  const timeError = isAfterNow(getTodayYmd(), rcdTm)
    ? FUTURE_TIME_MESSAGE
    : null;
  const hasError = valueError != null || timeError != null;

  /** 지금 이후 시각 안내 중에는 시간이 흘러 그 시각이 되면 안내를 걷고 [등록하기]를 켠다 */
  useEffect(() => {
    if (timeError == null) return undefined;
    const timer = setInterval(rerender, 10_000);
    return () => clearInterval(timer);
  }, [timeError]);
  const canSubmit =
    type != null &&
    rcdTm !== '' &&
    !hasError &&
    (isStool || (value !== '' && Number(value) > 0));

  const handleTypeChange = (nextTypeCd) => {
    setTypeCd(nextTypeCd);
    setValue('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || createRecord.isPending) return;
    /** 폼을 열어 둔 사이 시간이 흘러도 누르는 순간 기준으로 한 번 더 본다 */
    if (isAfterNow(getTodayYmd(), rcdTm)) {
      rerender();
      return;
    }
    createRecord.mutate(
      {
        petSn,
        body: {
          dailyRcdIdctCd: typeCd,
          rcdDt: makeDateTime(getTodayYmd(), rcdTm),
          ...(isStool ? { crsdSttsCd } : { rcdNvl: Number(value) }),
        },
      },
      { onSuccess: onClose },
    );
  };

  const footer = (
    <button
      type="submit"
      form="hlt002-record-form"
      disabled={!canSubmit || createRecord.isPending}
      className={`${BTN_PRIMARY} min-w-24`}
    >
      등록하기
    </button>
  );

  return (
    <Modal
      title="오늘 기록하기"
      footer={footer}
      isWide
      isPending={createRecord.isPending}
      onClose={onClose}
    >
      <form
        id="hlt002-record-form"
        className={`flex flex-col gap-4 ${hasError ? 'pb-6' : ''}`}
        onSubmit={handleSubmit}
      >
        <p className="text-subtle">기록 종류를 선택하고 내용을 입력해주세요</p>

        <div className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>종류</span>
          <div className="flex flex-wrap items-center gap-2">
            {recordTypes.length > 0 && (
              <div
                role="radiogroup"
                aria-label="기록 종류"
                className="flex h-10 w-full rounded-[6px] border border-[#e6eaeb] bg-[#f1f3f4] p-[3px] sm:w-auto"
              >
                {recordTypes.map((item) => {
                  const isSelected = item.cd === typeCd;
                  return (
                    <button
                      key={item.cd}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`flex flex-1 items-center justify-center rounded-[4px] whitespace-nowrap sm:flex-none sm:px-3 ${
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

        {isFiltered && isEditOpen && (
          <div
            id="hlt002-record-edit"
            className="flex flex-col gap-2 border-l-2 border-brand-100 pl-3"
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
              {/* 칩과 구별: 줄 오른쪽 끝에 세로 구분선 + 청록 네모 버튼. 줄이 모자라면 둘이 같이 다음 줄로 */}
              <span className="ml-auto flex items-center gap-2">
                <span aria-hidden="true" className="h-6 w-px bg-line" />
                <button
                  type="button"
                  className={`${BTN_PRIMARY} h-9! px-3.5!`}
                  onClick={() => setIsEditOpen(false)}
                >
                  완료
                </button>
              </span>
            </div>
            <p className="text-sm text-muted">
              켠 항목은 여기와 건강 대시보드에 함께 보여요
            </p>
          </div>
        )}

        {type && (
          <div className="flex flex-wrap items-end gap-x-4 gap-y-10">
            <div className="relative flex min-w-40 flex-1 flex-col gap-1.5">
              <span className={LABEL_CLASS}>시간</span>
              <TimeSelect ref={timeRef} value={rcdTm} onChange={setRcdTm} />
              {/* 값 칸 안내와 같이 입력칸 아래에 겹쳐 띄운다 */}
              {timeError && (
                <div className="absolute top-full left-0 mt-1 whitespace-nowrap">
                  <FieldError>{timeError}</FieldError>
                </div>
              )}
            </div>
            {isStool ? (
              <label className="flex min-w-40 flex-1 flex-col gap-1.5">
                <span className={LABEL_CLASS}>{type.valueLabel}</span>
                <DropdownSelect
                  value={crsdSttsCd}
                  options={STOOL_STATES.map((state) => ({
                    value: state.cd,
                    label: state.nm,
                  }))}
                  onChange={setCrsdSttsCd}
                />
              </label>
            ) : (
              <label className="relative flex min-w-40 flex-1 flex-col gap-1.5">
                <span className={LABEL_CLASS}>{type.valueLabel}</span>
                <span className="relative block">
                  <input
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
                {/* 안내가 줄 높이를 늘려 라벨·입력칸이 어긋나지 않게 입력칸 아래에 겹쳐 띄우고, 폼 아래 간격을 넓힌다 */}
                {valueError && (
                  <div className="absolute top-full left-0 mt-1 whitespace-nowrap">
                    <FieldError>{valueError}</FieldError>
                  </div>
                )}
              </label>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
