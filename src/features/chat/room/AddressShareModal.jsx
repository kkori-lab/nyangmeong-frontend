/**
 * [주소 공유 모달]
 * - 1단계 검색: 도로명·지번·건물·장소 이름을 카카오 주소·장소 검색(@/utils/placeSearch, 전북 한정)으로 찾는다. 지도·상세 주소 없음
 * - 2단계 확인: 고른 곳을 지도 핀으로 보이고, 지도를 끌어 핀을 만날 지점에 맞춘다. 상세 주소(선택, 30자) → 전송 (FN-CMU-005-05)
 * - 서버로는 shrnAddr(장소 이름·주소)와 상세 주소만 보낸다(좌표 없음)
 * - 화면설계서 SCR-CMU-005-02_주소공유모달 + 사람이 확정한 시안(html/SCR-CMU-005-final.html) 기준
 */
import { ChevronLeft, Map as MapIcon, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import useKakaoMap from '@/hooks/useKakaoMap';
import { searchPlaces } from '@/utils/placeSearch';
import PlaceMapPreview from './PlaceMapPreview';

export const DETAIL_ADDR_MAX_LENGTH = 30;
const SEARCH_DELAY = 300;
const SHARE_ADDR_MAX_LENGTH = 200;

/** 서버에 보내는 장소 글자: 장소 결과는 「이름 (주소)」, 주소 결과는 주소만 */
const toShareAddr = (place) =>
  (place.isAddress || !place.wtnsPlcNm
    ? place.wtnsPlcAddr
    : `${place.wtnsPlcNm} (${place.wtnsPlcAddr})`
  ).slice(0, SHARE_ADDR_MAX_LENGTH);

export default function AddressShareModal({
  ctptMbrNcnm,
  isPending,
  onClose,
  onSend,
}) {
  const { kakao, isError } = useKakaoMap();
  const inputId = useId();
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState({ status: 'idle', rows: [] });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState('');
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

  return (
    <Modal
      title="주소 공유"
      isWide
      isTop
      isTitleHidden
      isHeaderBorderHidden
      headerLead={
        selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="-ml-1 inline-flex min-h-8 items-center gap-0.5 text-sm font-medium text-muted hover:text-ink"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            다시 검색
          </button>
        )
      }
      isPending={isPending}
      onClose={onClose}
      footer={
        selected && (
          <>
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              disabled={isPending}
              onClick={() =>
                onSend({ shrnAddr: toShareAddr(selected), detail: detail.trim() })
              }
            >
              주소 보내기
            </button>
          </>
        )
      }
    >
      {selected ? (
        <>
          <p className="flex items-start gap-1.5">
            <MapPin
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-500"
            />
            <span className="min-w-0">
              {!selected.isAddress && selected.wtnsPlcNm && (
                <b className="block font-bold text-ink">
                  {selected.wtnsPlcNm}
                </b>
              )}
              <span
                className={`block ${selected.isAddress || !selected.wtnsPlcNm ? 'font-bold text-ink' : 'text-sm text-muted'}`}
              >
                {selected.wtnsPlcAddr}
              </span>
            </span>
          </p>
          <PlaceMapPreview
            place={selected}
            onMove={(next) => setSelected({ ...next, isAddress: true })}
          />
          <p className="mt-2 text-sm text-muted">
            지도를 움직여 핀을 만날 장소에 맞춰 주세요
          </p>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor={`${inputId}-detail`}
                className="text-sm font-semibold text-ink"
              >
                상세 주소 (선택)
              </label>
              <span className="text-xs text-placeholder">
                {detail.length} / {DETAIL_ADDR_MAX_LENGTH}
              </span>
            </div>
            <input
              id={`${inputId}-detail`}
              maxLength={DETAIL_ADDR_MAX_LENGTH}
              placeholder="예: 103동 앞, 1층 현관"
              className="mt-1.5 block h-11 w-full rounded-md border border-input-line bg-white px-3.5 text-base placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
            />
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-sm text-subtle">
            <Icon name="lock" className="text-lg" />
            {ctptMbrNcnm}님에게만 보여요 · 이 채팅방 밖에는 공개되지 않아요
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} role="search">
            <label htmlFor={inputId} className="mb-2 block text-sm text-muted">
              만날 장소의 정확한 주소를 검색해 주세요(도로명·지번·건물 이름)
            </label>
            <div className="relative">
              <input
                id={inputId}
                type="text"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="예: 서곡로 21, 서곡동 123, 늘봄아파트"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="block h-10 w-full rounded-md border border-input-line bg-white pr-11 pl-3 text-base placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none"
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
              검색 결과가 없어요. 도로명·지번 주소나 건물 이름으로 찾아보세요
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
                    onClick={() => setSelected(row)}
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
