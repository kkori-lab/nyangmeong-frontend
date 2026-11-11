import { useState } from 'react';
import TimeSelect from '@/components/TimeSelect';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import {
  BTN_DANGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '@/components/buttonStyles';
import { formatDate, getHmOf, makeDateTime } from '@/utils/formatDate';
import {
  STOOL,
  STOOL_STATES,
  TODAY_RECORD_ORDER,
  TYPE_ICONS,
  WEIGHT,
  WEIGHT_MAX,
  WEIGHT_MAX_MESSAGE,
  findRecordType,
} from '../diaryTypes';
import { useDeleteDailyRecord, useUpdateDailyRecord } from '../queries';
import {
  DECIMAL_MESSAGE,
  hasOverTwoDecimals,
  toInputText,
} from '../numberFormat';
import FieldError from './FieldError';
import { INPUT_CLASS, SELECT_ARROW_STYLE, SELECT_CLASS } from './formStyles';
import { formatAmount, summarizeType } from './recordUtils';

/** 묶음 머리에 합계를 붙이지 않는 종류 */
const COUNT_ONLY_TYPES = [WEIGHT, STOOL];

/** 기록 1건의 입력값: 시각(HH:mm)과 값(배변상태는 코드, 그 외는 숫자 문자열) */
const toDraft = (record) => ({
  rcdTm: getHmOf(record.rcdDt),
  value:
    record.dailyRcdIdctCd === STOOL
      ? record.crsdSttsCd
      : toInputText(record.rcdNvl),
});

/** 지운 기록의 줄 상태를 버린다 */
const omitKey = (map, key) =>
  Object.fromEntries(
    Object.entries(map).filter(([entryKey]) => entryKey !== String(key)),
  );

/** 마지막 글자 받침에 따라 은/는을 붙인다(식사량은, 배변상태는) */
const withTopicParticle = (text) => {
  const code = text.charCodeAt(text.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${text}${hasBatchim ? '은' : '는'}`;
};

const isSameDraft = (a, b) => a.rcdTm === b.rcdTm && a.value === b.value;

/** 저장 전 검사: 시각 필수, 배변상태 외에는 0보다 큰 값·소수 둘째 자리까지, 체중은 상한 이하 */
const validateDraft = (typeCd, draft) => {
  if (draft.rcdTm === '') return '시각을 입력해주세요';
  if (typeCd === STOOL) return draft.value ? null : '상태를 선택해주세요';
  if (draft.value === '' || !(Number(draft.value) > 0))
    return '0보다 큰 값을 입력해주세요';
  if (typeCd === WEIGHT && Number(draft.value) > WEIGHT_MAX)
    return WEIGHT_MAX_MESSAGE;
  if (hasOverTwoDecimals(draft.value)) return DECIMAL_MESSAGE;
  return null;
};

/** 오늘의 기록 순서, 같은 종류 안에서는 시각 오름차순 */
const sortRecords = (records) =>
  [...records].sort(
    (a, b) =>
      TODAY_RECORD_ORDER.indexOf(a.dailyRcdIdctCd) -
        TODAY_RECORD_ORDER.indexOf(b.dailyRcdIdctCd) ||
      a.rcdDt.localeCompare(b.rcdDt),
  );

/**
 * [하루 기록 수정 모달] (※신규 정책)
 * - 오늘의 기록 카드 [오늘 기록 수정하기]와 최근 건강기록 날짜 행이 같이 연다. 상세 표 모달(FN-HLT-002-13)을 대신한다
 * - 같은 종류는 한 묶음(머리 1줄 + 기록 줄) (※신규 정책)
 *   머리: 종류 · "N회 · 합계 ○○"(체중·배변상태는 "N회"). 합계는 입력 중인 값이 아니라 저장된 기록 기준
 *   기록 줄: 시각 | 값·단위 | [삭제], 시각 오름차순. 묶음 사이에만 구분선
 * - [저장]은 바뀐 줄만 PUT. 일부만 실패하면 모달을 열어 두고 실패한 줄 아래 오류,
 *   성공한 줄은 저장된 값을 기준으로 삼아 다시 [저장]하면 실패한 줄만 보낸다
 * - [삭제]는 확인 후 바로 DELETE. 그날 기록이 모두 없어지면 닫는다
 */
export default function DayRecordEditModal({
  petSn,
  ymd,
  isToday,
  dayRecords,
  onClose,
}) {
  const dateText = formatDate(ymd, { hasYear: false, weekday: true });
  const records = sortRecords(dayRecords);
  /** 줄마다 입력값과 기준값(서버에 저장된 값). 키는 dailyHlthRcdSn */
  const [drafts, setDrafts] = useState({});
  const [baselines, setBaselines] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteSn, setDeleteSn] = useState(null);
  const updateRecord = useUpdateDailyRecord();
  const deleteRecord = useDeleteDailyRecord();

  const baselineOf = (record) =>
    baselines[record.dailyHlthRcdSn] ?? toDraft(record);
  const draftOf = (record) =>
    drafts[record.dailyHlthRcdSn] ?? baselineOf(record);
  const changedRecords = records.filter(
    (record) => !isSameDraft(draftOf(record), baselineOf(record)),
  );

  const missingTypes = TODAY_RECORD_ORDER.filter(
    (typeCd) => !records.some((record) => record.dailyRcdIdctCd === typeCd),
  );

  const changeDraft = (sn, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [sn]: {
        ...(prev[sn] ??
          baselineOf(records.find((r) => r.dailyHlthRcdSn === sn))),
        ...patch,
      },
    }));
    setErrors((prev) => ({ ...prev, [sn]: null }));
  };

  const handleSave = async () => {
    const nextErrors = {};
    changedRecords.forEach((record) => {
      const message = validateDraft(record.dailyRcdIdctCd, draftOf(record));
      if (message) nextErrors[record.dailyHlthRcdSn] = message;
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }
    if (changedRecords.length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    const results = await Promise.allSettled(
      changedRecords.map((record) => {
        const draft = draftOf(record);
        return updateRecord.mutateAsync({
          petSn,
          dailyHlthRcdSn: record.dailyHlthRcdSn,
          body: {
            rcdDt: makeDateTime(ymd, draft.rcdTm),
            ...(record.dailyRcdIdctCd === STOOL
              ? { crsdSttsCd: draft.value }
              : { rcdNvl: Number(draft.value) }),
          },
        });
      }),
    );
    setIsSaving(false);

    if (results.every((result) => result.status === 'fulfilled')) {
      onClose();
      return;
    }
    /** 성공한 줄은 보낸 값이 새 기준값이 되어 '바뀐 줄'에서 빠진다 */
    const savedBaselines = {};
    const failedErrors = {};
    results.forEach((result, index) => {
      const record = changedRecords[index];
      const sn = record.dailyHlthRcdSn;
      if (result.status === 'fulfilled') savedBaselines[sn] = draftOf(record);
      else
        failedErrors[sn] =
          result.reason?.message ?? '저장하지 못했어요. 다시 시도해주세요';
    });
    setBaselines((prev) => ({ ...prev, ...savedBaselines }));
    setErrors((prev) => ({ ...prev, ...failedErrors }));
  };

  const handleDelete = () =>
    deleteRecord.mutate(
      { petSn, dailyHlthRcdSn: deleteSn },
      {
        onSuccess: () => {
          const sn = deleteSn;
          setDeleteSn(null);
          setDrafts((prev) => omitKey(prev, sn));
          setErrors((prev) => omitKey(prev, sn));
          if (records.every((record) => record.dailyHlthRcdSn === sn))
            onClose();
        },
      },
    );

  return (
    <>
      <Modal
        title={`${isToday ? `오늘 ${dateText}` : dateText} 기록 수정`}
        width={560}
        isSheet
        isDismissDisabled
        isPending={isSaving}
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isSaving}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              disabled={isSaving}
              onClick={handleSave}
            >
              저장
            </button>
          </>
        }
      >
        <ul className="flex flex-col">
          {TODAY_RECORD_ORDER.filter(
            (typeCd) => !missingTypes.includes(typeCd),
          ).map((typeCd) => (
            <TypeGroup
              key={typeCd}
              typeCd={typeCd}
              summary={summarizeType(records, typeCd)}
            >
              {records
                .filter((record) => record.dailyRcdIdctCd === typeCd)
                .map((record) => (
                  <RecordRow
                    key={record.dailyHlthRcdSn}
                    record={record}
                    draft={draftOf(record)}
                    error={errors[record.dailyHlthRcdSn]}
                    isDisabled={isSaving}
                    onChange={(patch) =>
                      changeDraft(record.dailyHlthRcdSn, patch)
                    }
                    onRequestDelete={() => setDeleteSn(record.dailyHlthRcdSn)}
                  />
                ))}
            </TypeGroup>
          ))}
        </ul>
        {missingTypes.length > 0 && (
          <p className="mt-3 text-sm/[1.6] text-subtle">
            {withTopicParticle(
              missingTypes.map((typeCd) => findRecordType(typeCd).nm).join('·'),
            )}{' '}
            이날 기록이 없어요
          </p>
        )}
      </Modal>

      {deleteSn !== null && (
        <Modal
          isConfirm
          title="이 기록을 삭제할까요?"
          isPending={deleteRecord.isPending}
          onClose={() => setDeleteSn(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteRecord.isPending}
                onClick={() => setDeleteSn(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteRecord.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}
    </>
  );
}

/** 종류 묶음: 머리 줄(아이콘·종류 이름·횟수·합계) 아래 기록 줄 */
function TypeGroup({ typeCd, summary, children }) {
  const type = findRecordType(typeCd);
  const { count, sum } = summary;

  return (
    <li className="border-b border-line-soft py-3 first:pt-0 last:border-b-0">
      <p className="flex items-center gap-2 text-base font-semibold text-ink">
        <Icon name={TYPE_ICONS[typeCd]} className="text-muted" />
        {type.nm}
        <span className="text-sm font-normal text-subtle tabular-nums">
          {count}회
          {!COUNT_ONLY_TYPES.includes(typeCd) &&
            ` · 합계 ${formatAmount(typeCd, sum)}`}
        </span>
      </p>
      <ul className="flex flex-col">{children}</ul>
    </li>
  );
}

/** 기록 1건 줄: 시각 | 값 | 삭제. 아이콘 폭만큼 들여 쓴다. 760px 이하는 [삭제]가 같은 줄이라 들여쓰기 없이 시각 칸을 넓힌다(3 : 2) */
function RecordRow({
  record,
  draft,
  error,
  isDisabled,
  onChange,
  onRequestDelete,
}) {
  const typeCd = record.dailyRcdIdctCd;
  const type = findRecordType(typeCd);
  const isStool = typeCd === STOOL;

  return (
    <li className="mt-2 flex flex-col gap-1 pl-7 max-[760px]:pl-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
        {/* 시간 세 칸이 값 칸과 한 줄에 안 들어가는 760px 이하는 위아래로 쌓는다 */}
        <div className="grid grid-cols-2 gap-2 max-[760px]:grid-cols-1">
          <TimeSelect
            aria-label={`${type.nm} 시각`}
            value={draft.rcdTm}
            disabled={isDisabled}
            onChange={(rcdTm) => onChange({ rcdTm })}
          />
          {isStool ? (
            <select
              aria-label={type.nm}
              value={draft.value}
              disabled={isDisabled}
              className={SELECT_CLASS}
              style={SELECT_ARROW_STYLE}
              onChange={(event) => onChange({ value: event.target.value })}
            >
              {STOOL_STATES.map((state) => (
                <option key={state.cd} value={state.cd}>
                  {state.nm}
                </option>
              ))}
            </select>
          ) : (
            <span className="relative block">
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                aria-label={`${type.nm}(${type.unit})`}
                value={draft.value}
                disabled={isDisabled}
                className={`${INPUT_CLASS} pr-11 text-right tabular-nums`}
                onChange={(event) => onChange({ value: event.target.value })}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">
                {type.unit}
              </span>
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={isDisabled}
          className="min-h-9 text-sm/[1.6] font-semibold text-danger hover:underline"
          onClick={onRequestDelete}
        >
          삭제
        </button>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </li>
  );
}
