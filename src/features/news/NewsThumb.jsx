/**
 * 썸네일 주소(언론사 URL 또는 공개 파일)로 표시. 주소가 없으면 아무것도 그리지 않는다
 * - 불러오지 못하면 onError로 알려 부모가 칸(출처 캡션 포함)을 접는다. 점선 자리 표시는 없다
 * - natural: 원본 비율·크기 그대로, 본문보다 크면 줄이고 작으면 가운데(상세)
 */
export default function NewsThumb({
  src,
  className = '',
  natural = false,
  onError,
}) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={onError}
      className={
        natural
          ? 'mx-auto block h-auto max-w-full rounded-[14px]'
          : `overflow-hidden rounded-[10px] bg-[#f4f6f6] object-cover ${className}`
      }
    />
  );
}
