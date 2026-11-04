import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminAiKeyword,
  deleteAdminAiKeyword,
  getAdminAiKeywords,
  updateAdminAiKeyword,
} from './api';

export const adminAiKeywordKeys = {
  all: ['adminAiKeyword'],
  lists: ['adminAiKeyword', 'list'],
  list: (params) => ['adminAiKeyword', 'list', params],
};

/** params: { dictUsgCd, kwrdClsfNm }. 탭을 바꾸면 앞 탭 행을 보이지 않고 새로 받는다 */
export const useAdminAiKeywords = (params) =>
  useQuery({
    queryKey: adminAiKeywordKeys.list(params),
    queryFn: () => getAdminAiKeywords(params),
  });

/** 등록·수정·삭제 모두 성공하면 목록을 다시 받는다 */
const useKeywordMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminAiKeywordKeys.lists }),
  });
};

export const useCreateAdminAiKeyword = () =>
  useKeywordMutation(createAdminAiKeyword);
export const useUpdateAdminAiKeyword = () =>
  useKeywordMutation(updateAdminAiKeyword);
export const useDeleteAdminAiKeyword = () =>
  useKeywordMutation(deleteAdminAiKeyword);
