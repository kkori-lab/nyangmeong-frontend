import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createAdminAiRoute,
  deleteAdminAiRoute,
  getAdminAiRoutes,
  updateAdminAiRoute,
} from './api';

export const adminAiRouteKeys = {
  all: ['adminAiRoute'],
  lists: ['adminAiRoute', 'list'],
  list: (params) => ['adminAiRoute', 'list', params],
};

export const useAdminAiRoutes = (params) =>
  useQuery({
    queryKey: adminAiRouteKeys.list(params),
    queryFn: () => getAdminAiRoutes(params),
    placeholderData: keepPreviousData,
  });

/** 등록·수정·삭제 모두 성공하면 목록을 다시 받는다 */
const useRouteMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminAiRouteKeys.lists }),
  });
};

export const useCreateAdminAiRoute = () => useRouteMutation(createAdminAiRoute);
export const useUpdateAdminAiRoute = () => useRouteMutation(updateAdminAiRoute);
export const useDeleteAdminAiRoute = () => useRouteMutation(deleteAdminAiRoute);
