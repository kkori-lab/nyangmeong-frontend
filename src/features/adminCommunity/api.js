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

/**
 * [관리자 실종제보 API]
 * - 정상 게시글만, 블라인드·삭제 글은 나오지 않는다
 * - 찾았어요 제보 상세는 제목·상태·처리 시각(dscvSwtcDt)·pstSn만 온다(결정 13)
 */

/**
 * 실종제보 목록(최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·lostTpofSttsCd
 * - 목록 행: lostTpofSn·pstSn·pstTtl·lostTpofSttsCd·mbrSn·mbrNcnm·expryCrtrDt·regDt
 */
export const getAdminLostReports = (params) =>
  api.get('/admin/lost-reports', { params });

/**
 * 실종제보 상세: lostTpofSn·pstSn·pstTtl·lostTpofSttsCd·dscvSwtcDt·mbrSn·mbrNcnm·regDt·pstCn·expryCrtrDt·imgs[]
 * - 찾았어요면 mbrSn부터 null, 없으면 404 LOST_REPORT_NOT_FOUND
 */
export const getAdminLostReport = (lostTpofSn) =>
  api.get(`/admin/lost-reports/${lostTpofSn}`);

/**
 * [관리자 펫돌봄 거래 API]
 * - 채팅 메시지는 응답에 없다(결정 14·26)
 */

/**
 * 펫돌봄 모집글 목록(정상 게시글만, 최신순): { content, page, size, totalElements, totalPages, hasNext }
 * - params: page(1부터)·size·rcrtSttsCd
 * - 목록 행: petPrtcRcrtSn·pstSn·pstTtl·rcrtSttsCd·mbrSn·mbrNcnm·cstAmt·cstUnitCd·regDt
 */
export const getAdminCareRecruits = (params) =>
  api.get('/admin/care-matches', { params });

/**
 * 펫돌봄 매칭 상세: 목록 행 + mtchs[](최신순, 없으면 빈 배열)
 * - 매칭: petPrtcMtchSn·ctptMbrSn·ctptNcnm·mtchDlngSttsCd·rcvYn·rcvIdntyDt·regDt·cndVers[]·sttsHstry[]·cmptnDmnds[]
 */
export const getAdminCareRecruit = (petPrtcRcrtSn) =>
  api.get(`/admin/care-matches/${petPrtcRcrtSn}`);

/** 완료 사진 경로(관리자 로그인, 이미지 바이트) -> useFileImage url */
export const adminCareImageUrl = (petPrtcRcrtSn, atchFileSn) =>
  `/admin/care-matches/${petPrtcRcrtSn}/images/${atchFileSn}`;

/**
 * [관리자 노출 콘텐츠 API] /api/admin/community/exposure
 * - 건강팁은 PST.HLTH_INFO_EXPSR_SEQ(값이 있으면 관리자 지정), 후보 문구는 TODAY_PHRS, AI 코멘트는 CMNTY_AI_CMTRY 이름 그대로
 */

/** 오늘의 건강팁 최대 3건: [{ pstSn, pstTtl, hlthInfoExpsrSeq }], 노출 자리 순서. 자동 선정 글은 hlthInfoExpsrSeq null */
export const getAdminHealthTips = () =>
  api.get('/admin/community/exposure/health-tips');

/** 건강팁 지정: 같은 자리의 기존 지정은 풀리고, 다른 자리에 지정된 글이면 옮김 */
export const assignHealthTip = ({ pstSn, hlthInfoExpsrSeq }) =>
  api.put(`/admin/community/exposure/health-tips/${pstSn}`, {
    hlthInfoExpsrSeq,
  });

/** 건강팁 지정 해제 */
export const unassignHealthTip = (pstSn) =>
  api.delete(`/admin/community/exposure/health-tips/${pstSn}`);

/** 후보 문구 목록(등록순): { todayPhrs: { todayPhrsSn, phrsCn } | null, content: [{ todayPhrsSn, phrsCn, useYn }] } */
export const getAdminTodayPhrases = () =>
  api.get('/admin/community/exposure/phrases');

/** 후보 문구 등록: { todayPhrsSn } */
export const createAdminTodayPhrase = ({ phrsCn, useYn }) =>
  api.post('/admin/community/exposure/phrases', { phrsCn, useYn });

/** 후보 문구 수정: 보낸 칸만 바뀜(undefined 칸은 안 보냄) */
export const updateAdminTodayPhrase = ({ todayPhrsSn, phrsCn, useYn }) =>
  api.patch(`/admin/community/exposure/phrases/${todayPhrsSn}`, {
    phrsCn,
    useYn,
  });

/** AI 코멘트 목록(최근 일자순): { content, page, size, totalElements, totalPages, hasNext } */
export const getAdminCommentaries = ({ page = 1, size = 20 } = {}) =>
  api.get('/admin/community/exposure/commentaries', {
    params: { page, size },
  });

/** AI 코멘트 사용 여부 전환 */
export const updateAdminCommentary = ({ cmntyAiCmtrySn, useYn }) =>
  api.patch(`/admin/community/exposure/commentaries/${cmntyAiCmtrySn}`, {
    useYn,
  });
