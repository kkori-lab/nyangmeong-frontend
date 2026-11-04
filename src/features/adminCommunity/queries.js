import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  assignHealthTip,
  blindPost,
  createAdminTodayPhrase,
  deleteComment,
  getAdminCommentaries,
  getAdminHealthTips,
  getAdminTodayPhrases,
  getAdminCareRecruit,
  getAdminCareRecruits,
  getAdminComments,
  getAdminLostReport,
  getAdminLostReports,
  getAdminPost,
  getAdminPosts,
  restorePost,
  unassignHealthTip,
  updateAdminCommentary,
  updateAdminTodayPhrase,
} from './api';

export const adminCommunityKeys = {
  all: ['adminCommunity'],
  posts: (params) => ['adminCommunity', 'posts', params],
  post: (pstSn) => ['adminCommunity', 'post', pstSn],
  comments: (params) => ['adminCommunity', 'comments', params],
  lostReports: (params) => ['adminCommunity', 'lostReports', params],
  lostReport: (lostTpofSn) => ['adminCommunity', 'lostReport', lostTpofSn],
  careRecruits: (params) => ['adminCommunity', 'careRecruits', params],
  careRecruit: (petPrtcRcrtSn) => [
    'adminCommunity',
    'careRecruit',
    petPrtcRcrtSn,
  ],
  healthTips: ['adminCommunity', 'healthTips'],
  todayPhrases: ['adminCommunity', 'todayPhrases'],
  commentariesAll: ['adminCommunity', 'commentaries'],
  commentaries: (params) => ['adminCommunity', 'commentaries', params],
};

export const useAdminHealthTips = () =>
  useQuery({
    queryKey: adminCommunityKeys.healthTips,
    queryFn: getAdminHealthTips,
  });

/** 건강팁 검색용 펫정보 정상 글 목록 */
export const useHealthTipCandidates = (params) =>
  useQuery({
    queryKey: adminCommunityKeys.posts(params),
    queryFn: () => getAdminPosts(params),
    placeholderData: keepPreviousData,
  });

export const useAssignHealthTip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignHealthTip,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminCommunityKeys.healthTips,
      }),
  });
};

export const useUnassignHealthTip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unassignHealthTip,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminCommunityKeys.healthTips,
      }),
  });
};

export const useAdminTodayPhrases = () =>
  useQuery({
    queryKey: adminCommunityKeys.todayPhrases,
    queryFn: getAdminTodayPhrases,
  });

export const useCreateAdminTodayPhrase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminTodayPhrase,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminCommunityKeys.todayPhrases,
      }),
  });
};

export const useUpdateAdminTodayPhrase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminTodayPhrase,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminCommunityKeys.todayPhrases,
      }),
  });
};

export const useAdminCommentaries = (params) =>
  useQuery({
    queryKey: adminCommunityKeys.commentaries(params),
    queryFn: () => getAdminCommentaries(params),
    placeholderData: keepPreviousData,
  });

export const useUpdateAdminCommentary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCommentary,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminCommunityKeys.commentariesAll,
      }),
  });
};

export const useAdminCareRecruits = (params) =>
  useQuery({
    queryKey: adminCommunityKeys.careRecruits(params),
    queryFn: () => getAdminCareRecruits(params),
    placeholderData: keepPreviousData,
  });

export const useAdminCareRecruit = (petPrtcRcrtSn) =>
  useQuery({
    queryKey: adminCommunityKeys.careRecruit(petPrtcRcrtSn),
    queryFn: () => getAdminCareRecruit(petPrtcRcrtSn),
  });

export const useAdminLostReports = (params) =>
  useQuery({
    queryKey: adminCommunityKeys.lostReports(params),
    queryFn: () => getAdminLostReports(params),
    placeholderData: keepPreviousData,
  });

export const useAdminLostReport = (lostTpofSn) =>
  useQuery({
    queryKey: adminCommunityKeys.lostReport(lostTpofSn),
    queryFn: () => getAdminLostReport(lostTpofSn),
  });

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
