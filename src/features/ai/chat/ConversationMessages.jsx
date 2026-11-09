import ActionCard from './ActionCard';
import AnswerBubble from './AnswerBubble';
import FallbackBubble from './FallbackBubble';
import { CALENDAR_TOOLS } from './actionForm';
import { AI_ROLE } from '../shared/aiCodes';
import { FALLBACK_MESSAGE, FAQ_FAIL_COUNT } from '../shared/fallbackCount';

/**
 * 확인 카드 자리: 서버에 저장되지 않아 번호 없음
 * - 결과 요약이 저장됐으면 그 메시지 자리, 아니면 카드를 부른 내 메시지(afterSn보다 큰 첫 사용자 메시지) 뒤
 * - 그 메시지를 아직 받지 못했으면 목록 끝
 * - anchorSn이 있으면(검색 답변 끝에 온 확인 카드) 그 AI 메시지 뒤, 그 메시지가 아직 답변 말풍선이면 말풍선 뒤(afterChildren)
 */
const placeCards = (messages, cards) => {
  const replaced = new Map();
  const after = new Map();
  const atEnd = [];
  const afterChildren = [];
  cards.forEach((card) => {
    if (messages.some((message) => message.aiCnvrsMsgSn === card.resultMsgSn)) {
      replaced.set(card.resultMsgSn, card);
      return;
    }
    const anchor =
      card.anchorSn != null
        ? messages.find((message) => message.aiCnvrsMsgSn === card.anchorSn)
        : messages.find(
            (message) =>
              message.roleCd === AI_ROLE.USER &&
              message.aiCnvrsMsgSn > card.afterSn,
          );
    if (!anchor) {
      (card.anchorSn != null ? afterChildren : atEnd).push(card);
      return;
    }
    after.set(anchor.aiCnvrsMsgSn, [
      ...(after.get(anchor.aiCnvrsMsgSn) ?? []),
      card,
    ]);
  });
  return { replaced, after, atEnd, afterChildren };
};

/** 저장된 메시지 목록 */
export default function ConversationMessages({
  messages,
  fallbackCount,
  actionCards = [],
  latestCardKey,
  onRegenerate,
  onChangeAction,
  onConfirmAction,
  onCancelAction,
  onRetryAction,
  children,
}) {
  const lastSn = messages.at(-1)?.aiCnvrsMsgSn;
  const { replaced, after, atEnd, afterChildren } = placeCards(
    messages,
    actionCards,
  );

  /** 케어 캘린더 바로가기: 등록 도구 결과가 방금 저장된 마지막 메시지일 때만(FN-AIM-012-15) */
  const renderCard = (item) => (
    <li key={`card-${item.key}`}>
      <ActionCard
        item={item}
        isActive={item.key === latestCardKey}
        hasCalendarLink={
          CALENDAR_TOOLS.includes(item.card.tool) &&
          item.resultMsgSn != null &&
          item.resultMsgSn === lastSn
        }
        onChange={(field, input) => onChangeAction(item.key, field, input)}
        onConfirm={() => onConfirmAction(item.key)}
        onCancel={() => onCancelAction(item.key)}
        onRetrySave={() => onRetryAction(item.key)}
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
