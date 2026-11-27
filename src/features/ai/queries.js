import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { healthKeys } from '@/features/health/queries';
import {
  analyzeChatLabPdf,
  analyzeEye,
  analyzeSkin,
  createChatCheckup,
  findChatNearSchedule,
  getChatCheckups,
  getChatObservationItems,
  getChatBreeds,
  getChatPets,
  getChatPixelCharacter,
  getChatReceivedInvitation,
  getChatSentInvitations,
  getChatShopItems,
  saveChatEquippedImage,
  analyzeChatReceipt,
  deleteConversation,
  executeAction,
  getChatReceiptResult,
  getConversation,
  getConversations,
  judgeImageIntent,
  recognizeCheckupReceipt,
  saveActionResult,
  saveCheckupCard,
  saveLesionCard,
  saveReceiptResult,
} from './api';

export const aiKeys = {
  lists: ['ai', 'conversations', 'list'],
  list: (petSn) => ['ai', 'conversations', 'list', petSn],
  detail: (aiCnvrsRoomSn) => ['ai', 'conversations', 'detail', aiCnvrsRoomSn],
  receipt: (recptSn, petSn) => ['ai', 'receipts', recptSn, petSn],
  checkups: ['ai', 'checkups'],
  checkupList: (petSn) => ['ai', 'checkups', petSn],
  observationItemList: (petSn) => ['ai', 'observation-items', petSn],
  /** 반려동물 쓰기 확인 카드의 이름 조회: 카드 실행이 성공하면 모두 다시 읽는다 */
  pet: ['ai', 'pet'],
  pets: ['ai', 'pet', 'pets'],
  receivedInvitation: (jntBrupInvtnSn) => [
    'ai',
    'pet',
    'received-invitation',
    jntBrupInvtnSn,
  ],
  sentInvitations: ['ai', 'pet', 'sent-invitations'],
  shopItems: (pixelCharSn) => ['ai', 'pet', 'shop-items', pixelCharSn],
  pixelCharacter: (pixelCharSn) => [
    'ai',
    'pet',
    'pixel-character',
    pixelCharSn,
  ],
  breeds: (petSeCd) => ['ai', 'pet', 'breeds', petSeCd],
};

/** 초대 발송 카드의 반려동물 이름 */
export const useChatPets = () =>
  useQuery({ queryKey: aiKeys.pets, queryFn: getChatPets });

/** 수락·거절 카드의 받은 초대 */
export const useChatReceivedInvitation = (jntBrupInvtnSn) =>
  useQuery({
    queryKey: aiKeys.receivedInvitation(jntBrupInvtnSn),
    queryFn: () => getChatReceivedInvitation(jntBrupInvtnSn),
    enabled: jntBrupInvtnSn != null,
  });

/** 취소 카드의 보낸 초대 목록 */
export const useChatSentInvitations = () =>
  useQuery({
    queryKey: aiKeys.sentInvitations,
    queryFn: getChatSentInvitations,
  });

/** 구매 카드의 상점 아이템과 보유 포인트 */
export const useChatShopItems = (pixelCharSn) =>
  useQuery({
    queryKey: aiKeys.shopItems(pixelCharSn),
    queryFn: () => getChatShopItems(pixelCharSn),
    enabled: pixelCharSn != null,
  });

/** 착용 카드의 보유 아이템 */
export const useChatPixelCharacter = (pixelCharSn) =>
  useQuery({
    queryKey: aiKeys.pixelCharacter(pixelCharSn),
    queryFn: () => getChatPixelCharacter(pixelCharSn),
    enabled: pixelCharSn != null,
  });

/** 반려동물 등록 카드의 품종 이름 */
export const useChatBreeds = (petSeCd) =>
  useQuery({
    queryKey: aiKeys.breeds(petSeCd),
    queryFn: () => getChatBreeds(petSeCd),
    enabled: !!petSeCd,
  });

/**
 * 착용 저장 뒤 대표 이미지 저장: 성공·실패와 관계없이 끝나면 캐릭터 그림(전신·얼굴)을 다시 읽는다
 * - 캐릭터 그림 키는 반려동물 화면(features/pet useSaveEquippedItems)과 같은 ['pets', petSn, 'character-image']
 */
export const useSaveChatEquippedImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveChatEquippedImage,
    onSettled: (_, __, { petSn }) =>
      queryClient.invalidateQueries({
        queryKey: ['pets', petSn, 'character-image'],
      }),
  });
};

/** 관찰 기록 추가 확인 카드의 관찰 항목 목록 */
export const useChatObservationItems = (petSn) =>
  useQuery({
    queryKey: aiKeys.observationItemList(petSn),
    queryFn: () => getChatObservationItems(petSn),
    enabled: petSn != null,
  });

/** 검사 수치 확인 카드의 검진기록 목록 */
export const useChatCheckups = (petSn) =>
  useQuery({
    queryKey: aiKeys.checkupList(petSn),
    queryFn: () => getChatCheckups(petSn),
    enabled: petSn != null,
  });

/** 대화창에서 분석한 영수증의 인식 결과: 본창 결과 확인 모달용 */
export const useChatReceiptResult = ({ recptSn, petSn }) =>
  useQuery({
    queryKey: aiKeys.receipt(recptSn, petSn),
    queryFn: () => getChatReceiptResult({ recptSn, petSn }),
    enabled: recptSn != null && petSn != null,
    retry: false,
    /** 모달은 진입 때 한 번만 열므로 재조회 없음 */
    staleTime: Infinity,
  });

/** 대화 목록 조회 */
export const useConversations = (petSn) =>
  useQuery({
    queryKey: aiKeys.list(petSn),
    queryFn: () => getConversations(petSn),
    /** 반려동물 목록을 받아 기본 칩(대표 반려동물)이 정해진 뒤 조회 */
    enabled: petSn !== undefined,
  });

export const useConversation = (aiCnvrsRoomSn) =>
  useQuery({
    queryKey: aiKeys.detail(aiCnvrsRoomSn),
    queryFn: () => getConversation(aiCnvrsRoomSn),
    enabled: aiCnvrsRoomSn != null,
  });

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    /** 삭제된 대화 상세는 무효화 대신 캐시 제거 */
    onSuccess: (_, aiCnvrsRoomSn) => {
      queryClient.removeQueries({ queryKey: aiKeys.detail(aiCnvrsRoomSn) });
      queryClient.invalidateQueries({ queryKey: aiKeys.lists });
    },
  });
};

/** 결과 요약 메시지 저장: 그 메시지가 붙은 대화 상세 갱신 */
const useResultMessage = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_, { aiCnvrsRoomSn }) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.detail(aiCnvrsRoomSn),
      });
    },
  });
};

/**
 * 확인 카드 Java 실행: 성공 뒤 본창 새로고침은 화면이 알린다(aiWriteChannel)
 * - 대화창이 있는 창의 다른 도메인 캐시도 다시 받는다
 * - /ai-chat은 UserLayout 밖이라, 같은 탭에서 건강 일지로 돌아가면 바꾼 관찰 사진이 캐시(5분) 그대로 보였다
 */
export const useExecuteAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executeAction,
    /** 다시 받기를 기다리지 않고 결과 저장으로 넘어간다 */
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] !== 'ai',
      });
      /**
       * 이름 조회는 다시 읽되, 초대는 빼고 앞 값을 둔다: 처리한 초대의 GET은 보낸 사람·반려동물이 비어
       * 실행 뒤 카드가 "초대 N"으로 바뀐다(검증 2026-11-27)
       */
      queryClient.invalidateQueries({
        queryKey: aiKeys.pet,
        predicate: ({ queryKey }) =>
          !['received-invitation', 'sent-invitations'].includes(queryKey[2]),
      });
    },
  });
};

/** 확인 카드 결과 저장: 결과 요약 메시지가 붙은 대화 상세 갱신 */
export const useSaveActionResult = () => useResultMessage(saveActionResult);

/** 검진 영수증 인식 */
export const useRecognizeCheckupReceipt = () =>
  useMutation({ mutationFn: recognizeCheckupReceipt });

/** 첨부 사진+글의 의도 판단: 사진 턴이 저장된 대화 목록·상세 갱신 */
export const useJudgeImageIntent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: judgeImageIntent,
    onSuccess: ({ aiCnvrsRoomSn }) => {
      queryClient.invalidateQueries({ queryKey: aiKeys.lists });
      queryClient.invalidateQueries({
        queryKey: aiKeys.detail(aiCnvrsRoomSn),
      });
    },
  });
};

/** 대화창 영수증 분석 */
export const useAnalyzeChatReceipt = () =>
  useMutation({ mutationFn: analyzeChatReceipt });

/** 대화창 검사결과지 PDF 분석 */
export const useAnalyzeChatLabPdf = () =>
  useMutation({ mutationFn: analyzeChatLabPdf });

/** 대화창 피부 사진 분석 */
export const useAnalyzeSkin = () => useMutation({ mutationFn: analyzeSkin });

/** 대화창 눈 사진 분석 */
export const useAnalyzeEye = () => useMutation({ mutationFn: analyzeEye });

/** 대화창 피부·눈 분석 결과 저장: 대화를 다시 받은 뒤 끝냄(말풍선을 걷을 때 요약이 바로 보이게) */
export const useSaveLesionCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveLesionCard,
    onSuccess: ({ aiCnvrsRoomSn }) => {
      queryClient.invalidateQueries({ queryKey: aiKeys.lists });
      return queryClient.invalidateQueries({
        queryKey: aiKeys.detail(aiCnvrsRoomSn),
      });
    },
  });
};

/** 대화창 검진기록 만들기: 가까운 예정 병원 일정 */
export const useFindChatNearSchedule = () =>
  useMutation({ mutationFn: findChatNearSchedule });

/** 대화창 검진기록 만들기: 건강기록 검진·일정·케어리스트 캐시 갱신 */
export const useCreateChatCheckup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChatCheckup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.checkups });
      queryClient.invalidateQueries({ queryKey: healthKeys.schedules });
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
      queryClient.invalidateQueries({ queryKey: aiKeys.checkups });
    },
  });
};

/** 대화창 검사결과지 결과 저장: 대화를 다시 받은 뒤 끝냄(말풍선을 걷을 때 요약이 바로 보이게) */
export const useSaveCheckupCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCheckupCard,
    onSuccess: ({ aiCnvrsRoomSn }) => {
      queryClient.invalidateQueries({ queryKey: aiKeys.lists });
      return queryClient.invalidateQueries({
        queryKey: aiKeys.detail(aiCnvrsRoomSn),
      });
    },
  });
};

/** 대화창 영수증 결과 이력 저장: 메시지가 저장된 대화 갱신 */
export const useSaveReceiptResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveReceiptResult,
    onSuccess: ({ aiCnvrsRoomSn }) => {
      queryClient.invalidateQueries({ queryKey: aiKeys.lists });
      queryClient.invalidateQueries({
        queryKey: aiKeys.detail(aiCnvrsRoomSn),
      });
    },
  });
};
