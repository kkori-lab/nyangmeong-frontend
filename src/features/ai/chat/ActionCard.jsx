import { CircleCheck, CircleX, ClipboardCheck } from 'lucide-react';
import aiCharacter from '@/assets/ai-character.png';
import { actionFieldName } from '../shared/actionFields';
import {
  hasPetChoice,
  isEmptyValue,
  missingFields,
  requiredFields,
  toFieldValue,
  withField,
} from './actionForm';

const buttonClass =
  'h-8 w-[54px] rounded-md text-base font-semibold leading-[1.25] disabled:cursor-not-allowed disabled:border-0 disabled:bg-[#ebf0f0] disabled:text-[#b9c4c4]';

const inputClass =
  'h-10 w-full rounded-lg border border-[#e2e7e7] bg-white px-3 text-base text-[#1a3234] focus:border-[#285a5c] focus:outline-none disabled:bg-[#f4f6f6] disabled:text-[#667374]';

const chipClass = (isSelected) =>
  `h-8 rounded-full border px-3 text-sm leading-[1.25] disabled:cursor-not-allowed ${
    isSelected
      ? 'border-[#285a5c] bg-[#285a5c] text-white disabled:opacity-60'
      : 'border-[#e2e7e7] bg-white text-[#3d4a4b] enabled:hover:bg-[#f4f6f6] disabled:text-[#b9c4c4]'
  }`;

/** 글 칸이 길면 여러 줄 입력 */
const LONG_TEXT_LENGTH = 100;

const BOOLEAN_CHOICES = [
  { cd: true, nm: '예' },
  { cd: false, nm: '아니요' },
];

/** 입력 값 → 날짜·시간 입력의 값 모양 */
const toInputValue = (type, value) => {
  if (isEmptyValue(value)) return '';
  if (type === 'datetime') return String(value).slice(0, 16);
  if (type === 'time') return String(value).slice(0, 5);
  return String(value);
};

/** 날짜·시간 입력의 값 → 서버 모양(일시는 초까지) */
const fromInputValue = (type, raw) =>
  type === 'datetime' && raw.length === 16 ? `${raw}:00` : raw;

/** 칩 고르기: 필수가 아닌 칸은 고른 칩을 다시 누르면 비운다 */
function ChoiceChips({ choices, value, isRequired, isDisabled, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {choices.map((choice) => {
        const isSelected = value === choice.cd;
        return (
          <button
            key={String(choice.cd)}
            type="button"
            aria-pressed={isSelected}
            disabled={isDisabled}
            className={chipClass(isSelected)}
            onClick={() =>
              onPick(isSelected && !isRequired ? undefined : choice.cd)
            }
          >
            {choice.nm}
          </button>
        );
      })}
    </div>
  );
}

/** 칸 타입별 입력: 코드는 칩, 날짜·시간은 날짜 입력, 숫자는 숫자 입력 */
function FieldControl({ id, param, value, isRequired, isDisabled, onPick }) {
  if (param.type === 'code') {
    return (
      <ChoiceChips
        choices={param.codes ?? []}
        value={value}
        isRequired={isRequired}
        isDisabled={isDisabled}
        onPick={onPick}
      />
    );
  }
  if (param.type === 'boolean') {
    return (
      <ChoiceChips
        choices={BOOLEAN_CHOICES}
        value={value}
        isRequired={isRequired}
        isDisabled={isDisabled}
        onPick={onPick}
      />
    );
  }
  if (['date', 'time', 'datetime'].includes(param.type)) {
    return (
      <input
        id={id}
        type={param.type === 'datetime' ? 'datetime-local' : param.type}
        value={toInputValue(param.type, value)}
        disabled={isDisabled}
        className={inputClass}
        onChange={(event) =>
          onPick(
            toFieldValue(param, fromInputValue(param.type, event.target.value)),
          )
        }
      />
    );
  }
  if (['int', 'long', 'decimal'].includes(param.type)) {
    return (
      <input
        id={id}
        type="number"
        inputMode={param.type === 'decimal' ? 'decimal' : 'numeric'}
        step={param.type === 'decimal' ? 'any' : 1}
        min={param.min}
        max={param.max}
        value={value ?? ''}
        disabled={isDisabled}
        className={inputClass}
        onChange={(event) => onPick(toFieldValue(param, event.target.value))}
      />
    );
  }
  if ((param.maxLength ?? 0) > LONG_TEXT_LENGTH) {
    return (
      <textarea
        id={id}
        rows={3}
        maxLength={param.maxLength}
        value={value ?? ''}
        disabled={isDisabled}
        className={`${inputClass} h-auto py-2 leading-[22px]`}
        onChange={(event) => onPick(toFieldValue(param, event.target.value))}
      />
    );
  }
  return (
    <input
      id={id}
      type="text"
      maxLength={param.maxLength}
      value={value ?? ''}
      disabled={isDisabled}
      className={inputClass}
      onChange={(event) => onPick(toFieldValue(param, event.target.value))}
    />
  );
}

/** 결과 줄: 저장한 요약 메시지와 같은 글 */
function ResultLine({ status, text }) {
  const isDone = status === 'done';
  const Icon = isDone ? CircleCheck : CircleX;
  let color = 'text-[#667374]';
  if (isDone) color = 'text-[#2f6f57]';
  if (status === 'failed') color = 'text-[#b42318]';
  return (
    <p
      className={`mt-4 flex items-center gap-2 border-t border-[#edf1f1] pt-3 text-base font-semibold leading-6 ${color}`}
    >
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
      {text.replace(/^✔\s*/, '')}
    </p>
  );
}

/**
 * [확인 카드(2단계 쓰기)]
 * - 서버가 준 칸 규칙(params)으로 폼을 그리고, 빈 필수 칸이 있으면 [확인]이 눌리지 않는다
 * - 가장 최근 카드의 버튼만 활성, 처리한 카드는 결과 줄만 남는다
 */
export default function ActionCard({
  item,
  isActive,
  onChange,
  onConfirm,
  onCancel,
  onRetrySave,
}) {
  const { card, input, shownFields, status, isBusy, fieldErrors } = item;
  const isPending = status === 'pending';
  const isEditable = isActive && isPending && !isBusy && !item.unsaved;
  const missing = missingFields(card, input);
  const required = requiredFields(card, input);
  const title = card.label ?? '내용 확인';

  const change = (field, value) =>
    onChange(field, withField(input, field, value));

  return (
    <div className="flex min-w-0 items-start gap-3">
      <img
        src={aiCharacter}
        alt=""
        width="36"
        height="36"
        className="size-9 shrink-0 rounded-full border border-[#e2e7e7] bg-[#e9f2f2] object-contain p-1"
      />
      <section
        aria-label={`${title} 확인`}
        className="w-full max-w-[520px] rounded-[14px] border border-[#e2e7e7] bg-white p-5 tracking-[-0.03em]"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold leading-[1.25] text-[#1a3234]">
          <ClipboardCheck
            aria-hidden="true"
            className="size-5 text-[#285a5c]"
          />
          {title}
        </h2>

        <div className="mt-4 flex flex-col gap-4 rounded-[10px] bg-[#f4f6f6] p-4">
          {hasPetChoice(card) ? (
            <div role="group" aria-label="반려동물">
              <p className="mb-2 text-sm leading-[1.25] text-[#667374]">
                반려동물
              </p>
              <ChoiceChips
                choices={card.petChoices.map((pet) => ({
                  cd: pet.petSn,
                  nm: pet.petNm,
                }))}
                value={input.petSn}
                isRequired
                isDisabled={!isEditable}
                onPick={(petSn) => change('petSn', petSn)}
              />
            </div>
          ) : (
            card.petNm && (
              <div>
                <p className="text-sm leading-[1.25] text-[#667374]">
                  반려동물
                </p>
                <p className="mt-1 text-base font-semibold leading-6 text-[#1a3234]">
                  {card.petNm}
                </p>
              </div>
            )
          )}

          {shownFields.map((field) => {
            const param = card.params[field];
            const id = `action-${item.key}-${field}`;
            const isChoice = ['code', 'boolean'].includes(param.type);
            const isMissing = missing.includes(field);
            return (
              <div
                key={field}
                role={isChoice ? 'group' : undefined}
                aria-label={isChoice ? actionFieldName(field) : undefined}
              >
                {isChoice ? (
                  <p className="mb-2 text-sm leading-[1.25] text-[#667374]">
                    {actionFieldName(field)}
                  </p>
                ) : (
                  <label
                    htmlFor={id}
                    className="mb-2 block text-sm leading-[1.25] text-[#667374]"
                  >
                    {actionFieldName(field)}
                  </label>
                )}
                <FieldControl
                  id={id}
                  param={param}
                  value={input[field]}
                  isRequired={required.includes(field)}
                  isDisabled={!isEditable}
                  onPick={(value) => change(field, value)}
                />
                {fieldErrors[field] ? (
                  <p
                    role="alert"
                    className="mt-1 text-sm leading-[22px] text-[#b42318]"
                  >
                    {fieldErrors[field]}
                  </p>
                ) : (
                  isMissing &&
                  isPending && (
                    <p className="mt-1 text-sm leading-[22px] text-[#667374]">
                      입력해 주세요
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>

        {item.formError && isPending && (
          <p
            role="alert"
            className="mt-3 text-sm leading-[22px] text-[#b42318]"
          >
            {item.formError}
          </p>
        )}

        {isPending && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={!isEditable || missing.length > 0}
              className={`${buttonClass} bg-[#285a5c] text-white enabled:hover:bg-[#1e4a4c]`}
              onClick={onConfirm}
            >
              확인
            </button>
            <button
              type="button"
              disabled={!isEditable}
              className={`${buttonClass} border border-[#e2e7e7] bg-white text-[#1a3234] enabled:hover:bg-[#f4f6f6]`}
              onClick={onCancel}
            >
              취소
            </button>
          </div>
        )}

        {item.unsaved && (
          <p
            role="alert"
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-[22px] text-[#b42318]"
          >
            결과를 저장하지 못했어요.
            <button
              type="button"
              disabled={isBusy}
              className="font-semibold text-[#1e4a4c] underline disabled:opacity-60"
              onClick={onRetrySave}
            >
              다시 시도
            </button>
          </p>
        )}

        {item.resultText && (
          <ResultLine status={status} text={item.resultText} />
        )}
      </section>
    </div>
  );
}
