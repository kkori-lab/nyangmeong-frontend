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

const DETAIL_WINDOW = 'nmcare-kakao-place';
const DETAIL_WIDTH = 420;
const DETAIL_HEIGHT = 760;
const DETAIL_GAP = 8;

/** 목록 패널(`PlacePanel`의 section id). 작은 창을 이 패널 바로 옆에 띄운다 */
export const PLACE_LIST_ID = 'place-list-panel';

// 목록 패널 오른쪽 가장자리를 화면 좌표로 바꾼다. 브라우저 테두리·주소창 두께만큼 더한다
const detailWindowPosition = () => {
  const panel = document.getElementById(PLACE_LIST_ID)?.getBoundingClientRect();
  const chromeX = (window.outerWidth - window.innerWidth) / 2;
  const chromeY = window.outerHeight - window.innerHeight - chromeX;
  const left = window.screenX + chromeX + (panel?.right ?? 0) + DETAIL_GAP;
  const top = window.screenY + chromeY + (panel?.top ?? 0);
  // 화면 밖으로 나가지 않게 오른쪽·아래 끝에서 멈춘다
  // availLeft·availTop은 표준이 아니라 없는 브라우저(Safari)는 0으로 본다
  const {
    availLeft = 0,
    availTop = 0,
    availWidth,
    availHeight,
  } = window.screen;
  const maxLeft = availLeft + availWidth - DETAIL_WIDTH;
  const maxTop = availTop + availHeight - DETAIL_HEIGHT;
  return {
    left: Math.round(Math.min(left, maxLeft)),
    top: Math.round(Math.min(top, maxTop)),
  };
};

/**
 * 카카오맵 업체 상세를 목록 패널 바로 옆 작은 창으로 연다. 모든 장소가 같은 창 하나를 써서
 * 다른 장소를 누르면 그 창 내용만 바뀐다(위치는 처음 열 때만 정해진다).
 * 모바일 브라우저는 크기·위치를 무시해 새 탭으로 열린다
 */
export const openDetail = (place) => {
  const { left, top } = detailWindowPosition();
  // opener를 끊으면 카카오로 넘어간 창을 다시 이동시킬 수 없어 장소마다 창이 새로 생긴다.
  // 여는 곳이 카카오맵뿐이라 opener를 남긴다(2026-11-10 사람 결정)
  const popup = window.open(
    detailUrl(place),
    DETAIL_WINDOW,
    `popup,width=${DETAIL_WIDTH},height=${DETAIL_HEIGHT},left=${left},top=${top}`,
  );
  popup?.focus();
};
