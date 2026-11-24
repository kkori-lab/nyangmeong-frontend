import { useEffect } from 'react';

/**
 * [펼침 창 공용] 달력·셀렉트·시간 목록이 모달 본문 overflow에 잘리지 않게 띄우고, 열린 동안 바깥 스크롤을 막는다
 * (사람 요청 2026-11-23, Radix·MUI Select처럼 포털 + 스크롤 잠금)
 */

/**
 * 포털을 붙일 곳: 모달 안이면 그 모달, 아니면 body
 * - <dialog>은 맨 위층이라 body에 붙이면 가려짐
 * - role="dialog"인 고정 창(AI 매니저 창 z-35 등)도 body의 펼침 창(z-30)보다 위라 그 창에 붙인다
 */
export const getPortalTarget = (anchor) =>
  anchor?.closest('dialog, [role="dialog"]') ?? document.body;

/**
 * position: fixed 기준점. 포털 대상에 transform·translate가 있으면 fixed가 화면이 아니라 그 요소 기준이 되므로
 * 그 요소 왼쪽 위만큼 빼서 쓴다(모바일 아래 시트를 끄는 중 등)
 */
export const getFixedOrigin = (target) => {
  if (!target || target === document.body) return { x: 0, y: 0 };
  const style = getComputedStyle(target);
  const isContaining =
    style.transform !== 'none' ||
    (style.translate && style.translate !== 'none') ||
    style.filter !== 'none';
  if (!isContaining) return { x: 0, y: 0 };
  const rect = target.getBoundingClientRect();
  return { x: rect.left, y: rect.top };
};

/** target에서 root까지 올라가며 그 방향으로 더 스크롤할 수 있는 요소가 있는지 */
const canScrollInside = (target, root, deltaY) => {
  for (
    let el = target;
    el && el !== root.parentElement;
    el = el.parentElement
  ) {
    const { overflowY } = getComputedStyle(el);
    const isScrollable =
      (overflowY === 'auto' || overflowY === 'scroll') &&
      el.scrollHeight > el.clientHeight;
    if (isScrollable) {
      if (deltaY < 0 && el.scrollTop > 0) return true;
      if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)
        return true;
      if (deltaY === 0) return true;
    }
    if (el === root) break;
  }
  return false;
};

/**
 * 열린 동안 휠·터치 끌기로 페이지·모달 본문이 스크롤되지 않게 막는다.
 * 펼침 창(layerRef) 안에서 스스로 스크롤하는 목록은 그대로 스크롤되고, 끝에 닿아도 바깥으로 넘어가지 않는다
 */
export function useLockOutsideScroll(isOpen, layerRef) {
  useEffect(() => {
    if (!isOpen) return undefined;
    let touchY = 0;
    const allow = (target, deltaY) => {
      const layer = layerRef.current;
      return Boolean(
        layer &&
        layer.contains(target) &&
        canScrollInside(target, layer, deltaY),
      );
    };
    const handleWheel = (event) => {
      if (!allow(event.target, event.deltaY)) event.preventDefault();
    };
    const handleTouchStart = (event) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const handleTouchMove = (event) => {
      const y = event.touches[0]?.clientY ?? touchY;
      const deltaY = touchY - y;
      touchY = y;
      if (!allow(event.target, deltaY)) event.preventDefault();
    };
    const options = { capture: true, passive: false };
    document.addEventListener('wheel', handleWheel, options);
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    return () => {
      document.removeEventListener('wheel', handleWheel, options);
      document.removeEventListener('touchstart', handleTouchStart, options);
      document.removeEventListener('touchmove', handleTouchMove, options);
    };
  }, [isOpen, layerRef]);
}
