import { useEffect } from 'react';

/** 지금 잠근 창 수. 0 → 1에서 잠그고 1 → 0에서만 푼다(창이 겹쳐도 마지막이 닫힐 때 풀린다) */
let lockCount = 0;
let savedStyles = null;

/**
 * html에만 잠금을 건다
 * - body에도 overflow hidden을 걸면 body가 따로 스크롤되는 상자가 되어, 내린 채 열 때 sticky 헤더가 화면 위로 밀려난다(2026-11-13)
 */
const lock = () => {
  lockCount += 1;
  if (lockCount > 1) return;
  const html = document.documentElement;
  savedStyles = {
    overflow: html.style.overflow,
    gutter: html.style.scrollbarGutter,
    overscroll: html.style.overscrollBehavior,
  };
  /**
   * 스크롤바가 사라지며 화면이 밀리지 않게 자리를 남긴다
   * - 원래 스크롤바가 있을 때만: 없는 화면(메인 등)에 빈 자리를 새로 만들면 오히려 폭이 줄어 화면이 밀린다(2026-11-11)
   */
  const hasScrollbar = window.innerWidth > html.clientWidth;
  if (hasScrollbar) html.style.scrollbarGutter = 'stable';
  html.style.overflow = 'hidden';
  html.style.overscrollBehavior = 'none';
};

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyles) return;
  const html = document.documentElement;
  html.style.overflow = savedStyles.overflow;
  html.style.scrollbarGutter = savedStyles.gutter;
  html.style.overscrollBehavior = savedStyles.overscroll;
  savedStyles = null;
};

/** 창이 열려 있는 동안(마운트된 동안) 페이지 스크롤을 잠근다. 마우스 휠과 터치 모두 막힌다 */
export default function useScrollLock() {
  useEffect(() => {
    lock();
    return unlock;
  }, []);
}
