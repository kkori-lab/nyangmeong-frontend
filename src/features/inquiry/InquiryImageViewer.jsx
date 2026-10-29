import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

const ARROW_CLASS =
  'absolute top-1/2 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[rgba(15,23,35,0.62)] text-white hover:bg-[rgba(15,23,35,0.85)] max-[760px]:size-10';

/**
 * 첨부 이미지 크게 보기: 제목 줄·판 없이 어두운 배경 위에 이미지만 띄운다
 * - imgs: 서버 첨부 [{ atchFileSn, sortSeq, orgnlFileNm }], urls: { [atchFileSn]: blob 주소 }
 * - index: 지금 보는 장(0부터). 파일명은 이미지 위, 「N / 전체」는 이미지 아래(여러 장일 때만)
 * - ←·→ 키와 좌우 화살표로 넘기고 처음·끝에서는 그쪽 화살표가 없다. ✕·이미지 밖 클릭·ESC로 닫힌다
 */
export default function InquiryImageViewer({
  imgs,
  urls,
  index,
  onChange,
  onClose,
}) {
  const dialogRef = useRef(null);
  const current = imgs[index];
  const url = urls[current.atchFileSn];
  const hasPrev = index > 0;
  const hasNext = index < imgs.length - 1;
  const name = current.orgnlFileNm || `첨부 이미지 ${index + 1}`;

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

  /** 안쪽 요소는 pointer-events-auto라 dialog 자신이나 빈 가운데 판이 눌린 것은 이미지 밖이다 */
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
        <p className="pointer-events-auto max-w-full truncate text-base leading-normal text-white">
          {name}
        </p>
        {url ? (
          <img
            src={url}
            alt={name}
            className="pointer-events-auto max-h-[calc(100dvh-10rem)] max-w-full object-contain"
          />
        ) : (
          <span
            role="img"
            aria-label={`${name} 이미지를 불러오지 못했어요`}
            className="pointer-events-auto grid size-60 place-items-center rounded-[10px] bg-[#2b2b2b] text-[#8c9899] max-[760px]:size-48"
          >
            <ImageIcon size={48} aria-hidden="true" />
          </span>
        )}
        {imgs.length > 1 && (
          <p className="pointer-events-auto text-base leading-normal text-white">
            {index + 1} / {imgs.length}
          </p>
        )}
      </div>

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
