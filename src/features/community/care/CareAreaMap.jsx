import { useEffect, useMemo, useState } from 'react';
import useKakaoMap from '@/hooks/useKakaoMap';
import MissingMap from '../missing/MissingMap';
import { findDongCenter } from '../missing/placeSearch';

/**
 * 돌봄 장소 지도: 실종센터 지도(MissingMap)와 같은 크기·형태(높이 400px, 반경 원, +/−)
 * - place: { sggNm, emdNm, wtnsPlcLat?, wtnsPlcLot? }. 좌표가 없으면(상세·수정은 공개 좌표가 없다) 동 중심을 찾아 보여 준다
 * - 라벨은 공개 범위에 맞춰 항상 「○○동 인근」
 * - onMove: 글쓰기에서만 넘긴다. 지도를 끌면 그 자리의 장소(좌표·시군구·동)를 넘긴다
 */
export default function CareAreaMap({ place, onMove, className = '' }) {
  const { kakao } = useKakaoMap();
  const { sggNm, emdNm, wtnsPlcLat, wtnsPlcLot } = place;
  const area = `${emdNm} 인근`;
  const dongKey = `${sggNm} ${emdNm}`;
  const hasCoords = wtnsPlcLat != null && wtnsPlcLot != null;
  /** { key, coords }: coords가 null이면 못 찾음 */
  const [center, setCenter] = useState(null);

  useEffect(() => {
    if (!kakao || hasCoords) return;
    let isCancelled = false;
    findDongCenter(kakao, sggNm, emdNm)
      .catch(() => null)
      .then((coords) => {
        if (!isCancelled) setCenter({ key: dongKey, coords });
      });
    return () => {
      isCancelled = true;
    };
  }, [kakao, hasCoords, dongKey, sggNm, emdNm]);

  const found = center?.key === dongKey ? center : null;
  const coords = hasCoords ? { wtnsPlcLat, wtnsPlcLot } : found?.coords;
  const lat = coords?.wtnsPlcLat;
  const lng = coords?.wtnsPlcLot;
  /** 좌표가 같으면 같은 객체: 다시 그릴 때마다 지도가 가운데로 돌아가지 않게 */
  const mapPlace = useMemo(
    () =>
      lat == null
        ? null
        : { wtnsPlcNm: area, wtnsPlcLat: lat, wtnsPlcLot: lng },
    [area, lat, lng],
  );

  return (
    <div className={className}>
      <MissingMap
        place={mapPlace}
        isPreview
        mapLabel="돌봄 장소 지도"
        emptyText={
          found ? '지도를 불러오지 못했어요' : '지도를 불러오고 있어요'
        }
        onMove={onMove}
      />
    </div>
  );
}
