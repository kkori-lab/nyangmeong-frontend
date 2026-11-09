import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/components/toastStore';
import { togglePostLike } from './api';

/**
 * 좋아요·취소 토글: 누르는 즉시 상세 캐시의 liked·rcmdtnCnt를 바꾼다(서버 응답 전에 화면이 바뀜)
 * - 요청이 실패하면 눌렀던 값으로 되돌리고 토스트로 알린다
 * - 끝나면(성공·실패) 그 도메인 캐시를 다시 받아 서버 값으로 맞춘다
 * - detailKey: 그 글 상세의 queryKey(도메인마다 번호가 달라 화면이 정함), allKey: 그 도메인 queryKey 전체
 */
export const useOptimisticLike = ({ detailKey, allKey }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePostLike,
    onMutate: async ({ liked }) => {
      /** 진행 중인 상세 재조회가 낙관적 값을 덮어쓰지 않게 먼저 멈춘다 */
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData(detailKey);
      queryClient.setQueryData(detailKey, (post) =>
        post
          ? {
              ...post,
              liked: !liked,
              rcmdtnCnt: post.rcmdtnCnt + (liked ? -1 : 1),
            }
          : post,
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(detailKey, context?.previous);
      showToast(error?.message || '좋아요를 처리하지 못했어요');
    },
    onSettled: () => {
      /** Promise를 돌려주면 재조회가 끝날 때까지 버튼이 잠기므로 기다리지 않는다 */
      queryClient.invalidateQueries({ queryKey: allKey });
    },
  });
};
