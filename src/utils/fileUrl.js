/**
 * [공개 파일 주소]
 * - 게시글 사진처럼 공개된 첨부 파일을 로그인 없이 <img src>로 바로 그릴 주소
 * - 비공개 이미지는 도메인 API를 blob으로 받는 @/hooks/useFileImage
 */

/** 공개 파일 주소: 번호가 없으면 null */
export const publicFileUrl = (atchFileSn) =>
  atchFileSn == null ? null : `/api/files/public/${atchFileSn}`;
