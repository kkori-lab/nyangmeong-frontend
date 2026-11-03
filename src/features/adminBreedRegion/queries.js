import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createAdminBreed,
  getAdminBreeds,
  getRegions,
  getServiceSggRegions,
  updateAdminBreed,
} from './api';

export const adminBreedRegionKeys = {
  all: ['adminBreedRegion'],
  breeds: ['adminBreedRegion', 'breeds'],
  breedList: (petSeCd) => ['adminBreedRegion', 'breeds', petSeCd],
  regions: (upRgnSn) => ['adminBreedRegion', 'regions', upRgnSn ?? null],
  serviceSggs: ['adminBreedRegion', 'regions', 'serviceSggs'],
};

export const useAdminBreeds = (petSeCd) =>
  useQuery({
    queryKey: adminBreedRegionKeys.breedList(petSeCd),
    queryFn: () => getAdminBreeds({ petSeCd }),
    placeholderData: keepPreviousData,
  });

const useInvalidateBreeds = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminBreedRegionKeys.breeds });
};

export const useCreateAdminBreed = () => {
  const invalidate = useInvalidateBreeds();
  return useMutation({ mutationFn: createAdminBreed, onSuccess: invalidate });
};

export const useUpdateAdminBreed = () => {
  const invalidate = useInvalidateBreeds();
  return useMutation({ mutationFn: updateAdminBreed, onSuccess: invalidate });
};

/** 지역은 기준 데이터라 오래 둔다. enabled가 false면 조회 안 함 */
/** 서비스 지역(전북) 시군구 */
export const useServiceSggRegions = () =>
  useQuery({
    queryKey: adminBreedRegionKeys.serviceSggs,
    queryFn: getServiceSggRegions,
    staleTime: Infinity,
  });

export const useRegions = (upRgnSn, { enabled = true } = {}) =>
  useQuery({
    queryKey: adminBreedRegionKeys.regions(upRgnSn),
    queryFn: () => getRegions(upRgnSn),
    staleTime: Infinity,
    enabled,
  });
