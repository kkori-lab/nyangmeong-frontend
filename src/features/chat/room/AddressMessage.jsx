/**
 * [주소 공유 말풍선: 지도 카드]
 * - 위 정적 지도(핀) + [장소 보기](큰 지도 창). 주소·상세 주소는 말풍선에 안 보인다. 지도나 [장소 보기]를 누르면 전체 화면 지도(AddressMapScreen)로 바뀐다. 서버는 글자만 저장해 받는 쪽이 주소로 위치를 찾는다(useAddressPoint)
 * - 찾는 동안 지도와 [장소 보기] 버튼 자리를 잡아 둬 대화 스크롤이 튀지 않는다. 위치를 못 찾거나 지도가 안 뜨면 지도·버튼 없이 글자만
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import useKakaoMap from '@/hooks/useKakaoMap';
import { useAddressPoint } from '../queries';
import AddressMapScreen from './AddressMapScreen';

const MAP_LEVEL = 3;

/** 정적 지도가 안에 넣는 카카오맵 링크가 클릭을 가져가지 않게 pointer-events-none(클릭은 바깥 버튼이 받는다) */
function StaticPinMap({ point }) {
  const { kakao } = useKakaoMap();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!kakao || !container) return;
    container.replaceChildren();
    const position = new kakao.maps.LatLng(point.lat, point.lng);
    new kakao.maps.StaticMap(container, {
      center: position,
      level: MAP_LEVEL,
      marker: { position },
    });
  }, [kakao, point.lat, point.lng]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="공유한 장소 지도"
      className="pointer-events-none h-36 w-full bg-surface-2"
    />
  );
}

export default function AddressMessage({ message }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isError: isKakaoError } = useKakaoMap();
  const { data: point, isPending } = useAddressPoint(message.shrnAddr);
  /** 지도 SDK를 못 불러오면 쿼리가 꺼진 채 대기 상태로 남으므로 찾는 중으로 치지 않는다 */
  const isLoading = isPending && !isKakaoError;
  const hasMap = isLoading || Boolean(point);

  /** 지도 카드: 지도와 [장소 보기]만(주소·상세 주소는 안 보임). 위치를 못 찾으면 글자만 */
  if (!hasMap) {
    return (
      <span className="flex w-[260px] max-w-full flex-col gap-0.5 rounded-[14px] border border-line bg-white px-3.5 py-2.5 text-sm leading-[1.55] break-words text-ink">
        <b className="flex items-center gap-1">
          <Icon name="location_on" className="text-base text-brand-500" />
          주소 공유
        </b>
        <span className="whitespace-pre-line">{message.shrnAddr}</span>
        {message.dtlAddr && (
          <span className="text-muted">{message.dtlAddr}</span>
        )}
      </span>
    );
  }

  return (
    <span className="block w-[260px] max-w-full overflow-hidden rounded-[14px] border border-line bg-white text-sm text-ink">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={!point}
        className="block h-36 w-full cursor-pointer bg-surface-2 disabled:cursor-default"
        onClick={() => setIsOpen(true)}
      >
        {point && <StaticPinMap point={point} />}
      </button>
      <span className="block p-2">
        {isLoading ? (
          <span aria-hidden="true" className="block h-9 w-full" />
        ) : (
          <button
            type="button"
            aria-label={`장소 보기: ${message.shrnAddr}`}
            className="h-9 w-full rounded-md bg-surface-2 font-medium hover:bg-surface-3"
            onClick={() => setIsOpen(true)}
          >
            장소 보기
          </button>
        )}
      </span>
      {isOpen && point && (
        <AddressMapScreen
          address={message.shrnAddr}
          detail={message.dtlAddr}
          point={point}
          onBack={() => setIsOpen(false)}
        />
      )}
    </span>
  );
}
