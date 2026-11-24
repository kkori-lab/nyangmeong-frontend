import { useCallback, useEffect, useRef, useState } from 'react';

const DOCK_KEY = 'nyangmeong-ai-dock';
/** 말풍선 본 기록: 회원별 */
const bubbleSeenKey = (mbrSn) => `nyangmeong-ai-bubble-seen.${mbrSn}`;
const MOBILE_QUERY = '(width < 760px)';
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
function hasSeenBubble(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return true;
  }
}

/**
 * 모바일에서 플로팅 묶음(AI 버튼·반려동물 등록)을 우측 가장자리로 접고 펴는 상태 + 회원별 첫 말풍선
 * - dragHandlers는 묶음을 감싼 요소에 붙인다. 안의 어느 버튼을 끌어도 묶음이 같이 밀린다
 * - mbrSn: 로그인한 회원 번호. 없으면(비로그인) 말풍선 없음, 기록 안 함
 * - shown: 버튼이 실제로 그려지는지. 메인처럼 안 그려지는 동안은 본 것으로 치지 않음
 */
export default function useAiDock({ mbrSn = null, shown = true } = {}) {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );
  /** 저장값이 없으면 접힘 */
  const [collapsed, setCollapsed] = useState(
    () => readStorage(DOCK_KEY) !== 'open',
  );
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** 말풍선을 정한 회원 키와 표시 여부. 회원이 바뀌면(다른 계정 로그인) 다시 정함 */
  const [bubble, setBubble] = useState({ key: null, visible: false });
  const drag = useRef({ startX: 0, moved: false, active: false });
  const suppressClick = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = (event) => setIsMobile(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const memberKey = mbrSn == null ? null : bubbleSeenKey(mbrSn);
  /** 버튼이 그려지는 화면에 처음 왔을 때 그 회원 기록으로 표시 여부를 정함 */
  if (shown && memberKey !== null && bubble.key !== memberKey) {
    setBubble({ key: memberKey, visible: !hasSeenBubble(memberKey) });
  }
  const bubbleVisible = shown && bubble.key === memberKey && bubble.visible;

  /** 말풍선은 한 번 뜬 것으로 기록한다. 펼치거나 닫을 때까지 유지 */
  useEffect(() => {
    if (bubbleVisible) writeStorage(bubble.key, '1');
  }, [bubbleVisible, bubble.key]);

  const updateCollapsed = useCallback((next) => {
    setCollapsed(next);
    writeStorage(DOCK_KEY, next ? 'closed' : 'open');
  }, []);

  const closeBubble = useCallback(
    () => setBubble((prev) => ({ ...prev, visible: false })),
    [],
  );
  const expand = useCallback(() => {
    updateCollapsed(false);
    closeBubble();
  }, [updateCollapsed, closeBubble]);

  const onPointerDown = (event) => {
    if (!isMobile) return;
    drag.current = { startX: event.clientX, moved: false, active: true };
  };

  const onPointerMove = (event) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true;
      setDragging(true);
      /** 끌기 시작한 뒤에만 포인터를 잡는다. 누르자마자 잡으면 묶음 안 버튼(AI·등록)의 click이 묶음으로 가서 열리지 않는다 */
      event.currentTarget.setPointerCapture(event.pointerId);
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
