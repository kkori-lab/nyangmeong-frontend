import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ARROW_CLASS =
  'absolute top-1/2 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[rgba(15,23,35,0.62)] text-white hover:bg-[rgba(15,23,35,0.85)] max-[760px]:size-10';

/**
 * 이미지 크게 보기: 판 없이 어두운 배경 위에 이미지만 표시(화면에 맞춘 크기, 작은 원본은 늘리지 않음)
 * - images: [{ key, src, name }] (src가 없으면 불러오지 못한 자리 표시, name은 화면 맨 위 ✕와 같은 줄 가운데에 고정)
 * - index: 지금 보는 장(0부터). 「N / 전체」는 이미지 아래(여러 장일 때만)
 * - ←·→ 키와 좌우 화살표로 넘기고 처음·끝에서는 그쪽 화살표 없음. ✕·이미지 밖 클릭·ESC로 닫힘
 * - src가 바뀌어 아직 받는 중이면 자리 표시(공개 주소를 바로 불러 큰 사진이 느릴 때)
 */
export default function ImageViewer({ images, index, onChange, onClose }) {
  const dialogRef = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const { src: url, name } = images[index];
  const isLoading = Boolean(url) && loadedSrc !== url;
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft' && hasPrev) onChange(index - 1);
    if (event.key === 'ArrowRight' && hasNext) onChange(index + 1);
  };

  /** 안쪽 요소는 pointer-events-auto라 dialog 자신이나 빈 가운데 판이 눌린 것은 이미지 밖 */
  const handleMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${name} 크게 보기`}
      className="m-0 size-full max-h-none max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-[rgba(30,30,30,0.92)]"
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    >
      <div className="pointer-events-none flex size-full flex-col items-center justify-center gap-3 px-20 max-[760px]:px-12">
        {url ? (
          <>
            {isLoading && (
              <span
                role="status"
                aria-label="이미지를 불러오는 중이에요"
                className="pointer-events-auto size-60 animate-pulse rounded-[10px] bg-[#2b2b2b] max-[760px]:size-48"
              />
            )}
            <img
              key={url}
              src={url}
              alt={name}
              onLoad={() => setLoadedSrc(url)}
              onError={() => setLoadedSrc(url)}
              className={`pointer-events-auto max-h-[calc(100dvh-10rem)] max-w-full object-contain ${isLoading ? 'hidden' : ''}`}
            />
          </>
        ) : (
          <span
            role="img"
            aria-label={`${name} 이미지를 불러오지 못했어요`}
            className="pointer-events-auto grid size-60 place-items-center rounded-[10px] bg-[#2b2b2b] text-[#8c9899] max-[760px]:size-48"
          >
            <ImageIcon size={48} aria-hidden="true" />
          </span>
        )}
        {images.length > 1 && (
          <p className="pointer-events-auto text-base leading-normal text-white">
            {index + 1} / {images.length}
          </p>
        )}
      </div>

      <p className="pointer-events-auto absolute top-4 left-1/2 flex h-10 w-[calc(100%-8rem)] -translate-x-1/2 items-center justify-center text-base leading-normal text-white max-[760px]:top-2 max-[760px]:w-[calc(100%-6rem)]">
        <span className="truncate">{name}</span>
      </p>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center rounded-full text-white hover:bg-[rgba(255,255,255,0.15)] max-[760px]:top-2 max-[760px]:right-2"
      >
        <X size={24} aria-hidden="true" />
      </button>
      {hasPrev && (
        <button
          type="button"
          aria-label="이전 이미지"
          onClick={() => onChange(index - 1)}
          className={`${ARROW_CLASS} left-4 max-[760px]:left-1`}
        >
          <ChevronLeft size={28} aria-hidden="true" />
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          aria-label="다음 이미지"
          onClick={() => onChange(index + 1)}
          className={`${ARROW_CLASS} right-4 max-[760px]:right-1`}
        >
          <ChevronRight size={28} aria-hidden="true" />
        </button>
      )}
    </dialog>
  );
}
