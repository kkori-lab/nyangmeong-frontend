import { useCallback, useEffect, useRef, useState } from 'react';

/** 공용 스크롤바와 같은 조건: 마우스 기기에만(터치 폰은 기본 오버레이 바) */
const MOUSE_QUERY = '(hover: hover) and (pointer: fine)';
/** 막대 최소 길이(px): 아주 긴 페이지에서도 잡을 수 있게 */
const MIN_THUMB = 32;
/** 막대 칸 위아래 여백(px): 공용 스크롤바의 투명 테두리 3px와 같다 */
const INSET = 3;

/** 페이지가 잠겼는지: 모달이 html에 overflow hidden을 건 동안 */
const isLocked = () => {
  const html = document.documentElement;
  return (
    html.style.overflow === 'hidden' ||
    getComputedStyle(html).overflowY === 'hidden'
  );
};

/**
 * 페이지(html) 스크롤바를 내용 위에 겹쳐 그린다(사람 요청 2026-11-13)
 * - 브라우저 막대는 assets/index.css에서 숨긴다. 막대가 자리를 차지하지 않아 막대가 생기고 없어질 때 화면이 옆으로 밀리지 않는다
 * - 휠·키보드·터치패드 스크롤은 브라우저가 하고, 이 막대는 스크롤 위치를 따라 그린다. 끌기와 빈 곳 누르기만 직접 처리한다
 * - 스크롤이 안 되는 화면(메인 등)과 모달로 잠긴 동안은 그리지 않는다
 * - 스크롤 영역 안 막대(목록·모달)는 그대로 브라우저 막대다
 */
export default function PageScrollbar() {
  const [isMouse, setIsMouse] = useState(
    () => window.matchMedia(MOUSE_QUERY).matches,
  );
  const [bar, setBar] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const frameRef = useRef(0);

  /** 지금 스크롤 위치·길이로 막대 위치와 길이를 잰다. 그리지 않을 때는 null */
  const measure = useCallback(() => {
    const html = document.documentElement;
    const viewport = html.clientHeight;
    const total = html.scrollHeight;
    if (total <= viewport + 1 || isLocked()) {
      setBar(null);
      return;
    }
    const track = viewport - INSET * 2;
    const height = Math.max(MIN_THUMB, (track * viewport) / total);
    const maxScroll = total - viewport;
    const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    setBar({
      top: INSET + ratio * (track - height),
      height,
      // 막대 1px을 끌 때 페이지가 움직이는 거리
      scrollPerPx: maxScroll / (track - height),
    });
  }, []);

  /** 같은 화면 그리기 안에서 여러 번 불려도 한 번만 잰다 */
  const requestMeasure = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      measure();
    });
  }, [measure]);

  useEffect(() => {
    const media = window.matchMedia(MOUSE_QUERY);
    const handleChange = (event) => setIsMouse(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isMouse) return undefined;
    requestMeasure();
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);
    // 페이지 길이 변화: 목록을 더 불러오거나 아코디언을 펼칠 때, 화면을 옮길 때
    const resizeObserver = new ResizeObserver(requestMeasure);
    resizeObserver.observe(document.body);
    // 잠금 변화: 모달이 html의 style을 바꿀 때
    const mutationObserver = new MutationObserver(requestMeasure);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    return () => {
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, [isMouse, measure, requestMeasure]);

  /** 막대를 잡으면 누른 곳에서 움직인 거리만큼 페이지를 옮긴다 */
  const handleThumbPointerDown = (event) => {
    if (event.button !== 0 || !bar) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startY: event.clientY,
      startScroll: window.scrollY,
      scrollPerPx: bar.scrollPerPx,
    };
    setIsDragging(true);
  };

  const handleThumbPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    window.scrollTo({
      top: drag.startScroll + (event.clientY - drag.startY) * drag.scrollPerPx,
      behavior: 'instant',
    });
  };

  const handleThumbPointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  /** 막대 위아래 빈 곳을 누르면 그쪽으로 한 화면쯤 넘긴다(브라우저 막대와 같다) */
  const handleTrackPointerDown = (event) => {
    if (event.button !== 0 || !bar) return;
    event.preventDefault();
    const direction = event.clientY < bar.top ? -1 : 1;
    window.scrollBy({
      top: direction * document.documentElement.clientHeight * 0.875,
      behavior: 'instant',
    });
  };

  if (!isMouse || !bar) return null;

  return (
    <div
      aria-hidden="true"
      onPointerDown={handleTrackPointerDown}
      className="fixed top-0 right-0 bottom-0 z-40 w-2.5"
    >
      {/* 잡는 곳은 칸 너비(10px) 전체, 보이는 막대는 가운데 4px */}
      <div
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={handleThumbPointerUp}
        onPointerCancel={handleThumbPointerUp}
        style={{ top: bar.top, height: bar.height }}
        className="group absolute inset-x-0"
      >
        <div
          className={`mx-auto h-full w-1 rounded-full transition-colors ${
            isDragging
              ? 'bg-line-strong'
              : 'bg-input-line group-hover:bg-line-strong'
          }`}
        />
      </div>
    </div>
  );
}
