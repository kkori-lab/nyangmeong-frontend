import { api } from '@/api/axios';
import { REPORT_REASON_CODES } from './postCodes';

/**
 * [펫이야기 API]
 * - 게시글 GET /posts(page·size·bbsCd·keyword·sort=latest|popular), GET·PATCH·DELETE /posts/{pstSn}, POST /posts
 *   작성·수정은 multipart/form-data(bbsCd·pstTtl·pstCn·images, 수정은 남길 사진 keepAtchFileSns)
 * - 좋아요 POST·DELETE /posts/{pstSn}/likes, 댓글 /posts/{pstSn}/comments, 신고 POST /reports
 * - 레일 GET /community-ai-commentaries, /posts/popular-photo, /posts/health-tips
 * - 사진은 공개 파일이라 주소로 바로 그린다: getPostImageUrl
 */

/** 게시글 사진 주소: 공개 파일이라 로그인 없이 조회 */
export const getPostImageUrl = (atchFileSn) =>
  `/api/files/public/${atchFileSn}`;

/** 화면의 정렬 값(new·hot)을 서버 값으로 */
const SORT_PARAMS = { new: 'latest', hot: 'popular' };

/** 목록: 게시판(bbsCd)·정렬(sort: 'new' | 'hot')·키워드. 서버 정렬은 제목 일치 우선, 그다음 최신순 */
export const getPostList = ({
  page = 1,
  size = 10,
  bbsCd = '',
  sort = 'new',
  keyword = '',
} = {}) =>
  api.get('/posts', {
    params: {
      page,
      size,
      bbsCd: bbsCd || undefined,
      keyword: keyword || undefined,
      sort: SORT_PARAMS[sort],
    },
  });

export const getPost = (pstSn) => api.get(`/posts/${pstSn}`);

const toFormData = ({ bbsCd, pstTtl, pstCn, images, keepAtchFileSns }) => {
  const body = new FormData();
  body.append('bbsCd', bbsCd);
  body.append('pstTtl', pstTtl);
  body.append('pstCn', pstCn);
  images.forEach((file) => body.append('images', file));
  if (keepAtchFileSns) {
    if (keepAtchFileSns.length === 0) body.append('keepAtchFileSns', '');
    keepAtchFileSns.forEach((sn) => body.append('keepAtchFileSns', sn));
  }
  return body;
};

export const createPost = ({ bbsCd, pstTtl, pstCn, images }) =>
  api.post('/posts', toFormData({ bbsCd, pstTtl, pstCn, images }));

export const updatePost = ({
  pstSn,
  bbsCd,
  pstTtl,
  pstCn,
  images,
  keepAtchFileSns,
}) =>
  api.patch(
    `/posts/${pstSn}`,
    toFormData({ bbsCd, pstTtl, pstCn, images, keepAtchFileSns }),
  );

export const deletePost = (pstSn) => api.delete(`/posts/${pstSn}`);

/** 좋아요 토글: 지금 눌려 있으면(liked) 취소, 아니면 등록 */
export const togglePostLike = ({ pstSn, liked }) =>
  liked
    ? api.delete(`/posts/${pstSn}/likes`)
    : api.post(`/posts/${pstSn}/likes`);

/** 신고: 화면의 사유 문구를 코드로 바꿔 전송. 게시글이나 댓글 중 하나만 전달 */
const report = ({ pstSn, cmntSn, reason, detail }) =>
  api.post('/reports', {
    pstSn,
    cmntSn,
    dclrRsnCd: REPORT_REASON_CODES[reason],
    dclrDtlCn: detail || undefined,
  });

export const reportPost = ({ pstSn, reason, detail }) =>
  report({ pstSn, reason, detail });

export const reportComment = ({ cmntSn, reason, detail }) =>
  report({ cmntSn, reason, detail });

export const getComments = (pstSn) => api.get(`/posts/${pstSn}/comments`);

export const createComment = ({ pstSn, prntCmntSn, cmntCn }) =>
  api.post(`/posts/${pstSn}/comments`, { cmntCn, prntCmntSn });

export const deleteComment = ({ pstSn, cmntSn }) =>
  api.delete(`/posts/${pstSn}/comments/${cmntSn}`);

/** 오른쪽 레일 */
export const getTodayStory = () => api.get('/community-ai-commentaries');

/** 인기 포토: 서버가 7일 → 30일 → 전체 순으로 찾고 없으면 null */
export const getPopularPhoto = () => api.get('/posts/popular-photo');

/** 오늘의 건강 팁: 관리자가 노출순서를 준 펫정보 글 */
export const getHealthTips = () => api.get('/posts/health-tips');
