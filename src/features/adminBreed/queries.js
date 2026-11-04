import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createAdminBreed, getAdminBreeds, updateAdminBreed } from './api';

export const adminBreedKeys = {
  all: ['adminBreed'],
  breeds: ['adminBreed', 'breeds'],
  breedList: (petSeCd) => ['adminBreed', 'breeds', petSeCd],
};

export const useAdminBreeds = (petSeCd) =>
  useQuery({
    queryKey: adminBreedKeys.breedList(petSeCd),
    queryFn: () => getAdminBreeds({ petSeCd }),
    placeholderData: keepPreviousData,
  });

const useInvalidateBreeds = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminBreedKeys.breeds });
};

export const useCreateAdminBreed = () => {
  const invalidate = useInvalidateBreeds();
  return useMutation({ mutationFn: createAdminBreed, onSuccess: invalidate });
};

export const useUpdateAdminBreed = () => {
  const invalidate = useInvalidateBreeds();
  return useMutation({ mutationFn: updateAdminBreed, onSuccess: invalidate });
};
