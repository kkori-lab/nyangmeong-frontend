import { useSyncExternalStore } from 'react';
import { getToasts, subscribe } from './toastStore';

export default function ToastContainer() {
  const toasts = useSyncExternalStore(subscribe, getToasts);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 max-[761px]:bottom-[calc(76px+env(safe-area-inset-bottom))]"
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
