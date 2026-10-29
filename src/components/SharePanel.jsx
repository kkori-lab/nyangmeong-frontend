import { Link2, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { showToast } from '@/components/toastStore';

const itemClass =
  'flex h-10 w-full cursor-pointer items-center gap-2 px-4 text-left text-sm font-medium text-[#3d4a4b] hover:bg-[#f4f6f6]';

/** 공유하기: 누르면 패널에 [링크 복사], 브라우저가 지원하면 [다른 앱으로 공유] */
export default function SharePanel({ title }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const canShare = typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleCopy = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크를 복사했어요');
    } catch {
      showToast('링크를 복사하지 못했어요');
    }
  };

  const handleShare = async () => {
    setOpen(false);
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      /** 사용자가 공유 창을 닫으면 AbortError: 알림 없음 */
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="공유하기"
        aria-expanded={open}
        className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-1 text-sm leading-normal font-medium text-[#667374] hover:text-[#1a3234]"
      >
        <Share2 size={20} aria-hidden="true" />
        <span className="max-[760px]:hidden">공유하기</span>
      </button>
      {open && (
        <div className="absolute right-0 bottom-full z-10 mb-2 w-48 overflow-hidden rounded-xl border border-[#e2e7e7] bg-white py-1">
          <button type="button" onClick={handleCopy} className={itemClass}>
            <Link2 size={16} />
            링크 복사
          </button>
          {canShare && (
            <button type="button" onClick={handleShare} className={itemClass}>
              <Share2 size={16} />
              다른 앱으로 공유
            </button>
          )}
        </div>
      )}
    </div>
  );
}
