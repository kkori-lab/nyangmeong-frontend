import { useCallback, useEffect, useRef, useState } from 'react';

const DOCK_KEY = 'nyangmeong-ai-dock';
const BUBBLE_SEEN_KEY = 'nyangmeong-ai-bubble-seen';
const MOBILE_QUERY = '(max-width: 760px)';
/** 이 거리(px)보다 오른쪽으로 끌고 놓으면 접힘 */
const FOLD_DISTANCE = 40;
/** 이 거리(px) 안의 움직임은 클릭으로 간주 */
const DRAG_THRESHOLD = 4;

/** 저장소가 막혀 있어도 화면이 깨지지 않게 감싸기 */
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /** 저장 못 해도 이번 방문에서는 동작 */
  }
}

/** 저장소를 못 읽으면 본 것으로 처리해 말풍선 매번 표시 방지 */
function hasSeenBubble() {
  try {
    return localStorage.getItem(BUBBLE_SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

/** 모바일에서 AI 버튼을 우측 가장자리로 접고 펴는 상태 + 첫 방문 말풍선 */
export default function useAiDock() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );
  /** 저장값이 없으면 접힘 */
  const [collapsed, setCollapsed] = useState(
    () => readStorage(DOCK_KEY) !== 'open',
  );
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(() => !hasSeenBubble());
  const drag = useRef({ startX: 0, moved: false, active: false });
  const suppressClick = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = (event) => setIsMobile(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  /** 말풍선은 한 번 뜬 것으로 기록한다. 펼치거나 닫을 때까지 유지 */
  useEffect(() => {
    if (bubbleVisible) writeStorage(BUBBLE_SEEN_KEY, '1');
  }, [bubbleVisible]);

  const updateCollapsed = useCallback((next) => {
    setCollapsed(next);
    writeStorage(DOCK_KEY, next ? 'closed' : 'open');
  }, []);

  const closeBubble = useCallback(() => setBubbleVisible(false), []);
  const expand = useCallback(() => {
    updateCollapsed(false);
    setBubbleVisible(false);
  }, [updateCollapsed]);

  const onPointerDown = (event) => {
    if (!isMobile) return;
    drag.current = { startX: event.clientX, moved: false, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true;
      setDragging(true);
    }
    /** 우측으로만 끌기 */
    setOffset(Math.max(0, dx));
  };

  const onPointerEnd = (event) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.startX;
    const { moved } = drag.current;
    drag.current.active = false;
    setDragging(false);
    setOffset(0);
    if (moved) {
      /** 끈 직후 따라오는 click은 AI 창 열림 차단 */
      suppressClick.current = true;
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      if (dx > FOLD_DISTANCE) updateCollapsed(true);
    }
  };

  /** 끈 직후면 false */
  const consumeClick = () => !suppressClick.current;

  return {
    isMobile,
    folded: isMobile && collapsed,
    offset,
    dragging,
    bubbleVisible: bubbleVisible && !dragging,
    expand,
    closeBubble,
    consumeClick,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}
