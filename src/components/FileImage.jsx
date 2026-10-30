import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

/**
 * [파일 이미지]
 * - 공개: <FileImage src={publicFileUrl(atchFileSn)} className="size-full object-cover" />
 * - 비공개: const { src, isPending } = useFileImage(...) -> <FileImage src={src} pending={isPending} />
 * - 받는 중이면 로딩 자리, 주소가 없거나 열리지 않으면(404 등) fallback(없으면 아이콘 칸). 크기·모양은 className
 */
export default function FileImage({
  src,
  alt = '',
  className = '',
  pending = false,
  fallback,
}) {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);

  /** 넘긴 바탕색보다 로딩 색 우선 */
  if (pending) return <Skeleton className={`${className} bg-[#e9eded]!`} />;

  if (!src || failedSrc === src) {
    if (fallback) return fallback;
    return (
      <span
        className={`grid place-items-center bg-[#f4f6f6] text-[#9aa5a6] ${className}`}
      >
        <ImageOff className="size-6" aria-hidden="true" />
      </span>
    );
  }

  /** 공개 주소 이미지가 오기 전 로딩 색 */
  const loading = loadedSrc === src ? '' : ' animate-pulse bg-[#e9eded]!';
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
      className={`${className}${loading}`}
    />
  );
}
