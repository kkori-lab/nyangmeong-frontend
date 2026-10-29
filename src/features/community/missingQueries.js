import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMissing,
  createMissingComment,
  deleteMissing,
  deleteMissingComment,
  extendMissing,
  getBreeds,
  getMissing,
  getMissingComments,
  getMissingList,
  getMissingRail,
  markMissingFound,
  reportMissing,
  reportMissingComment,
  toggleMissingLike,
  updateMissing,
} from './missingApi';

export const missingKeys = {
  all: ['missing'],
  list: (params) => ['missing', 'list', params],
  detail: (lostTpofSn) => ['missing', lostTpofSn],
  comments: (pstSn) => ['missing', 'comments', pstSn],
  rail: ['missing', 'rail'],
  breeds: (petSeCd) => ['missing', 'breeds', petSeCd],
};

export const useMissingList = (params) =>
  useQuery({
    queryKey: missingKeys.list(params),
    queryFn: () => getMissingList(params),
  });

export const useMissingRail = () =>
  useQuery({ queryKey: missingKeys.rail, queryFn: getMissingRail });

export const useMissing = (lostTpofSn) =>
  useQuery({
    queryKey: missingKeys.detail(lostTpofSn),
    queryFn: () => getMissing(lostTpofSn),
    retry: false,
  });

export const useMissingComments = (pstSn) =>
  useQuery({
    queryKey: missingKeys.comments(pstSn),
    queryFn: () => getMissingComments(pstSn),
  });

export const useBreeds = (petSeCd) =>
  useQuery({
    queryKey: missingKeys.breeds(petSeCd),
    queryFn: () => getBreeds(petSeCd),
    staleTime: Infinity,
  });

/** 글·댓글·좋아요·상태가 바뀌면 목록·상세·레일을 모두 재조회 */
const useInvalidatingMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: missingKeys.all }),
  });
};

export const useCreateMissing = () => useInvalidatingMutation(createMissing);
export const useUpdateMissing = () => useInvalidatingMutation(updateMissing);
export const useDeleteMissing = () => useInvalidatingMutation(deleteMissing);
export const useToggleMissingLike = () =>
  useInvalidatingMutation(toggleMissingLike);
export const useMarkMissingFound = () =>
  useInvalidatingMutation(markMissingFound);
export const useExtendMissing = () => useInvalidatingMutation(extendMissing);
export const useCreateMissingComment = () =>
  useInvalidatingMutation(createMissingComment);
export const useDeleteMissingComment = () =>
  useInvalidatingMutation(deleteMissingComment);

/** 신고·장소 검색은 화면이 바뀌지 않아 재조회 없음 */
export const useReportMissing = () =>
  useMutation({ mutationFn: reportMissing });
export const useReportMissingComment = () =>
  useMutation({ mutationFn: reportMissingComment });
/** CommentSection에 넘기는 실종센터 댓글 훅 묶음 */
export const missingCommentHooks = {
  useComments: useMissingComments,
  useCreateComment: useCreateMissingComment,
  useDeleteComment: useDeleteMissingComment,
  useReportComment: useReportMissingComment,
};
