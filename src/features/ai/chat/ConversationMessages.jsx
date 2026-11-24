import { Image as ImageIcon } from 'lucide-react';
import ActionCard from './ActionCard';
import AnswerBubble from './AnswerBubble';
import { messageTypingKey } from './useTypewriter';
import FallbackBubble from './FallbackBubble';
import { CALENDAR_TOOLS } from './actionForm';
import { AI_ROLE } from '../shared/aiCodes';
import { FALLBACK_MESSAGE, FAQ_FAIL_COUNT } from '../shared/fallbackCount';

/** 사진 턴 사용자 메시지 머리(image-intent가 `[사진] <글>`로 저장) */
const PHOTO_PREFIX = '[사진]';

/** 사진 턴 내 메시지: 이번에 보낸 사진이면 미리보기, 다시 연 방이면 사진 표시 + 함께 보낸 글 */
function PhotoMessage({ text, previewUrl }) {
  const caption = text.slice(PHOTO_PREFIX.length).trim();
  return (
    <div className="flex flex-col items-end gap-2">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="보낸 사진"
          width="160"
          height="120"
          className="h-[120px] w-40 rounded-[10px] border border-line object-cover"
        />
      ) : (
        <p className="flex h-8 items-center gap-1 rounded-full border border-line bg-white px-3 text-sm leading-[1.25] tracking-[-0.03em] text-subtle">
          <ImageIcon aria-hidden="true" className="size-4" />
          사진
        </p>
      )}
      {caption && (
        <p className="max-w-[592px] whitespace-pre-wrap rounded-[18px_4px_18px_18px] border border-fab-line bg-accent-300 px-4 py-3 text-[15px] leading-relaxed text-ink">
          {caption}
        </p>
      )}
    </div>
  );
}

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

/**
 * 글자 펼치기 대상: 방금(30초 안) 저장된 마지막 AI 메시지. 지난 방을 다시 열면 바로 전체
 * - 말풍선이 처음 그려질 때 한 번만 정한다(useTypewriter가 첫 값만 씀)
 * - 마지막 메시지만: 답변 말풍선이 보여 준 뒤 다음 전송 때 목록에 다시 나타나는 지난 답변은 펼치지 않는다
 * - 이 창에서 이미 펼친 메시지는 방을 다시 열어도 바로 전체(memoKey, 사람 요청 2026-11-24 "처음 보여질 때만")
 */
const TYPING_RECENT_MS = 30 * 1000;

const isRecent = (regDt) => {
  const time = new Date(regDt).getTime();
  return Number.isFinite(time) && Date.now() - time < TYPING_RECENT_MS;
};

/**
 * 저장된 메시지 목록
 * - avatarPet: AI 말풍선 얼굴로 쓸 방 태그 반려동물(없으면 기본 강아지 얼굴)
 */
export default function ConversationMessages({
  messages,
  fallbackCount,
  actionCards = [],
  latestCardKey,
  photoPreviews = {},
  isChoiceDisabled = false,
  onRegenerate,
  onChoosePet,
  onConfirmAction,
  onCancelAction,
  onChangeAction,
  onRetryAction,
  avatarPet,
  children,
}) {
  const lastSn = messages.at(-1)?.aiCnvrsMsgSn;
  const { replaced, after, atEnd, afterChildren } = placeCards(
    messages,
    actionCards,
  );

  /** 케어 캘린더 바로가기: 등록 도구 결과가 방금 저장된 마지막 메시지일 때만(FN-AIM-012-15) */
  const renderCard = (item) => (
    <li key={`card-${item.key}`} className="empty:hidden">
      <ActionCard
        item={item}
        isActive={item.key === latestCardKey}
        hasCalendarLink={
          CALENDAR_TOOLS.includes(item.card.tool) &&
          item.resultMsgSn != null &&
          item.resultMsgSn === lastSn
        }
        isChoiceDisabled={isChoiceDisabled}
        onChoosePet={onChoosePet}
        onConfirm={() => onConfirmAction(item.key)}
        onCancel={() => onCancelAction(item.key)}
        onChangeInput={(patch) => onChangeAction(item.key, patch)}
        onRetrySave={() => onRetryAction(item.key)}
        avatarPet={avatarPet}
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
            avatarPet={avatarPet}
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
            isTyping={
              message.aiCnvrsMsgSn === lastSn && isRecent(message.regDt)
            }
            memoKey={messageTypingKey(message.aiCnvrsMsgSn)}
            onRegenerate={
              isIncomplete && message.aiCnvrsMsgSn === lastSn
                ? () => onRegenerate(message)
                : undefined
            }
            avatarPet={avatarPet}
          />
        </li>
      );
    }
    if (message.cnvrsCn.startsWith(PHOTO_PREFIX)) {
      return (
        <li key={message.aiCnvrsMsgSn}>
          <PhotoMessage
            text={message.cnvrsCn}
            previewUrl={photoPreviews[message.aiCnvrsMsgSn]}
          />
        </li>
      );
    }
    return (
      <li key={message.aiCnvrsMsgSn} className="flex justify-end">
        <p className="max-w-[592px] whitespace-pre-wrap rounded-[18px_4px_18px_18px] border border-fab-line bg-accent-300 px-4 py-3 text-[15px] leading-relaxed text-ink">
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
