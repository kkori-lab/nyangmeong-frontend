import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { faqKeys } from '@/features/faq/queries';
import {
  createAdminFaq,
  getAdminFaq,
  getAdminFaqs,
  getFaqCategories,
  updateAdminFaq,
} from './api';

export const adminFaqKeys = {
  all: ['adminFaq'],
  list: (params) => ['adminFaq', 'list', params],
  detail: (faqSn) => ['adminFaq', 'detail', faqSn],
  categories: ['adminFaq', 'categories'],
};

export const useAdminFaqs = (params) =>
  useQuery({
    queryKey: adminFaqKeys.list(params),
    queryFn: () => getAdminFaqs(params),
    placeholderData: keepPreviousData,
  });

export const useAdminFaq = (faqSn) =>
  useQuery({
    queryKey: adminFaqKeys.detail(faqSn),
    queryFn: () => getAdminFaq(faqSn),
    enabled: Number.isInteger(faqSn),
  });

/** 카테고리는 SQL로만 바뀌어 오래 둔다 */
export const useFaqCategories = () =>
  useQuery({
    queryKey: adminFaqKeys.categories,
    queryFn: getFaqCategories,
    staleTime: Infinity,
  });

/** 관리자 목록과 사용자 FAQ 화면까지 무효화 */
const useInvalidateFaqs = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminFaqKeys.all }),
      queryClient.invalidateQueries({ queryKey: faqKeys.all }),
    ]);
};

export const useCreateAdminFaq = () => {
  const invalidate = useInvalidateFaqs();
  return useMutation({ mutationFn: createAdminFaq, onSuccess: invalidate });
};

export const useUpdateAdminFaq = () => {
  const invalidate = useInvalidateFaqs();
  return useMutation({ mutationFn: updateAdminFaq, onSuccess: invalidate });
};
