import {
  ArrowRight,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Info,
} from 'lucide-react';
import {
  BTN_DANGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { actionFieldName } from '../shared/actionFields';
import { useOpenMain } from './aiHost';
import {
  CARE_ITEM_TOOL,
  errorFieldsShown,
  isDeleteCard,
  missingFields,
} from './actionForm';
import ActionCardFields from './ActionCardFields';
import AiAvatar from './AiAvatar';
import useTypewriter from './useTypewriter';

/**
 * 등록한 반려동물로 케어 캘린더 열기: 캘린더가 `?petSn=`을 보고 있는 아이로 고름
 * - 보이는 곳: 케어 항목은 케어리스트 탭(#hlt003-care), 일정은 달력 탭
 */
const calendarPath = (petSn, isCareItem) => {
  const query = petSn == null ? '' : `?petSn=${encodeURIComponent(petSn)}`;
  const hash = isCareItem ? '#hlt003-care' : '';
  return `${PATHS.HEALTH_CALENDAR}${query}${hash}`;
};

/**
 * 결과 줄: 저장한 요약 메시지와 같은 글, 등록 직후에는 그 아래 오른쪽에 케어 캘린더 바로가기
 * - 결과는 이 창에서 처리한 카드에만 있어(카드는 저장되지 않음) 처음 그릴 때가 곧 방금 받은 때: 글자를 펼치고, 다 펼친 뒤 바로가기
 */
function ResultLine({
  status,
  text,
  hasCalendarLink,
  petSn,
  isCareItem,
  memoKey,
}) {
  const openMain = useOpenMain();
  const typed = useTypewriter(text.replace(/^✔\s*/, ''), true, memoKey);
  const isDone = status === 'done';
  const Icon = isDone ? CircleCheck : CircleX;
  let color = 'text-subtle';
  if (isDone) color = 'text-ok';
  if (status === 'failed') color = 'text-danger';
  return (
    <div>
      <p
        className={`flex items-start gap-2 text-base font-semibold leading-6 ${color}`}
      >
        <Icon aria-hidden="true" className="mt-[3px] size-[18px] shrink-0" />
        {typed.text}
      </p>
      {isDone && hasCalendarLink && !typed.isRevealing && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="flex items-center gap-1 text-base font-semibold leading-6 text-brand-600 hover:underline"
            onClick={() => openMain(calendarPath(petSn, isCareItem))}
          >
            {isCareItem ? '케어리스트에서 보기' : '케어 캘린더에서 보기'}
            <ArrowRight aria-hidden="true" className="size-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * [확인 카드(2단계 쓰기)]: 칸 이름·값 카드와 [확인]·[취소](사람 결정 2026-11-24, 11-13 "요약 글·말로 확인"을 바꿈)
 * - 처리 전 가장 최근 카드: 제목·안내·칸·버튼. 말로 하는 확인("등록해 줘")·취소·고치기도 그대로
 * - [확인]은 빈 필수 칸·처리 중·답변 중이면 비활성, 가장 최근 카드가 아니면 버튼 없음
 * - 처리한 카드: 결과 요약 메시지 자리에 결과 줄(케어 캘린더 바로가기 포함)
 * - 지난 카드·버린 카드는 그리지 않는다
 * - 받자마자 실행하는 카드(isAuto)는 실행·결과 저장 중에 그리지 않는다(결과 줄만, 사람 결정 2026-11-27)
 * - 삭제 카드(DELETE): 칸 대신 대상 글(targetText) 한 줄, [확인] 대신 빨간 [삭제]
 */
export default function ActionCard({
  item,
  isActive,
  hasCalendarLink,
  isChoiceDisabled,
  onChoosePet,
  onConfirm,
  onCancel,
  onChangeInput,
  onRetrySave,
  avatarPet,
}) {
  const { card, input, status, isBusy, fieldErrors } = item;
  const isCareItem = card.tool === CARE_ITEM_TOOL;
  const isDelete = isDeleteCard(card);

  if (item.resultText) {
    return (
      <div className="flex min-w-0 items-start gap-3">
        <AiAvatar pet={avatarPet} />
        <div className="max-w-[592px] rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3 tracking-[-0.03em]">
          <ResultLine
            status={status}
            text={item.resultText}
            hasCalendarLink={hasCalendarLink}
            petSn={input.petSn ?? card.input.petSn}
            isCareItem={isCareItem}
            memoKey={`action-result-${item.key}`}
          />
        </div>
      </div>
    );
  }

  const isShown =
    status === 'pending' &&
    !(item.isAuto && isBusy) &&
    (isActive || item.unsaved || isBusy);
  if (!isShown) return null;

  const shownFields = errorFieldsShown(card, input);
  const errorLines = Object.entries(fieldErrors)
    .filter(([field]) => !shownFields.includes(field))
    .map(([field, message]) => `${actionFieldName(field)}: ${message}`);
  if (item.formError) errorLines.push(item.formError);
  const isLocked = isBusy || Boolean(item.unsaved) || isChoiceDisabled;
  const isConfirmDisabled = isLocked || missingFields(card, input).length > 0;
  const hasButtons = isActive && !item.unsaved;

  return (
    <div className="flex min-w-0 items-start gap-3 tracking-[-0.03em]">
      <AiAvatar pet={avatarPet} />
      <section
        aria-label={`${card.label ?? '요청'} 확인 카드`}
        aria-busy={isBusy}
        className="flex min-w-0 max-w-[592px] flex-1 flex-col gap-3 rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3"
      >
        <h3 className="flex items-center gap-2 text-base font-semibold leading-[1.3] text-ink">
          <ClipboardCheck
            aria-hidden="true"
            className="size-[18px] shrink-0 text-brand-600"
          />
          {card.label ?? '요청'}
        </h3>
        {card.notice && (
          <p className="flex items-start gap-2 rounded-[10px] bg-tone-amber-bg px-3 py-2 text-sm leading-[22px] text-tone-amber-fg">
            <Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
            {card.notice}
          </p>
        )}
        {isDelete ? (
          card.targetText && (
            <p className="text-base leading-6 break-keep text-ink-2">
              {card.targetText}
            </p>
          )
        ) : (
          <ActionCardFields
            card={card}
            input={input}
            fieldErrors={fieldErrors}
            isActive={isActive}
            isDisabled={isLocked}
            onChoosePet={onChoosePet}
            onChangeInput={onChangeInput}
            photoFields={item.photoFields}
            isPhotoAsked={item.isPhotoAsked}
          />
        )}
        {isBusy && (
          <p role="status" className="text-sm leading-[22px] text-subtle">
            {card.label ?? '요청'}을(를) 처리하고 있어요…
          </p>
        )}
        {errorLines.length > 0 && (
          <ul
            role="alert"
            className="flex flex-col gap-1 text-sm leading-[22px] text-danger"
          >
            {errorLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {item.unsaved && (
          <p
            role="alert"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-[22px] text-danger"
          >
            결과를 저장하지 못했어요.
            <button
              type="button"
              disabled={isBusy}
              className="font-semibold text-brand-600 underline disabled:opacity-60"
              onClick={onRetrySave}
            >
              다시 시도
            </button>
          </p>
        )}
        {hasButtons && (
          <div className="flex justify-end gap-2 border-t border-line pt-3 max-[760px]:[&>button]:flex-1">
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isLocked}
              onClick={onCancel}
            >
              취소
            </button>
            <button
              type="button"
              className={isDelete ? BTN_DANGER : BTN_PRIMARY}
              disabled={isConfirmDisabled}
              onClick={onConfirm}
            >
              {isDelete ? '삭제' : '확인'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
