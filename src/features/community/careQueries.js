import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createCare,
  deleteCare,
  getCare,
  getCareList,
  getMinimumWage,
  updateCare,
} from './careApi';
import { INFINITE_OPTIONS } from '@/utils/infiniteList';
import { reportPost } from './api';
import { useOptimisticLike } from './optimisticLike';

export const careKeys = {
  all: ['care'],
  list: (params) => ['care', 'list', params],
  detail: (petPrtcRcrtSn) => ['care', petPrtcRcrtSn],
  minimumWage: ['care', 'minimumWage'],
};

/** 쪽 번호 목록(760px 이상). options.enabled가 false면 요청하지 않는다(모바일은 무한 스크롤 훅만 쓴다) */
export const useCareList = (params, { enabled = true } = {}) =>
  useQuery({
    enabled,
    queryKey: careKeys.list(params),
    queryFn: () => getCareList(params),
    /** 필터를 바꾸는 동안 이전 목록 유지로 필터 영역 보존 */
    placeholderData: keepPreviousData,
  });

/** 무한 스크롤 목록: params에 page는 넣지 않는다 */
export const useCareInfiniteList = (params, { enabled = true } = {}) =>
  useInfiniteQuery({
    enabled,
    ...INFINITE_OPTIONS,
    queryKey: [...careKeys.list(params), 'infinite'],
    queryFn: ({ pageParam }) => getCareList({ ...params, page: pageParam }),
    placeholderData: keepPreviousData,
  });

export const useCare = (petPrtcRcrtSn) =>
  useQuery({
    queryKey: careKeys.detail(petPrtcRcrtSn),
    queryFn: () => getCare(petPrtcRcrtSn),
    retry: false,
  });

/** 관리자가 바꾸면 다음 조회부터 바뀐 값이라 글쓰기·수정을 열 때마다 다시 받는다 */
export const useMinimumWage = () =>
  useQuery({
    queryKey: careKeys.minimumWage,
    queryFn: getMinimumWage,
    staleTime: 0,
  });

/** 글·좋아요가 바뀌면 목록·상세를 모두 재조회 */
const useInvalidatingMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careKeys.all }),
  });
};

export const useCreateCare = () => useInvalidatingMutation(createCare);
export const useUpdateCare = () => useInvalidatingMutation(updateCare);
/**
 * 삭제는 목록만 다시 받는다: 상세까지 받으면 삭제한 글이 404가 되어
 * 상세가 오류 화면으로 바뀌고 삭제 뒤 이동·토스트(mutate의 onSuccess)가 불리지 않는다
 */
export const useDeleteCare = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCare,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...careKeys.all, 'list'] }),
  });
};
/** 누르는 즉시 그 글 상세의 좋아요·개수가 바뀐다(optimisticLike) */
export const useToggleCareLike = (petPrtcRcrtSn) =>
  useOptimisticLike({
    detailKey: careKeys.detail(petPrtcRcrtSn),
    allKey: careKeys.all,
  });

/** 신고는 화면이 바뀌지 않아 재조회 없음 */
export const useReportCare = () => useMutation({ mutationFn: reportPost });
