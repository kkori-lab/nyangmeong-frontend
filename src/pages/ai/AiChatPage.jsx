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
import ImageIntentBubble from '@/features/ai/chat/ImageIntentBubble';
import { IMAGE_KIND } from '@/features/ai/api';
import { AI_ROLE } from '@/features/ai/shared/aiCodes';
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
  useJudgeImageIntent,
} from '@/features/ai/queries';
import PetChoiceChips from '@/features/ai/chat/PetChoiceChips';
import useAnswerStream from '@/features/ai/chat/useAnswerStream';
import useChatReceipt from '@/features/ai/chat/useChatReceipt';
import RouteGuideBubble from '@/features/ai/chat/RouteGuideBubble';
import WelcomeMessage from '@/features/ai/chat/WelcomeMessage';
import { useMemberSummary } from '@/features/member/queries';
import { useCreateCharacter, usePets } from '@/features/pet/queries';
import { receiveAttachment } from '@/hooks/useAiWindow';
import useChatWindow from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';

/** 서버 메시지 중 가장 큰 번호(가짜 메시지는 음수) */
const lastServerSn = (messages) =>
  Math.max(0, ...messages.map((message) => message.aiCnvrsMsgSn));

/** 이 창에서 받은 등록 카드의 화면 키 */
let nextCardKey = 1;

/** 서버 저장 전 내 메시지 자리(서버 번호는 양수, 가짜는 음수) */
const PENDING_MSG_SN = 0;

/** 영수증 말풍선이 떠 있는 동안 숨길 메시지: 이번 분석으로 저장된 내 글·요약(말풍선이 같은 내용 표시) */
const isReceiptSaved = (receipt, message) =>
  receipt?.savedUntilSn != null &&
  message.aiCnvrsMsgSn > receipt.afterMsgSn &&
  message.aiCnvrsMsgSn <= receipt.savedUntilSn;

/** 본창 건강 일지 결과 확인 모달: 파라미터 이름은 건강기록(JAJ)과 협의 전 제안값 */
const receiptResultPath = ({ recptSn, petSn }) =>
  `${PATHS.HEALTH_DIARY}?${new URLSearchParams({ recptSn, petSn })}`;
/** 본창 건강 일지 검진기록 탭 + 검진기록 등록 모달 빈 폼 */
const manualCheckupPath = (recptSn) => {
  const params = new URLSearchParams({ checkup: 'manual' });
  if (recptSn) params.set('recptSn', String(recptSn));
  return `${PATHS.HEALTH_DIARY}?${params}#hlt002-exam`;
};

/** 판정이 영수증일 때 안내(저장 안 함): 이미지 첨부로만 분석 */
const RECEIPT_GUIDE = '영수증 사진을 첨부해 주세요.';

/** 캐릭터 생성 실패 안내: 409·403은 서버 문구, 다시 해도 같아 [캐릭터 보기]로 */
const characterFailure = (error) => {
  if (
    error.code === 'PIXEL_CHARACTER_CREATING' ||
    error.code === 'PIXEL_CHARACTER_ALREADY_EXISTS'
  ) {
    return {
      errorMessage: error.message || '이미 캐릭터를 만들었거나 만드는 중이에요',
      isRetryable: false,
    };
  }
  if (error.code === 'PET_PRIMARY_ONLY') {
    return {
      errorMessage: error.message || '주양육자만 캐릭터를 만들 수 있어요',
      isRetryable: false,
    };
  }
  return {
    errorMessage: '캐릭터를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요',
    isRetryable: true,
  };
};

/** 본창에서 넘긴 사진을 못 받았을 때 */
const ATTACH_FAILED =
  '첨부한 사진을 불러오지 못했어요. 대화창에서 다시 첨부해 주세요';

/** 별도 창 전체 화면 AI 채팅 */
export default function AiChatPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  /** 1100px 미만 대화 목록 drawer */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const petsQuery = usePets();
  /** 반려동물 목록: 받기 전 undefined, 못 받으면 빈 목록([전체]만) */
  const pets = petsQuery.data ?? (petsQuery.isError ? [] : undefined);
  const isPetsReady = pets !== undefined;
  /** 고른 칩: undefined면 아직 안 고름 */
  const [pickedPetSn, setPickedPetSn] = useState(undefined);
  /** 선택한 칩: 고르기 전에는 대표 반려동물, 없으면 [전체](null), 목록 받기 전 undefined */
  const selectedPetSn =
    pickedPetSn !== undefined
      ? pickedPetSn
      : pets && (pets.find((pet) => pet.rprsPetYn)?.petSn ?? null);
  /** 선택된 대화 번호 */
  const [selectedRoomSn, setSelectedRoomSn] = useState(null);
  /** 첫 메시지 */
  const [searchParams, setSearchParams] = useSearchParams();
  const [firstMessage, setFirstMessage] = useState(() => searchParams.get('q'));
  /** 본창 검색창에서 넘긴 사진 번호 */
  const [attachId] = useState(() => searchParams.get('attach'));
  const [isAttachFailed, setIsAttachFailed] = useState(false);

  const { data: member } = useMemberSummary();
  const { data: conversation, isError } = useConversation(selectedRoomSn);
  const confirmRegister = useConfirmRegister();
  const cancelRegister = useCancelRegister();
  const answer = useAnswerStream();
  const openChatWindow = useChatWindow();
  /** 영수증 파일 고르기 창 */
  const fileInputRef = useRef(null);
  const receipt = useChatReceipt({
    onSaved: ({ aiCnvrsRoomSn }) => {
      setFirstMessage(null);
      setSelectedRoomSn(aiCnvrsRoomSn);
    },
  });
  const judgeImage = useJudgeImageIntent();
  const createCharacter = useCreateCharacter();
  /** 지금 사진 말풍선의 번호: 지난 판단 응답이 새 말풍선을 고치지 않게 */
  const imageIdRef = useRef(0);
  /**
   * 첨부 사진 흐름(진료 영수증은 receipt가 이어 받음)
   * - { id, file, text, previewUrl, status, pet, characterStatus, errorMessage, isRetryable }
   */
  const [image, setImage] = useState(null);
  /** 이동 안내 상태 */
  const [route, setRoute] = useState(null);
  /** 저장하지 않는 안내: 변환표에 없는 화면(fallback)·영수증 판정(receipt) */
  const [notice, setNotice] = useState(null);
  /** 보내기 전 마지막 서버 메시지 번호: 이보다 큰 내 메시지가 오면 임시 말풍선을 제거 */
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

  const updateImage = (id, patch) =>
    setImage((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));

  const resetImage = () => {
    imageIdRef.current += 1;
    setImage(null);
  };

  /** 미리보기 주소 해제 */
  const imagePreviewUrl = image?.previewUrl;
  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

  /** 대화를 옮기거나 지울 때 카드·초안·칩 상태 초기화 */
  const resetRegister = () => {
    setRegisterCards([]);
    setDraft(null);
    setPetChoices(null);
    receipt.reset();
    resetImage();
  };

  const selectedPet = pets?.find((pet) => pet.petSn === selectedPetSn);
  /** 분석·생성할 반려동물: 고른 칩, 1마리면 그 아이, 아니면 되묻기(null) */
  const autoPet = selectedPet ?? (pets?.length === 1 ? pets[0] : null);

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

  /** 서버 판정별 화면 처리: 검색 답변은 말풍선 담당, 등록이 아니면 초안 폐기 */
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

  /** 메시지 전송: 가장 최근 카드를 초안으로 함께 전송 */
  const handleSend = async (cnvrsCn) => {
    setFirstMessage(null);
    setIsAttachFailed(false);
    setRoute(null);
    setNotice(null);
    setPetChoices(null);
    receipt.reset();
    resetImage();
    const afterSn = lastServerSn(conversation?.messages ?? []);
    setPendingAfterSn(afterSn);
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      petSn: selectedPetSn ?? null,
      cnvrsCn,
      draft,
      onRoom: setSelectedRoomSn,
    });
    handleResult(result, afterSn);
  };

  /** [다시 시도]·[다시 생성]: 방의 마지막 사용자 메시지에 재답변 */
  const handleAnswerAgain = async (replaceMsgSn) => {
    setRoute(null);
    setNotice(null);
    setPetChoices(null);
    /** 카드가 오면 마지막 사용자 메시지 뒤에 추가 */
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

  /** 판단한 종류의 흐름으로: 진료 영수증은 영수증 분석(1마리면 자동 선택)이 이어 받음 */
  const goImageKind = (target, kind) => {
    if (kind === IMAGE_KIND.MEDICAL_RECEIPT) {
      setImage(null);
      receipt.start({
        file: target.file,
        text: target.text,
        aiCnvrsRoomSn: selectedRoomSn,
        afterMsgSn: lastServerSn(conversation?.messages ?? []),
        petSn: selectedPetSn ?? null,
        pet: autoPet,
      });
      return;
    }
    if (kind === IMAGE_KIND.CHARACTER) {
      updateImage(target.id, {
        status: 'character',
        pet: autoPet,
        characterStatus: 'ready',
      });
      return;
    }
    updateImage(target.id, {
      status: kind === IMAGE_KIND.EXPENSE_RECEIPT ? 'expense' : 'asking',
    });
  };

  /** 사진 첨부 전송: 사진+글로 종류를 판단(가짜)한 뒤 그 흐름으로, 판단 실패면 종류 칩 */
  const handleSendImage = (file, text) => {
    setFirstMessage(null);
    setIsAttachFailed(false);
    answer.reset();
    setRoute(null);
    setNotice(null);
    setPetChoices(null);
    receipt.reset();
    imageIdRef.current += 1;
    const target = {
      id: imageIdRef.current,
      file,
      text,
      previewUrl: URL.createObjectURL(file),
      status: 'judging',
      pet: null,
      characterStatus: null,
      errorMessage: null,
      isRetryable: false,
    };
    setImage(target);
    judgeImage.mutate(
      { file, cnvrsCn: text, petSn: selectedPetSn ?? null },
      {
        onSuccess: ({ kind }) => {
          if (target.id === imageIdRef.current) goImageKind(target, kind);
        },
        onError: () => updateImage(target.id, { status: 'asking' }),
      },
    );
  };

  /** 캐릭터 만들기 요청: 사진은 첨부한 그대로 */
  const handleCreateCharacter = () => {
    const target = image;
    updateImage(target.id, { characterStatus: 'creating' });
    createCharacter.mutate(
      { petSn: target.pet.petSn, photo: target.file },
      {
        onSuccess: () => updateImage(target.id, { characterStatus: 'created' }),
        onError: (error) =>
          updateImage(target.id, {
            characterStatus: 'failed',
            ...characterFailure(error),
          }),
      },
    );
  };

  /** 실패 안내에서 다시 올리기 */
  const handleRetryReceipt = () => {
    receipt.reset();
    fileInputRef.current.click();
  };

  /** 등록·취소 결과를 카드에 반영: 결과 요약 메시지 자리로 이동, 초안 폐기 */
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

  /**
   * 첫 메시지 전송: StrictMode가 effect를 정리했다 다시 돌리면(그때 답변 스트림도 취소) 예약을 지우고 새로 잡아 한 번만 전송
   * 본창에서 넘긴 사진이 있으면 받아서 사진+글로, 못 받으면 안내하고 글만 보낸다
   */
  useEffect(() => {
    if ((!firstMessage && !attachId) || !isPetsReady) return;
    const timer = setTimeout(async () => {
      const text = firstMessage?.slice(0, 1000) ?? '';
      if (!attachId) return handleSend(text);
      /** 새로고침해도 다시 받지 않게 주소에서 번호를 지운다 */
      setSearchParams(
        (prev) => {
          prev.delete('attach');
          return prev;
        },
        { replace: true },
      );
      const file = await receiveAttachment(attachId);
      if (file) return handleSendImage(file, text);
      /** handleSend가 안내를 지운 뒤 다시 켠다(같은 렌더에 묶여 마지막 값이 남음) */
      if (text) handleSend(text);
      setIsAttachFailed(true);
    });
    return () => clearTimeout(timer);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 창을 열고 반려동물 목록을 받은 뒤 한 번만 전송 */
  }, [isPetsReady]);

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
        onSelectPet={setPickedPetSn}
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
            pets={pets}
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
          {(conversation || receipt.receipt || image || isPendingShown) && (
            <ConversationMessages
              messages={[
                ...(conversation?.messages ?? []).filter(
                  (message) =>
                    !answer.hiddenMsgSns.includes(message.aiCnvrsMsgSn) &&
                    !isReceiptSaved(receipt.receipt, message),
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
              {image && (
                <ImageIntentBubble
                  image={image}
                  pets={pets ?? []}
                  onChooseKind={(kind) => goImageKind(image, kind)}
                  onChoosePet={(pet) => updateImage(image.id, { pet })}
                  onCreateCharacter={handleCreateCharacter}
                  onCancelCharacter={resetImage}
                  onOpenCharacters={() =>
                    openInMainWindow(PATHS.MYPAGE_CHARACTERS)
                  }
                  onOpenExpenses={() => openInMainWindow(PATHS.MYPAGE_EXPENSES)}
                />
              )}
              {receipt.receipt && (
                <ReceiptAnalysisBubble
                  receipt={receipt.receipt}
                  pets={pets ?? []}
                  onChoosePet={receipt.choosePet}
                  onCancel={receipt.cancel}
                  onConfirm={() =>
                    openInMainWindow(receiptResultPath(receipt.receipt.result))
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
            !image &&
            !answer.pendingText && (
              <div className="flex min-h-full items-center justify-center">
                <WelcomeMessage
                  nickname={member?.mbrNcnm ?? ''}
                  petNm={selectedPet?.petNm}
                />
              </div>
            )}
        </div>
        {isAttachFailed && (
          <p role="alert" className="pb-2 text-center text-sm text-[#b42318]">
            {ATTACH_FAILED}
          </p>
        )}
        {answer.status === 'failed' && (
          <p role="alert" className="pb-2 text-center text-sm text-[#b42318]">
            메시지를 보내지 못했어요. 잠시 뒤 다시 시도해 주세요
          </p>
        )}
        <ChatInput
          petNm={selectedPet?.petNm}
          isDisabled={
            isAnswering ||
            receipt.isBusy ||
            judgeImage.isPending ||
            image?.characterStatus === 'creating'
          }
          fileInputRef={fileInputRef}
          onSubmit={handleSend}
          onSubmitReceipt={handleSendImage}
        />
      </main>
    </div>
  );
}
