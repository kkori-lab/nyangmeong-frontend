import { ArrowRight, CircleCheck, CircleX, Info } from 'lucide-react';
import aiCharacter from '@/assets/ai-character.png';
import { PATHS } from '@/routes/paths';
import { actionFieldName } from '../shared/actionFields';
import { useOpenMain } from './aiHost';
import { CARE_ITEM_TOOL, hasPetChoice } from './actionForm';
import PetChoiceChips from './PetChoiceChips';

/**
 * 등록한 반려동물로 케어 캘린더 열기: 캘린더가 `?petSn=`을 보고 있는 아이로 고름
 * - 보이는 곳: 케어 항목은 케어리스트 탭(#hlt003-care), 일정은 달력 탭
 */
const calendarPath = (petSn, isCareItem) => {
  const query = petSn == null ? '' : `?petSn=${encodeURIComponent(petSn)}`;
  const hash = isCareItem ? '#hlt003-care' : '';
  return `${PATHS.HEALTH_CALENDAR}${query}${hash}`;
};

/** 결과 줄: 저장한 요약 메시지와 같은 글, 등록 직후에는 그 아래 오른쪽에 케어 캘린더 바로가기 */
function ResultLine({ status, text, hasCalendarLink, petSn, isCareItem }) {
  const openMain = useOpenMain();
  const isDone = status === 'done';
  const Icon = isDone ? CircleCheck : CircleX;
  let color = 'text-[#667374]';
  if (isDone) color = 'text-[#2f6f57]';
  if (status === 'failed') color = 'text-[#b42318]';
  return (
    <div>
      <p
        className={`flex items-start gap-2 text-base font-semibold leading-6 ${color}`}
      >
        <Icon aria-hidden="true" className="mt-[3px] size-[18px] shrink-0" />
        {text.replace(/^✔\s*/, '')}
      </p>
      {isDone && hasCalendarLink && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="flex items-center gap-1 text-base font-semibold leading-6 text-[#1e4a4c] hover:underline"
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
 * [확인 카드(2단계 쓰기)]: 카드 내용은 저장된 요약 글(done.message)로 보이고, 확인·취소는 말로 한다(사람 결정 2026-11-13)
 * - 처리 전 가장 최근 카드: 요약 글 아래 안내 문구·반려동물 이름 칩·실행 오류만
 * - 처리한 카드: 결과 요약 메시지 자리에 결과 줄(케어 캘린더 바로가기 포함)
 * - 지난 카드·버린 카드는 그리지 않는다
 */
export default function ActionCard({
  item,
  isActive,
  hasCalendarLink,
  isChoiceDisabled,
  onChoosePet,
  onRetrySave,
}) {
  const { card, input, status, isBusy, fieldErrors } = item;
  const isCareItem = card.tool === CARE_ITEM_TOOL;
  const errorLines = Object.entries(fieldErrors).map(
    ([field, message]) => `${actionFieldName(field)}: ${message}`,
  );
  if (item.formError) errorLines.push(item.formError);

  if (item.resultText) {
    return (
      <div className="flex min-w-0 items-start gap-3">
        <img
          src={aiCharacter}
          alt=""
          width="36"
          height="36"
          className="size-9 shrink-0 rounded-full border border-[#e2e7e7] bg-[#e9f2f2] object-contain p-1"
        />
        <div className="max-w-[592px] rounded-[4px_18px_18px_18px] border border-[#e2e7e7] bg-white px-4 py-3 tracking-[-0.03em]">
          <ResultLine
            status={status}
            text={item.resultText}
            hasCalendarLink={hasCalendarLink}
            petSn={input.petSn ?? card.input.petSn}
            isCareItem={isCareItem}
          />
        </div>
      </div>
    );
  }

  const isShown = status === 'pending' && (isActive || item.unsaved || isBusy);
  const hasPetChips = isActive && hasPetChoice(card) && input.petSn == null;
  const hasContent =
    card.notice ||
    isBusy ||
    errorLines.length > 0 ||
    item.unsaved ||
    hasPetChips;
  if (!isShown || !hasContent) return null;

  return (
    <div className="flex flex-col gap-2 tracking-[-0.03em]">
      {card.notice && (
        <p className="ml-12 flex max-w-[592px] items-start gap-2 rounded-[10px] bg-[#fcf1df] px-3 py-2 text-sm leading-[22px] text-[#9a5c0c]">
          <Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
          {card.notice}
        </p>
      )}
      {isBusy && (
        <p
          role="status"
          className="ml-12 text-sm leading-[22px] text-[#667374]"
        >
          {card.label ?? '요청'}을(를) 처리하고 있어요…
        </p>
      )}
      {errorLines.length > 0 && (
        <ul
          role="alert"
          className="ml-12 flex flex-col gap-1 text-sm leading-[22px] text-[#b42318]"
        >
          {errorLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {item.unsaved && (
        <p
          role="alert"
          className="ml-12 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-[22px] text-[#b42318]"
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
      {hasPetChips && (
        <PetChoiceChips
          pets={card.petChoices}
          isDisabled={isChoiceDisabled || isBusy}
          onSelect={onChoosePet}
        />
      )}
    </div>
  );
}
