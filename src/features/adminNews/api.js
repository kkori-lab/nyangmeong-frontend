import { api } from '@/api/axios';

/**
 * [관리자 펫뉴스 API]
 * - 계약은 백엔드 docs/api/community.md /admin/news 행
 * - 썸네일은 POST /admin/news/images로 먼저 올리고 받은 atchFileSn을 등록·수정 본문에 넣는다
 * - 제목·요약·썸네일 수정은 관리자 등록 기사만, 사용 여부·카테고리는 모든 기사
 */

/** 뉴스 목록(숨긴 기사 포함, 등록 최신순): { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminNewsList = ({
  newsSrcCd,
  newsClsfCd,
  page = 1,
  size = 20,
} = {}) =>
  api.get('/admin/news', {
    params: {
      newsSrcCd: newsSrcCd || undefined,
      newsClsfCd: newsClsfCd || undefined,
      page,
      size,
    },
  });

/** 썸네일 업로드(multipart image) -> { atchFileSn } */
const uploadAdminNewsImage = (file) => {
  const body = new FormData();
  body.append('image', file);
  return api.post('/admin/news/images', body);
};

/** 고른 썸네일이 있으면 먼저 올리고 { atchFileSn }, 없으면 빈 객체 */
const toThumbnailBody = async (thumbnail) => {
  if (!thumbnail) return {};
  const { atchFileSn } = await uploadAdminNewsImage(thumbnail);
  return { atchFileSn };
};

/** 관리자 뉴스 등록 -> 201 { newsSn } */
export const createAdminNews = async ({
  newsTtl,
  newsCn,
  newsClsfCd,
  thumbnail,
}) =>
  api.post('/admin/news', {
    newsTtl,
    newsCn,
    newsClsfCd,
    ...(await toThumbnailBody(thumbnail)),
  });

/**
 * 뉴스 수정: 보낸 칸만 바꿈(newsTtl·newsCn·newsClsfCd·useYn, 썸네일 파일)
 * - 없는 기사 404 NEWS_NOT_FOUND, 아무 칸도 없으면 400
 */
export const updateAdminNews = async ({ newsSn, thumbnail, ...changes }) =>
  api.patch(`/admin/news/${newsSn}`, {
    ...changes,
    ...(await toThumbnailBody(thumbnail)),
  });

/** 분류 키워드 목록(정렬순): [{ kwrdDictSn, mpngCd, kwrdCn, sortSeq }] */
export const getAdminNewsKeywords = () => api.get('/admin/news/keywords');

/**
 * 분류 키워드 등록 -> 201 { kwrdDictSn }
 * - 1~50자·쉼표 없음, 같은 카테고리 같은 키워드(대소문자 무시) 409 DUPLICATE_NEWS_KEYWORD
 */
export const createAdminNewsKeyword = ({ mpngCd, kwrdCn }) =>
  api.post('/admin/news/keywords', { mpngCd, kwrdCn });

/** 분류 키워드 삭제: 없거나 이미 삭제 404 NEWS_KEYWORD_NOT_FOUND */
export const deleteAdminNewsKeyword = (kwrdDictSn) =>
  api.delete(`/admin/news/keywords/${kwrdDictSn}`);
