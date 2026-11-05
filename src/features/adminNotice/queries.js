import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { noticeKeys } from '@/features/notice/queries';
import {
  createAdminNotice,
  getAdminNotice,
  getAdminNotices,
  getNoticeTargetCount,
  updateAdminNotice,
  uploadNoticeImage,
} from './api';

export const adminNoticeKeys = {
  all: ['adminNotice'],
  list: (params) => ['adminNotice', 'list', params],
  detail: (ntcMttrSn) => ['adminNotice', 'detail', ntcMttrSn],
  targetCount: ['adminNotice', 'targetCount'],
};

export const useAdminNotices = (params) =>
  useQuery({
    queryKey: adminNoticeKeys.list(params),
    queryFn: () => getAdminNotices(params),
    placeholderData: keepPreviousData,
  });

export const useAdminNotice = (ntcMttrSn) =>
  useQuery({
    queryKey: adminNoticeKeys.detail(ntcMttrSn),
    queryFn: () => getAdminNotice(ntcMttrSn),
    enabled: Number.isInteger(ntcMttrSn),
  });

/** 확인 모달을 열 때마다 새로 센다 */
export const useNoticeTargetCount = () =>
  useQuery({
    queryKey: adminNoticeKeys.targetCount,
    queryFn: getNoticeTargetCount,
    staleTime: 0,
  });

/** 관리자 목록과 사용자 공지 화면까지 무효화 */
const useInvalidateNotices = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminNoticeKeys.all }),
      queryClient.invalidateQueries({ queryKey: noticeKeys.all }),
    ]);
};

export const useCreateAdminNotice = () => {
  const invalidate = useInvalidateNotices();
  return useMutation({ mutationFn: createAdminNotice, onSuccess: invalidate });
};

export const useUpdateAdminNotice = () => {
  const invalidate = useInvalidateNotices();
  return useMutation({ mutationFn: updateAdminNotice, onSuccess: invalidate });
};

/** 본문 이미지 업로드: 캐시는 건드리지 않는다(본문에 줄을 넣어 저장할 때 반영) */
export const useUploadNoticeImage = () =>
  useMutation({ mutationFn: uploadNoticeImage });
