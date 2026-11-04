import { Newspaper } from 'lucide-react';
import { useState } from 'react';

/**
 * 썸네일 주소(언론사 URL 또는 공개 파일)로 표시. 없거나 불러오지 못하면 자리 표시(className 크기)
 * - natural: 원본 비율·크기 그대로, 본문보다 크면 줄이고 작으면 가운데(상세)
 */
export default function NewsThumb({
  src,
  className = '',
  iconSize = 40,
  natural = false,
}) {
  const [failed, setFailed] = useState(false);
  const base = `overflow-hidden rounded-[10px] bg-[#f4f6f6] ${className}`;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid place-items-center border border-dashed border-[#b9c4c4] text-[#b9c4c4] ${base}`}
      >
        <Newspaper size={iconSize} />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={
        natural
          ? 'mx-auto block h-auto max-w-full rounded-[14px]'
          : `object-cover ${base}`
      }
    />
  );
}
