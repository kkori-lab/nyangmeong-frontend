import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  getComments,
  reportComment,
  reportPost,
  togglePostLike,
} from './api';
import {
  createMissing,
  deleteMissing,
  extendMissing,
  getBreeds,
  getJeonbukRegions,
  getMissing,
  getMissingList,
  getMissingRail,
  getRegions,
  markMissingFound,
  updateMissing,
} from './missingApi';

export const missingKeys = {
  all: ['missing'],
  list: (params) => ['missing', 'list', params],
  detail: (lostTpofSn) => ['missing', lostTpofSn],
  comments: (pstSn) => ['missing', 'comments', pstSn],
  rail: ['missing', 'rail'],
  breeds: (petSeCd) => ['missing', 'breeds', petSeCd],
  regions: (upRgnSn) => ['missing', 'regions', upRgnSn],
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
    queryFn: () => getComments(pstSn),
  });

/** 품종·지역 목록은 화면을 열어 둔 동안 변경 없음 */
export const useBreeds = (petSeCd) =>
  useQuery({
    queryKey: missingKeys.breeds(petSeCd),
    queryFn: () => getBreeds(petSeCd),
    staleTime: Infinity,
  });

/** 전북 시군구 목록 */
export const useJeonbukRegions = () =>
  useQuery({
    queryKey: missingKeys.regions('jeonbuk'),
    queryFn: getJeonbukRegions,
    staleTime: Infinity,
  });

/** 고른 시군구의 읍면동 목록. 시군구를 고르지 않았으면 요청 없음 */
export const useSubRegions = (upRgnSn) =>
  useQuery({
    queryKey: missingKeys.regions(upRgnSn),
    queryFn: () => getRegions(upRgnSn),
    enabled: Boolean(upRgnSn),
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
/**
 * 목록·레일만 무효화. all로 하면 아직 떠 있는 지운 글의 상세를 재조회해 404가 나고,
 * 상세가 오류 화면으로 바뀌어 삭제 뒤 이동·토스트(mutate의 onSuccess) 호출 안 됨
 */
export const useDeleteMissing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMissing,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...missingKeys.all, 'list'],
        }),
        queryClient.invalidateQueries({ queryKey: missingKeys.rail }),
      ]),
  });
};
export const useToggleMissingLike = () =>
  useInvalidatingMutation(togglePostLike);
export const useMarkMissingFound = () =>
  useInvalidatingMutation(markMissingFound);
export const useExtendMissing = () => useInvalidatingMutation(extendMissing);
/** 댓글 영역(CommentSection)은 targetSn(실종 글의 pstSn)으로 전달 */
export const useCreateMissingComment = () =>
  useInvalidatingMutation(({ targetSn, ...rest }) =>
    createComment({ pstSn: targetSn, ...rest }),
  );
export const useDeleteMissingComment = () =>
  useInvalidatingMutation(({ targetSn, cmntSn }) =>
    deleteComment({ pstSn: targetSn, cmntSn }),
  );

/** 신고는 화면이 바뀌지 않아 재조회 없음 */
export const useReportMissing = () => useMutation({ mutationFn: reportPost });
export const useReportMissingComment = () =>
  useMutation({ mutationFn: reportComment });
/** CommentSection에 넘기는 실종센터 댓글 훅 묶음 */
export const missingCommentHooks = {
  useComments: useMissingComments,
  useCreateComment: useCreateMissingComment,
  useDeleteComment: useDeleteMissingComment,
  useReportComment: useReportMissingComment,
};
