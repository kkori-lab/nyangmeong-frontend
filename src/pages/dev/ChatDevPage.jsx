/**
 * [채팅 창 확인용 DEV 화면]
 * - 게시글 [채팅하기]·[채팅 목록 보기](KSJ SCR-CMU-004) 전 FN-COM-009-02, FN-CMU-005-01·02 확인
 */
import useChatWindow from '@/hooks/useChatWindow';
import { PATHS } from '@/routes/paths';

const buttonClass =
  'h-10 rounded-lg border border-[#e2e7e7] bg-white px-4 text-sm text-[#3d4a4b] hover:bg-[#f4f6f6]';

/** 방마다 거래 상태·역할이 달라 한 번에 확인용 */
const ROOM_LINKS = [
  [1, '수락 대기 · 보호자(내가 올린 글)'],
  [2, '매칭 전 · 보호자'],
  [3, '요청 취소 · 보호자'],
  [4, '거래 완료 · 돌보미'],
  [5, '확인 대기 · 돌보미'],
  [6, '매칭 완료 · 돌보미'],
  [7, '확인 대기 · 보호자(완료 확인)'],
  [8, '수령 대기 · 돌보미'],
  [9, '수락 대기 · 돌보미(수락)'],
  [10, '매칭 취소 · 상대가 나간 방'],
];

export default function ChatDevPage() {
  const openChatWindow = useChatWindow();

  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-xl font-bold text-[#1a3234]">채팅 창 확인</h1>
      <button
        type="button"
        className={buttonClass}
        onClick={() => openChatWindow({ pstSn: 102 })}
      >
        채팅하기 (기존 방 있는 게시글 102)
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => openChatWindow({ pstSn: 999 })}
      >
        채팅하기 (방 없는 게시글 999 → 새 방)
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => openChatWindow({ listPstSn: 101 })}
      >
        채팅 목록 보기 (내 돌봄 글 101)
      </button>

      <h2 className="mt-4 font-bold text-[#1a3234]">
        거래 상태별 방 (상대 동작 버튼이 붙은 새 탭)
      </h2>
      <ul className="flex flex-col gap-1.5 text-sm">
        {ROOM_LINKS.map(([otoChatRoomSn, label]) => (
          <li key={otoChatRoomSn}>
            <a
              className="text-[#285a5c] underline"
              href={`${PATHS.CHAT}?otoChatRoomSn=${otoChatRoomSn}&fakeChatTools=1`}
              target="_blank"
              rel="noopener"
            >
              방 {otoChatRoomSn}: {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
