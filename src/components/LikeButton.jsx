import { Heart } from 'lucide-react';
import { useState } from 'react';

/**
 * 좋아요 버튼: 하트와 개수. 누르면 하트만 주황빨강, 안 누르면 회색 하트. 개수는 항상 진회색(ink-2)
 * - isLiked가 false에서 true로 바뀐 순간에만 하트가 한 번 통 튄다(취소·처음 그릴 때는 없음, 동작 줄이기 설정이면 없음)
 * - onToggle: 눌렀을 때 호출. 부모가 isLiked를 바꾼다(커뮤니티는 낙관적 갱신으로 누르는 즉시, 실패하면 되돌림)
 */
export default function LikeButton({ isLiked, count, disabled, onToggle }) {
  /** 렌더 중에 이전 값과 견줘 바뀐 순간을 잡는다(효과 없이) */
  const [prevLiked, setPrevLiked] = useState(isLiked);
  const [isPopping, setIsPopping] = useState(false);
  if (isLiked !== prevLiked) {
    setPrevLiked(isLiked);
    setIsPopping(isLiked);
  }

  return (
    <button
      type="button"
      aria-pressed={isLiked}
      aria-label="좋아요"
      disabled={disabled}
      onClick={onToggle}
      className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-base font-semibold text-ink-2 ${isLiked ? '[&_svg]:text-[#f44b21]' : '[&_svg]:text-line-strong'}`}
    >
      <Heart
        size={22}
        aria-hidden="true"
        fill="currentColor"
        className={
          isPopping
            ? 'animate-[like-pop_0.4s_ease-in-out] motion-reduce:animate-none'
            : ''
        }
      />
      {count}
    </button>
  );
}
