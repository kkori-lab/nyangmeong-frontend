import { useEffect, useReducer, useRef, useState } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import Modal from '@/components/Modal';
import TimeSelect from '@/components/TimeSelect';
import Icon from '@/components/Icon';
import NoticeBox from '@/components/NoticeBox';
import { BTN_PRIMARY, CHIP, CHIP_ON } from '@/components/buttonStyles';
import { getNowHm, getTodayYmd, makeDateTime } from '@/utils/formatDate';
import { DAILY_ITEMS, keepWidgetOrder } from '../dashboard/widgetItems';
import {
  FUTURE_TIME_MESSAGE,
  RECORD_TYPES,
  STOOL,
  STOOL_STATES,
  TYPE_ICONS,
  WEIGHT,
  WEIGHT_MAX,
  WEIGHT_MAX_MESSAGE,
  getOnceMaxMessage,
  isAfterNow,
} from '../diaryTypes';
import { useBulkCreateDailyRecords, useSaveHealthWidgets } from '../queries';
import { DECIMAL_MESSAGE, hasOverTwoDecimals } from '../numberFormat';
import FieldError from '@/components/FieldError';
import { INPUT } from '@/components/formStyles';

/** 서버 칸 이름 → 줄 안 칸(시간·값). 종류 칸 등 줄에 붙일 수 없는 오류는 푸터 위 한 줄로 */
const SERVER_FIELDS = { rcdDt: 'time', rcdNvl: 'value', crsdSttsCd: 'value' };
const SERVER_FIELD_PATTERN = /^values\[(\d+)\]\.(\w+)$/;

/** 배변 상태 「선택 안 함」 값: 이 값이면 등록 대상이 아님 */
const NO_STOOL = '';

const emptyRow = () => ({ rcdTm: getNowHm(), value: '' });
const makeRows = () =>
  Object.fromEntries(RECORD_TYPES.map((item) => [item.cd, emptyRow()]));

/** 값을 넣은(배변 상태는 고른) 줄인지. 0 이하는 넣지 않은 것으로 봄 */
const isFilledRow = (typeCd, row) =>
  typeCd === STOOL
    ? row.value !== NO_STOOL
    : row.value !== '' && Number(row.value) > 0;

/** 체중 상한·음수량·식사량 1회 상한, 소수 셋째 자리 이상 */
const getValueError = (typeCd, value, petBdwg) => {
  if (typeCd === STOOL || value === '') return null;
  if (typeCd === WEIGHT && Number(value) > WEIGHT_MAX)
    return WEIGHT_MAX_MESSAGE;
  return (
    getOnceMaxMessage(typeCd, value, petBdwg) ??
    (hasOverTwoDecimals(value) ? DECIMAL_MESSAGE : null)
  );
};

/**
 * [오늘 기록하기 모달] (※신규 정책, 2026-11-14 페이지 영역 → 모달 / 2026-11-25 켠 항목 한꺼번에 입력)
 * - 켠 매일 기록마다 한 줄(종류 | 시간 | 값)을 모두 보여 주고, 값을 넣은 줄만 한꺼번에 등록 (FN-HLT-002-11)
 * - 공통 Modal(✕, isWide 688px). 배치: 안내 상자 + [항목 편집] / 칩 줄 / 줄 목록 / 푸터(왼쪽 입력 개수, 오른쪽 [n개 등록하기])
 *   안내 상자(NoticeBox info, 아이콘 없음)는 점 목록 2줄 「입력한 줄만 한꺼번에 등록돼요」·「꺼 둔 항목은 [항목 편집]에서 켤 수 있어요」를 항상 보임.
 *   상자는 남는 폭, [항목 편집]은 같은 줄 오른쪽에 세로 가운데 (※신규 정책, 2026-11-26)
 *   PC는 머리줄 「종류 · 시간 · 값」 + 3칸 한 줄, 760px 미만은 종류 이름 한 줄 + 아래 시간·값(폭이 모자라면 값이 다음 줄로) (※신규 정책, 2026-11-25)
 * - 시간은 열 때 모든 줄이 지금 시각, 줄마다 따로 바꿈. 값은 비어 있고 배변 상태는 「선택 안 함」(정상을 미리 고르지 않음) (※신규 정책, 2026-11-25)
 * - 값을 넣은 줄은 바탕 bg-brand-50, 숫자 값 칸 청록 테두리. 비운 줄은 보내지 않음. 0개거나 오류 있는 줄이 있으면 [등록하기]가 꺼짐 (※신규 정책, 2026-11-25)
 * - 값 검사(체중 상한, 음수량·식사량 1회 상한, 소수 셋째 자리)는 줄마다 값 칸 아래, 지금 이후 시각은 값을 넣은 줄의 시간 칸 아래에 안내하고 등록을 막음.
 *   [등록하기] 순간에도 현재 시각으로 다시 봄 (※신규 정책, 2026-11-25)
 * - [등록하기]: bulk API 한 번(하나라도 틀리면 아무것도 저장 안 됨). 성공하면 닫힘(연속 입력 없음).
 *   400 칸별 오류(values[번호].칸)는 보낸 줄의 그 칸 아래, 칸 없는 오류는 푸터 위 한 줄. 그 줄을 고치면 서버 오류를 걷음
 * - 열릴 때 initialTypeCd 줄(없으면 첫 줄) 값 칸에 포커스
 * - petBdwg: 선택된 반려동물의 프로필 체중(kg). 음수량·식사량 1회 상한 계산용 (※신규 정책)
 * - 대시보드에서 고른 매일 기록만 줄로 보임 (※신규 정책, D11). widgetIds가 null(고른 적 없음)이면 5종 모두 켜진 것으로 봄
 * - [항목 편집]: 항상 보임. widgetIds가 null이어도 5개 켜진 상태에서 칩을 누르면 같은 방식으로 저장 (※신규 정책, 2026-11-26). 매일 기록 5개 칩을 펼침. 칩을 누를 때마다 켜고 끄며 바로 저장(대시보드 기록 항목과 같은 저장소).
 *   끈 줄만 빠지고 그 줄 값은 버림, 다른 줄 값은 그대로. 마지막으로 켜 둔 하나는 끌 수 없음. [완료](칩 줄 끝 세로 구분선 뒤 청록 네모 버튼)로 접음 (※신규 정책, 2026-11-08)
 */
export default function TodayRecordForm({
  petSn,
  petBdwg,
  initialTypeCd,
  mbrSn,
  widgetIds,
  onClose,
}) {
  const valueRefs = useRef({});
  const [rows, setRows] = useState(makeRows);
  const [isEditOpen, setIsEditOpen] = useState(false);
  /** 서버 칸별 오류: { [typeCd]: { time?, value? } } */
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const bulkCreate = useBulkCreateDailyRecords();
  const saveWidgets = useSaveHealthWidgets();
  /** 다시 그리기만 한다: 시각 검사는 그릴 때마다 현재 시각으로 하므로, 등록 순간 검사 결과를 화면에 맞춘다 */
  const [, rerender] = useReducer((count) => count + 1, 0);

  /** 켠 항목 id. null(고른 적 없음)이면 매일 기록 5개 모두 켜진 것으로 봄 (※신규 정책, 2026-11-26) */
  const onIds = widgetIds ?? DAILY_ITEMS.map((item) => item.id);
  const shownTypeCds = DAILY_ITEMS.filter((item) =>
    onIds.includes(item.id),
  ).map((item) => item.typeCd);
  const recordTypes = RECORD_TYPES.filter((item) =>
    shownTypeCds.includes(item.cd),
  );
  const focusTypeCd = shownTypeCds.includes(initialTypeCd)
    ? initialTypeCd
    : recordTypes[0]?.cd;

  /** 열 때 한 번만 포커스 */
  const initialFocusRef = useRef(focusTypeCd);
  useEffect(() => {
    valueRefs.current[initialFocusRef.current]?.focus({ preventScroll: true });
  }, []);

  /** 켠 매일 기록 수: 마지막 하나는 끌 수 없음 */
  const onCount = shownTypeCds.length;

  const updateRow = (typeCd, patch) => {
    setRows((prev) => ({ ...prev, [typeCd]: { ...prev[typeCd], ...patch } }));
    setServerErrors((prev) => {
      if (!prev[typeCd]) return prev;
      const next = { ...prev };
      delete next[typeCd];
      return next;
    });
  };

  /** 매일 기록 켜고 끄기: 대시보드 카드도 같이 생기거나 빠짐. 끈 줄 값은 버리고 다른 줄은 그대로 */
  const handleToggle = (item) => {
    /** 서버 저장 중에는 누름 무시: 끝나기 전 값으로 다시 저장하면 앞 저장을 덮어씀 */
    if (saveWidgets.isPending) return;
    const isOn = onIds.includes(item.id);
    if (isOn && onCount <= 1) return;
    const nextIds = isOn
      ? onIds.filter((id) => id !== item.id)
      : [...onIds, item.id];
    saveWidgets.mutate(
      { mbrSn, widgetIds: keepWidgetOrder(nextIds) },
      {
        onSuccess: () => {
          if (isOn) updateRow(item.typeCd, emptyRow());
        },
      },
    );
  };

  const todayYmd = getTodayYmd();
  const lines = recordTypes.map((type) => {
    const row = rows[type.cd];
    const isFilled = isFilledRow(type.cd, row);
    const isFuture =
      isFilled && row.rcdTm !== '' && isAfterNow(todayYmd, row.rcdTm);
    const valueError = getValueError(type.cd, row.value, petBdwg);
    return {
      type,
      row,
      isFilled,
      isFuture,
      timeError: isFuture
        ? FUTURE_TIME_MESSAGE
        : (serverErrors[type.cd]?.time ?? null),
      valueError: valueError ?? serverErrors[type.cd]?.value ?? null,
      /** 보낼 수 없는 줄: 값 오류, 지금 이후 시각, 시·분 중 일부만 고른 시간 */
      hasError:
        valueError != null || (isFilled && (isFuture || row.rcdTm === '')),
    };
  });
  const filledLines = lines.filter((line) => line.isFilled);
  const hasError = lines.some((line) => line.hasError);
  const hasFutureTime = lines.some((line) => line.isFuture);
  const canSubmit = filledLines.length > 0 && !hasError;

  /** 지금 이후 시각 안내 중에는 시간이 흘러 그 시각이 되면 안내를 걷고 [등록하기]를 켠다 */
  useEffect(() => {
    if (!hasFutureTime) return undefined;
    const timer = setInterval(rerender, 10_000);
    return () => clearInterval(timer);
  }, [hasFutureTime]);

  /** 서버 칸별 오류를 보낸 줄마다 나눈다. 칸에 붙일 수 없는 문구는 푸터 위 한 줄로 */
  const showServerErrors = (error, sentTypeCds) => {
    const byType = {};
    const hidden = [];
    error.fields.forEach(({ field, message }) => {
      const match = SERVER_FIELD_PATTERN.exec(field);
      const typeCd = match && sentTypeCds[Number(match[1])];
      const localField = match && SERVER_FIELDS[match[2]];
      if (typeCd && localField) {
        byType[typeCd] = { ...byType[typeCd], [localField]: message };
      } else {
        hidden.push(message);
      }
    });
    setServerErrors(byType);
    setFormError(hidden.length > 0 ? [...new Set(hidden)].join(' ') : null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || bulkCreate.isPending) return;
    /** 폼을 열어 둔 사이 시간이 흘러도 누르는 순간 기준으로 한 번 더 본다 */
    if (filledLines.some((line) => isAfterNow(getTodayYmd(), line.row.rcdTm))) {
      rerender();
      return;
    }
    setServerErrors({});
    setFormError(null);
    const sentTypeCds = filledLines.map((line) => line.type.cd);
    bulkCreate.mutate(
      {
        petSn,
        values: filledLines.map(({ type, row }) => ({
          dailyRcdIdctCd: type.cd,
          rcdDt: makeDateTime(getTodayYmd(), row.rcdTm),
          ...(type.cd === STOOL
            ? { crsdSttsCd: row.value }
            : { rcdNvl: Number(row.value) }),
        })),
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (error.fields) showServerErrors(error, sentTypeCds);
        },
      },
    );
  };

  const count = filledLines.length;
  const footer = (
    <>
      <p className="mr-auto self-center text-sm text-subtle">
        {count > 0 ? `${count}개 기록을 입력했어요` : '입력한 기록이 없어요'}
      </p>
      <button
        type="submit"
        form="hlt002-record-form"
        disabled={!canSubmit || bulkCreate.isPending}
        className={`${BTN_PRIMARY} min-w-24`}
      >
        {count > 0 ? `${count}개 등록하기` : '등록하기'}
      </button>
    </>
  );

  return (
    <Modal
      title="오늘 기록하기"
      footer={footer}
      isWide
      isPending={bulkCreate.isPending}
      onClose={onClose}
    >
      <form
        id="hlt002-record-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-2">
          <NoticeBox className="min-w-0 flex-1">
            <ul className="list-disc space-y-1 pl-5">
              <li>입력한 줄만 한꺼번에 등록돼요</li>
              <li>꺼 둔 항목은 [항목 편집]에서 켤 수 있어요</li>
            </ul>
          </NoticeBox>
          <button
            type="button"
            aria-expanded={isEditOpen}
            aria-controls="hlt002-record-edit"
            className={`${isEditOpen ? CHIP_ON : CHIP} shrink-0`}
            onClick={() => setIsEditOpen((isOpen) => !isOpen)}
          >
            <Icon name="tune" className="text-lg" />
            항목 편집
          </button>
        </div>

        {isEditOpen && (
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
                const isOn = onIds.includes(item.id);
                const isLastOn = isOn && onCount <= 1;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isOn}
                    disabled={saveWidgets.isPending || isLastOn}
                    className={isOn ? CHIP_ON : CHIP}
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
                  className={`${BTN_PRIMARY}`}
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

        <div className="flex flex-col gap-1">
          <div
            aria-hidden="true"
            className="flex gap-4 px-3 text-sm font-semibold text-subtle max-[760px]:hidden"
          >
            <span className="w-34 shrink-0">종류</span>
            <span className="min-w-0 flex-1">시간</span>
            <span className="min-w-0 flex-1">값</span>
          </div>
          <ul aria-label="기록할 항목" className="flex flex-col gap-1">
            {lines.map(({ type, row, isFilled, timeError, valueError }) => {
              const isStool = type.cd === STOOL;
              const timeErrorId = `hlt002-record-${type.cd}-time-error`;
              const valueErrorId = `hlt002-record-${type.cd}-value-error`;
              const setValueRef = (node) => {
                valueRefs.current[type.cd] = node;
              };
              return (
                <li
                  key={type.cd}
                  className={`flex flex-col gap-2 rounded-md px-3 py-2.5 min-[760px]:flex-row min-[760px]:items-start min-[760px]:gap-4 ${isFilled ? 'bg-brand-50' : ''}`}
                >
                  <span className="flex items-center gap-1.5 font-semibold text-ink min-[760px]:h-10 min-[760px]:w-34 min-[760px]:shrink-0">
                    <Icon name={TYPE_ICONS[type.cd]} className="text-muted" />
                    {type.nm}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-2 min-[760px]:flex-nowrap">
                    <div className="flex min-w-0 flex-[1_1_auto] flex-col gap-1 min-[760px]:flex-1">
                      <TimeSelect
                        aria-label={`${type.nm} 시간`}
                        value={row.rcdTm}
                        invalid={timeError != null}
                        onChange={(rcdTm) => updateRow(type.cd, { rcdTm })}
                      />
                      {timeError && (
                        <span id={timeErrorId}>
                          <FieldError>{timeError}</FieldError>
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-24 flex-1 flex-col gap-1">
                      {isStool ? (
                        <DropdownSelect
                          ref={setValueRef}
                          label={`${type.nm} ${type.valueLabel}`}
                          value={row.value}
                          options={[
                            { value: NO_STOOL, label: '선택 안 함' },
                            ...STOOL_STATES.map((state) => ({
                              value: state.cd,
                              label: state.nm,
                            })),
                          ]}
                          invalid={valueError != null}
                          describedBy={valueError ? valueErrorId : undefined}
                          onChange={(value) => updateRow(type.cd, { value })}
                        />
                      ) : (
                        <span className="relative block">
                          <input
                            ref={setValueRef}
                            type="number"
                            min="0"
                            step="any"
                            inputMode="decimal"
                            aria-label={`${type.nm} ${type.valueLabel}(${type.unit})`}
                            aria-invalid={valueError != null}
                            aria-describedby={
                              valueError ? valueErrorId : undefined
                            }
                            value={row.value}
                            className={`${INPUT} pr-12 text-right tabular-nums ${isFilled && valueError == null ? 'border-brand-500!' : ''}`}
                            onChange={(event) =>
                              updateRow(type.cd, { value: event.target.value })
                            }
                          />
                          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">
                            {type.unit}
                          </span>
                        </span>
                      )}
                      {valueError && (
                        <span id={valueErrorId}>
                          <FieldError>{valueError}</FieldError>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {formError && <FieldError>{formError}</FieldError>}
      </form>
    </Modal>
  );
}
