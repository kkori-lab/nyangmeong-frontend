import AnswerBubble from './AnswerBubble';
import FallbackBubble from './FallbackBubble';
import RegisterCard from './RegisterCard';
import { AI_ROLE } from '../shared/aiCodes';
import { FALLBACK_MESSAGE, FAQ_FAIL_COUNT } from '../shared/fallbackCount';

/**
 * 등록 카드 자리: 서버에 저장되지 않아 번호 없음
 * - 결과 요약이 저장됐으면 그 메시지 자리, 아니면 카드를 부른 내 메시지(afterSn보다 큰 첫 사용자 메시지) 뒤
 * - 그 메시지를 아직 받지 못했으면 목록 끝
 */
const placeCards = (messages, registerCards) => {
  const replaced = new Map();
  const after = new Map();
  const atEnd = [];
  registerCards.forEach((registerCard) => {
    if (
      messages.some(
        (message) => message.aiCnvrsMsgSn === registerCard.resultMsgSn,
      )
    ) {
      replaced.set(registerCard.resultMsgSn, registerCard);
      return;
    }
    const anchor = messages.find(
      (message) =>
        message.roleCd === AI_ROLE.USER &&
        message.aiCnvrsMsgSn > registerCard.afterSn,
    );
    if (!anchor) {
      atEnd.push(registerCard);
      return;
    }
    after.set(anchor.aiCnvrsMsgSn, [
      ...(after.get(anchor.aiCnvrsMsgSn) ?? []),
      registerCard,
    ]);
  });
  return { replaced, after, atEnd };
};

/** 저장된 메시지 목록 */
export default function ConversationMessages({
  messages,
  fallbackCount,
  registerCards,
  latestCardKey,
  isRegisterBusy,
  hasRegisterError,
  onRegenerate,
  onConfirmRegister,
  onCancelRegister,
  children,
}) {
  const lastSn = messages.at(-1)?.aiCnvrsMsgSn;
  const { replaced, after, atEnd } = placeCards(messages, registerCards);

  const renderCard = (registerCard) => (
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
    </ul>
  );
}
