import { useQuery } from '@tanstack/react-query';

/** 맨 아래에서 발로 보는 줄 수(512px 기준) */
const FOOT_ROWS = 24;
const FOOT_ROWS_BASE = 512;
/** 이 값보다 투명한 픽셀은 빈 곳으로 본다(0~255) */
const ALPHA_MIN = 20;

/** 측정 전·실패 때 쓰는 값: 가로 가운데, 위아래는 기본 캐릭터 대략값. measured가 false면 크기 보정에 쓰지 않는다 */
const DEFAULT_FOOT_BOX = {
  x: 0.5,
  left: 0.25,
  right: 0.75,
  top: 0.15,
  bottom: 0.82,
  measured: false,
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

/** 이미지 안 캐릭터의 위·발 아래·좌우 끝과 발 가로 중심을 이미지 크기 대비 0~1로 잰다. 그림이 없으면 null */
const measureFootBox = async (src) => {
  const image = await loadImage(src);
  const { naturalWidth: width, naturalHeight: height } = image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, width, height);

  const rowRange = (y) => {
    let min = -1;
    let max = -1;
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_MIN) {
        if (min < 0) min = x;
        max = x;
      }
    }
    return min < 0 ? null : [min, max];
  };

  let top = -1;
  let bottom = -1;
  let left = width;
  let right = 0;
  for (let y = 0; y < height; y += 1) {
    const range = rowRange(y);
    if (range) {
      if (top < 0) top = y;
      bottom = y;
      left = Math.min(left, range[0]);
      right = Math.max(right, range[1]);
    }
  }
  if (top < 0) return null;

  const footRows = Math.round((FOOT_ROWS * height) / FOOT_ROWS_BASE);
  let footMin = width;
  let footMax = 0;
  for (let y = Math.max(top, bottom - footRows); y <= bottom; y += 1) {
    const range = rowRange(y);
    if (range) {
      footMin = Math.min(footMin, range[0]);
      footMax = Math.max(footMax, range[1]);
    }
  }
  return {
    x: (footMin + footMax + 1) / 2 / width,
    left: left / width,
    right: (right + 1) / width,
    top: top / height,
    bottom: (bottom + 1) / height,
    measured: true,
  };
};

/**
 * [캐릭터 발 위치]
 * - 캐릭터 전신 이미지(data URL)에서 발 가로 중심(x)과 캐릭터 위·아래·좌우 끝(top·bottom·left·right)을 0~1 비율로 돌려준다
 * - 꼬리 등으로 발이 이미지 가운데에서 벗어난 캐릭터의 그림자·가운데 정렬용
 * - src가 없거나 측정에 실패하면 기본값(measured: false)
 * - isPending: 측정 중(캐릭터 그림을 재는 동안 화면이 그림자·캐릭터 자리를 정하지 못한다)
 */
export const useFootBox = (src) => {
  const { data, isLoading } = useQuery({
    queryKey: ['foot-box', src],
    queryFn: () => measureFootBox(src).catch(() => null),
    enabled: Boolean(src),
    staleTime: Infinity,
    gcTime: 60 * 1000,
    retry: false,
  });
  return { ...(data ?? DEFAULT_FOOT_BOX), isPending: isLoading };
};
