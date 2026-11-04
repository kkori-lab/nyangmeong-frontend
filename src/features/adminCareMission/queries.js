import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getAdminCareMissions, updateAdminCareMission } from './api';

export const adminCareMissionKeys = {
  all: ['adminCareMission'],
  lists: ['adminCareMission', 'list'],
  list: (params) => ['adminCareMission', 'list', params],
};

export const useAdminCareMissions = (params) =>
  useQuery({
    queryKey: adminCareMissionKeys.list(params),
    queryFn: () => getAdminCareMissions(params),
    placeholderData: keepPreviousData,
  });

export const useUpdateAdminCareMission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminCareMission,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminCareMissionKeys.lists }),
  });
};
