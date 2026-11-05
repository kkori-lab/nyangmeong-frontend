import { useEffect } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { showToast } from '@/components/toastStore';
import { useFileImage } from '@/hooks/useFileImage';
import {
  acceptCareMatch,
  cancelCareMatch,
  chatImageUrl,
  confirmCareCompletion,
  confirmCareReceipt,
  createChatMessage,
  createChatRoom,
  getCareMatch,
  getChatMessages,
  getChatRoom,
  getChatRooms,
  getChatUnreadCount,
  leaveChatRoom,
  readChatRoom,
  requestCareCompletion,
  requestCareMatch,
  searchChatPlaces,
} from './api';
import { retainChatRealtime, setViewingChatRoom } from './realtime';
import { MSG_TYPE } from './shared/chatCodes';

export const chatKeys = {
  lists: ['chat-rooms', 'list'],
  list: (unreadOnly) => ['chat-rooms', 'list', unreadOnly],
  unreadCount: ['chat-rooms', 'unread-count'],
  detail: (otoChatRoomSn) => ['chat-rooms', otoChatRoomSn, 'detail'],
  places: (keyword) => ['chat-places', keyword],
  messages: (otoChatRoomSn) => ['chat-rooms', otoChatRoomSn, 'messages'],
  image: (otoChatRoomSn, atchFileSn) => [
    'chat-rooms',
    otoChatRoomSn,
    'images',
    atchFileSn,
  ],
  careMatch: (petPrtcMtchSn) => ['care-matches', petPrtcMtchSn],
};

/** 메시지 캐시(최신순 페이지들)의 맨 앞에 새 메시지. 이미 있으면 그대로 */
const prependMessage = (queryClient, otoChatRoomSn, message) =>
  queryClient.setQueryData(chatKeys.messages(otoChatRoomSn), (data) => {
    if (!data) return data;
    const exists = data.pages.some((page) =>
      page.content.some((item) => item.chatMsgSn === message.chatMsgSn),
    );
    if (exists) return data;
    const [first, ...rest] = data.pages;
    return {
      ...data,
      pages: [{ ...first, content: [message, ...first.content] }, ...rest],
    };
  });

/** 목록 마지막 대화·안 읽은 수 다시 조회 */
const invalidateSummaries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: chatKeys.lists });
  queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount });
};

/** 거래 단계가 바뀌면 시스템 안내·거래 카드가 오므로 방 정보와 매칭도 다시 조회 */
const DEAL_MSG_TYPES = [MSG_TYPE.SYSTEM, MSG_TYPE.DEAL_CARD];

/** 실시간 수신을 캐시에 반영: 새 메시지는 그 방 대화에 붙이고, 읽음은 목록·배지만 */
const useChatRealtime = (enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return undefined;
    return retainChatRealtime((event) => {
      if (event.type === 'MESSAGE') {
        prependMessage(queryClient, event.otoChatRoomSn, event.message);
        if (DEAL_MSG_TYPES.includes(event.message.msgTypeCd)) {
          queryClient.invalidateQueries({
            queryKey: chatKeys.detail(event.otoChatRoomSn),
          });
          queryClient.invalidateQueries({ queryKey: ['care-matches'] });
        }
      }
      invalidateSummaries(queryClient);
    });
  }, [enabled, queryClient]);
};

/** 새 메시지는 실시간으로 반영, 연결이 끊긴 동안을 메우는 1분 주기 */
export const useChatRooms = (unreadOnly) => {
  useChatRealtime();
  return useQuery({
    queryKey: chatKeys.list(unreadOnly),
    queryFn: () => getChatRooms({ unreadOnly }),
    refetchInterval: 60_000,
  });
};

/** 헤더 배지: 채팅 창에서 읽고 본창으로 돌아오면 다시 조회. 로그인 전에는 enabled=false(조회·소켓 없음) */
export const useChatUnreadCount = (enabled = true) => {
  useChatRealtime(enabled);
  return useQuery({
    queryKey: chatKeys.unreadCount,
    queryFn: getChatUnreadCount,
    enabled,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
};

/** 최신순 커서 페이지를 오래된 순 목록으로. fetchNextPage가 더 오래된 30건 */
export const useChatMessages = (otoChatRoomSn) => {
  useChatRealtime();
  return useInfiniteQuery({
    queryKey: chatKeys.messages(otoChatRoomSn),
    queryFn: ({ pageParam }) =>
      getChatMessages({ otoChatRoomSn, beforeChatMsgSn: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.content.at(-1)?.chatMsgSn : undefined,
    select: (data) => data.pages.flatMap((page) => page.content).reverse(),
    enabled: otoChatRoomSn !== null,
  });
};

/** 지금 보는 방을 서버에 알림: 방을 닫거나 창이 포커스를 잃으면 null */
export const useViewingChatRoom = (otoChatRoomSn) => {
  useEffect(() => {
    const sync = () =>
      setViewingChatRoom(
        document.visibilityState === 'visible' && document.hasFocus()
          ? otoChatRoomSn
          : null,
      );
    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('blur', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('blur', sync);
      document.removeEventListener('visibilitychange', sync);
      setViewingChatRoom(null);
    };
  }, [otoChatRoomSn]);
};

/** 채팅 사진(참여자만, 쿠키 인증) */
export const useChatImage = (otoChatRoomSn, atchFileSn) =>
  useFileImage({
    queryKey: chatKeys.image(otoChatRoomSn, atchFileSn),
    url: chatImageUrl(otoChatRoomSn, atchFileSn),
  });

export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChatRoom,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.lists }),
    onError: (error) => showToast(error.message),
  });
};

export const useReadChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readChatRoom,
    onSuccess: () => invalidateSummaries(queryClient),
  });
};

/** 보낸 메시지는 응답으로 바로 대화에 붙임(실시간으로 같은 메시지가 와도 한 번만) */
export const useSendChatMessage = (otoChatRoomSn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => createChatMessage({ otoChatRoomSn, ...body }),
    onSuccess: (message) => {
      prependMessage(queryClient, otoChatRoomSn, message);
      queryClient.invalidateQueries({ queryKey: chatKeys.lists });
    },
  });
};

export const useChatRoom = (otoChatRoomSn) =>
  useQuery({
    queryKey: chatKeys.detail(otoChatRoomSn),
    queryFn: () => getChatRoom(otoChatRoomSn),
    enabled: otoChatRoomSn !== null,
    refetchInterval: 60_000,
  });

/** 합의 조건(cnd): 매칭 전(petPrtcMtchSn 없음)이면 조회하지 않음 */
export const useCareMatch = (petPrtcMtchSn) =>
  useQuery({
    queryKey: chatKeys.careMatch(petPrtcMtchSn),
    queryFn: () => getCareMatch(petPrtcMtchSn),
    enabled: petPrtcMtchSn !== null && petPrtcMtchSn !== undefined,
  });

/** 주소 공유 모달의 장소 목록: 키워드가 없으면 돌봄 글 동네 근처 */
export const useChatPlaces = (keyword) =>
  useQuery({
    queryKey: chatKeys.places(keyword),
    queryFn: () => searchChatPlaces({ keyword }),
  });

/** 거래 버튼이 부르는 API: 눌린 key → 함수. 요청은 방 기준, 나머지는 매칭 기준 */
const DEAL_API = {
  request: requestCareMatch,
  cancel: cancelCareMatch,
  accept: acceptCareMatch,
  doneRequest: requestCareCompletion,
  confirm: confirmCareCompletion,
  receive: confirmCareReceipt,
};

/** 거래 단계 변경 { action, cnclRsn }: 서버가 방·대화에 반영하므로 끝나면 다시 조회 */
export const useDealAction = (room) => {
  const queryClient = useQueryClient();
  const { otoChatRoomSn, petPrtcMtchSn } = room;

  return useMutation({
    mutationFn: ({ action, cnclRsn }) =>
      DEAL_API[action]({ otoChatRoomSn, petPrtcMtchSn, cnclRsn }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(otoChatRoomSn),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(otoChatRoomSn),
      });
      queryClient.invalidateQueries({ queryKey: ['care-matches'] });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists });
    },
    onError: (error) => showToast(error.message),
  });
};

export const useLeaveChatRoom = (otoChatRoomSn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveChatRoom(otoChatRoomSn),
    onSuccess: () => invalidateSummaries(queryClient),
    onError: (error) => showToast(error.message),
  });
};
