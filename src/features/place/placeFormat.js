/** 미터를 표시용으로: 1000m 미만은 m, 이상은 소수 첫째 자리 km */
export const formatDistance = (meters) =>
  meters == null
    ? ''
    : meters < 1000
      ? `${meters}m`
      : `${(meters / 1000).toFixed(1)}km`;

/** 카카오맵 업체 상세. 카카오 출처가 아닌 업체는 그 좌표의 카카오맵으로 대신 연다 */
export const detailUrl = ({ kakaoUrlPath, plcConm, plcLat, plcLot }) =>
  kakaoUrlPath ||
  `https://map.kakao.com/link/map/${encodeURIComponent(plcConm)},${plcLat},${plcLot}`;

export const routeUrl = ({ plcConm, plcLat, plcLot }) =>
  `https://map.kakao.com/link/to/${encodeURIComponent(plcConm)},${plcLat},${plcLot}`;

/** 새 탭으로 연다 */
export const openDetail = (place) =>
  window.open(detailUrl(place), '_blank', 'noopener,noreferrer');
