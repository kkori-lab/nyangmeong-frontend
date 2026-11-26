/**
 * [거래 카드]
 * - 채팅방 위 한 줄 바(상태·글 제목·지금 할 일·내 차례 버튼)와 펼침(글 정보·5단계·확인 칸) (FN-CMU-005-06~11)
 * - 되돌릴 수 없는 단계는 카드 안 확인 칸에서 한 번 더 확인. 단계가 바뀌면 key로 새로 그려 접힘
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { useCareMatch, useDealAction } from '../queries';
import {
  MTCH_STTS,
  RCRT_STTS_RECRUITING,
  ROOM_STTS,
  getDealCancelState,
  isDealCancelRequesting,
} from '../shared/chatCodes';
import DealBadge from './DealBadge';
import {
  CANCEL_REASONS,
  DEAL_ASKS,
  DEAL_STEPS,
  OTHER_REASON,
  OTHER_REASON_MAX_LENGTH,
  getDealCancelGuide,
  getDealGuide,
  getStepProgress,
} from './dealSteps';

const BUTTON_BASE =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border text-sm font-medium disabled:cursor-not-allowed';
const BUTTON_VARIANT = {
  primary:
    'border-transparent bg-brand-500 text-white hover:enabled:bg-brand-600 disabled:bg-surface-3 disabled:text-line-strong',
  secondary:
    'border-line bg-white hover:enabled:border-line-strong hover:enabled:bg-surface-2 disabled:border-transparent disabled:bg-surface-3 disabled:text-line-strong',
  danger:
    'border-transparent bg-danger text-white hover:enabled:bg-danger-600 disabled:bg-surface-3 disabled:text-line-strong',
};

/** isBlocked: 상대가 나간 방이면 매칭 요청 버튼을 막는다(서버도 409 CARE_MATCH_COUNTERPART_LEFT) */
function DealButton({
  action,
  isSmall = false,
  isPending,
  isBlocked = false,
  onClick,
}) {
  const size = isSmall ? 'h-9 px-3.5' : 'h-10 min-w-24 px-4';

  return (
    <button
      type="button"
      className={`${BUTTON_BASE} ${BUTTON_VARIANT[action.variant]} ${size}`}
      disabled={isPending || (isBlocked && action.key === 'request')}
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
      className="mt-3.5 grid grid-cols-5 text-sm max-[390px]:text-[13px]"
    >
      {DEAL_STEPS.map((name, index) => {
        const step = index + 1;
        const isDone = step <= doneCount;
        const isNow = step === current;
        const lineColor =
          isEnded || !(isDone || isNow)
            ? 'before:bg-line'
            : 'before:bg-fab-line';
        let circle =
          'bg-white shadow-[inset_0_0_0_2px_var(--color-line-strong)]';
        if (isDone) {
          circle = isEnded
            ? 'bg-surface-3 shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
            : 'bg-accent-300 shadow-[inset_0_0_0_1px_var(--color-fab-line)]';
        } else if (isNow) {
          circle =
            'bg-white shadow-[inset_0_0_0_2px_var(--color-fab-line),0_0_0_4px_var(--color-accent-300)]';
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

const CST_UNIT_LABEL = { PCAC0004: '시급', PCAC0005: '건당' };

/** "2026-11-07T10:00:00" → "11.07 10:00" */
const formatShortDt = (dt) =>
  `${dt.slice(5, 7)}.${dt.slice(8, 10)} ${dt.slice(11, 16)}`;

/** 합의 조건 한 줄: 일정 · 비용 (매칭 조회 cnd) */
const formatCondition = (cnd) => {
  const schedule =
    cnd.acrdPrtcBgngDt && cnd.acrdPrtcEndDt
      ? `${formatShortDt(cnd.acrdPrtcBgngDt)} ~ ${formatShortDt(cnd.acrdPrtcEndDt)}`
      : '일정 협의';
  const cost =
    `${CST_UNIT_LABEL[cnd.cstUnitCd] ?? ''} ${cnd.acrdCstAmt.toLocaleString('ko-KR')}원`.trim();
  return `${schedule} · ${cost}`;
};

const ACT_TONE = {
  todo: 'bg-accent-300 [&_.icon]:text-ink text-ink',
  done: 'bg-tone-green-bg [&_.icon]:text-ok',
  end: '[&_.icon]:text-placeholder',
  '': '',
};

export default function CareDealCard({ room }) {
  const { mtchDlngSttsCd: stage, myRole } = room;
  const [isOpen, setIsOpen] = useState(false);
  const [askKey, setAskKey] = useState(null);
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const dealAction = useDealAction(room);
  const { data: careMatch } = useCareMatch(room.petPrtcMtchSn);
  const isActiveRoom = room.chatRoomSttsCd === ROOM_STTS.ACTIVE;
  const guide = getDealCancelGuide(room) ??
    getDealGuide(stage, myRole, room.rcrtSttsCd === RCRT_STTS_RECRUITING);
  const isCancelRequesting = isDealCancelRequesting(room);
  /** 상대가 동의해 거래가 취소된 방: 방이 읽기 전용이어도 취소 안내와 구분되는 배지를 보인다 */
  const isDealCanceled =
    getDealCancelState(room) === 'approved' && stage === MTCH_STTS.CANCELED;
  const mainAction = guide.actions.find(
    (action) => action.variant === 'primary',
  );
  const otherActions = guide.actions.filter((action) => action !== mainAction);
  const ask = askKey ? DEAL_ASKS[askKey] : null;
  const { isPending } = dealAction;

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
    if (!isPending) dealAction.mutate({ action: key });
  };

  const handleConfirm = (reason) => {
    if (isPending) return;
    /** 요청 취소 사유는 서버가 상태 이력과 채팅 시스템 안내에 남긴다 */
    dealAction.mutate({ action: ask.action, cnclRsn: reason });
  };

  return (
    <section
      ref={rootRef}
      aria-label="돌봄 거래"
      className="@container relative z-[15] shrink-0 border-b border-line bg-white"
    >
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 py-1.5 pr-1.5 pl-4 transition-colors max-[390px]:pl-3.5 ${
          mainAction ? 'bg-accent-300' : ''
        }`}
      >
        <p className="order-1 flex min-w-0 flex-1 items-center gap-2">
          {isCancelRequesting && (
            <DealBadge label="취소 요청중" tone="amber" />
          )}
          {isDealCanceled && <DealBadge label="거래 취소" tone="gray" />}
          {!isCancelRequesting && !isDealCanceled && (
            <DealBadge stage={stage} />
          )}
          <span
            className={`min-w-0 text-sm @max-[559px]:line-clamp-2 @min-[560px]:truncate ${
              mainAction ? 'font-semibold text-ink' : 'text-muted'
            }`}
          >
            {isActiveRoom || isDealCanceled
              ? guide.title
              : '대화가 종료된 채팅방이에요'}
          </span>
        </p>
        {mainAction && !isOpen && isActiveRoom && (
          <div className="order-3 w-full pr-1.5 pb-1 *:w-full @min-[560px]:order-2 @min-[560px]:w-auto @min-[560px]:pr-0 @min-[560px]:pb-0 @min-[560px]:*:w-auto">
            <DealButton
              action={mainAction}
              isSmall
              isPending={isPending}
              isBlocked={room.ctptLeft}
              onClick={handleAction}
            />
          </div>
        )}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="deal-more"
          aria-label={`거래 정보 ${isOpen ? '접기' : '펼치기'}`}
          className="order-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-3 @min-[560px]:order-3"
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
          className="absolute inset-x-0 top-full max-h-[min(70vh,520px)] overflow-y-auto border-b border-line bg-white px-4 pt-3 pb-4 shadow-[0_12px_24px_-12px_rgba(26,50,52,0.25)]"
        >
          {careMatch && (
            <p className="text-sm text-muted tabular-nums">
              {formatCondition(careMatch.cnd)}
            </p>
          )}

          <StepList stage={stage} />

          <div
            className={`mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-card bg-surface-2 py-3 pr-3 pl-3.5 ${ACT_TONE[guide.tone]}`}
          >
            <p className="min-w-0 flex-1 text-sm leading-normal text-muted @max-[559px]:basis-full">
              {guide.description}
            </p>
            {!ask && guide.actions.length > 0 && (
              <div className="flex shrink-0 flex-wrap gap-1.5 @max-[559px]:w-full @max-[559px]:*:flex-1">
                {otherActions.map((action) => (
                  <DealButton
                    key={action.key}
                    action={action}
                    isPending={isPending}
                    isBlocked={room.ctptLeft}
                    onClick={handleAction}
                  />
                ))}
                {mainAction && (
                  <DealButton
                    action={mainAction}
                    isPending={isPending}
                    isBlocked={room.ctptLeft}
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
