import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminSettings, updateAdminSettings } from './api';

export const settingKeys = {
  all: ['settings'],
  admin: ['settings', 'admin'],
};

export const useAdminSettings = () =>
  useQuery({ queryKey: settingKeys.admin, queryFn: getAdminSettings });

export const useUpdateAdminSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSettings,
    /** 다시 받을 때까지 저장 중 유지 */
    onSuccess: () => qc.invalidateQueries({ queryKey: settingKeys.all }),
  });
};
