import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addPlaceBookmark,
  getPlaceBookmarks,
  removePlaceBookmark,
  searchPlaces,
} from './api';

export const placeKeys = {
  search: (cond) => ['places', 'search', cond],
  bookmarks: (plcClsfCd) => ['places', 'bookmarks', plcClsfCd],
};

/** 검색 결과를 쪽 단위로 이어 불러온다. enabled가 false면(내 위치를 찾는 중) 보내지 않는다 */
export const usePlaceSearchQuery = (cond, { enabled = true } = {}) =>
  useInfiniteQuery({
    queryKey: placeKeys.search(cond),
    enabled,
    queryFn: ({ pageParam }) => searchPlaces({ ...cond, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });

export const usePlaceBookmarks = (plcClsfCd) =>
  useQuery({
    queryKey: placeKeys.bookmarks(plcClsfCd),
    queryFn: () => getPlaceBookmarks(plcClsfCd),
  });

/** 변수 { place, plcBkmkSn }: plcBkmkSn이 있으면 해제, 없으면 저장 */
export const useTogglePlaceBookmark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ place, plcBkmkSn }) =>
      plcBkmkSn
        ? removePlaceBookmark(plcBkmkSn)
        : addPlaceBookmark(place.plcSn),
    onSuccess: (data, { place, plcBkmkSn }) =>
      qc.setQueryData(placeKeys.bookmarks(place.plcClsfCd), (prev = []) =>
        plcBkmkSn
          ? prev.filter((item) => item.plcBkmkSn !== plcBkmkSn)
          : [
              { ...place, plcBkmkSn: data.plcBkmkSn },
              ...prev.filter((item) => item.plcSn !== place.plcSn),
            ],
      ),
    onSettled: (data, error, { place }) =>
      qc.invalidateQueries({ queryKey: placeKeys.bookmarks(place.plcClsfCd) }),
  });
};
