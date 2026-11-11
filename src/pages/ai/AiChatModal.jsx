import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import { useAiModal } from '@/context/aiModal';
import { useChatModal } from '@/context/chatModal';
import useScrollLock from '@/hooks/useScrollLock';
import AiChatScreen from './AiChatScreen';

/**
 * [AI 매니저 모달] (SCR-COM-007, 모든 폭: 사람 결정 2026-11-11 PC도 새 창 대신 모달)
 * - 헤더 아래 전체 화면, 본문은 `/ai` 새 창과 같은 AiChatScreen
 * - [✕]·Esc·페이지 이동에 닫힘, 다시 열면 새 대화
 * - 여는 연출(useOpenMotion): 메인 검색창에서 열면 검색창이 대화창 입력 자리로 옮겨 가며 대화창으로 바뀌고,
 *   플로팅 버튼에서 열면 오른쪽 아래에서 커진다
 * - 닫는 연출(useCloseWithMotion): [✕]·Esc로 닫을 때 플로팅 버튼에서 연 모달은 오른쪽 아래로 작아지고,
 *   메인 검색창에서 연 모달은 입력 줄이 메인 검색창(`data-ai-origin-input`) 자리로 돌아간다
 * - transform-gpu: 대화 목록 drawer(fixed)를 헤더 아래 모달 안에 가두기 위함
 */

/** 연출 길이(ms) */
const INPUT_MOTION_MS = 560;
const FAB_MOTION_MS = 320;
const FADE_MOTION_MS = 200;
/** 검색창 이동 중 대화창이 다 나타나는 지점(이동 시간 대비) */
const SCREEN_FADE_RATIO = 0.7;
/** 복제 → 실제 입력 줄로 바뀌기 시작하는 지점(이동 시간 대비) */
const SWAP_FROM = 0.75;
/** 닫을 때 실제 입력 줄 → 복제로 바뀌는 데 쓰는 앞부분(이동 시간 대비) */
const SWAP_TO = 0.2;
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
/** 이동: 빨리 출발해 부드럽게 멈춤 */
const EASE_TRAVEL = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const FAB_SHRUNK = { transform: 'scale(0.1)', opacity: 0 };
const FAB_FULL = { transform: 'scale(1)', opacity: 1 };

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 복제 검색창의 한 자리: 위치·크기·모서리 */
const placeOf = (rect, borderRadius) => ({
  left: `${rect.left}px`,
  top: `${rect.top}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  borderRadius,
});

/**
 * 여는 연출: 패널이 처음 그려질 때 한 번
 * - from 'input'(사람 2026-11-11 "인풋이 ai 채팅 입력 자리로 위치하면서 ai 채팅으로 바뀌는 것"):
 *   메인 검색창 복제(ghost)가 검색창 자리에서 대화창 입력 줄 자리로 옮겨 가는 동안 대화창이 함께 나타나고,
 *   도착할 무렵 복제와 실제 입력 줄이 같은 자리에서 교차해 바뀐다
 * - from 'fab': 패널이 오른쪽 아래를 기준으로 작게 시작해 커진다
 * - 그 밖: 짧게 나타남. 동작 줄이기 설정이면 연출 없음
 */
function useOpenMotion(panelRef, backdropRef, origin) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel?.animate || prefersReducedMotion()) return undefined;
    const animations = [];
    const play = (element, keyframes, options) => {
      if (!element) return null;
      const animation = element.animate(keyframes, options);
      animations.push(animation);
      return animation;
    };
    const ghost = origin?.from === 'input' ? origin.ghost : null;
    /** 개발 모드 두 번 실행·도중에 닫힘: 연출 멈추고 복제 치우기 */
    const cleanup = () => {
      animations.forEach((animation) => animation.cancel());
      ghost?.remove();
    };

    if (origin?.from === 'fab') {
      play(panel, [FAB_SHRUNK, FAB_FULL], {
        duration: FAB_MOTION_MS,
        easing: EASE_OUT,
      });
      play(backdrop, [{ opacity: 0 }, { opacity: 1 }], {
        duration: FAB_MOTION_MS,
      });
      return cleanup;
    }

    const input = panel.querySelector('[data-ai-chat-input]');
    const to = input?.getBoundingClientRect();
    const from = origin?.rect;
    if (!ghost || !from || !to || to.width === 0 || to.height === 0) {
      play(panel, [{ opacity: 0 }, { opacity: 1 }], {
        duration: FADE_MOTION_MS,
        easing: 'ease-out',
      });
      return cleanup;
    }

    /**
     * 한 흐름으로 겹친다(사람 2026-11-11 "이동이랑 화면 전환이 끊김"):
     * - 0~INPUT_MOTION_MS: 복제가 옮겨 간다
     * - 같은 시간 앞쪽(SCREEN_FADE_RATIO): 대화창·어두운 배경이 함께 서서히 나타난다
     * - 끝 무렵(SWAP_FROM~1): 복제는 사라지고 실제 입력 줄이 같은 자리에서 나타난다(교차)
     */
    const screenFade = {
      duration: INPUT_MOTION_MS * SCREEN_FADE_RATIO,
      easing: 'ease-out',
    };
    play(panel, [{ opacity: 0 }, { opacity: 1 }], screenFade);
    play(backdrop, [{ opacity: 0 }, { opacity: 1 }], screenFade);
    play(
      input,
      [{ opacity: 0 }, { opacity: 0, offset: SWAP_FROM }, { opacity: 1 }],
      { duration: INPUT_MOTION_MS, easing: 'linear' },
    );

    Object.assign(ghost.style, {
      position: 'fixed',
      zIndex: '40',
      margin: '0',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      /** 메인 검색창의 max-w-[600px]가 대화창 입력 줄 폭(PC 772px 등)으로 늘어나는 것을 막지 않게 */
      maxWidth: 'none',
      ...placeOf(from, ''),
    });
    document.body.append(ghost);
    const fromPlace = placeOf(from, getComputedStyle(ghost).borderRadius);
    const toPlace = placeOf(to, getComputedStyle(input).borderRadius);
    play(ghost, [fromPlace, toPlace], {
      duration: INPUT_MOTION_MS,
      easing: EASE_TRAVEL,
      fill: 'forwards',
    });
    const swap = play(
      ghost,
      [{ opacity: 1 }, { opacity: 1, offset: SWAP_FROM }, { opacity: 0 }],
      { duration: INPUT_MOTION_MS, easing: 'linear', fill: 'forwards' },
    );
    swap.finished.then(() => ghost.remove()).catch(() => {});
    return cleanup;
  }, [panelRef, backdropRef, origin]);
}

/** 닫는 연출 동안 위에 띄울 메인 검색창 복제: id·파일 입력을 빼고 조작을 막는다 */
const cloneMainInput = (form) => {
  const ghost = form.cloneNode(true);
  ghost
    .querySelectorAll('ul, input[type="file"]')
    .forEach((element) => element.remove());
  ghost
    .querySelectorAll('[id]')
    .forEach((element) => element.removeAttribute('id'));
  ghost.removeAttribute('role');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  return ghost;
};

/**
 * 메인 검색창으로 돌아가며 닫기(사람 2026-11-11 "닫았을 때 복귀 애니메이션도"): 여는 연출의 거꾸로
 * - 처음(0~SWAP_TO): 대화창 입력 줄이 메인 검색창 복제로 교차해 바뀐다
 * - 복제가 메인 검색창 자리로 돌아가는 동안 대화창·어두운 배경이 함께 사라진다
 * - 끝 무렵(SWAP_FROM~1): 복제가 사라지며 그 아래 실제 메인 검색창이 남는다
 * 메인 검색창이 화면에 없으면 false(호출한 쪽이 바로 닫음)
 */
const playReturnToInput = (panel, backdrop, onDone) => {
  const input = panel.querySelector('[data-ai-chat-input]');
  const mainForm = document.querySelector('[data-ai-origin-input]');
  const from = input?.getBoundingClientRect();
  const to = mainForm?.getBoundingClientRect();
  if (!from || !to || from.width === 0 || to.width === 0) return false;

  const ghost = cloneMainInput(mainForm);
  Object.assign(ghost.style, {
    position: 'fixed',
    zIndex: '40',
    margin: '0',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    /** 메인 검색창의 max-w-[600px]가 대화창 입력 줄 폭(PC 772px 등)으로 늘어나는 것을 막지 않게 */
    maxWidth: 'none',
    ...placeOf(from, ''),
  });
  document.body.append(ghost);
  const fromPlace = placeOf(from, getComputedStyle(input).borderRadius);
  const toPlace = placeOf(to, getComputedStyle(mainForm).borderRadius);

  const screenFade = {
    duration: INPUT_MOTION_MS * SCREEN_FADE_RATIO,
    easing: 'ease-in',
    fill: 'forwards',
  };
  panel.animate([{ opacity: 1 }, { opacity: 0 }], screenFade);
  backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], screenFade);
  ghost.animate([fromPlace, toPlace], {
    duration: INPUT_MOTION_MS,
    easing: EASE_TRAVEL,
    fill: 'forwards',
  });
  ghost
    .animate(
      [
        { opacity: 0 },
        { opacity: 1, offset: SWAP_TO },
        { opacity: 1, offset: SWAP_FROM },
        { opacity: 0 },
      ],
      { duration: INPUT_MOTION_MS, easing: 'linear', fill: 'forwards' },
    )
    .finished.then(
      () => {
        ghost.remove();
        onDone();
      },
      () => {
        ghost.remove();
        onDone();
      },
    );
  return true;
};

/**
 * 닫기([✕]·Esc)
 * - 플로팅 버튼에서 열었으면 오른쪽 아래로 작아지며 닫힘(사람 2026-11-11 "복귀할 때 스케일 다운")
 * - 메인 검색창에서 열었으면 검색창 자리로 돌아가며 닫힘(playReturnToInput)
 * - 그 밖·동작 줄이기면 바로 닫힘. 화면 이동으로 닫을 때는 이 함수를 쓰지 않는다
 */
function useCloseWithMotion(panelRef, backdropRef, origin, closeNow) {
  const isClosingRef = useRef(false);
  return useCallback(() => {
    const panel = panelRef.current;
    const from = origin?.from;
    if (
      (from !== 'fab' && from !== 'input') ||
      !panel?.animate ||
      prefersReducedMotion()
    ) {
      closeNow();
      return;
    }
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const finish = () => {
      isClosingRef.current = false;
      closeNow();
    };

    if (from === 'input') {
      if (!playReturnToInput(panel, backdropRef.current, finish)) finish();
      return;
    }

    const options = {
      duration: FAB_MOTION_MS,
      easing: EASE_IN,
      fill: 'forwards',
    };
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], options);
    panel
      .animate([FAB_FULL, FAB_SHRUNK], options)
      .finished.then(finish, finish);
  }, [panelRef, backdropRef, origin, closeNow]);
}

function AiChatModalPanel({ backdropRef }) {
  const { openKey, firstMessage, file, origin, close: closeNow } = useAiModal();
  const { open: openChatModal } = useChatModal();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useScrollLock();
  useOpenMotion(panelRef, backdropRef, origin);
  const close = useCloseWithMotion(panelRef, backdropRef, origin, closeNow);

  /** 열릴 때 모달로 포커스 */
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  /** Esc 닫기: drawer·안쪽 dialog의 Esc는 제외 */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest('dialog')) {
        return;
      }
      close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  /** 같은 창에서 화면 이동 후 모달 닫기 */
  const handleOpenMain = useCallback(
    (path) => {
      closeNow();
      navigate(path);
    },
    [closeNow, navigate],
  );

  /** AI 모달 대신 펫돌봄 채팅 모달 */
  const handleOpenCareChat = () => {
    closeNow();
    openChatModal();
  };

  /** 넘긴 사진 그대로 사용 */
  const loadAttachment = file ? async () => file : null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby="ai-modal-title"
      tabIndex={-1}
      className="fixed inset-x-0 top-16 bottom-0 z-35 flex origin-bottom-right transform-gpu flex-col overflow-hidden bg-white pb-[env(safe-area-inset-bottom)] outline-none"
    >
      <header className="flex h-16 shrink-0 items-center gap-1 border-b border-line pr-4 pl-5">
        <h2
          id="ai-modal-title"
          className="flex-1 text-xl leading-[1.3] font-bold tracking-[-0.03em] text-ink"
        >
          AI 매니저
        </h2>
        <button
          type="button"
          aria-label="닫기"
          title="닫기"
          className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-surface-3"
          onClick={close}
        >
          <Icon name="close" className="text-2xl" />
        </button>
      </header>

      <AiChatScreen
        key={openKey}
        initialMessage={firstMessage}
        loadAttachment={loadAttachment}
        onOpenMain={handleOpenMain}
        onOpenCareChat={handleOpenCareChat}
        className="min-h-0 flex-1"
      />
    </div>
  );
}

export default function AiChatModal() {
  const { isOpen, close } = useAiModal();
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  const backdropRef = useRef(null);

  /** 페이지 이동 시 닫기 */
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    if (isOpen) close();
  }, [pathname, isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-35 bg-[#0f1723]/45"
        aria-hidden="true"
      />
      <AiChatModalPanel backdropRef={backdropRef} />
    </>
  );
}
