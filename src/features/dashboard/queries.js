import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/components/toastStore';
import {
  getDashboardWidgets,
  getHealthIndicators,
  saveDashboardWidgets,
} from './api';

export const dashboardKeys = {
  indicators: (petSn) => ['dashboard', 'health-indicators', petSn],
  // 위젯 순서는 회원 단위라 반려동물과 무관한 키
  widgets: ['dashboard', 'widgets'],
};

const sortWidgets = (list) => [...list].sort((a, b) => a.sortSeq - b.sortSeq);

/** 건강 지표(FN-MAN-005·006). 메인 진입·탭 전환 때마다 다시 부른다 */
export const useHealthIndicators = (petSn) =>
  useQuery({
    queryKey: dashboardKeys.indicators(petSn),
    queryFn: () => getHealthIndicators(petSn),
    enabled: petSn != null,
  });

/** 위젯 순서(FN-MAN-007), sortSeq 오름차순. isEnabled가 false면 요청하지 않는다(비로그인) */
export const useDashboardWidgets = (isEnabled) =>
  useQuery({
    queryKey: dashboardKeys.widgets,
    queryFn: getDashboardWidgets,
    select: sortWidgets,
    enabled: isEnabled,
  });

/** 위젯 순서 저장. 200 응답의 순서로 다시 그린다 */
export const useSaveDashboardWidgets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDashboardWidgets,
    onSuccess: (widgets) =>
      queryClient.setQueryData(dashboardKeys.widgets, widgets),
    onError: (error) => showToast(error.message),
  });
};
