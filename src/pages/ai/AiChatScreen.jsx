import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { AiHostContext } from '@/features/ai/chat/aiHost';
import { petTagFor } from '@/features/ai/chat/petTag';
import { useConversation, useJudgeImageIntent } from '@/features/ai/queries';
import { useActionCards } from '@/features/ai/chat/useActionCards';
import useAnswerStream from '@/features/ai/chat/useAnswerStream';
import useChatReceipt from '@/features/ai/chat/useChatReceipt';
import RouteGuideBubble from '@/features/ai/chat/RouteGuideBubble';
import WelcomeMessage from '@/features/ai/chat/WelcomeMessage';
import { useMemberSummary } from '@/features/member/queries';
import { useCreateCharacter, usePets } from '@/features/pet/queries';
import { PATHS } from '@/routes/paths';

/** 서버 메시지 중 가장 큰 번호(가짜 메시지는 음수) */
const lastServerSn = (messages) =>
  Math.max(0, ...messages.map((message) => message.aiCnvrsMsgSn));

/** 이 창에서 받은 확인 카드의 화면 키 */
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

/**
 * [AI 대화 화면]
 * - 새 창(AiChatPage)·모바일 모달(AiChatModal) 공용 본문
 * - 본창 이동·펫돌봄 채팅 열기: 놓인 곳이 넘기는 onOpenMain·onOpenCareChat
 * - loadAttachment: 본창에서 넘긴 사진 받기 -> File, 못 받으면 null
 */
export default function AiChatScreen({
  initialMessage = null,
  loadAttachment = null,
  onOpenMain,
  onOpenCareChat,
  className = 'h-dvh',
}) {
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
  const [firstMessage, setFirstMessage] = useState(initialMessage);
  /** 본창 검색창에서 넘긴 사진 받기 함수 */
  const [loadFile] = useState(() => loadAttachment);
  const [isAttachFailed, setIsAttachFailed] = useState(false);

  const { data: member } = useMemberSummary();
  const { data: conversation, isError } = useConversation(selectedRoomSn);
  /** 확인 카드(2단계 쓰기) */
  const actions = useActionCards();
  const answer = useAnswerStream();
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
  const latestCardKey = actions.actionCards.at(-1)?.key ?? null;

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

  /** 대화를 옮기거나 지울 때 카드·영수증·사진 상태 초기화 */
  const resetCards = () => {
    actions.reset();
    receipt.reset();
    resetImage();
  };

  const selectedPet = pets?.find((pet) => pet.petSn === selectedPetSn);
  /** 분석·생성할 반려동물: 고른 칩, 1마리면 그 아이, 아니면 되묻기(null) */
  const autoPet = selectedPet ?? (pets?.length === 1 ? pets[0] : null);

  /** 서버 판정별 화면 처리: 검색 답변은 말풍선 담당 */
  const handleResult = (result, afterSn) => {
    if (!result) return;
    const { aiCnvrsRoomSn, intent } = result;
    /** 확인 카드: ACTION 판정, 또는 검색 답변 끝(답변 메시지 뒤 자리) */
    if (result.action) {
      setFallbackCount(resetFallbackCount(aiCnvrsRoomSn));
      actions.add({
        key: nextCardKey++,
        card: result.action,
        afterSn,
        anchorSn: result.message?.aiCnvrsMsgSn ?? null,
      });
    }
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
    if (intent.kind === 'RECEIPT') setNotice('receipt');
  };

  /** 메시지 전송: 처리 전 가장 최근 확인 카드를 함께 전송 */
  const handleSend = async (cnvrsCn) => {
    setFirstMessage(null);
    setIsAttachFailed(false);
    setRoute(null);
    setNotice(null);
    receipt.reset();
    resetImage();
    const afterSn = lastServerSn(conversation?.messages ?? []);
    setPendingAfterSn(afterSn);
    /** 새 방의 태그: 글에 이름이 나온 반려동물, 새 방이 목록에 보이게 칩도 함께 변경 */
    const newRoomPetSn =
      selectedRoomSn === null
        ? petTagFor(cnvrsCn, pets, selectedPetSn)
        : undefined;
    if (
      newRoomPetSn !== undefined &&
      newRoomPetSn !== (selectedPetSn ?? null)
    ) {
      setPickedPetSn(newRoomPetSn);
    }
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      /** 펫 태그는 새 방을 만들 때만: 열린 방은 늘 방 태그 기준 */
      ...(newRoomPetSn !== undefined && { petSn: newRoomPetSn }),
      cnvrsCn,
      action: actions.pendingAction(latestCardKey),
      onRoom: setSelectedRoomSn,
    });
    handleResult(result, afterSn);
  };

  /** [다시 시도]·[다시 생성]: 방의 마지막 사용자 메시지에 재답변 */
  const handleAnswerAgain = async (replaceMsgSn) => {
    setRoute(null);
    setNotice(null);
    /** 카드가 오면 마지막 사용자 메시지 뒤에 추가 */
    const lastUserSn =
      conversation?.messages.findLast(
        (message) => message.roleCd === AI_ROLE.USER,
      )?.aiCnvrsMsgSn ?? 0;
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      action: actions.pendingAction(latestCardKey),
      replaceMsgSn,
    });
    handleResult(result, lastUserSn - 1);
  };

  /**
   * 판단한 종류의 흐름으로: 진료 영수증은 영수증 분석(1마리면 자동 선택)이 이어 받음
   * - 반려동물: 글에 이름이 나온 아이가 하나뿐이면 그 아이, 아니면 칩·한 마리 기준
   */
  const goImageKind = (target, kind) => {
    const namedPetSn = petTagFor(target.text, pets, null);
    const namedPet = pets?.find((pet) => pet.petSn === namedPetSn);
    /** 새 방이면 칩도 그 반려동물로(글 질문의 새 방 태그와 같은 규칙) */
    if (namedPet && selectedRoomSn === null) setPickedPetSn(namedPet.petSn);
    if (kind === IMAGE_KIND.MEDICAL_RECEIPT) {
      setImage(null);
      receipt.start({
        file: target.file,
        text: target.text,
        aiCnvrsRoomSn: selectedRoomSn,
        afterMsgSn: lastServerSn(conversation?.messages ?? []),
        petSn: namedPet?.petSn ?? selectedPetSn ?? null,
        pet: namedPet ?? autoPet,
      });
      return;
    }
    if (kind === IMAGE_KIND.CHARACTER) {
      updateImage(target.id, {
        status: 'character',
        pet: namedPet ?? autoPet,
        characterStatus: 'ready',
      });
      return;
    }
    updateImage(target.id, {
      status: kind === IMAGE_KIND.EXPENSE_RECEIPT ? 'expense' : 'asking',
    });
  };

  /** 사진 첨부 전송: 사진+글로 종류를 판단한 뒤 그 흐름으로, 판단 실패면 종류 칩 */
  const handleSendImage = (file, text) => {
    setFirstMessage(null);
    setIsAttachFailed(false);
    answer.reset();
    setRoute(null);
    setNotice(null);
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

  /** 검색 답변 완료 시 실패 횟수 초기화 */
  useEffect(() => {
    if (answer.status !== 'done') return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 답변 완료 시점에 맞춘 초기화 */
    setFallbackCount(resetFallbackCount(answer.aiCnvrsRoomSn));
  }, [answer.status, answer.aiCnvrsRoomSn]);

  /** 유예 종료 후 본창 이동 */
  const handleRouteElapsed = () => {
    if (route.isModal) onOpenCareChat();
    else onOpenMain(route.path);
  };

  /**
   * 첫 메시지 전송: StrictMode가 effect를 정리했다 다시 돌리면(그때 답변 스트림도 취소) 예약을 지우고 새로 잡아 한 번만 전송
   * 본창에서 넘긴 사진이 있으면 사진+글로, 못 받으면 안내 후 글만 전송
   */
  useEffect(() => {
    if ((!firstMessage && !loadFile) || !isPetsReady) return;
    const timer = setTimeout(async () => {
      const text = firstMessage?.slice(0, 1000) ?? '';
      if (!loadFile) return handleSend(text);
      const file = await loadFile();
      if (file) return handleSendImage(file, text);
      /** handleSend가 지운 안내 다시 켜기(같은 렌더에 묶여 마지막 값이 남음) */
      if (text) handleSend(text);
      setIsAttachFailed(true);
    });
    return () => clearTimeout(timer);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 창을 열고 반려동물 목록을 받은 뒤 한 번만 전송 */
  }, [isPetsReady]);

  /** 연 대화가 지워졌을 때: 새 대화 화면으로 */
  const handleOpenRoomDeleted = () => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    resetCards();
    setSelectedRoomSn(null);
    setFallbackCount(0);
  };

  /** 사이드바에서 지운 방이 지금 연 방일 때만 화면을 비움 */
  const handleRoomDeleted = (aiCnvrsRoomSn) => {
    if (aiCnvrsRoomSn === selectedRoomSn) handleOpenRoomDeleted();
  };

  const handleSelectRoom = (aiCnvrsRoomSn) => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    resetCards();
    setFirstMessage(null);
    setSelectedRoomSn(aiCnvrsRoomSn);
    setFallbackCount(getFallbackCount(aiCnvrsRoomSn));
    setIsDrawerOpen(false);
  };

  /** 새 대화 화면으로: 답변·이동 안내·카드·사진 상태 초기화(입력창의 글은 유지) */
  const goNewChat = () => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    resetCards();
    setFirstMessage(null);
    setSelectedRoomSn(null);
    setFallbackCount(0);
  };

  const handleNewChat = () => {
    goNewChat();
    setIsDrawerOpen(false);
  };

  /**
   * 칩은 대화 목록 필터: 열린 방이 고른 칩 목록에 남으면([전체]이거나 방 태그와 같음) 그대로,
   * 빠지면 그 반려동물의 새 대화로(상세를 받기 전이면 새 대화로). drawer는 열린 채 유지
   */
  const handleSelectPet = (petSn) => {
    setPickedPetSn(petSn);
    if (selectedRoomSn === null || petSn === null) return;
    if (conversation?.petSn !== petSn) goNewChat();
  };

  const openDrawer = () => setIsDrawerOpen(true);

  /** 말풍선·카드 안 본창 이동 방법 */
  const hostValue = useMemo(() => ({ openMain: onOpenMain }), [onOpenMain]);

  return (
    <AiHostContext.Provider value={hostValue}>
      <div className={`flex bg-[#faf8f5] font-sans ${className}`}>
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
          onSelectPet={handleSelectPet}
          onSelectRoom={handleSelectRoom}
          onNewChat={handleNewChat}
          onRoomDeleted={handleRoomDeleted}
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
              onDeleted={handleOpenRoomDeleted}
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
                actionCards={actions.actionCards}
                latestCardKey={latestCardKey}
                onRegenerate={(message) =>
                  handleAnswerAgain(message.aiCnvrsMsgSn)
                }
                onChangeAction={actions.changeInput}
                onConfirmAction={(key) => actions.confirm(selectedRoomSn, key)}
                onCancelAction={(key) => actions.cancel(selectedRoomSn, key)}
                onRetryAction={(key) => actions.retrySave(selectedRoomSn, key)}
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
                {image && (
                  <ImageIntentBubble
                    image={image}
                    pets={pets ?? []}
                    onChooseKind={(kind) => goImageKind(image, kind)}
                    onChoosePet={(pet) => updateImage(image.id, { pet })}
                    onCreateCharacter={handleCreateCharacter}
                    onCancelCharacter={resetImage}
                    onOpenCharacters={() => onOpenMain(PATHS.MYPAGE_CHARACTERS)}
                    onOpenExpenses={() => onOpenMain(PATHS.MYPAGE_EXPENSES)}
                  />
                )}
                {receipt.receipt && (
                  <ReceiptAnalysisBubble
                    receipt={receipt.receipt}
                    pets={pets ?? []}
                    onChoosePet={receipt.choosePet}
                    onCancel={receipt.cancel}
                    onConfirm={() =>
                      onOpenMain(receiptResultPath(receipt.receipt.result))
                    }
                    onDismiss={receipt.dismiss}
                    onRetry={handleRetryReceipt}
                    onManualInput={() =>
                      onOpenMain(
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
    </AiHostContext.Provider>
  );
}
