import { useEffect, useRef, useState } from 'react';
import { MapPinOff } from 'lucide-react';
import DropdownSelect from '@/components/DropdownSelect';
import PlaceListItem from './PlaceListItem';
import PlaceSearchForm from './PlaceSearchForm';
import { SORT_OPTIONS } from './placeData';
import { PLACE_LIST_ID } from './placeFormat';

// 목록 끝에서 이만큼 남았을 때 다음 쪽을 부른다
const END_MARGIN_PX = 120;

const groupTitle =
  'flex items-baseline gap-1.5 px-4 pt-4 text-sm font-semibold text-ink-2 md:px-5';

export default function PlacePanel({
  search,
  sort,
  regionText,
  query,
  results,
  totalCount,
  favorites,
  bookmarkSnOf,
  isOutside,
  isCollapsed,
  sheet,
  onSearch,
  onSortChange,
  onToggleFavorite,
}) {
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const [isEndInView, setIsEndInView] = useState(false);

  // 목록 스크롤 영역을 기준으로 끝이 보이는지 본다(화면 기준이면 스크롤 영역에 잘려 보이지 않는다)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsEndInView(entry.isIntersecting),
      { root: scrollRef.current, rootMargin: `0px 0px ${END_MARGIN_PX}px 0px` },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  // 목록 끝이 보이면 다음 쪽을 이어 불러온다(최대 3쪽).
  // 새 쪽이 막 그려져 감시 결과가 아직 이전 값일 수 있어 위치를 한 번 더 잰다
  useEffect(() => {
    if (!isEndInView || !hasNextPage || isFetchingNextPage) return;
    const rootBottom = scrollRef.current.getBoundingClientRect().bottom;
    const endTop = sentinelRef.current.getBoundingClientRect().top;
    if (endTop <= rootBottom + END_MARGIN_PX) fetchNextPage();
  }, [isEndInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section
      id={PLACE_LIST_ID}
      aria-label="장소 목록"
      style={{ '--sheet-y': `${sheet.sheetY}px` }}
      className={`relative z-[2] flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-line bg-white max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:z-[6] max-md:h-[calc(100%-56px)] max-md:translate-y-[calc(100%-var(--sheet-y))] max-md:rounded-t-[20px] max-md:border-0 max-md:shadow-[0_-6px_24px_rgba(26,50,52,0.14)] ${
        sheet.isDragging
          ? ''
          : 'max-md:transition-transform max-md:duration-300 max-md:ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none'
      } ${isCollapsed ? 'md:invisible' : ''}`}
    >
      <button
        type="button"
        aria-label="목록 크기 바꾸기"
        onPointerDown={(event) => sheet.startDrag(event, true)}
        onClick={sheet.handleHandleClick}
        className="flex w-full cursor-grab touch-none flex-col items-center gap-1.5 pb-1.5 pt-2.5 before:h-1 before:w-10 before:rounded-sm before:bg-line-strong before:content-[''] md:hidden"
      >
        <span className="text-sm text-subtle">
          {sheet.isFull ? '아래로 내려 지도 보기' : '위로 올려 목록 보기'}
        </span>
      </button>

      <div className="hidden flex-col gap-3 px-5 pb-4 pt-6 md:flex">
        <h1 className="text-2xl font-bold leading-[1.3] tracking-[-0.02em] text-ink">
          반려동물 플레이스
        </h1>
        <PlaceSearchForm id="place-q" q={search.q} onSearch={onSearch} />
      </div>

      <div className="flex min-h-12 items-center justify-between gap-3 border-y border-line bg-surface-2 px-5 max-md:border-t-0 max-md:bg-white max-md:px-4 md:min-h-[52px]">
        <p
          onPointerDown={(event) => sheet.startDrag(event, false)}
          className="min-w-0 flex-1 touch-none truncate text-sm text-muted max-md:cursor-grab"
        >
          <b className="font-semibold text-ink">{regionText}</b> · 결과{' '}
          {totalCount}곳
        </p>
        <DropdownSelect
          label="정렬"
          value={sort}
          size="sm"
          options={SORT_OPTIONS}
          className="w-[104px] shrink-0"
          onChange={onSortChange}
        />
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {favorites.length > 0 && (
          <section
            aria-labelledby="place-fav-title"
            className="border-b-8 border-surface-2"
          >
            <h2 id="place-fav-title" className={groupTitle}>
              내 즐겨찾기 <b className="text-brand-600">{favorites.length}</b>
              <small className="ml-auto text-sm font-normal text-subtle">
                상단 고정
              </small>
            </h2>
            <ul>
              {favorites.map((place) => (
                <PlaceListItem
                  key={place.plcSn}
                  place={place}
                  isFavorite
                  isStarred
                  isOutside={isOutside(place)}
                  isSelected={search.selected === place.plcSn}
                  shouldScroll={
                    search.selected === place.plcSn &&
                    search.selectedBy === 'pin'
                  }
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="place-result-title">
          <h2 id="place-result-title" className={groupTitle}>
            검색 결과 <b className="text-brand-600">{totalCount}</b>
            <small className="ml-auto text-sm font-normal text-subtle">
              “{search.q}”
            </small>
          </h2>
          {query.isPending ? (
            <p className="px-6 py-12 text-center text-muted">
              검색 결과를 불러오는 중이에요
            </p>
          ) : query.isError ? (
            <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center text-muted">
              <p className="text-lg font-bold text-ink">
                검색 결과를 불러오지 못했어요
              </p>
              <p>{query.error.message}</p>
              <button
                type="button"
                onClick={() => query.refetch()}
                className="mt-1 h-10 rounded-md bg-brand-500 px-5 font-semibold text-white hover:bg-brand-600"
              >
                다시 시도
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 px-6 py-12 text-center text-muted">
              <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-500">
                <MapPinOff className="size-8" />
              </span>
              <p className="text-lg font-bold text-ink">
                이 지도 영역에 검색 결과가 없어요
              </p>
              <p>지도를 옮기거나 검색어를 바꿔 보세요</p>
            </div>
          ) : (
            <>
              <ul>
                {results.map((place, index) => (
                  <PlaceListItem
                    key={place.plcSn}
                    place={place}
                    letter={String(index + 1)}
                    isStarred={bookmarkSnOf(place) != null}
                    isSelected={search.selected === place.plcSn}
                    shouldScroll={
                      search.selected === place.plcSn &&
                      search.selectedBy === 'pin'
                    }
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </ul>
              <p className="px-5 pb-10 pt-6 text-center text-sm text-subtle">
                {isFetchingNextPage
                  ? '검색 결과를 더 불러오는 중이에요'
                  : hasNextPage
                    ? ' '
                    : '마지막 검색 결과예요'}
              </p>
            </>
          )}
          {/* 감시 줄은 결과와 상관없이 항상 두어 처음 그릴 때부터 감시한다 */}
          <div ref={sentinelRef} aria-hidden="true" className="h-px" />
        </section>
      </div>
    </section>
  );
}
