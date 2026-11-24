import { useEffect, useRef, useState } from 'react';

/** 글 전체를 펼치는 프레임 수: 약 1초(60fps). 짧은 글은 한 프레임에 한 글자라 더 빨리 끝난다 */
const REVEAL_FRAMES = 60;

/** 이모지 등 두 칸 문자의 뒤 칸: 그 사이에서 자르지 않는다 */
const isLowSurrogate = (code) => code >= 0xdc00 && code <= 0xdfff;

/** 다시 마운트돼도 이어 펼치기: memoKey별 지금까지 보인 길이(확인 카드가 목록에서 자리를 옮길 때) */
const shownByKey = new Map();

/** 다른 곳(답변 말풍선)에서 이미 다 보인 글: 다시 그려도 바로 전체 */
export const markRevealed = (memoKey) =>
  shownByKey.set(memoKey, Number.POSITIVE_INFINITY);

/** 저장된 AI 메시지의 펼치기 키 */
export const messageTypingKey = (aiCnvrsMsgSn) => `message-${aiCnvrsMsgSn}`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * [AI 답변 글자 펼치기] 받은 글을 앞에서부터 조금씩 보여 준다(사람 요청 2026-11-24 "한번에 빡 보여지는데")
 * - 글이 스트림으로 늘어나면 이어서 펼치고, 한 프레임에 (전체 길이 / 60)자씩이라 긴 글도 약 1초
 * - isEnabled가 false거나 동작 줄이기 설정이면 처음부터 전체
 * - memoKey: 같은 글이 다시 마운트돼도(목록 자리 이동) 처음부터 다시 펼치지 않고 이어 간다
 * - 반환: { text: 지금 보일 글, isRevealing: 아직 펼치는 중 }
 */
export default function useTypewriter(text, isEnabled, memoKey = null) {
  const [isAnimated] = useState(() => isEnabled && !prefersReducedMotion());
  const [shownLength, setShownLength] = useState(() => {
    if (!isAnimated) return text.length;
    return memoKey == null ? 0 : (shownByKey.get(memoKey) ?? 0);
  });
  const shownRef = useRef(shownLength);

  useEffect(() => {
    if (!isAnimated) return undefined;
    let frame = 0;
    const tick = () => {
      const current = Math.min(shownRef.current, text.length);
      if (current >= text.length) {
        shownRef.current = current;
        setShownLength(current);
        return;
      }
      const step = Math.max(1, Math.ceil(text.length / REVEAL_FRAMES));
      let next = Math.min(text.length, current + step);
      if (next < text.length && isLowSurrogate(text.charCodeAt(next))) {
        next += 1;
      }
      shownRef.current = next;
      if (memoKey != null) shownByKey.set(memoKey, next);
      setShownLength(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, isAnimated, memoKey]);

  if (!isAnimated) return { text, isRevealing: false };
  const length = Math.min(shownLength, text.length);
  return { text: text.slice(0, length), isRevealing: length < text.length };
}
