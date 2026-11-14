import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChatInput from '@/features/ai/chat/ChatInput';
import Skeleton from '@/components/Skeleton';
import ConversationHeader, {
  CloseButton,
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
import {
  useConversation,
  useConversations,
  useJudgeImageIntent,
} from '@/features/ai/queries';
import { readLastPetSn } from '@/utils/lastPetSn';
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

/** 맨 아래로 따라갈 거리(px): 이보다 위로 올려 읽는 중이면 끌어내리지 않음 */
const FOLLOW_GAP = 80;
/** 부드러운 스크롤이 끝났다는 신호(scrollend)가 없을 때 끝으로 볼 시간 */
const SMOOTH_LIMIT_MS = 1000;

/** 서버 저장 전 내 메시지 자리(서버 번호는 양수, 가짜는 음수) */
const PENDING_MSG_SN = 0;

/**
 * 영수증 말풍선이 떠 있는 동안 숨길 메시지: 이번 사진 턴과 분석 요약(말풍선이 사진·글·결과를 같이 표시)
 * - 요약 저장 전에는 afterMsgSn 뒤 전부(사진 턴), 저장 뒤에는 요약까지
 */
const isReceiptSaved = (receipt, message) =>
  receipt != null &&
  message.aiCnvrsMsgSn > receipt.afterMsgSn &&
  (receipt.savedUntilSn == null ||
    message.aiCnvrsMsgSn <= receipt.savedUntilSn);

/** 사진 판단 실패 문구: 형식·크기·입력 오류는 서버 문구, 그 밖은 공통 */
const IMAGE_SEND_FAILED = '사진을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요';
const IMAGE_ERROR_CODES = [
  'FILE_TYPE_NOT_ALLOWED',
  'FILE_SIZE_EXCEEDED',
  'INVALID_REQUEST',
];

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
 * - onBack: 있으면(모달) 대화 제목 줄 오른쪽 끝 [✕]로 닫기
 * - openRecent: 플로팅 버튼으로 열었을 때 고른 칩 기준 가장 최근 대화를 한 번 연다(없으면 새 대화)
 */
export default function AiChatScreen({
  initialMessage = null,
  loadAttachment = null,
  onOpenMain,
  onOpenCareChat,
  onBack = null,
  openRecent = false,
  className = 'h-dvh',
}) {
  /** 사이드바 기본 접힘(사람 요청 2026-11-11) */
  const [isCollapsed, setIsCollapsed] = useState(true);
  /** 1100px 미만 대화 목록 drawer */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const petsQuery = usePets();
  /** 반려동물 목록: 받기 전 undefined, 못 받으면 빈 목록([전체]만) */
  const pets = petsQuery.data ?? (petsQuery.isError ? [] : undefined);
  const { data: member, isPending: isMemberPending } = useMemberSummary();
  /** 칩을 정할 준비: 반려동물 목록과 회원 정보(마지막 선택을 회원 번호로 읽음)를 받은 뒤 */
  const isPetsReady = pets !== undefined && !isMemberPending;
  /** 고른 칩: undefined면 아직 안 고름 */
  const [pickedPetSn, setPickedPetSn] = useState(undefined);
  /** 건강기록에서 마지막으로 고른 반려동물(읽기만, AI 칩 변경은 저장하지 않음) */
  const lastPetSn = readLastPetSn(member?.mbrSn);
  /**
   * 선택한 칩: 고르기 전에는 마지막으로 고른 반려동물(목록에 있을 때) → 대표 반려동물 → [전체](null)
   * - 준비 전 undefined(저장값을 읽기 전에 대표로 정했다가 칩이 바뀌지 않게)
   */
  const defaultPetSn = isPetsReady
    ? (pets.find((pet) => pet.petSn === lastPetSn)?.petSn ??
      pets.find((pet) => pet.rprsPetYn)?.petSn ??
      null)
    : undefined;
  const selectedPetSn = pickedPetSn !== undefined ? pickedPetSn : defaultPetSn;
  /** 선택된 대화 번호 */
  const [selectedRoomSn, setSelectedRoomSn] = useState(null);
  /** 첫 메시지 */
  const [firstMessage, setFirstMessage] = useState(initialMessage);
  /** 본창 검색창에서 넘긴 사진 받기 함수 */
  const [loadFile] = useState(() => loadAttachment);
  const [isAttachFailed, setIsAttachFailed] = useState(false);

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
  /** 본문 스크롤: 맨 아래를 따라갈지(보낼 때·방을 열 때 켬, 위로 올려 읽으면 끔) */
  const scrollRef = useRef(null);
  const followRef = useRef(true);
  /** 부드럽게 내려가는 중: 도중의 위치로 따라가기를 끄지 않고, 늘어난 내용도 부드럽게 이어 감 */
  const isSmoothRef = useRef(false);
  const smoothTimerRef = useRef(null);
  /**
   * 맨 아래로: 보낼 때는 부드럽게(smooth), 방을 열 때·동작 줄이기 설정이면 바로
   * - 부드럽게는 끝(scrollend·맨 아래 도착)·사용자 조작·1초 뒤 중 먼저 오는 때 끝남
   */
  const followBottom = ({ smooth = false } = {}) => {
    followRef.current = true;
    const el = scrollRef.current;
    if (!el) return;
    const isReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!smooth || isReduced) {
      isSmoothRef.current = false;
      el.scrollTop = el.scrollHeight;
      return;
    }
    isSmoothRef.current = true;
    clearTimeout(smoothTimerRef.current);
    smoothTimerRef.current = setTimeout(() => {
      isSmoothRef.current = false;
    }, SMOOTH_LIMIT_MS);
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };
  /**
   * 첨부 사진 흐름(진료 영수증은 receipt가 이어 받음)
   * - { id, file, text, previewUrl, status, pet, characterStatus, errorMessage, isRetryable, aiCnvrsRoomSn, beforeSn }
   * - aiCnvrsRoomSn: image-intent가 사진 턴을 저장한 방(저장 전 null), beforeSn: 보내기 전 마지막 서버 메시지 번호
   */
  const [image, setImage] = useState(null);
  /** 이번에 보낸 사진 미리보기: 저장된 사진 메시지 번호 → 주소 */
  const [photoPreviews, setPhotoPreviews] = useState({});
  /** 만든 미리보기 주소: 저장 메시지가 계속 쓰므로 화면을 떠날 때 한꺼번에 해제 */
  const previewUrlsRef = useRef([]);
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
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  /** 대화를 옮기거나 지울 때 카드·영수증·사진 상태 초기화 */
  const resetCards = () => {
    actions.reset();
    receipt.reset();
    resetImage();
  };

  const selectedPet = pets?.find((pet) => pet.petSn === selectedPetSn);
  /** 분석·생성할 반려동물: 고른 칩, 1마리면 그 아이, 아니면 되묻기(null) */
  const autoPet = selectedPet ?? (pets?.length === 1 ? pets[0] : null);

  /** 연 대화가 지워졌을 때: 새 대화 화면으로 */
  const handleOpenRoomDeleted = () => {
    answer.reset();
    setRoute(null);
    setNotice(null);
    resetCards();
    setSelectedRoomSn(null);
    setFallbackCount(0);
  };

  /**
   * 서버 판정별 화면 처리: 검색 답변은 말풍선 담당
   * - sentCardKey: 이번 요청에 실은 확인 카드, 카드 없이 답하면(취소 말 등) 그 카드를 버림
   */
  const handleResult = (result, afterSn, sentCardKey) => {
    if (!result) return;
    const { aiCnvrsRoomSn, intent } = result;
    if (sentCardKey != null && !result.action) actions.drop(sentCardKey);
    /** 확인 카드: ACTION 판정, 또는 검색 답변 끝(요약 글 메시지 뒤 자리) */
    if (result.action) {
      setFallbackCount(resetFallbackCount(aiCnvrsRoomSn));
      const params = {
        key: nextCardKey++,
        card: result.action,
        afterSn,
        anchorSn: result.message?.aiCnvrsMsgSn ?? null,
      };
      /** 확인 말("등록해 줘"): 서버가 다시 검증한 카드를 바로 실행 */
      if (result.execute) actions.execute(aiCnvrsRoomSn, params);
      else actions.add(params);
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

  /**
   * 메시지 전송: 처리 전 가장 최근 확인 카드를 함께 전송
   * - choicePetSn: 카드의 반려동물 이름 칩으로 고른 아이, 실을 카드의 petSn으로(같은 이름이 둘이어도 고른 아이)
   */
  const handleSend = async (cnvrsCn, choicePetSn = null) => {
    followBottom({ smooth: true });
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
    const pending = actions.pendingAction(latestCardKey);
    const action =
      pending && choicePetSn != null
        ? { ...pending, input: { ...pending.input, petSn: choicePetSn } }
        : pending;
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      /** 펫 태그는 새 방을 만들 때만: 열린 방은 늘 방 태그 기준 */
      ...(newRoomPetSn !== undefined && { petSn: newRoomPetSn }),
      cnvrsCn,
      action,
      onRoom: setSelectedRoomSn,
    });
    handleResult(result, afterSn, action ? latestCardKey : null);
  };

  /** [다시 시도]·[다시 생성]: 방의 마지막 사용자 메시지에 재답변 */
  const handleAnswerAgain = async (replaceMsgSn) => {
    followBottom({ smooth: true });
    setRoute(null);
    setNotice(null);
    /** 카드가 오면 마지막 사용자 메시지 뒤에 추가 */
    const lastUserSn =
      conversation?.messages.findLast(
        (message) => message.roleCd === AI_ROLE.USER,
      )?.aiCnvrsMsgSn ?? 0;
    const action = actions.pendingAction(latestCardKey);
    const result = await answer.start({
      aiCnvrsRoomSn: selectedRoomSn,
      action,
      replaceMsgSn,
    });
    handleResult(result, lastUserSn - 1, action ? latestCardKey : null);
  };

  /**
   * 판단한 종류의 흐름으로: 진료 영수증은 영수증 분석(1마리면 자동 선택)이 이어 받음
   * - 반려동물: 글에 이름이 나온 아이가 하나뿐이면 그 아이, 아니면 칩·한 마리 기준
   */
  const goImageKind = (target, kind) => {
    const namedPetSn = petTagFor(target.text, pets, null);
    const namedPet = pets?.find((pet) => pet.petSn === namedPetSn);
    if (kind === IMAGE_KIND.MEDICAL_RECEIPT) {
      setImage(null);
      /** 사진 턴은 image-intent가 저장한 방에 이어서 요약만 저장 */
      receipt.start({
        file: target.file,
        text: target.text,
        aiCnvrsRoomSn: target.aiCnvrsRoomSn,
        afterMsgSn: target.beforeSn,
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
      /** 칩으로 고른 종류는 서버 안내 글이 없어 말풍선이 안내 */
      isChosen: target.isChosen ?? false,
    });
  };

  /** 사진 첨부 전송: 사진+글로 종류를 판단한 뒤 그 흐름으로, 판단 실패면 종류 칩 */
  const handleSendImage = (file, text) => {
    followBottom({ smooth: true });
    setFirstMessage(null);
    setIsAttachFailed(false);
    answer.reset();
    setRoute(null);
    setNotice(null);
    receipt.reset();
    imageIdRef.current += 1;
    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.push(previewUrl);
    /** 새 방의 태그: 글 질문과 같은 규칙(글에 이름이 나온 반려동물), 칩도 함께 변경 */
    const newRoomPetSn =
      selectedRoomSn === null
        ? petTagFor(text, pets, selectedPetSn)
        : undefined;
    if (
      newRoomPetSn !== undefined &&
      newRoomPetSn !== (selectedPetSn ?? null)
    ) {
      setPickedPetSn(newRoomPetSn);
    }
    const target = {
      id: imageIdRef.current,
      file,
      text,
      previewUrl,
      status: 'judging',
      pet: null,
      characterStatus: null,
      errorMessage: null,
      isRetryable: false,
      aiCnvrsRoomSn: null,
      beforeSn: lastServerSn(conversation?.messages ?? []),
    };
    setImage(target);
    judgeImage.mutate(
      {
        file,
        cnvrsCn: text,
        petSn: newRoomPetSn ?? null,
        aiCnvrsRoomSn: selectedRoomSn,
      },
      {
        onSuccess: ({ kind, aiCnvrsRoomSn, messages }) => {
          if (target.id !== imageIdRef.current) return;
          /** 화면에만 둔 사진 대신 저장 메시지를 그림: 사진 메시지에 미리보기를 붙임 */
          const photoMsg = messages.find(
            (message) => message.roleCd === AI_ROLE.USER,
          );
          if (photoMsg) {
            setPhotoPreviews((prev) => ({
              ...prev,
              [photoMsg.aiCnvrsMsgSn]: previewUrl,
            }));
          }
          setFirstMessage(null);
          setSelectedRoomSn(aiCnvrsRoomSn);
          updateImage(target.id, { aiCnvrsRoomSn });
          goImageKind({ ...target, aiCnvrsRoomSn }, kind);
        },
        onError: (error) => {
          if (target.id !== imageIdRef.current) return;
          /** 열린 방이 사라짐(남의 방·없는 번호) */
          if (error?.code === 'NOT_FOUND') {
            handleOpenRoomDeleted();
            return;
          }
          updateImage(target.id, {
            status: 'failed',
            errorMessage: IMAGE_ERROR_CODES.includes(error?.code)
              ? error.message
              : IMAGE_SEND_FAILED,
          });
        },
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

  /** 플로팅 버튼 진입: 고른 칩 기준 목록(사이드바와 같은 캐시)이 오면 맨 위 방을 한 번만 연다 */
  const conversationsQuery = useConversations(selectedPetSn);
  const isRecentPendingRef = useRef(openRecent);
  useEffect(() => {
    if (!isRecentPendingRef.current) return;
    if (conversationsQuery.isError) {
      isRecentPendingRef.current = false;
      return;
    }
    const rooms = conversationsQuery.data;
    if (!rooms) return;
    isRecentPendingRef.current = false;
    /** 목록이 오기 전에 이미 보냈거나 방을 골랐으면 그대로 */
    if (rooms.length === 0 || selectedRoomSn !== null || answer.pendingText) {
      return;
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 서버 목록이 처음 온 시점에 한 번 방을 고름 */
    handleSelectRoom(rooms[0].aiCnvrsRoomSn);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 목록이 처음 올 때 한 번만 */
  }, [conversationsQuery.data, conversationsQuery.isError]);

  /** 내용이 바뀔 때(답변 글자·카드·말풍선) 따라가는 중이면 맨 아래로 */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const gap = () => el.scrollHeight - el.scrollTop - el.clientHeight;
    const endSmooth = () => {
      isSmoothRef.current = false;
      clearTimeout(smoothTimerRef.current);
    };
    const handleScroll = () => {
      if (isSmoothRef.current) {
        if (gap() <= 1) endSmooth();
        return;
      }
      followRef.current = gap() <= FOLLOW_GAP;
    };
    const observer = new MutationObserver(() => {
      if (!followRef.current) return;
      if (isSmoothRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    el.addEventListener('scroll', handleScroll, { passive: true });
    el.addEventListener('scrollend', endSmooth);
    /** 사용자가 직접 굴리면 부드럽게를 멈추고 위치로 다시 판단 */
    const userEvents = ['wheel', 'touchstart', 'keydown'];
    userEvents.forEach((name) =>
      el.addEventListener(name, endSmooth, { passive: true }),
    );
    return () => {
      observer.disconnect();
      endSmooth();
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('scrollend', endSmooth);
      userEvents.forEach((name) => el.removeEventListener(name, endSmooth));
    };
  }, []);
  /** 방을 열거나 옮기면 맨 아래부터(보낸 뒤 새 방이 생긴 때는 이어지는 부드러운 스크롤 유지) */
  useEffect(() => {
    if (isSmoothRef.current) followRef.current = true;
    else followBottom();
  }, [selectedRoomSn]);

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
              {onBack && <CloseButton onClick={onBack} />}
            </header>
          )}
          {/** 방이 생겼거나 골랐는데 상세를 받기 전·못 받음: 헤더 틀과 닫기 유지 */}
          {selectedRoomSn !== null && !conversation && (
            <header className={chatHeaderClass}>
              <DrawerButton onClick={openDrawer} />
              {!isError && <Skeleton className="h-6 w-48" />}
              {onBack && <CloseButton onClick={onBack} />}
            </header>
          )}
          {conversation && (
            <ConversationHeader
              conversation={conversation}
              pets={pets}
              onOpenDrawer={openDrawer}
              onNewChat={handleNewChat}
              onBack={onBack}
              onDeleted={handleOpenRoomDeleted}
            />
          )}
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-8 max-[760px]:px-4 max-[760px]:py-5"
          >
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
                photoPreviews={photoPreviews}
                isChoiceDisabled={isAnswering}
                onChoosePet={(pet) => handleSend(pet.petNm, pet.petSn)}
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
                    onChooseKind={(kind) =>
                      goImageKind({ ...image, isChosen: true }, kind)
                    }
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
