import { useState } from 'react';
import { showToast } from '@/components/toastStore';
import { CATEGORIES, DEFAULT_SORT, JEONJU_AREA } from './placeData';
import {
  usePlaceBookmarks,
  usePlaceSearchQuery,
  useTogglePlaceBookmark,
} from './queries';

// 다른 곳에서 이미 바뀐 상태. 목록이 새로 맞춰지므로 알림 없이 둔다
const BOOKMARK_STALE_CODES = [
  'PLACE_BOOKMARK_ALREADY_EXISTS',
  'PLACE_BOOKMARK_NOT_FOUND',
];

const categoryOf = (key) => CATEGORIES.find((item) => item.key === key);

// 새 검색(카테고리 변경·검색어 실행)마다 달라지는 값. 지도가 결과에 맞춰 화면을 맞추는 때를 알린다
let searchSeq = 0;

// 카테고리를 처음 열었을 때의 검색 상태. 검색어 입력칸에는 카테고리 이름을 보이고 서버에는 검색어 없이 보낸다
const initialSearch = (category) => ({
  q: categoryOf(category).name,
  keyword: '',
  area: JEONJU_AREA, // 마지막으로 검색한 지도 영역과 거리 기준 중앙
  scope: 'first', // first: 시 전체, new: 지도 영역으로 다시 검색한 결과
  fitKey: ++searchSeq,
  isMoved: false,
  selected: null, // 선택한 장소의 plcSn
  selectedBy: '', // pin만 쓴다. 핀으로 골랐을 때 목록을 그 장소로 스크롤한다
});

const isInside = (place, { swLat, swLot, neLat, neLot }) =>
  place.plcLat >= swLat &&
  place.plcLat <= neLat &&
  place.plcLot >= swLot &&
  place.plcLot <= neLot;

export default function usePlaceSearch(category, onCategoryChange) {
  const [search, setSearch] = useState(() => initialSearch(category));
  const [syncedCategory, setSyncedCategory] = useState(category);
  const [sort, setSort] = useState(DEFAULT_SORT);

  // 주소창이나 GNB로 카테고리가 바뀌면 검색 상태를 처음으로 되돌린다
  if (syncedCategory !== category) {
    setSyncedCategory(category);
    setSearch(initialSearch(category));
  }

  const { code } = categoryOf(category);
  const query = usePlaceSearchQuery({
    plcClsfCd: code,
    keyword: search.keyword,
    sort,
    ...search.area,
  });
  const bookmarks = usePlaceBookmarks(code);
  const toggle = useTogglePlaceBookmark();

  const results = (query.data?.pages ?? []).flatMap((page) => page.content);
  const favorites = bookmarks.data ?? [];
  const totalCount = query.data?.pages[0]?.totalElements ?? results.length;
  const selectedPlace =
    [...results, ...favorites].find(
      (place) => place.plcSn === search.selected,
    ) ?? null;

  // 즐겨찾기 목록을 받았으면 그 목록이 기준이고, 받기 전에는 검색 결과의 plcBkmkSn을 쓴다
  const bookmarkSnOf = (place) =>
    bookmarks.data
      ? (bookmarks.data.find((item) => item.plcSn === place.plcSn)?.plcBkmkSn ??
        null)
      : (place.plcBkmkSn ?? null);

  // 재검색한 영역 밖에 있는 즐겨찾기
  const isOutside = (place) =>
    search.scope === 'new' && !isInside(place, search.area);

  const changeCategory = (next, nextSearch) => {
    setSyncedCategory(next);
    setSearch(nextSearch);
    onCategoryChange(next);
  };

  const selectCategory = (next) => changeCategory(next, initialSearch(next));

  const submitSearch = (text) => {
    const q = text.trim();
    if (!q) return;
    setSearch({ ...initialSearch(category), q, keyword: q });
  };

  const selectPlace = (plcSn, by) =>
    setSearch((prev) => ({
      ...prev,
      selected: prev.selected === plcSn && by === 'list' ? null : plcSn,
      selectedBy: by,
    }));

  const closePlace = () =>
    setSearch((prev) => ({ ...prev, selected: null, selectedBy: '' }));

  const markMoved = () =>
    setSearch((prev) => (prev.isMoved ? prev : { ...prev, isMoved: true }));

  // 지도를 옮긴 뒤 그 순간의 영역으로 검색어·카테고리·정렬은 그대로 다시 검색한다
  const researchHere = (area) =>
    setSearch((prev) => ({
      ...prev,
      area,
      scope: 'new',
      isMoved: false,
      selected: null,
      selectedBy: '',
    }));

  const toggleFavorite = (place) => {
    if (toggle.isPending) return;
    toggle.mutate(
      { place, plcBkmkSn: bookmarkSnOf(place) },
      {
        onError: (error) => {
          if (!BOOKMARK_STALE_CODES.includes(error.code)) {
            showToast(error.message);
          }
        },
      },
    );
  };

  const regionText = search.isMoved
    ? '지도를 움직였어요'
    : search.scope === 'new'
      ? '현재 지도 영역'
      : '전주시 전체';

  return {
    search,
    sort,
    setSort,
    query,
    results,
    totalCount,
    favorites,
    selectedPlace,
    bookmarkSnOf,
    isOutside,
    regionText,
    selectCategory,
    submitSearch,
    selectPlace,
    closePlace,
    markMoved,
    researchHere,
    toggleFavorite,
  };
}
