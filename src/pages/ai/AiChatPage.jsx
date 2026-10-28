import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatInput from '@/features/ai/chat/ChatInput';
import ConversationHeader, {
  DrawerButton,
  chatHeaderClass,
} from '@/features/ai/chat/ConversationHeader';
import ConversationMessages from '@/features/ai/chat/ConversationMessages';
import AnswerBubble from '@/features/ai/chat/AnswerBubble';
import ConversationSidebar from '@/features/ai/chat/ConversationSidebar';
import ReceiptAnalysisBubble from '@/features/ai/chat/ReceiptAnalysisBubble';
import { AI_ROLE } from '@/features/ai/shared/aiCodes';
import { CHAT_MODAL_ACTION } from '@/features/ai/shared/fakeRoutingMap';
import { fakePets } from '@/features/ai/chat/fakePets';
import {
  getFallbackCount,
  increaseFallbackCount,
  resetFallbackCount,
} from '@/features/ai/shared/fallbackCount';
import { openInMainWindow } from '@/features/ai/chat/openInMainWindow';
import {
  useCancelRegister,
  useConfirmRegister,
  useConversation,
  useSendMessage,
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

/** 본창 건강 일지 결과 확인 모달: 파라미터 이름은 건강기록(JAJ)과 협의 전 제안값 */
const receiptResultPath = (recptSn) =>
  `${PATHS.HEALTH_DIARY}?recptSn=${recptSn}`;
/** 본창 건강 일지 검진기록 탭 + 검진기록 등록 모달 빈 폼 */
const manualCheckupPath = (recptSn) => {
  const params = new URLSearchParams({ checkup: 'manual' });
  if (recptSn) params.set('recptSn', String(recptSn));
  return `${PATHS.HEALTH_DIARY}?${params}#hlt002-exam`;
};

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
  const sendMessage = useSendMessage();
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
  /** 이번 화면에서 받은 미리보기 카드: 메시지 번호별 카드·상태·결과 문구 */
  const [registerCards, setRegisterCards] = useState({});
  /** 반려동물을 되묻는 칩 */
  const [petChoices, setPetChoices] = useState(null);
  /** 선택된 대화의 연속 실패 횟수 */
  const [fallbackCount, setFallbackCount] = useState(0);
  const isAnswering =
    answer.status === 'waiting' || answer.status === 'streaming';
  const cardSns = Object.keys(registerCards).map(Number);
  const latestCardSn = cardSns.length > 0 ? Math.max(...cardSns) : null;

  /** 대화를 옮기거나 지울 때 카드·칩 상태 초기화 */
  const resetRegister = () => {
    setRegisterCards({});
    setPetChoices(null);
    receipt.reset();
  };

  const selectedPet = pets.find((pet) => pet.petSn === selectedPetSn);

  /** 메시지 전송 */
  const handleSend = (cnvrsCn) => {
    sendMessage.mutate(
      {
        aiCnvrsRoomSn: selectedRoomSn,
        petSn: selectedPet?.petSn,
        cnvrsCn,
      },
      {
        onSuccess: ({
          aiCnvrsRoomSn,
          intent,
          aiCnvrsMsgSn,
          route: nextRoute,
          card,
          petChoices: nextPetChoices,
        }) => {
          setFirstMessage(null);
          setRoute(null);
          setPetChoices(null);
          receipt.reset();
          setSelectedRoomSn(aiCnvrsRoomSn);
          if (intent === 'REGISTER') {
            answer.reset();
            if (card) {
              setRegisterCards((prev) => ({
                ...prev,
                [aiCnvrsMsgSn]: { card, status: 'pending', resultText: null },
              }));
            }
            if (nextPetChoices) setPetChoices(nextPetChoices);
          }
          /** 검색·이동 안내·매칭 실패만 이 화면 처리 */
          if (intent === 'SEARCH') {
            answer.start({ aiCnvrsRoomSn, question: cnvrsCn });
          }
          if (intent === 'ROUTE') {
            setRoute({ ...nextRoute, aiCnvrsMsgSn, status: 'waiting' });
          }
          if (intent === 'FALLBACK') {
            answer.reset();
            setFallbackCount(increaseFallbackCount(aiCnvrsRoomSn));
          }
          if (intent === 'ROUTE' || intent === 'REGISTER') {
            setFallbackCount(resetFallbackCount(aiCnvrsRoomSn));
          }
        },
      },
    );
  };

  /** 이미지 첨부 전송: 의도 분기 없이 영수증 분석, 1마리면 자동 선택 */
  const handleSendReceipt = (file, text) => {
    answer.reset();
    setRoute(null);
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

  /** 등록·취소 결과를 카드에 반영 */
  const settleRegisterCard = (mutation, status, aiCnvrsMsgSn) => {
    mutation.mutate(
      { aiCnvrsRoomSn: selectedRoomSn, aiCnvrsMsgSn },
      {
        onSuccess: ({ cnvrsCn }) => {
          setRegisterCards((prev) => ({
            ...prev,
            [aiCnvrsMsgSn]: {
              ...prev[aiCnvrsMsgSn],
              status,
              resultText: cnvrsCn,
            },
          }));
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

  /** 미완료 답변 재생성 */
  const handleRegenerate = (message) => {
    const messages = conversation?.messages ?? [];
    const index = messages.findIndex(
      (item) => item.aiCnvrsMsgSn === message.aiCnvrsMsgSn,
    );
    const question = messages
      .slice(0, index)
      .findLast((item) => item.roleCd === AI_ROLE.USER)?.cnvrsCn;
    if (!question) return;
    answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      question,
      replaceMsgSn: message.aiCnvrsMsgSn,
    });
  };

  /** 유예 종료 후 본창 이동 */
  const handleRouteElapsed = () => {
    if (route.action === CHAT_MODAL_ACTION) {
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

  /** StrictMode effect 이중 실행 방지 */
  const hasSentFirstMessage = useRef(false);
  useEffect(() => {
    if (!firstMessage || hasSentFirstMessage.current) return;
    hasSentFirstMessage.current = true;
    handleSend(firstMessage.slice(0, 1000));
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
    resetRegister();
    setFirstMessage(null);
    setSelectedRoomSn(aiCnvrsRoomSn);
    setFallbackCount(getFallbackCount(aiCnvrsRoomSn));
    setIsDrawerOpen(false);
  };

  const handleNewChat = () => {
    answer.reset();
    setRoute(null);
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
        {conversation && (
          <ConversationHeader
            conversation={conversation}
            onOpenDrawer={openDrawer}
            onNewChat={handleNewChat}
            onDeleted={() => {
              answer.reset();
              setRoute(null);
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
          {(conversation || receipt.receipt) && (
            <ConversationMessages
              messages={(conversation?.messages ?? []).filter(
                (message) =>
                  !answer.hiddenMsgSns.includes(message.aiCnvrsMsgSn) &&
                  message.aiCnvrsMsgSn !== route?.aiCnvrsMsgSn &&
                  message.aiCnvrsMsgSn !==
                    receipt.receipt?.result?.aiCnvrsMsgSn,
              )}
              fallbackCount={fallbackCount}
              registerCards={registerCards}
              latestCardSn={latestCardSn}
              isRegisterBusy={
                confirmRegister.isPending || cancelRegister.isPending
              }
              hasRegisterError={
                confirmRegister.isError || cancelRegister.isError
              }
              onRegenerate={handleRegenerate}
              onConfirmRegister={(aiCnvrsMsgSn) =>
                settleRegisterCard(confirmRegister, 'registered', aiCnvrsMsgSn)
              }
              onCancelRegister={(aiCnvrsMsgSn) =>
                settleRegisterCard(cancelRegister, 'cancelled', aiCnvrsMsgSn)
              }
            >
              {answer.status !== 'idle' && (
                <AnswerBubble
                  status={answer.status}
                  text={answer.text}
                  shortcuts={answer.shortcuts}
                  onRetry={() =>
                    answer.start({
                      aiCnvrsRoomSn: answer.aiCnvrsRoomSn,
                      question: answer.question,
                    })
                  }
                  onRegenerate={() =>
                    answer.start({
                      aiCnvrsRoomSn: answer.aiCnvrsRoomSn,
                      question: answer.question,
                      replaceMsgSn: answer.hiddenMsgSns.at(-1),
                    })
                  }
                />
              )}
              {petChoices && (
                <PetChoiceChips
                  pets={petChoices}
                  isDisabled={sendMessage.isPending || isAnswering}
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
                  key={route.aiCnvrsMsgSn}
                  label={route.label}
                  status={route.status}
                  onCancel={() => setRoute({ ...route, status: 'cancelled' })}
                  onElapsed={handleRouteElapsed}
                />
              )}
            </ConversationMessages>
          )}
          {selectedRoomSn === null && !receipt.receipt && (
            <div className="flex min-h-full items-center justify-center">
              <WelcomeMessage
                nickname={member?.mbrNcnm ?? ''}
                petNm={selectedPet?.petNm}
              />
            </div>
          )}
        </div>
        {sendMessage.isError && (
          <p role="alert" className="pb-2 text-center text-sm text-[#b42318]">
            메시지를 보내지 못했어요. 잠시 뒤 다시 시도해 주세요
          </p>
        )}
        <ChatInput
          petNm={selectedPet?.petNm}
          isDisabled={sendMessage.isPending || isAnswering || receipt.isBusy}
          fileInputRef={fileInputRef}
          onSubmit={handleSend}
          onSubmitReceipt={handleSendReceipt}
        />
      </main>
    </div>
  );
}
