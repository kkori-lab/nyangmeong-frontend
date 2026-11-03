import { api } from '@/api/axios';

/** 장소 검색. 쪽 크기 15 고정·최대 3쪽. 응답 { content, page, hasNext, totalElements, … } */
export const searchPlaces = ({
  plcClsfCd,
  keyword,
  sort,
  page,
  swLat,
  swLot,
  neLat,
  neLot,
  cntrLat,
  cntrLot,
}) =>
  api.get('/places', {
    params: {
      plcClsfCd,
      keyword: keyword || undefined,
      sort,
      page,
      swLat,
      swLot,
      neLat,
      neLot,
      cntrLat,
      cntrLot,
    },
  });

/** 내 즐겨찾기(카테고리별, 저장 최신순) */
export const getPlaceBookmarks = (plcClsfCd) =>
  api.get('/place-bookmarks', { params: { plcClsfCd } });

/** 저장. 응답 { plcBkmkSn, plcSn }, 이미 있으면 409 PLACE_BOOKMARK_ALREADY_EXISTS */
export const addPlaceBookmark = (plcSn) =>
  api.post('/place-bookmarks', { plcSn });

/** 해제. 없으면 404 */
export const removePlaceBookmark = (plcBkmkSn) =>
  api.delete(`/place-bookmarks/${plcBkmkSn}`);
