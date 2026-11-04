import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { newsKeys } from '@/features/news/queries';
import {
  createAdminNews,
  createAdminNewsKeyword,
  deleteAdminNewsKeyword,
  getAdminNewsKeywords,
  getAdminNewsList,
  updateAdminNews,
} from './api';

export const adminNewsKeys = {
  all: ['adminNews'],
  lists: ['adminNews', 'list'],
  list: (params) => ['adminNews', 'list', params],
  keywords: ['adminNews', 'keywords'],
};

export const useAdminNewsList = (params) =>
  useQuery({
    queryKey: adminNewsKeys.list(params),
    queryFn: () => getAdminNewsList(params),
    placeholderData: keepPreviousData,
  });

/** 관리자 목록과 회원 펫뉴스 화면까지 무효화 */
const useInvalidateNews = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminNewsKeys.lists }),
      queryClient.invalidateQueries({ queryKey: newsKeys.all }),
    ]);
};

export const useCreateAdminNews = () => {
  const invalidate = useInvalidateNews();
  return useMutation({ mutationFn: createAdminNews, onSuccess: invalidate });
};

export const useUpdateAdminNews = () => {
  const invalidate = useInvalidateNews();
  return useMutation({ mutationFn: updateAdminNews, onSuccess: invalidate });
};

export const useAdminNewsKeywords = () =>
  useQuery({
    queryKey: adminNewsKeys.keywords,
    queryFn: getAdminNewsKeywords,
  });

const useInvalidateKeywords = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminNewsKeys.keywords });
};

export const useCreateAdminNewsKeyword = () => {
  const invalidate = useInvalidateKeywords();
  return useMutation({
    mutationFn: createAdminNewsKeyword,
    onSuccess: invalidate,
  });
};

export const useDeleteAdminNewsKeyword = () => {
  const invalidate = useInvalidateKeywords();
  return useMutation({
    mutationFn: deleteAdminNewsKeyword,
    onSuccess: invalidate,
  });
};
