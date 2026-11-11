import { useEffect, useRef, useSyncExternalStore } from 'react';
import { getToasts, subscribe } from './toastStore';

/**
 * 공통 알림
 * - showModal()로 연 <dialog>는 top layer라 z-index로 못 이김 → popover(top layer)로 그림
 * - 알림이 바뀔 때마다 다시 띄워 그 사이 열린 모달보다 위로 올림
 */
export default function ToastContainer() {
  const toasts = useSyncExternalStore(subscribe, getToasts);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container?.showPopover) return;
    if (container.matches(':popover-open')) container.hidePopover();
    container.showPopover();
  }, [toasts]);

  return (
    <div
      ref={containerRef}
      popover="manual"
      className="fixed top-auto right-auto bottom-6 left-1/2 z-50 m-0 flex -translate-x-1/2 flex-col gap-2 overflow-visible border-0 bg-transparent p-0 max-[761px]:bottom-[calc(76px+env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
