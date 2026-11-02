import { api } from '@/api/axios';

/**
 * [관리자 게시글·댓글 API]
 * - 게시글 목록·상세, 블라인드·복구, 댓글 목록·삭제
 */

/** 게시글 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminPosts = (params) => api.get('/admin/posts', { params });

/** 게시글 상세 */
export const getAdminPost = (pstSn) => api.get(`/admin/posts/${pstSn}`);

/** 게시글 블라인드 */
export const blindPost = ({ pstSn, chgRsn }) =>
  api.post(`/admin/posts/${pstSn}/blind`, { chgRsn });

/** 블라인드 복구 */
export const restorePost = ({ pstSn, chgRsn }) =>
  api.post(`/admin/posts/${pstSn}/restore`, { chgRsn });

/** 댓글 목록: { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminComments = (params) =>
  api.get('/admin/comments', { params });

/** 댓글 삭제: DELETE 본문 금지라 POST */
export const deleteComment = ({ cmntSn, delRsn }) =>
  api.post(`/admin/comments/${cmntSn}/deletion`, { delRsn });
