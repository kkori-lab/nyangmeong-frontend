import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useFileImage } from '@/hooks/useFileImage';
import {
  createAdminItem,
  getAdminItems,
  getItemParts,
  saveAdminItemOrder,
  updateAdminItem,
} from './api';

export const adminItemKeys = {
  all: ['adminItem'],
  lists: ['adminItem', 'list'],
  list: (params) => ['adminItem', 'list', params],
  parts: ['adminItem', 'parts'],
  image: (itemSn, atchFileSn) => ['adminItem', 'image', itemSn, atchFileSn],
};

export const useAdminItems = (params) =>
  useQuery({
    queryKey: adminItemKeys.list(params),
    queryFn: () => getAdminItems(params),
    placeholderData: keepPreviousData,
  });

/** 부위는 SQL로만 바뀌어 오래 둔다 */
export const useItemParts = () =>
  useQuery({
    queryKey: adminItemKeys.parts,
    queryFn: getItemParts,
    staleTime: Infinity,
  });

/** 아이템 이미지: 판매 중지 아이템도 보이는 관리자 이미지 API, 파일이 없으면 조회 안 함 */
export const useAdminItemImage = ({ itemSn, atchFileSn }) =>
  useFileImage({
    queryKey: adminItemKeys.image(itemSn, atchFileSn),
    url: `/admin/items/${itemSn}/image`,
    enabled: atchFileSn != null,
  });

/** 목록만 무효화(이미지 캐시는 atchFileSn이 바뀌면 새 키) */
const useInvalidateItems = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminItemKeys.lists });
};

export const useCreateAdminItem = () => {
  const invalidate = useInvalidateItems();
  return useMutation({ mutationFn: createAdminItem, onSuccess: invalidate });
};

export const useUpdateAdminItem = () => {
  const invalidate = useInvalidateItems();
  return useMutation({ mutationFn: updateAdminItem, onSuccess: invalidate });
};

export const useSaveAdminItemOrder = () => {
  const invalidate = useInvalidateItems();
  return useMutation({ mutationFn: saveAdminItemOrder, onSuccess: invalidate });
};
