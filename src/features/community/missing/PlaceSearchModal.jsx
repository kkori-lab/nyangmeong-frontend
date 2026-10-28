import { ChevronLeft, Map as MapIcon, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import useKakaoMap from '@/hooks/useKakaoMap';
import MissingMap from './MissingMap';
import { findRegion, searchPlaces } from './placeSearch';

/**
 * 장소 찾기 모달(전북 한정): 실종센터 목격 장소, 펫돌봄 돌봄 장소가 같이 쓴다
 * - 1단계 검색: 장소명·동·주소를 한 칸에서 카카오 장소·주소 검색(./placeSearch)으로 찾고 전북 결과만 보여 준다
 *   입력을 멈추고 SEARCH_DELAY 뒤 자동으로 찾는다. 돋보기 버튼·Enter는 바로 찾는다. 늦게 온 이전 검색어의 결과는 버린다
 * - 2단계 위치 맞추기: 고른 결과를 지도(반경)로 보여 주고, 지도를 끌면 그 자리의 주소·시군구·동으로 바뀐다(전북 밖은 되돌림)
 *   「‹ 다시 검색」은 검색어·결과를 그대로 두고 1단계로 돌아간다. [확인 버튼]으로 부모에 넘긴다: onSelect(place)
 * - title·confirmLabel·guide: 모달 제목, 확인 버튼 문구, 검색 안내 문구(기본은 실종센터 문구)
 * - 모달이라 글쓰기 폼의 다른 입력값은 그대로 유지된다. 취소하면 이전 선택을 바꾸지 않는다
 */
const SEARCH_DELAY = 300;

export default function PlaceSearchModal({
  title = '목격 장소 찾기',
  confirmLabel = '목격 장소로 설정',
  guide = '마지막으로 본 곳 근처의 장소나 동 이름 검색',
  onSelect,
  onClose,
}) {
  const { kakao, isError } = useKakaoMap();
  const inputId = useId();
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState({ status: 'idle', rows: [] });
  const [selected, setSelected] = useState(null);
  const [pickError, setPickError] = useState('');

  const searchSeqRef = useRef(0);
  const word = keyword.trim();
  /** 검색어를 지우면 결과를 숨긴다(늦게 온 결과가 있어도) */
  const shown = word ? search : { status: 'idle', rows: [] };

  const runSearch = useCallback(
    async (text) => {
      const seq = ++searchSeqRef.current;
      setSearch((prev) => ({ status: 'loading', rows: prev.rows }));
      try {
        const rows = await searchPlaces(kakao, text);
        if (seq === searchSeqRef.current) setSearch({ status: 'done', rows });
      } catch {
        if (seq === searchSeqRef.current)
          setSearch({ status: 'error', rows: [] });
      }
    },
    [kakao],
  );

  useEffect(() => {
    if (!kakao || !word) return;
    const timer = setTimeout(() => runSearch(word), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [kakao, word, runSearch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (word && kakao) runSearch(word);
  };

  const handlePick = async (row) => {
    setPickError('');
    try {
      const region = await findRegion(kakao, row.wtnsPlcLat, row.wtnsPlcLot);
      if (!region) {
        setPickError('전북 지역만 선택할 수 있어요');
        return;
      }
      setSelected({
        ...region,
        wtnsPlcNm: row.wtnsPlcNm || `${region.emdNm} 인근`,
        wtnsPlcAddr: row.wtnsPlcAddr,
        wtnsPlcLat: row.wtnsPlcLat,
        wtnsPlcLot: row.wtnsPlcLot,
      });
    } catch {
      setPickError('위치를 확인하지 못했어요. 다시 골라 주세요');
    }
  };

  return (
    <Modal
      isWide
      isTop
      title={title}
      onClose={onClose}
      footer={
        selected && (
          <>
            <button type="button" onClick={onClose} className={BTN_SECONDARY}>
              취소
            </button>
            <button
              type="button"
              onClick={() => onSelect(selected)}
              className={BTN_PRIMARY}
            >
              {confirmLabel}
            </button>
          </>
        )
      }
    >
      {selected ? (
        <>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="-ml-1 inline-flex min-h-8 items-center gap-0.5 text-sm font-medium text-muted hover:text-ink"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            다시 검색
          </button>
          <p className="mt-2 flex items-start gap-1.5">
            <MapPin
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-500"
            />
            <span className="min-w-0">
              <b className="block font-bold text-ink">{selected.wtnsPlcNm}</b>
              <span className="block text-sm text-muted">
                {selected.wtnsPlcAddr}
              </span>
            </span>
          </p>
          <div className="mt-3">
            <MissingMap
              place={selected}
              isPreview
              height="h-[400px] max-[760px]:h-[240px]"
              onMove={(next) => setSelected({ ...selected, ...next })}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            지도를 움직여 정확한 위치를 맞춰 주세요
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} role="search">
            <label htmlFor={inputId} className="mb-2 block text-sm text-muted">
              {guide}
            </label>
            <div className="relative">
              <input
                id={inputId}
                type="text"
                enterKeyHint="search"
                autoComplete="off"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPickError('');
                }}
                className="block h-10 w-full rounded-md border border-input-line bg-white pr-11 pl-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!kakao}
                aria-label="검색"
                className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-md text-subtle hover:enabled:bg-surface-2 hover:enabled:text-ink disabled:opacity-40"
              >
                <Search size={18} aria-hidden="true" />
              </button>
            </div>
          </form>

          {isError && (
            <p className="mt-3 text-sm text-danger">
              지도를 불러오지 못해 검색할 수 없어요
            </p>
          )}
          {shown.status === 'loading' && shown.rows.length === 0 && (
            <p className="mt-3 text-sm text-muted">검색하고 있어요</p>
          )}
          {shown.status === 'error' && (
            <p className="mt-3 text-sm text-danger">
              검색하지 못했어요. 잠시 후 다시 시도해 주세요
            </p>
          )}
          {shown.status === 'done' && shown.rows.length === 0 && (
            <p className="mt-3 text-sm text-muted">
              검색 결과가 없어요. 가까운 학교·공원이나 동 이름으로 찾아보세요
            </p>
          )}
          {pickError && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {pickError}
            </p>
          )}
          {shown.rows.length > 0 && (
            <ul
              aria-label="검색 결과"
              className="mt-3 flex flex-col rounded-md border border-line"
            >
              {shown.rows.map((row) => (
                <li
                  key={row.key}
                  className="border-t border-line first:border-t-0"
                >
                  <button
                    type="button"
                    onClick={() => handlePick(row)}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-surface-2"
                  >
                    {row.isAddress ? (
                      <MapIcon
                        size={16}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-subtle"
                      />
                    ) : (
                      <MapPin
                        size={16}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-500"
                      />
                    )}
                    <span className="min-w-0">
                      {!row.isAddress && (
                        <b className="block font-semibold text-ink">
                          {row.wtnsPlcNm}
                        </b>
                      )}
                      <span
                        className={`block ${row.isAddress ? 'text-ink' : 'text-sm text-muted'}`}
                      >
                        {row.wtnsPlcAddr}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
