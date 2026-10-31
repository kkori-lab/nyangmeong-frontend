/**
 * [상대 동작 흉내: 개발 확인용]
 * - /chat?fakeChatTools=1 에서만 표시. 상대의 수락·완료 요청 같은 서버 반영을 가짜로 발생
 * - 채팅 API(KSJ)를 붙일 때 이 파일과 api.js의 fakePeerAct 삭제
 */
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/components/toastStore';
import { fakePeerAct } from '../api';
import { chatKeys } from '../queries';

const PEER_ACTIONS = [
  { type: 'say', label: '상대 말하기' },
  { type: 'accept', label: '상대 수락' },
  { type: 'doneRequest', label: '상대 완료 요청' },
  { type: 'confirm', label: '상대 완료 확인' },
  { type: 'receive', label: '상대 수령 확인' },
  { type: 'cancel', label: '상대 요청 취소' },
  { type: 'timeout', label: '14일 지남' },
  { type: 'leave', label: '상대 나감' },
];

const isEnabled =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get('fakeChatTools') === '1';

export default function FakePeerTools({ otoChatRoomSn }) {
  const queryClient = useQueryClient();

  if (!isEnabled) return null;

  const handleClick = async (type) => {
    try {
      await fakePeerAct({ otoChatRoomSn, type });
    } catch (error) {
      showToast(error.message);
    }
    queryClient.invalidateQueries({ queryKey: chatKeys.detail(otoChatRoomSn) });
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(otoChatRoomSn),
    });
    queryClient.invalidateQueries({ queryKey: chatKeys.lists });
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-line bg-surface-2 px-3 py-1.5 text-xs">
      <span className="font-semibold text-subtle">확인용</span>
      {PEER_ACTIONS.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          className="h-7 rounded-md border border-line bg-white px-2 text-ink-2 hover:bg-surface-3"
          onClick={() => handleClick(type)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
