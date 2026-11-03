import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';

const ARROW_CLASS =
  'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink-2 hover:enabled:bg-surface-2 disabled:cursor-not-allowed disabled:text-line-strong';

/** 받는 중이면 로딩 자리, 실패하면 아이콘 칸 */
function InquiryImage({ url, alt, className }) {
  if (url === undefined) return <Skeleton className={className} />;
  if (!url) {
    return (
      <span
        role="img"
        aria-label={`${alt}을 불러오지 못했어요`}
        className={`grid place-items-center bg-surface-2 text-line-strong ${className}`}
      >
        <ImageIcon className="size-6" aria-hidden="true" />
      </span>
    );
  }
  return <img src={url} alt={alt} className={`object-cover ${className}`} />;
}

/** 크게 보기: 이전·다음 버튼과 ←·→ 키로 넘김 */
function InquiryImageModal({ imgs, urls, index, onChange, onClose }) {
  const current = imgs[index];
  const name = current.orgnlFileNm || `첨부 이미지 ${index + 1}`;
  const url = urls[current.atchFileSn];
  const hasPrev = index > 0;
  const hasNext = index < imgs.length - 1;

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft' && hasPrev) onChange(index - 1);
    if (event.key === 'ArrowRight' && hasNext) onChange(index + 1);
  };

  return (
    <Modal title={name} isWide onClose={onClose}>
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="첨부 이미지 넘기기"
        onKeyDown={handleKeyDown}
      >
        {imgs.length > 1 && (
          <button
            type="button"
            aria-label="이전 이미지"
            className={ARROW_CLASS}
            disabled={!hasPrev}
            onClick={() => onChange(index - 1)}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        )}
        <div className="flex min-h-60 min-w-0 flex-1 items-center justify-center rounded-[10px] bg-surface-2">
          {url ? (
            <img
              src={url}
              alt={name}
              className="max-h-[60dvh] max-w-full object-contain"
            />
          ) : (
            <InquiryImage url={url} alt={name} className="size-60" />
          )}
        </div>
        {imgs.length > 1 && (
          <button
            type="button"
            aria-label="다음 이미지"
            className={ARROW_CLASS}
            disabled={!hasNext}
            onClick={() => onChange(index + 1)}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
      {imgs.length > 1 && (
        <p className="mt-3 text-center text-sm text-subtle tabular-nums">
          {index + 1} / {imgs.length}
        </p>
      )}
    </Modal>
  );
}

/**
 * [1:1 문의 첨부 이미지]
 * - imgs: [{ atchFileSn, sortSeq, orgnlFileNm }], urls: { [atchFileSn]: 주소 }(undefined는 받는 중, null은 실패)
 * - 썸네일을 누르면 크게 보기
 */
export default function InquiryImages({ imgs, urls }) {
  const [viewerIndex, setViewerIndex] = useState(null);

  if (imgs.length === 0) {
    return (
      <p className="rounded-[14px] border border-line bg-white py-8 text-center text-base text-subtle">
        첨부 이미지가 없어요
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-wrap gap-3 rounded-[14px] border border-line bg-white p-4">
        {imgs.map((img, index) => {
          const name = img.orgnlFileNm || `첨부 이미지 ${index + 1}`;
          return (
            <li key={img.atchFileSn}>
              <button
                type="button"
                aria-label={`${name} 크게 보기`}
                className="block cursor-pointer overflow-hidden rounded-[10px] border border-line hover:border-line-strong"
                onClick={() => setViewerIndex(index)}
              >
                <InquiryImage
                  url={urls[img.atchFileSn]}
                  alt={name}
                  className="size-24"
                />
              </button>
            </li>
          );
        })}
      </ul>
      {viewerIndex !== null && (
        <InquiryImageModal
          imgs={imgs}
          urls={urls}
          index={viewerIndex}
          onChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
