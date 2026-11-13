/**
 * [장소 보기 지도 화면]
 * - 주소 공유 말풍선의 지도·[장소 보기]를 누르면 모달이 아니라 화면 전체가 지도로 바뀐다. 지도가 가장자리까지 꽉 차고 제목·주소·닫기 버튼은 없다
 * - 위에 떠 있는 ‹로 채팅으로 돌아가고(대화 위치는 그대로), 맨 아래 낮은 흰 줄에 주소·상세 주소(같은 크기·굵기로 한 줄에 이어서, 왼쪽)와 [길찾기](오른쪽, 높이 40px)가 있다. [길찾기]는 카카오맵 길찾기를 새 창으로 연다
 * - 지도는 움직이고 확대할 수 있고 핀은 그 장소에 고정. 키가 없거나 SDK 오류면 안내만
 */
import { useEffect, useRef } from 'react';
import Icon from '@/components/Icon';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import useKakaoMap from '@/hooks/useKakaoMap';

const MAP_LEVEL = 3;

export default function AddressMapScreen({ address, detail, point, onBack }) {
  const { kakao, isError } = useKakaoMap();
  const containerRef = useRef(null);
  const directionsUrl = `https://map.kakao.com/link/to/${encodeURIComponent(address)},${point.lat},${point.lng}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!kakao || !container) return;
    container.replaceChildren();
    const center = new kakao.maps.LatLng(point.lat, point.lng);
    const map = new kakao.maps.Map(container, {
      center,
      level: MAP_LEVEL,
      draggable: true,
    });
    new kakao.maps.Marker({ position: center, map });
    map.addControl(
      new kakao.maps.ZoomControl(),
      kakao.maps.ControlPosition.RIGHT,
    );
  }, [kakao, point.lat, point.lng]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2">
      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          role="img"
          aria-label="공유한 장소 지도"
          className="size-full"
        />
        {isError && (
          <p className="absolute inset-0 grid place-items-center text-sm text-subtle">
            지도를 불러오지 못했어요
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label="채팅으로 돌아가기"
        className="absolute top-3 left-3 z-10 grid size-11 place-items-center rounded-full bg-white text-ink-2 shadow-depth-md hover:bg-surface-2"
        onClick={onBack}
      >
        <Icon name="chevron_left" className="text-[26px]" />
      </button>
      <div className="flex shrink-0 items-center gap-3 bg-white px-4 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--color-line)]">
        <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-[1.4] font-semibold text-ink">
          {address}
          {detail && <span className="ml-2">{detail}</span>}
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className={`${BTN_PRIMARY} shrink-0`}
        >
          길찾기
          <Icon name="open_in_new" className="text-lg" />
        </a>
      </div>
    </div>
  );
}
