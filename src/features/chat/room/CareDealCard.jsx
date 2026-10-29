/**
 * [거래 카드]
 * - 채팅방 위 한 줄 바(상태·글 제목·지금 할 일·내 차례 버튼)와 펼침(글 정보·5단계·확인 칸) (FN-CMU-005-06~11)
 * - 되돌릴 수 없는 단계는 카드 안 확인 칸에서 한 번 더 확인. 단계가 바뀌면 key로 새로 그려 접힘
 */
import { useEffect, useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';
import Icon from '@/components/Icon';
import { PATHS } from '@/routes/paths';
import { useDealAction, useSendChatMessage } from '../queries';
import { MSG_TYPE, ROLE } from '../shared/chatCodes';
import DealBadge from './DealBadge';
import {
  CANCEL_REASONS,
  DEAL_ASKS,
  DEAL_STEPS,
  OTHER_REASON,
  OTHER_REASON_MAX_LENGTH,
  getDealGuide,
  getStepProgress,
} from './dealSteps';

const BUTTON_BASE =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-semibold disabled:cursor-not-allowed';
const BUTTON_VARIANT = {
  primary:
    'border-transparent bg-brand-500 text-white hover:enabled:bg-brand-600 disabled:bg-surface-3 disabled:text-line-strong',
  secondary:
    'border-line bg-white hover:enabled:border-line-strong hover:enabled:bg-surface-2 disabled:border-transparent disabled:bg-surface-3 disabled:text-line-strong',
  danger:
    'border-transparent bg-danger text-white hover:enabled:bg-[#983a2f] disabled:bg-surface-3 disabled:text-line-strong',
};

function DealButton({ action, isSmall = false, isPending, onClick }) {
  const size = isSmall ? 'h-9 px-3.5' : 'h-10 min-w-24 px-4 max-[760px]:h-11';

  return (
    <button
      type="button"
      className={`${BUTTON_BASE} ${BUTTON_VARIANT[action.variant]} ${size}`}
      disabled={isPending}
      onClick={() => onClick(action.key)}
    >
      {action.label}
    </button>
  );
}

function StepList({ stage }) {
  const { isEnded, doneCount, current } = getStepProgress(stage);

  return (
    <ol
      aria-label="거래 진행 단계"
      className="mt-3.5 grid grid-cols-5 text-sm max-[400px]:text-[13px]"
    >
      {DEAL_STEPS.map((name, index) => {
        const step = index + 1;
        const isDone = step <= doneCount;
        const isNow = step === current;
        const lineColor =
          isEnded || !(isDone || isNow)
            ? 'before:bg-line'
            : 'before:bg-[#e9d27a]';
        let circle = 'bg-white shadow-[inset_0_0_0_2px_#b9c4c4]';
        if (isDone) {
          circle = isEnded
            ? 'bg-surface-3 shadow-[inset_0_0_0_1px_#b9c4c4]'
            : 'bg-[#f9eaa6] shadow-[inset_0_0_0_1px_#e9d27a]';
        } else if (isNow) {
          circle =
            'bg-white shadow-[inset_0_0_0_2px_#e9d27a,0_0_0_4px_#f9eaa6]';
        }
        let textColor = 'text-placeholder';
        if (isDone && !isEnded) textColor = 'text-ink-2';
        if (isNow) textColor = 'font-semibold text-ink';

        return (
          <li
            key={name}
            aria-current={isNow ? 'step' : undefined}
            className={`relative flex flex-col items-center gap-1 text-center leading-[1.3] before:absolute before:top-[9px] before:right-1/2 before:h-0.5 before:w-full first:before:hidden ${lineColor} ${textColor}`}
          >
            <i
              className={`relative z-[1] grid size-5 place-items-center rounded-full not-italic ${circle}`}
            >
              {isDone && (
                <Icon
                  name="check"
                  className={`text-sm ${isEnded ? 'text-subtle' : 'text-ink'}`}
                />
              )}
            </i>
            {name}
          </li>
        );
      })}
    </ol>
  );
}

/** 확인 칸: 요청 취소는 사유 칩, 나머지는 한 번 더 확인 */
function ConfirmPanel({ ask, isPending, onClose, onConfirm }) {
  const [reasonIndex, setReasonIndex] = useState(0);
  const [etcReason, setEtcReason] = useState('');
  const [isEtcInvalid, setIsEtcInvalid] = useState(false);
  const etcRef = useRef(null);
  const confirmRef = useRef(null);
  const isEtc = ask.hasReasons && CANCEL_REASONS[reasonIndex] === OTHER_REASON;

  useEffect(() => {
    if (isEtc) etcRef.current?.focus();
    else confirmRef.current?.focus();
  }, [isEtc]);

  const handleConfirm = () => {
    if (!ask.hasReasons) {
      onConfirm();
      return;
    }
    const reason = isEtc ? etcReason.trim() : CANCEL_REASONS[reasonIndex];
    if (!reason) {
      setIsEtcInvalid(true);
      etcRef.current?.focus();
      return;
    }
    onConfirm(reason);
  };

  return (
    <div
      role="group"
      aria-label={ask.title}
      className="mt-2.5 rounded-card border border-line bg-white p-3.5"
    >
      <b className="block font-semibold text-ink">{ask.title}</b>
      {ask.description && (
        <p className="mt-0.5 text-sm text-muted">{ask.description}</p>
      )}
      {ask.hasReasons && (
        <>
          <div
            role="radiogroup"
            aria-label="취소 사유"
            className="mt-2.5 flex flex-wrap gap-1.5"
          >
            {CANCEL_REASONS.map((reason, index) => (
              <label
                key={reason}
                className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium ${
                  index === reasonIndex
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-input-line bg-white text-ink-2 hover:bg-surface-2'
                }`}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  className="sr-only"
                  checked={index === reasonIndex}
                  onChange={() => {
                    setReasonIndex(index);
                    setIsEtcInvalid(false);
                  }}
                />
                {reason}
              </label>
            ))}
          </div>
          {isEtc && (
            <input
              ref={etcRef}
              aria-label="취소 사유 직접 입력"
              aria-invalid={isEtcInvalid}
              maxLength={OTHER_REASON_MAX_LENGTH}
              placeholder={`사유를 입력해 주세요 (${OTHER_REASON_MAX_LENGTH}자)`}
              className="mt-2 h-11 w-full rounded-md border border-input-line px-3.5 outline-none focus:border-brand-500 aria-invalid:border-danger"
              value={etcReason}
              onChange={(event) => {
                setEtcReason(event.target.value);
                setIsEtcInvalid(false);
              }}
            />
          )}
        </>
      )}
      <div className="mt-3 flex justify-end gap-1.5">
        <button
          type="button"
          className={`${BUTTON_BASE} ${BUTTON_VARIANT.secondary} h-10 min-w-24 px-4 max-[760px]:h-11 max-[760px]:flex-1`}
          onClick={onClose}
        >
          닫기
        </button>
        <button
          ref={confirmRef}
          type="button"
          disabled={isPending}
          className={`${BUTTON_BASE} ${
            ask.isDanger ? BUTTON_VARIANT.danger : BUTTON_VARIANT.primary
          } h-10 min-w-24 px-4 max-[760px]:h-11 max-[760px]:flex-1`}
          onClick={handleConfirm}
        >
          {ask.confirmLabel}
        </button>
      </div>
    </div>
  );
}

const ACT_TONE = {
  todo: 'bg-[#f9eaa6] [&_.icon]:text-ink text-ink',
  done: 'bg-[#ebf3ee] [&_.icon]:text-[#2f6f57]',
  end: '[&_.icon]:text-placeholder',
  '': '',
};

export default function CareDealCard({ room }) {
  const { otoChatRoomSn, mtchDlngSttsCd: stage, myRole } = room;
  const [isOpen, setIsOpen] = useState(false);
  const [askKey, setAskKey] = useState(null);
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const dealAction = useDealAction(otoChatRoomSn);
  const sendMessage = useSendChatMessage(otoChatRoomSn);
  const guide = getDealGuide(stage, myRole);
  const mainAction = guide.actions.find(
    (action) => action.variant === 'primary',
  );
  const otherActions = guide.actions.filter((action) => action !== mainAction);
  const ask = askKey ? DEAL_ASKS[askKey] : null;
  const isPending = dealAction.isPending || sendMessage.isPending;

  /** 펼침은 바깥을 누르거나 Esc로 접힌다(확인 칸이 열려 있으면 유지) */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (askKey === null && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      setAskKey(null);
      toggleRef.current?.focus();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, askKey]);

  /** 확인 칸이 있는 버튼은 칸을 열고, 나머지는 바로 요청 */
  const handleAction = (key) => {
    if (DEAL_ASKS[key]) {
      setAskKey(key);
      setIsOpen(true);
      return;
    }
    if (!isPending) dealAction.mutate(key);
  };

  const handleConfirm = async (reason) => {
    if (isPending) return;
    try {
      await dealAction.mutateAsync(ask.action);
    } catch {
      return;
    }
    /** 요청 취소 사유는 내 채팅 메시지로 남는다 (화면설계서 SCR-CMU-005-03 ②) */
    if (reason) {
      sendMessage.mutate({
        msgTypeCd: MSG_TYPE.TEXT,
        msgCn: reason,
        tagCn: '요청 취소',
        idmptDmndId: crypto.randomUUID(),
      });
    }
  };

  return (
    <section
      ref={rootRef}
      aria-label="돌봄 거래"
      className="relative z-[15] shrink-0 border-b border-line bg-white"
    >
      <div
        className={`flex min-h-16 items-center gap-2.5 py-2.5 pr-1.5 pl-4 transition-colors max-[520px]:pl-3.5 ${
          mainAction ? 'bg-[#f9eaa6]' : ''
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5">
            <DealBadge stage={stage} />
            <span className="truncate text-sm font-semibold text-ink max-[520px]:hidden">
              {room.pstTtl}
            </span>
          </p>
          <p
            className={`mt-0.5 text-sm max-[520px]:line-clamp-2 min-[521px]:truncate ${
              mainAction ? 'font-semibold text-ink' : 'text-muted'
            }`}
          >
            {room.chatRoomSttsCd === 'OPEN'
              ? guide.title
              : '대화가 종료된 채팅방이에요'}
          </p>
        </div>
        {mainAction && !isOpen && room.chatRoomSttsCd === 'OPEN' && (
          <DealButton
            action={mainAction}
            isSmall
            isPending={isPending}
            onClick={handleAction}
          />
        )}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="deal-more"
          aria-label={`거래 정보 ${isOpen ? '접기' : '펼치기'}`}
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-3"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setAskKey(null);
          }}
        >
          <Icon
            name="expand_more"
            className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          id="deal-more"
          className="absolute inset-x-0 top-full max-h-[min(70vh,520px)] overflow-y-auto border-b border-line bg-white px-4 pt-1 pb-4 shadow-[0_12px_24px_-12px_rgba(26,50,52,0.25)]"
        >
          <p className="text-sm text-subtle">
            {myRole === ROLE.OWNER
              ? '내가 올린 돌봄 글'
              : '내가 지원한 돌봄 글'}
          </p>
          <a
            className="mt-1 block truncate font-semibold text-ink hover:text-brand-600"
            href={generatePath(PATHS.COMMUNITY_PETCARE_DETAIL, {
              petPrtcRcrtSn: room.petPrtcRcrtSn,
            })}
            target="_blank"
            rel="noopener"
          >
            {room.pstTtl}
          </a>
          <p className="mt-0.5 text-sm text-muted">{room.rcrtSummary}</p>

          <StepList stage={stage} />

          <div
            className={`mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-card bg-surface-2 py-3 pr-3 pl-3.5 ${ACT_TONE[guide.tone]}`}
          >
            <Icon name={guide.icon} className="text-[22px] text-subtle" />
            <p className="min-w-0 flex-1 text-sm leading-normal text-muted">
              <b className="block text-base font-semibold text-ink">
                {guide.title}
              </b>
              {guide.description}
            </p>
            {!ask && guide.actions.length > 0 && (
              <div className="flex shrink-0 flex-wrap gap-1.5 max-[760px]:w-full max-[760px]:*:flex-1">
                {otherActions.map((action) => (
                  <DealButton
                    key={action.key}
                    action={action}
                    isPending={isPending}
                    onClick={handleAction}
                  />
                ))}
                {mainAction && (
                  <DealButton
                    action={mainAction}
                    isPending={isPending}
                    onClick={handleAction}
                  />
                )}
              </div>
            )}
          </div>

          {ask && (
            <ConfirmPanel
              ask={ask}
              isPending={isPending}
              onClose={() => {
                setAskKey(null);
                setIsOpen(false);
                toggleRef.current?.focus();
              }}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      )}
    </section>
  );
}
