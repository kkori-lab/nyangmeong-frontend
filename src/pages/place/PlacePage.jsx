import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PlaceCategoryNav from '@/features/place/PlaceCategoryNav';
import PlaceMap from '@/features/place/PlaceMap';
import PlacePanel from '@/features/place/PlacePanel';
import PlaceSearchForm from '@/features/place/PlaceSearchForm';
import { CATEGORIES, DEFAULT_CATEGORY } from '@/features/place/placeData';
import useBottomSheet from '@/features/place/useBottomSheet';
import usePlaceSearch from '@/features/place/usePlaceSearch';

export default function PlacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const category = CATEGORIES.some(({ key }) => key === categoryParam)
    ? categoryParam
    : DEFAULT_CATEGORY;

  const place = usePlaceSearch(category, (next) =>
    setSearchParams({ category: next }),
  );
  const { attachContainer, ...sheet } = useBottomSheet();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { search } = place;

  const handlePinSelect = (plcSn) => {
    place.selectPlace(plcSn, 'pin');
    sheet.setSheet('peek');
  };

  // 현재 지도 안에 있으면서 검색 결과에 없는 즐겨찾기는 번호 없는 별 핀으로 보인다
  const strayFavorites = place.favorites.filter(
    (fav) =>
      !place.isOutside(fav) &&
      !place.results.some((result) => result.plcSn === fav.plcSn),
  );

  return (
    <div
      ref={attachContainer}
      style={{ '--sheet-peek': `${sheet.peekY}px` }}
      className={`relative h-full border-t border-line bg-white md:grid ${
        isCollapsed
          ? 'md:grid-cols-[64px_0_minmax(0,1fr)] lg:grid-cols-[72px_0_minmax(0,1fr)]'
          : 'md:grid-cols-[64px_340px_minmax(0,1fr)] lg:grid-cols-[72px_400px_minmax(0,1fr)]'
      }`}
    >
      <nav
        aria-label="장소 종류"
        className="z-[3] hidden flex-col items-center gap-1 border-r border-line bg-white py-3 md:flex"
      >
        <PlaceCategoryNav
          variant="rail"
          category={category}
          onSelect={place.selectCategory}
        />
      </nav>

      <PlacePanel
        category={category}
        search={search}
        sort={place.sort}
        regionText={place.regionText}
        query={place.query}
        results={place.results}
        totalCount={place.totalCount}
        favorites={place.favorites}
        bookmarkSnOf={place.bookmarkSnOf}
        isOutside={place.isOutside}
        isCollapsed={isCollapsed}
        sheet={sheet}
        onSearch={place.submitSearch}
        onSortChange={place.setSort}
        onToggleFavorite={place.toggleFavorite}
      />

      <PlaceMap
        results={place.results}
        strayFavorites={strayFavorites}
        selectedPlace={place.selectedPlace}
        fitKey={search.fitKey}
        isReady={place.query.isSuccess}
        regionText={place.regionText}
        isMoved={search.isMoved}
        isCollapsed={isCollapsed}
        isSheetFull={sheet.isFull}
        onSelectPin={handlePinSelect}
        onClosePopup={place.closePlace}
        onMoved={place.markMoved}
        onResearch={place.researchHere}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] flex flex-col gap-2 px-4 pt-3 md:hidden">
          <PlaceSearchForm
            id="place-mq"
            q={search.q}
            onSearch={place.submitSearch}
            className="pointer-events-auto shadow-depth-md"
          />
          <div
            role="group"
            aria-label="장소 종류"
            className="pointer-events-auto -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
          >
            <PlaceCategoryNav
              variant="chips"
              category={category}
              onSelect={place.selectCategory}
            />
          </div>
        </div>
      </PlaceMap>
    </div>
  );
}
