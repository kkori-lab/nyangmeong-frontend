import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  blindPost,
  deleteComment,
  getAdminComments,
  getAdminPost,
  getAdminPosts,
  restorePost,
} from './api';

export const adminCommunityKeys = {
  all: ['adminCommunity'],
  posts: (params) => ['adminCommunity', 'posts', params],
  post: (pstSn) => ['adminCommunity', 'post', pstSn],
  comments: (params) => ['adminCommunity', 'comments', params],
};

export const useAdminPosts = (params) =>
  useQuery({
    queryKey: adminCommunityKeys.posts(params),
    queryFn: () => getAdminPosts(params),
    placeholderData: keepPreviousData,
  });

export const useAdminPost = (pstSn) =>
  useQuery({
    queryKey: adminCommunityKeys.post(pstSn),
    queryFn: () => getAdminPost(pstSn),
  });

export const useAdminComments = (params) =>
  useQuery({
    queryKey: adminCommunityKeys.comments(params),
    queryFn: () => getAdminComments(params),
    placeholderData: keepPreviousData,
  });

export const useBlindPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blindPost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminCommunityKeys.all }),
  });
};

export const useRestorePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restorePost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminCommunityKeys.all }),
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminCommunityKeys.all }),
  });
};
