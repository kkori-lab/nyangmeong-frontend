import ActionCard from './ActionCard';
import AnswerBubble from './AnswerBubble';
import FallbackBubble from './FallbackBubble';
import RegisterCard from './RegisterCard';
import { AI_ROLE } from '../shared/aiCodes';
import { FALLBACK_MESSAGE, FAQ_FAIL_COUNT } from '../shared/fallbackCount';

/**
 * 등록 카드·확인 카드 자리: 서버에 저장되지 않아 번호 없음
 * - 결과 요약이 저장됐으면 그 메시지 자리, 아니면 카드를 부른 내 메시지(afterSn보다 큰 첫 사용자 메시지) 뒤
 * - 그 메시지를 아직 받지 못했으면 목록 끝
 * - anchorSn이 있으면(검색 답변 끝에 온 확인 카드) 그 AI 메시지 뒤, 그 메시지가 아직 답변 말풍선이면 말풍선 뒤(afterChildren)
 */
const placeCards = (messages, registerCards) => {
  const replaced = new Map();
  const after = new Map();
  const atEnd = [];
  const afterChildren = [];
  registerCards.forEach((registerCard) => {
    if (
      messages.some(
        (message) => message.aiCnvrsMsgSn === registerCard.resultMsgSn,
      )
    ) {
      replaced.set(registerCard.resultMsgSn, registerCard);
      return;
    }
    const anchor =
      registerCard.anchorSn != null
        ? messages.find(
            (message) => message.aiCnvrsMsgSn === registerCard.anchorSn,
          )
        : messages.find(
            (message) =>
              message.roleCd === AI_ROLE.USER &&
              message.aiCnvrsMsgSn > registerCard.afterSn,
          );
    if (!anchor) {
      (registerCard.anchorSn != null ? afterChildren : atEnd).push(
        registerCard,
      );
      return;
    }
    after.set(anchor.aiCnvrsMsgSn, [
      ...(after.get(anchor.aiCnvrsMsgSn) ?? []),
      registerCard,
    ]);
  });
  return { replaced, after, atEnd, afterChildren };
};

/** 저장된 메시지 목록 */
export default function ConversationMessages({
  messages,
  fallbackCount,
  registerCards,
  actionCards = [],
  latestCardKey,
  isRegisterBusy,
  hasRegisterError,
  onRegenerate,
  onConfirmRegister,
  onCancelRegister,
  onChangeAction,
  onConfirmAction,
  onCancelAction,
  onRetryAction,
  children,
}) {
  const lastSn = messages.at(-1)?.aiCnvrsMsgSn;
  /** 두 카드는 같은 번호(key)를 써서 받은 순서대로 */
  const cards = [
    ...registerCards.map((item) => ({ ...item, kind: 'register' })),
    ...actionCards.map((item) => ({ ...item, kind: 'action' })),
  ].sort((a, b) => a.key - b.key);
  const { replaced, after, atEnd, afterChildren } = placeCards(messages, cards);

  const renderActionCard = (item) => (
    <li key={`card-${item.key}`}>
      <ActionCard
        item={item}
        isActive={item.key === latestCardKey}
        onChange={(field, input) => onChangeAction(item.key, field, input)}
        onConfirm={() => onConfirmAction(item.key)}
        onCancel={() => onCancelAction(item.key)}
        onRetrySave={() => onRetryAction(item.key)}
      />
    </li>
  );

  const renderCard = (registerCard) =>
    registerCard.kind === 'action' ? (
      renderActionCard(registerCard)
    ) : (
      <li key={`card-${registerCard.key}`}>
        <RegisterCard
          card={registerCard.card}
          status={registerCard.status}
          resultText={registerCard.resultText}
          isActive={registerCard.key === latestCardKey}
          isBusy={isRegisterBusy}
          hasError={hasRegisterError}
          hasCalendarLink={registerCard.resultMsgSn === lastSn}
          onConfirm={() => onConfirmRegister(registerCard.key)}
          onCancel={() => onCancelRegister(registerCard.key)}
        />
      </li>
    );

  const renderMessage = (message) => {
    if (
      message.roleCd !== AI_ROLE.USER &&
      message.cnvrsCn === FALLBACK_MESSAGE
    ) {
      return (
        <li key={message.aiCnvrsMsgSn}>
          <FallbackBubble
            text={message.cnvrsCn}
            hasActions={message.aiCnvrsMsgSn === lastSn}
            hasFaqGuide={fallbackCount >= FAQ_FAIL_COUNT}
          />
        </li>
      );
    }
    if (message.roleCd !== AI_ROLE.USER) {
      const isIncomplete = message.cmptnYn === false;
      return (
        <li key={message.aiCnvrsMsgSn}>
          <AnswerBubble
            status={isIncomplete ? 'incomplete' : 'done'}
            text={message.cnvrsCn}
            onRegenerate={
              isIncomplete && message.aiCnvrsMsgSn === lastSn
                ? () => onRegenerate(message)
                : undefined
            }
          />
        </li>
      );
    }
    return (
      <li key={message.aiCnvrsMsgSn} className="flex justify-end">
        <p className="max-w-[592px] whitespace-pre-wrap rounded-[18px_4px_18px_18px] border border-[#e8d27e] bg-[#f9eaa6] px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]">
          {message.cnvrsCn}
        </p>
      </li>
    );
  };

  return (
    <ul className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
      {messages.map((message) => {
        const resultCard = replaced.get(message.aiCnvrsMsgSn);
        return [
          resultCard ? renderCard(resultCard) : renderMessage(message),
          ...(after.get(message.aiCnvrsMsgSn) ?? []).map(renderCard),
        ];
      })}
      {atEnd.map(renderCard)}
      {children && <li>{children}</li>}
      {afterChildren.map(renderCard)}
    </ul>
  );
}
