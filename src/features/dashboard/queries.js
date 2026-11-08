import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/components/toastStore';
import { getMainShortcuts, saveMainShortcuts } from './api';

export const dashboardKeys = {
  shortcuts: ['dashboard', 'shortcuts'],
};

/** 메인 반려동물 바로가기(회원 단위) */
export const useMainShortcuts = () =>
  useQuery({
    queryKey: dashboardKeys.shortcuts,
    queryFn: getMainShortcuts,
  });

/** 바로가기 저장. 응답의 목록으로 다시 그린다 */
export const useSaveMainShortcuts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMainShortcuts,
    onSuccess: (shortcuts) =>
      queryClient.setQueryData(dashboardKeys.shortcuts, shortcuts),
    onError: (error) => showToast(error.message),
  });
};
