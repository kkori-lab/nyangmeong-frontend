import { useEffect, useRef } from 'react';
import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';

/**
 * [사진 확대 화면] 모달 안을 덮는 확대 화면. [닫기]·바깥을 누르면 onClose
 * - zoom: ZoomBox가 넘긴 { image, label }
 * - 열면 [닫기]에 포커스, Esc는 확대 화면만 닫음(둘러보기 모달은 Modal isDismissDisabled로 Esc·배경을 막는다)
 * - 건강기록 둘러보기·메인 서비스 둘러보기가 같이 쓴다
 */
export default function ZoomOverlay({ zoom, onClose }) {
  const closeRef = useRef(null);

  /** 열릴 때 한 번만 포커스(부모가 다시 그려져도 옮기지 않음) */
  useEffect(() => {
    closeRef.current.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`${zoom.label} 사진 크게 보기`}
      className="absolute inset-0 z-10 flex flex-col gap-3 rounded-modal bg-brand-900/80 p-6 max-[760px]:rounded-b-none max-[760px]:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-semibold text-white">
          {zoom.label}
        </p>
        <button
          ref={closeRef}
          type="button"
          className={`${BTN_SECONDARY} shrink-0 text-ink-2`}
          onClick={onClose}
        >
          <Icon name="close" className="text-lg" />
          닫기
        </button>
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <img
          src={zoom.image.src}
          alt={zoom.image.alt}
          className="max-h-full max-w-full rounded-box bg-white object-contain"
        />
      </div>
    </div>
  );
}
