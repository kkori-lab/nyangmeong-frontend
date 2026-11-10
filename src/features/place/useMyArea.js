import { useEffect, useState } from 'react';
import { JEONJU_AREA } from './placeData';

// 내 위치 둘레 검색 영역의 절반 폭(약 3km). 위도 1도 ≈ 111km, 전주 부근 경도 1도 ≈ 90km
const HALF_LAT = 0.027;
const HALF_LOT = 0.033;
// 권한 창에 답하지 않으면 브라우저가 끝없이 기다리므로 이 시간 뒤에는 전주로 간다
const LOCATE_LIMIT_MS = 5000;
// GPS·Wi-Fi 없는 PC는 IP로 위치를 추정해 수십 km 틀린다(전주에서 군산, 정확도 50km).
// 오차가 이보다 크면 내 위치로 쓰지 않는다
const MAX_ACCURACY_M = 3000;
const MAX_AGE_MS = 60 * 1000;

const areaAround = (lat, lot) => ({
  swLat: lat - HALF_LAT,
  swLot: lot - HALF_LOT,
  neLat: lat + HALF_LAT,
  neLot: lot + HALF_LOT,
  cntrLat: lat,
  cntrLot: lot,
});

/**
 * 처음 검색할 영역. 브라우저 위치를 받으면 그 둘레, 받지 못하면 전주시 대표 영역.
 * 반환 { area, isMine, isLocating } — isLocating 동안은 검색을 보내지 않는다
 */
export default function useMyArea() {
  const [state, setState] = useState(() =>
    navigator.geolocation
      ? { area: JEONJU_AREA, isMine: false, isLocating: true }
      : { area: JEONJU_AREA, isMine: false, isLocating: false },
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    let isDone = false;
    const finish = (next) => {
      if (isDone) return;
      isDone = true;
      setState({ ...next, isLocating: false });
    };
    const fallback = () => finish({ area: JEONJU_AREA, isMine: false });

    const timer = setTimeout(fallback, LOCATE_LIMIT_MS);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        coords.accuracy > MAX_ACCURACY_M
          ? fallback()
          : finish({
              area: areaAround(coords.latitude, coords.longitude),
              isMine: true,
            }),
      fallback,
      {
        enableHighAccuracy: true,
        maximumAge: MAX_AGE_MS,
        timeout: LOCATE_LIMIT_MS,
      },
    );
    return () => {
      isDone = true;
      clearTimeout(timer);
    };
  }, []);

  return state;
}
