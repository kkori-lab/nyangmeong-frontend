import { useEffect } from 'react';

/** 지금 잠근 창 수. 0 → 1에서 잠그고 1 → 0에서만 푼다(창이 겹쳐도 마지막이 닫힐 때 풀린다) */
let lockCount = 0;
let savedStyles = null;

const lock = () => {
  lockCount += 1;
  if (lockCount > 1) return;
  const { documentElement: html, body } = document;
  savedStyles = {
    htmlOverflow: html.style.overflow,
    htmlGutter: html.style.scrollbarGutter,
    bodyOverflow: body.style.overflow,
    bodyOverscroll: body.style.overscrollBehavior,
  };
  /** 스크롤바가 사라지며 화면이 밀리지 않게 자리를 남긴다 */
  html.style.scrollbarGutter = 'stable';
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';
};

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyles) return;
  const { documentElement: html, body } = document;
  html.style.overflow = savedStyles.htmlOverflow;
  html.style.scrollbarGutter = savedStyles.htmlGutter;
  body.style.overflow = savedStyles.bodyOverflow;
  body.style.overscrollBehavior = savedStyles.bodyOverscroll;
  savedStyles = null;
};

/** 창이 열려 있는 동안(마운트된 동안) 페이지 스크롤을 잠근다. 마우스 휠과 터치 모두 막힌다 */
export default function useScrollLock() {
  useEffect(() => {
    lock();
    return unlock;
  }, []);
}
