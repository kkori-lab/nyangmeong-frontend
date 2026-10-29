import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatInput from '@/features/ai/chat/ChatInput';
import Skeleton from '@/components/Skeleton';
import ConversationHeader, {
  DrawerButton,
  chatHeaderClass,
} from '@/features/ai/chat/ConversationHeader';
import ConversationMessages from '@/features/ai/chat/ConversationMessages';
import AnswerBubble from '@/features/ai/chat/AnswerBubble';
import FallbackBubble from '@/features/ai/chat/FallbackBubble';
import ConversationSidebar from '@/features/ai/chat/ConversationSidebar';
import ReceiptAnalysisBubble from '@/features/ai/chat/ReceiptAnalysisBubble';
import { AI_ROLE } from '@/features/ai/shared/aiCodes';
import { fakePets } from '@/features/ai/chat/fakePets';
import {
  FALLBACK_MESSAGE,
  getFallbackCount,
  increaseFallbackCount,
  resetFallbackCount,
} from '@/features/ai/shared/fallbackCount';
import { toRoute } from '@/features/ai/shared/screenPaths';
import { openInMainWindow } from '@/features/ai/chat/openInMainWindow';
import { CARD_TYPE } from '@/features/ai/shared/registerCodes';
import {
  useCancelRegister,
  useConfirmRegister,
  useConversation,
} from '@/features/ai/queries';
import PetChoiceChips from '@/features/ai/chat/PetChoiceChips';
import useAnswerStream from '@/features/ai/chat/useAnswerStream';
import useChatReceipt from '@/features/ai/chat/useChatReceipt';
import RouteGuideBubble from '@/features/ai/chat/RouteGuideBubble';
import WelcomeMessage from '@/features/ai/chat/WelcomeMessage';
import { useMemberSummary } from '@/features/member/queries';
import useChatWindow from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';

/** 임시 반려동물 목록 */
const pets = fakePets;
const representativePet = pets.find((pet) => pet.rprsPetYn === 'Y');

/** 서버 메시지 중 가장 큰 번호(가짜 메시지는 음수) */
const lastServerSn = (messages) =>
  Math.max(0, ...messages.map((message) => message.aiCnvrsMsgSn));

/** 이 창에서 받은 등록 카드의 화면 키 */
let nextCardKey = 1;

/** 서버 저장 전 내 메시지 자리(서버 번호는 양수, 가짜는 음수) */
const PENDING_MSG_SN = 0;

/** 본창 건강 일지 결과 확인 모달: 파라미터 이름은 건강기록(JAJ)과 협의 전 제안값 */
const receiptResultPath = (recptSn) =>
  `${PATHS.HEALTH_DIARY}?recptSn=${recptSn}`;
/** 본창 건강 일지 검진기록 탭 + 검진기록 등록 모달 빈 폼 */
const manualCheckupPath = (recptSn) => {
  const params = new URLSearchParams({ checkup: 'manual' });
  if (recptSn) params.set('recptSn', String(recptSn));
  return `${PATHS.HEALTH_DIARY}?${params}#hlt002-exam`;
};

/** 판정이 영수증일 때 안내(저장 안 함): 이미지 첨부로만 분석한다 */
const RECEIPT_GUIDE = '영수증 사진을 첨부해 주세요.';

/** 별도 창 전체 화면 AI 채팅 */
export default function AiChatPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  /** 1100px 미만 대화 목록 drawer */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const [selectedPetSn, setSelectedPetSn] = useState(
    representativePet?.petSn ?? null,
  );
  /** 선택된 대화 번호 */
  const [selectedRoomSn, setSelectedRoomSn] = useState(null);
  /** 첫 메시지 */
  const [searchParams] = useSearchParams();
  const [firstMessage, setFirstMessage] = useState(() => searchParams.get('q'));

  const { data: member } = useMemberSummary();
  const { data: conversation, isError } = useConversation(selectedRoomSn);
  const confirmRegister = useConfirmRegister();
  const cancelRegister = useCancelRegister();
  const answer = useAnswerStream();
  const openChatWindow = useChatWindow();
  /** 영수증 파일 고르기 창 */
  const fileInputRef = useRef(null);
  const receipt = useChatReceipt({
    onAnalyzed: ({ aiCnvrsRoomSn }) => {
      setFirstMessage(null);
      setSelectedRoomSn(aiCnvrsRoomSn);
    },
  });
  /** 이동 안내 상태 */
  const [route, setRoute] = useState(null);
  /** 저장하지 않는 안내: 변환표에 없는 화면(fallback)·영수증 판정(receipt) */
  const [notice, setNotice] = useState(null);
  /** 보내기 전 마지막 서버 메시지 번호: 이보다 큰 내 메시지가 오면 임시 말풍선을 치운다 */
  const [pendingAfterSn, setPendingAfterSn] = useState(0);
  /**
   * 이번 화면에서 받은 미리보기 카드(서버에 저장 안 됨, 새로고침하면 사라짐)
   * - { key, card, afterSn(보내기 전 마지막 서버 메시지 번호), status, resultText, resultMsgSn }
   */
  const [registerCards, setRegisterCards] = useState([]);
  /** 다음 메시지에 실어 보낼 가장 최근 카드(되물음 포함) */
  const [draft, setDraft] = useState(null);
  /** 반려동물을 되묻는 칩 */
  const [petChoices, setPetChoices] = useState(null);
  /** 선택된 대화의 연속 실패 횟수 */
  const [fallbackCount, setFallbackCount] = useState(0);
  const isAnswering =
    answer.status === 'waiting' ||
    answer.status === 'streaming' ||
    answer.status === 'silent';
  /** 판정만 받았거나 스트림 전 오류면 말풍선 없음 */
  const hasAnswerBubble = !['idle', 'silent', 'failed'].includes(answer.status);
  /** 보낸 뒤 서버가 저장한 내 메시지가 아직 안 보이면 임시 말풍선 */
  const isPendingShown =
    Boolean(answer.pendingText) &&
    !(conversation?.messages ?? []).some(
      (message) =>
        message.roleCd === AI_ROLE.USER &&
        message.aiCnvrsMsgSn > pendingAfterSn,
    );
  const latestCardKey = registerCards.at(-1)?.key ?? null;

  /** 대화를 옮기거나 지울 때 카드·초안·칩 상태 초기화 */
  const resetRegister = () => {
    setRegisterCards([]);
    setDraft(null);
    setPetChoices(null);
    receipt.reset();
  };

  const selectedPet = pets.find((pet) => pet.petSn === selectedPetSn);

  /** 등록 판정의 카드: 되물음은 칩, 미리보기는 카드로 */
  const applyRegister = (aiCnvrsRoomSn, card, afterSn) => {
    setFallbackCount(resetFallbackCount(aiCnvrsRoomSn));
    if (!card) return;
    if (card.cardType === CARD_TYPE.ASK) {
      if (card.petChoices.length > 0) setPetChoices(card.petChoices);
      return;
    }
    setRegisterCards((prev) => [
      ...prev,
      {
        key: nextCardKey++,
        card,
        afterSn,
        status: 'pending',
        resultText: null,
        resultMsgSn: null,
      },
    ]);
  };

  /** 서버 판정별 화면 처리: 검색 답변은 말풍선이 맡는다, 등록이 아니면 초안을 버린다 */
  const handleResult = (result, afterSn) => {
    if (!result) return;
    const { aiCnvrsRoomSn, intent } = result;
    setDraft(intent.kind === 'REGISTER' ? result.card : null);
    if (intent.kind === 'ROUTE') {
      const nextRoute = toRoute(intent);
      if (nextRoute) {
        setRoute({ ...nextRoute, id: Date.now(), status: 'waiting' });
        setFallbackCount(resetFallbackCount(aiCnvrsRoomSn));
      } else {
        setNotice('fallback');
      }
    }
    if (intent.kind === 'FALLBACK') {
      setFallbackCount(increaseFallbackCount(aiCnvrsRoomSn));
    }
    if (intent.kind === 'REGISTER') {
      applyRegister(aiCnvrsRoomSn, result.card, afterSn);
    }
    if (intent.kind === 'RECEIPT') setNotice('receipt');
  };

  /** 메시지 전송: 가장 최근 카드를 초안으로 함께 보낸다 */
  const handleSend = async (cnvrsCn) => {
    setFirstMessage(null);
    setRoute(null);
    setNotice(null);
    setPetChoices(null);
    receipt.reset();
    const afterSn = lastServerSn(conversation?.messages ?? []);
    setPendingAfterSn(afterSn);
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      cnvrsCn,
      draft,
      onRoom: setSelectedRoomSn,
    });
    handleResult(result, afterSn);
  };

  /** [다시 시도]·[다시 생성]: 방의 마지막 사용자 메시지에 다시 답한다 */
  const handleAnswerAgain = async (replaceMsgSn) => {
    setRoute(null);
    setNotice(null);
    setPetChoices(null);
    /** 카드가 오면 마지막 사용자 메시지 뒤에 붙인다 */
    const lastUserSn =
      conversation?.messages.findLast(
        (message) => message.roleCd === AI_ROLE.USER,
      )?.aiCnvrsMsgSn ?? 0;
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      draft,
      replaceMsgSn,
    });
    handleResult(result, lastUserSn - 1);
  };

  /** 이미지 첨부 전송: 의도 분기 없이 영수증 분석, 1마리면 자동 선택 */
  const handleSendReceipt = (file, text) => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    setPetChoices(null);
    receipt.start({
      file,
      text,
      aiCnvrsRoomSn: selectedRoomSn,
      pet: selectedPet ?? (pets.length === 1 ? pets[0] : null),
    });
  };

  /** 실패 안내에서 다시 올리기 */
  const handleRetryReceipt = () => {
    receipt.reset();
    fileInputRef.current.click();
  };

  /** 등록·취소 결과를 카드에 반영: 결과 요약 메시지 자리로 옮기고 초안을 버린다 */
  const settleRegisterCard = (mutation, status, key) => {
    const target = registerCards.find(
      (registerCard) => registerCard.key === key,
    );
    mutation.mutate(
      { aiCnvrsRoomSn: selectedRoomSn, card: target.card },
      {
        onSuccess: ({ aiCnvrsMsgSn, cnvrsCn }) => {
          setDraft(null);
          setRegisterCards((prev) =>
            prev.map((registerCard) =>
              registerCard.key === key
                ? {
                    ...registerCard,
                    status,
                    resultText: cnvrsCn,
                    resultMsgSn: aiCnvrsMsgSn,
                  }
                : registerCard,
            ),
          );
        },
      },
    );
  };

  /** 검색 답변 완료 시 실패 횟수 초기화 */
  useEffect(() => {
    if (answer.status !== 'done') return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 답변 완료 시점에 맞춘 초기화 */
    setFallbackCount(resetFallbackCount(answer.aiCnvrsRoomSn));
  }, [answer.status, answer.aiCnvrsRoomSn]);

  /** 유예 종료 후 본창 이동 */
  const handleRouteElapsed = () => {
    if (route.isModal) {
      /** 팝업 차단 시 이 창을 채팅 화면으로 */
      if (openChatWindow()) {
        window.close();
      } else {
        window.location.href = PATHS.CHAT;
      }
    } else {
      openInMainWindow(route.path);
    }
  };

  /** 첫 메시지 전송: StrictMode가 effect를 정리했다 다시 돌리면(그때 답변 스트림도 취소) 예약을 지우고 새로 잡아 한 번만 보낸다 */
  useEffect(() => {
    if (!firstMessage) return;
    const timer = setTimeout(() => handleSend(firstMessage.slice(0, 1000)));
    return () => clearTimeout(timer);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 창을 연 직후 한 번만 전송 */
  }, []);

  /** 설정은 본창에서 열기 */
  const handleOpenSettings = () => {
    const opener = window.opener;
    if (opener && !opener.closed) {
      opener.location.href = PATHS.SETTINGS_NOTIFICATIONS;
      opener.focus();
    } else {
      window.open(PATHS.SETTINGS_NOTIFICATIONS, '_blank');
    }
  };

  const handleSelectRoom = (aiCnvrsRoomSn) => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    resetRegister();
    setFirstMessage(null);
    setSelectedRoomSn(aiCnvrsRoomSn);
    setFallbackCount(getFallbackCount(aiCnvrsRoomSn));
    setIsDrawerOpen(false);
  };

  const handleNewChat = () => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    resetRegister();
    setFirstMessage(null);
    setSelectedRoomSn(null);
    setFallbackCount(0);
    setIsDrawerOpen(false);
  };

  const openDrawer = () => setIsDrawerOpen(true);

  return (
    <div className="flex h-dvh bg-[#faf8f5] font-sans">
      <ConversationSidebar
        pets={pets}
        nickname={member?.mbrNcnm ?? ''}
        selectedPetSn={selectedPetSn}
        selectedRoomSn={selectedRoomSn}
        isCollapsed={isCollapsed}
        isDrawerOpen={isDrawerOpen}
        onTogglePanel={() => setIsCollapsed((prev) => !prev)}
        onOpenDrawer={openDrawer}
        onCloseDrawer={closeDrawer}
        onSelectPet={setSelectedPetSn}
        onSelectRoom={handleSelectRoom}
        onNewChat={handleNewChat}
        onOpenSettings={handleOpenSettings}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {selectedRoomSn === null && (
          <header className={chatHeaderClass}>
            <DrawerButton onClick={openDrawer} />
            <h1 className="text-lg font-bold text-[#1a3234] max-[760px]:text-base">
              새 대화
            </h1>
            <span className="shrink-0 rounded-full bg-[#e9f2f2] px-2.5 py-0.5 text-xs font-medium text-[#285a5c]">
              {selectedPet?.petNm ?? '전체'}
            </span>
          </header>
        )}
        {/** 방이 생겼거나 골랐는데 상세를 받기 전: 헤더 틀 유지 */}
        {selectedRoomSn !== null && !conversation && !isError && (
          <header className={chatHeaderClass}>
            <DrawerButton onClick={openDrawer} />
            <Skeleton className="h-6 w-48" />
          </header>
        )}
        {conversation && (
          <ConversationHeader
            conversation={conversation}
            onOpenDrawer={openDrawer}
            onNewChat={handleNewChat}
            onDeleted={() => {
              answer.reset();
              setRoute(null);
              setNotice(null);
              resetRegister();
              setSelectedRoomSn(null);
              setFallbackCount(0);
            }}
          />
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 max-[760px]:px-4 max-[760px]:py-5">
          {isError && (
            <p role="alert" className="text-center text-[#667374]">
              대화를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
            </p>
          )}
          {(conversation || receipt.receipt || isPendingShown) && (
            <ConversationMessages
              messages={[
                ...(conversation?.messages ?? []).filter(
                  (message) =>
                    !answer.hiddenMsgSns.includes(message.aiCnvrsMsgSn) &&
                    message.aiCnvrsMsgSn !==
                      receipt.receipt?.result?.aiCnvrsMsgSn,
                ),
                ...(isPendingShown
                  ? [
                      {
                        aiCnvrsMsgSn: PENDING_MSG_SN,
                        roleCd: AI_ROLE.USER,
                        cnvrsCn: answer.pendingText,
                      },
                    ]
                  : []),
              ]}
              fallbackCount={fallbackCount}
              registerCards={registerCards}
              latestCardKey={latestCardKey}
              isRegisterBusy={
                confirmRegister.isPending || cancelRegister.isPending
              }
              hasRegisterError={
                confirmRegister.isError || cancelRegister.isError
              }
              onRegenerate={(message) =>
                handleAnswerAgain(message.aiCnvrsMsgSn)
              }
              onConfirmRegister={(key) =>
                settleRegisterCard(confirmRegister, 'registered', key)
              }
              onCancelRegister={(key) =>
                settleRegisterCard(cancelRegister, 'cancelled', key)
              }
            >
              {hasAnswerBubble && (
                <AnswerBubble
                  status={answer.status}
                  text={answer.text}
                  shortcuts={answer.shortcuts}
                  onRetry={() => handleAnswerAgain()}
                  onRegenerate={() =>
                    handleAnswerAgain(answer.hiddenMsgSns.at(-1))
                  }
                />
              )}
              {notice === 'fallback' && (
                <FallbackBubble
                  text={FALLBACK_MESSAGE}
                  hasActions
                  hasFaqGuide={false}
                />
              )}
              {notice === 'receipt' && (
                <AnswerBubble status="done" text={RECEIPT_GUIDE} />
              )}
              {petChoices && (
                <PetChoiceChips
                  pets={petChoices}
                  isDisabled={isAnswering}
                  onSelect={handleSend}
                />
              )}
              {receipt.receipt && (
                <ReceiptAnalysisBubble
                  receipt={receipt.receipt}
                  pets={pets}
                  onChoosePet={receipt.choosePet}
                  onCancel={receipt.cancel}
                  onConfirm={() =>
                    openInMainWindow(
                      receiptResultPath(receipt.receipt.result.recptSn),
                    )
                  }
                  onDismiss={receipt.dismiss}
                  onRetry={handleRetryReceipt}
                  onManualInput={() =>
                    openInMainWindow(
                      manualCheckupPath(receipt.receipt.result?.recptSn),
                    )
                  }
                />
              )}
              {route && (
                <RouteGuideBubble
                  key={route.id}
                  label={route.label}
                  status={route.status}
                  onCancel={() => setRoute({ ...route, status: 'cancelled' })}
                  onElapsed={handleRouteElapsed}
                />
              )}
            </ConversationMessages>
          )}
          {selectedRoomSn === null &&
            !receipt.receipt &&
            !answer.pendingText && (
              <div className="flex min-h-full items-center justify-center">
                <WelcomeMessage
                  nickname={member?.mbrNcnm ?? ''}
                  petNm={selectedPet?.petNm}
                />
              </div>
            )}
        </div>
        {answer.status === 'failed' && (
          <p role="alert" className="pb-2 text-center text-sm text-[#b42318]">
            메시지를 보내지 못했어요. 잠시 뒤 다시 시도해 주세요
          </p>
        )}
        <ChatInput
          petNm={selectedPet?.petNm}
          isDisabled={isAnswering || receipt.isBusy}
          fileInputRef={fileInputRef}
          onSubmit={handleSend}
          onSubmitReceipt={handleSendReceipt}
        />
      </main>
    </div>
  );
}
