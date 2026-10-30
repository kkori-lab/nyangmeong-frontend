import { ExternalLink, MapPin } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useKakaoMap from '@/hooks/useKakaoMap';
import { findPlaceAt } from './placeSearch';

const MAP_LEVEL = 4;
/** 개인정보 보호: 정확한 좌표 대신 반경 약 250m 원으로 표시 */
const RADIUS_METER = 250;

/**
 * 목격 장소 지도: 카카오맵 SDK(@/hooks/useKakaoMap)로 반경 원 + 장소명 라벨, 키가 없거나 SDK 오류면 안내만
 * - 길찾기: 카카오맵 앱·웹으로 연결
 * - isPreview: 길찾기 링크 없음(글쓰기 미리보기·장소 검색·펫돌봄)
 * - mapLabel·emptyText: 지도 이름(스크린 리더)과 장소가 없을 때 안내(펫돌봄이 교체해 사용)
 * - height: 지도 높이 Tailwind 클래스(장소 검색 모달은 낮게)
 * - onMove: 전달하면 지도를 끌어 놓은 가운데로 원을 옮기고 그 자리의 장소(주소·시군구·동·좌표)를 onMove(place)로 전달.
 *   전북 밖이면 안내 후 이전 위치로 되돌림. 상세는 미전달로 둘러보기만 가능
 */
export default function MissingMap({
  place,
  isPreview = false,
  height = 'h-[400px]',
  mapLabel = '목격 장소 지도',
  emptyText = '장소를 고르면 지도에 표시돼요',
  onMove,
}) {
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
      const circle = new kakao.maps.Circle({
        center,
        radius: RADIUS_METER,
        strokeWeight: 2,
        strokeColor: '#285a5c',
        strokeStyle: 'dashed',
        fillColor: '#285a5c',
        fillOpacity: 0.12,
      });
      circle.setMap(map);
      map.addControl(
        new kakao.maps.ZoomControl(),
        kakao.maps.ControlPosition.RIGHT,
      );
      kakao.maps.event.addListener(map, 'center_changed', () => {
        if (onMoveRef.current) circle.setPosition(map.getCenter());
      });
      kakao.maps.event.addListener(map, 'dragend', async () => {
        if (!onMoveRef.current) return;
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
      mapRef.current = { map, circle };
      return;
    }
    mapRef.current.map.setCenter(center);
    mapRef.current.circle.setPosition(center);
  }, [kakao, place]);

  let notice = null;
  if (isError) notice = '지도를 불러오지 못했어요';
  else if (!place) notice = emptyText;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-line bg-surface-2 ${height}`}
    >
      <div
        ref={containerRef}
        className="size-full"
        role="img"
        aria-label={place ? `${place.wtnsPlcNm} ${mapLabel}` : mapLabel}
      />
      {notice && (
        <p className="absolute inset-0 grid place-items-center bg-surface-2 text-sm text-subtle">
          {notice}
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
      {place && (
        <span className="absolute bottom-3 left-3 inline-flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-sm text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <MapPin size={14} aria-hidden="true" className="text-brand-500" />
          {place.wtnsPlcNm}
        </span>
      )}
      {place && !isPreview && (
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(place.wtnsPlcNm)},${place.wtnsPlcLat},${place.wtnsPlcLot}`}
          target="_blank"
          rel="noreferrer"
          className="absolute right-3 bottom-3 inline-flex h-7 items-center gap-1 rounded-full bg-white px-2.5 text-sm font-medium text-brand-600 shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-brand-50"
        >
          길찾기
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
