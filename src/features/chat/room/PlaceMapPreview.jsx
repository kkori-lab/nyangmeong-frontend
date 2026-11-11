/**
 * [만날 장소 지도: 핀 하나]
 * - 카카오맵 SDK(@/hooks/useKakaoMap). 지도 가운데 핀이 만날 지점이고, 지도를 끌면 그 자리의 도로명·지번 주소로 바뀐다(onMove)
 * - 전북 밖이면 안내하고 이전 위치로 되돌린다. 키가 없거나 SDK 오류면 안내만
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useKakaoMap from '@/hooks/useKakaoMap';
import { findPlaceAt } from '@/utils/placeSearch';

const MAP_LEVEL = 3;

export default function PlaceMapPreview({ place, onMove }) {
  const { kakao, isError } = useKakaoMap();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onMoveRef = useRef(onMove);
  const placeRef = useRef(place);
  const [moveNotice, setMoveNotice] = useState('');
  useLayoutEffect(() => {
    onMoveRef.current = onMove;
    placeRef.current = place;
  });

  useEffect(() => {
    if (!moveNotice) return;
    const timer = setTimeout(() => setMoveNotice(''), 2500);
    return () => clearTimeout(timer);
  }, [moveNotice]);

  useEffect(() => {
    if (!kakao || !place) return;
    const center = new kakao.maps.LatLng(place.wtnsPlcLat, place.wtnsPlcLot);
    if (!mapRef.current) {
      const map = new kakao.maps.Map(containerRef.current, {
        center,
        level: MAP_LEVEL,
        draggable: true,
        scrollwheel: false,
      });
      const marker = new kakao.maps.Marker({ position: center, map });
      map.addControl(
        new kakao.maps.ZoomControl(),
        kakao.maps.ControlPosition.RIGHT,
      );
      kakao.maps.event.addListener(map, 'center_changed', () => {
        marker.setPosition(map.getCenter());
      });
      kakao.maps.event.addListener(map, 'dragend', async () => {
        const moved = map.getCenter();
        const goBack = (message) => {
          const prev = placeRef.current;
          map.setCenter(
            new kakao.maps.LatLng(prev.wtnsPlcLat, prev.wtnsPlcLot),
          );
          setMoveNotice(message);
        };
        try {
          const next = await findPlaceAt(kakao, moved.getLat(), moved.getLng());
          if (next) onMoveRef.current?.(next);
          else goBack('전북 지역만 선택할 수 있어요');
        } catch {
          goBack('위치를 확인하지 못했어요. 다시 움직여 주세요');
        }
      });
      mapRef.current = { map, marker };
      return;
    }
    mapRef.current.map.setCenter(center);
    mapRef.current.marker.setPosition(center);
  }, [kakao, place]);

  return (
    <div className="relative mt-3 h-80 overflow-hidden rounded-box border border-line bg-surface-2 max-[760px]:h-60">
      <div
        ref={containerRef}
        className="size-full"
        role="img"
        aria-label="만날 장소 지도"
      />
      {isError && (
        <p className="absolute inset-0 grid place-items-center bg-surface-2 text-sm text-subtle">
          지도를 불러오지 못했어요
        </p>
      )}
      {moveNotice && (
        <p
          role="status"
          className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-3 py-1.5 text-sm whitespace-nowrap text-white"
        >
          {moveNotice}
        </p>
      )}
    </div>
  );
}
