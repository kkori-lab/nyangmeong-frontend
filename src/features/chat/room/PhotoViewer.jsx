/**
 * [사진 보기]
 * - 채팅 사진을 누르면 어두운 배경 전체 화면으로 크게 본다. 방에서 불러온 모든 사진을 시간 순으로 넘겨 본다(카카오톡 사진 보기)
 * - 모바일: 좌우 스와이프(스크롤 스냅). PC: 양옆 ‹ › 버튼, 키보드 ← →. ✕·Esc로 닫는다. 위에 「현재 / 전체」
 * - 사진은 비공개라 참여자 쿠키로 받는 useChatImage를 슬라이드마다 쓴다(보이는 슬라이드 근처만 받는다)
 */
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FileImage from '@/components/FileImage';
import { useChatImage } from '../queries';

/** 현재 슬라이드에서 이만큼 떨어진 슬라이드는 이미지를 받지 않는다 */
const LOAD_RANGE = 1;

function Slide({ otoChatRoomSn, atchFileSn, isNear }) {
  const { src, isPending } = useChatImage(
    otoChatRoomSn,
    isNear ? atchFileSn : null,
  );

  return (
    <li className="grid h-full w-full shrink-0 snap-center place-items-center px-3 max-[760px]:px-0">
      {isNear && (
        <FileImage
          src={src}
          pending={isPending}
          alt="채팅 사진"
          className="max-h-full max-w-full object-contain"
        />
      )}
    </li>
  );
}

export default function PhotoViewer({
  photos,
  startIndex,
  otoChatRoomSn,
  onClose,
}) {
  const listRef = useRef(null);
  const [index, setIndex] = useState(startIndex);
  const last = photos.length - 1;

  const goTo = (next, behavior = 'smooth') => {
    const list = listRef.current;
    if (!list) return;
    const clamped = Math.min(Math.max(next, 0), last);
    list.scrollTo({ left: clamped * list.clientWidth, behavior });
  };

  /** 처음 열 때 누른 사진으로 */
  useLayoutEffect(() => {
    const list = listRef.current;
    list.scrollLeft = startIndex * list.clientWidth;
  }, [startIndex]);

  /** 키보드: ← → 넘기기, Esc는 사진 보기만 닫는다(채팅 창은 그대로) */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        goTo(index - 1);
      } else if (event.key === 'ArrowRight') {
        goTo(index + 1);
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  });

  const handleScroll = (event) => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    setIndex(Math.round(scrollLeft / clientWidth));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="사진 보기"
      className="fixed inset-0 z-50 bg-black/95 text-white"
    >
      <ul
        ref={listRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, photoIndex) => (
          <Slide
            key={photo.atchFileSn}
            otoChatRoomSn={otoChatRoomSn}
            atchFileSn={photo.atchFileSn}
            isNear={Math.abs(photoIndex - index) <= LOAD_RANGE}
          />
        ))}
      </ul>

      <div className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-2">
        <span className="pl-3 text-sm font-medium tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          aria-label="사진 보기 닫기"
          className="grid size-11 place-items-center rounded-full hover:bg-white/15"
          onClick={onClose}
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>

      {index > 0 && (
        <button
          type="button"
          aria-label="이전 사진"
          className="absolute top-1/2 left-4 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 hover:bg-black/70 max-[760px]:hidden [@media(hover:none)]:hidden"
          onClick={() => goTo(index - 1)}
        >
          <ChevronLeft size={28} aria-hidden="true" />
        </button>
      )}
      {index < last && (
        <button
          type="button"
          aria-label="다음 사진"
          className="absolute top-1/2 right-4 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 hover:bg-black/70 max-[760px]:hidden [@media(hover:none)]:hidden"
          onClick={() => goTo(index + 1)}
        >
          <ChevronRight size={28} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
