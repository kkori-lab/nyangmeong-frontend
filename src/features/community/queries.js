import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getComments,
  getHealthTips,
  getPopularPhoto,
  getPost,
  getPostList,
  getTodayStory,
  reportComment,
  reportPost,
  togglePostLike,
  updatePost,
} from './api';

export const postKeys = {
  all: ['posts'],
  list: (params) => ['posts', 'list', params],
  detail: (pstSn) => ['posts', pstSn],
  comments: (pstSn) => ['posts', pstSn, 'comments'],
  rail: ['posts', 'rail'],
};

export const usePostList = (params) =>
  useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => getPostList(params),
  });

export const usePost = (pstSn) =>
  useQuery({
    queryKey: postKeys.detail(pstSn),
    queryFn: () => getPost(pstSn),
    retry: false,
  });

export const useComments = (pstSn) =>
  useQuery({
    queryKey: postKeys.comments(pstSn),
    queryFn: () => getComments(pstSn),
  });

export const useTodayStory = () =>
  useQuery({
    queryKey: [...postKeys.rail, 'story'],
    queryFn: getTodayStory,
  });

export const usePopularPhoto = () =>
  useQuery({
    queryKey: [...postKeys.rail, 'photo'],
    queryFn: getPopularPhoto,
  });

export const useHealthTips = () =>
  useQuery({
    queryKey: [...postKeys.rail, 'tips'],
    queryFn: getHealthTips,
  });

/** 글·댓글·좋아요가 바뀌면 목록·상세·레일을 모두 재조회 */
const useInvalidatingMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useCreatePost = () => useInvalidatingMutation(createPost);
export const useUpdatePost = () => useInvalidatingMutation(updatePost);
/**
 * 목록·레일만 무효화한다. all로 하면 아직 떠 있는 지운 글의 상세를 다시 받아 404가 나고,
 * 상세가 오류 화면으로 바뀌어 삭제 뒤 이동·토스트(mutate의 onSuccess) 호출 안 됨
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [...postKeys.all, 'list'] }),
        queryClient.invalidateQueries({ queryKey: postKeys.rail }),
      ]),
  });
};
export const useTogglePostLike = () => useInvalidatingMutation(togglePostLike);
/** 댓글 영역(CommentSection)은 게시판 종류를 몰라 targetSn으로 수신 */
export const useCreateComment = () =>
  useInvalidatingMutation(({ targetSn, ...rest }) =>
    createComment({ pstSn: targetSn, ...rest }),
  );
export const useDeleteComment = () =>
  useInvalidatingMutation(({ targetSn, cmntSn }) =>
    deleteComment({ pstSn: targetSn, cmntSn }),
  );

/** 신고는 화면이 바뀌지 않아 재조회 없음 */
export const useReportPost = () => useMutation({ mutationFn: reportPost });
export const useReportComment = () =>
  useMutation({ mutationFn: reportComment });

/** CommentSection에 넘기는 펫이야기 댓글 훅 묶음 */
export const postCommentHooks = {
  useComments,
  useCreateComment,
  useDeleteComment,
  useReportComment,
};
