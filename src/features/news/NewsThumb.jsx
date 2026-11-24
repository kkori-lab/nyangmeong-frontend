import { useRef, useState } from 'react';

/** 칸을 채우려고 이만큼(배) 넘게 키워야 하면 작은 이미지로 본다. 조금(10%) 키우는 것은 채워 보인다 */
const SMALL_SCALE = 1.1;

/**
 * 썸네일 주소(언론사 URL 또는 공개 파일)로 표시. 주소가 없으면 아무것도 그리지 않는다
 * - 불러오지 못하면 onError로 알려 부모가 칸(출처 캡션 포함)을 접는다. 점선 자리 표시는 없다
 * - 목록 칸(기본): 칸을 채워 보인다(cover, 비율이 달라도 잘려서 채움).
 *   칸에 채우려면 많이 키워야 하는 작은 이미지만 원래 크기로 가운데에 두고, 남는 자리는 같은 이미지를 크게 늘려 흐리게 깐다(늘어나 뭉개지지 않게)
 * - natural: 원본 비율·크기 그대로, 본문보다 크면 줄이고 작으면 가운데(상세)
 */
export default function NewsThumb({
  src,
  className = '',
  natural = false,
  onError,
}) {
  const boxRef = useRef(null);
  const [isSmall, setIsSmall] = useState(false);

  if (!src) return null;

  if (natural) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={onError}
        className="mx-auto block h-auto max-w-full rounded-[14px]"
      />
    );
  }

  /** 불러온 크기와 칸 크기를 견줘, 칸을 채우려면 SMALL_SCALE보다 더 키워야 하면 작은 이미지로 본다 */
  const handleLoad = (event) => {
    const box = boxRef.current;
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!box || !naturalWidth || !naturalHeight) return;
    const coverScale = Math.max(
      box.clientWidth / naturalWidth,
      box.clientHeight / naturalHeight,
    );
    setIsSmall(coverScale > SMALL_SCALE);
  };

  return (
    <span
      ref={boxRef}
      className={`block overflow-hidden rounded-[10px] bg-surface-2 ${className}`}
    >
      {/* 작은 이미지일 때만: 흐린 배경. 같은 주소라 요청은 한 번이고, 장식이라 화면 읽기에서 뺀다 */}
      {isSmall && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full scale-125 object-cover opacity-80 blur-xl"
        />
      )}
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={onError}
        className={
          isSmall
            ? 'absolute inset-0 m-auto max-h-full max-w-full'
            : 'absolute inset-0 size-full object-cover'
        }
      />
    </span>
  );
}
