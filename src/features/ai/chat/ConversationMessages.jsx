import AnswerBubble from './AnswerBubble';
import FallbackBubble from './FallbackBubble';
import RegisterCard from './RegisterCard';
import { AI_ROLE } from '../shared/aiCodes';
import { FALLBACK_MESSAGE, FAQ_FAIL_COUNT } from '../shared/fallbackCount';

const INCOMPLETE = 'N';

/** 저장된 메시지 목록 */
export default function ConversationMessages({
  messages,
  fallbackCount,
  registerCards,
  latestCardSn,
  isRegisterBusy,
  hasRegisterError,
  onRegenerate,
  onConfirmRegister,
  onCancelRegister,
  children,
}) {
  const lastSn = messages.at(-1)?.aiCnvrsMsgSn;

  return (
    <ul className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
      {messages.map((message) => {
        const registerCard = registerCards[message.aiCnvrsMsgSn];
        if (registerCard) {
          return (
            <li key={message.aiCnvrsMsgSn}>
              <RegisterCard
                card={registerCard.card}
                status={registerCard.status}
                resultText={registerCard.resultText}
                isActive={message.aiCnvrsMsgSn === latestCardSn}
                isBusy={isRegisterBusy}
                hasError={hasRegisterError}
                hasCalendarLink={message.aiCnvrsMsgSn === lastSn}
                onConfirm={() => onConfirmRegister(message.aiCnvrsMsgSn)}
                onCancel={() => onCancelRegister(message.aiCnvrsMsgSn)}
              />
            </li>
          );
        }
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
          const isIncomplete = message.aiCnvrsMsgCmptnYn === INCOMPLETE;
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
      })}
      {children && <li>{children}</li>}
    </ul>
  );
}
