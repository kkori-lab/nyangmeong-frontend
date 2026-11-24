import { useLayoutEffect } from 'react';

/**
 * 바로 앞 사이드 메뉴(sticky)가 스크롤에 붙을 때 이 요소(sticky)도 메뉴 바로 아래에 같이 붙는다. 건강기록 반려동물 카드와 실종센터 가이드 버튼이 쓴다
 * - 요소는 SubPageLayout의 SideMenu 바로 다음 형제여야 한다(previousElementSibling을 메뉴로 본다)
 * - 붙는 높이 = 메뉴의 계산된 top + 메뉴 높이 + 이 카드의 위 여백. 값은 화면에서 읽어 따로 적지 않는다
 * - 메뉴가 sticky가 아니면(1100px 이하 등 top이 auto) 비워 둔다
 * - 사이드 열 끝에 닿아 카드가 밀려 올라가면 메뉴도 같은 만큼 올림: 카드가 메뉴를 덮지 않게
 */
/** 사이드 메뉴(레이아웃 소유) sticky top 조정 */
const setTop = (node, value) => {
  node.style.top = value;
};

export default function useStickBelowMenu(ref, isEnabled, layoutKey) {
  useLayoutEffect(() => {
    const element = ref.current;
    const menu = element?.previousElementSibling;
    if (!isEnabled || !menu) return undefined;
    /** 메뉴 원래 sticky top, 카드가 붙는 top */
    let menuTop = NaN;
    let stickTop = NaN;
    /** 카드가 사이드 열 끝에 밀린 만큼 메뉴 top 올림 */
    const follow = () => {
      if (Number.isNaN(menuTop)) return;
      const columnBottom = element.parentElement.getBoundingClientRect().bottom;
      const overlap = stickTop + element.offsetHeight - columnBottom;
      setTop(menu, overlap > 0 ? `${menuTop - overlap}px` : '');
    };
    const update = () => {
      setTop(menu, '');
      const isSticky = getComputedStyle(element).position === 'sticky';
      menuTop = isSticky ? parseFloat(getComputedStyle(menu).top) : NaN;
      if (Number.isNaN(menuTop)) {
        element.style.top = '';
        return;
      }
      const marginTop = parseFloat(getComputedStyle(element).marginTop) || 0;
      stickTop = menuTop + menu.offsetHeight + marginTop;
      element.style.top = `${stickTop}px`;
      follow();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(menu);
    observer.observe(element);
    observer.observe(element.parentElement);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', follow, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', follow);
      setTop(menu, '');
    };
  }, [ref, isEnabled, layoutKey]);
}
