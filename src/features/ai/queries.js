import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  analyzeChatReceipt,
  cancelRegister,
  confirmRegister,
  deleteConversation,
  getChatReceiptResult,
  getConversation,
  getConversations,
  recognizeCheckupReceipt,
  saveReceiptResult,
} from './api';

export const aiKeys = {
  lists: ['ai', 'conversations', 'list'],
  list: (petSn) => ['ai', 'conversations', 'list', petSn],
  detail: (aiCnvrsRoomSn) => ['ai', 'conversations', 'detail', aiCnvrsRoomSn],
  receipt: (recptSn, petSn) => ['ai', 'receipts', recptSn, petSn],
};

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

/** 등록 확정·취소 공통: 결과 요약 메시지가 붙은 대화 상세 갱신 */
const useRegisterAnswer = (mutationFn) => {
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

export const useConfirmRegister = () => useRegisterAnswer(confirmRegister);

export const useCancelRegister = () => useRegisterAnswer(cancelRegister);

/** 검진 영수증 인식 */
export const useRecognizeCheckupReceipt = () =>
  useMutation({ mutationFn: recognizeCheckupReceipt });

/** 대화창 영수증 분석 */
export const useAnalyzeChatReceipt = () =>
  useMutation({ mutationFn: analyzeChatReceipt });

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
