import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { pointKeys } from '@/features/point/queries';
import {
  acceptInvitation,
  createCharacter,
  createInvitation,
  createPet,
  deleteCaregiver,
  deletePet,
  getCaregivers,
  getCharacterItems,
  getInvitation,
  getPet,
  getPets,
  getShopItems,
  getSentInvitations,
  getVarieties,
  leavePet,
  purchaseCharacterItems,
  rejectInvitation,
  setRepresentativePet,
  updateCharacterWear,
  updatePet,
} from './api';

export const petKeys = {
  all: ['pets'],
  list: () => ['pets', 'list'],
  detail: (petSn) => ['pets', petSn],
  caregivers: (petSn) => ['pets', petSn, 'caregivers'],
  items: (petSn) => ['pets', petSn, 'items'],
  varieties: (petSeCd) => ['varieties', petSeCd],
  shopItems: () => ['items', 'shop'],
};

export const invitationKeys = {
  all: ['invitations'],
  sent: () => ['invitations', 'sent'],
  detail: (invitationToken) => ['invitations', invitationToken],
};

export const usePets = () =>
  useQuery({ queryKey: petKeys.list(), queryFn: getPets });

export const usePet = (petSn) =>
  useQuery({
    queryKey: petKeys.detail(petSn),
    queryFn: () => getPet(petSn),
    enabled: petSn != null,
  });

export const useVarieties = (petSeCd) =>
  useQuery({
    queryKey: petKeys.varieties(petSeCd),
    queryFn: () => getVarieties(petSeCd),
    enabled: !!petSeCd,
  });

export const useCreatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPet,
    onSuccess: () => qc.invalidateQueries({ queryKey: petKeys.all }),
  });
};

export const useUpdatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePet,
    onSuccess: () => qc.invalidateQueries({ queryKey: petKeys.all }),
  });
};

/**
 * 연동이 끊긴 동물의 상세·양육자·캐릭터 이미지 쿼리는 화면에 붙어 있는 채로 갱신하면 403·404가 난다.
 * 목록만 먼저 다시 읽어 슬라이드가 다른 동물로 넘어가게 한 뒤 그 동물의 쿼리를 지운다.
 */
const refreshAfterPetGone = async (qc, petSn) => {
  await qc.invalidateQueries({ queryKey: petKeys.list() });
  qc.removeQueries({ queryKey: petKeys.detail(petSn) });
};

export const useDeletePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePet,
    /** 대표 승계가 다른 동물 상세에도 반영되도록 남은 쿼리도 무효화 */
    onSuccess: async (_, petSn) => {
      await refreshAfterPetGone(qc, petSn);
      qc.invalidateQueries({ queryKey: petKeys.all });
    },
    /** 이미 삭제된 동물이면 목록을 다시 읽어 맞춘다 */
    onError: (error, petSn) => {
      if (error.code === 'PET_NOT_FOUND') return refreshAfterPetGone(qc, petSn);
    },
  });
};

export const useCaregivers = (petSn) =>
  useQuery({
    queryKey: petKeys.caregivers(petSn),
    queryFn: () => getCaregivers(petSn),
    enabled: petSn != null,
  });

/** 여러 동물의 양육관계 한 번에 조회 (초대 대상 인원 표시용) */
export const useCaregiversOf = (petSns) =>
  useQueries({
    queries: petSns.map((petSn) => ({
      queryKey: petKeys.caregivers(petSn),
      queryFn: () => getCaregivers(petSn),
    })),
  });

export const useDeleteCaregiver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCaregiver,
    onSuccess: (_, { petSn }) => {
      qc.invalidateQueries({ queryKey: petKeys.caregivers(petSn) });
      qc.invalidateQueries({ queryKey: petKeys.list() });
    },
    /** 이미 해제된 연동이면 목록을 다시 읽어 맞춘다 */
    onError: (error, { petSn }) => {
      if (error.code === 'CAREGIVER_NOT_FOUND')
        qc.invalidateQueries({ queryKey: petKeys.caregivers(petSn) });
    },
  });
};

export const useLeavePet = () => {
  const qc = useQueryClient();
  /**
   * 해제된 동물의 상세·양육자·캐릭터 이미지 쿼리는 화면에 붙어 있는 채로 갱신하면 403이 난다.
   * 목록만 먼저 다시 읽어 슬라이드가 다른 동물로 넘어가게 한 뒤 그 동물의 쿼리를 지운다.
   */
  const refreshAfterUnlink = (petSn) => refreshAfterPetGone(qc, petSn);
  return useMutation({
    mutationFn: leavePet,
    onSuccess: (_, { petSn }) => refreshAfterUnlink(petSn),
    /** 이미 해제된 연동이면 목록을 다시 읽어 맞춘다 */
    onError: (error, { petSn }) => {
      if (error.code === 'CAREGIVER_NOT_FOUND') return refreshAfterUnlink(petSn);
    },
  });
};

export const useCharacterItems = (petSn) =>
  useQuery({
    queryKey: petKeys.items(petSn),
    queryFn: () => getCharacterItems(petSn),
    enabled: petSn != null,
  });

/** 모달이 닫혀도 생성은 이어지므로 갱신은 여기(훅 옵션)에서 처리 */
export const useCreateCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => {
      const done = createCharacter(body);
      /** 요청 즉시 "만드는 중" 상태를 목록에 반영 */
      qc.invalidateQueries({ queryKey: petKeys.list() });
      return done;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: petKeys.all }),
  });
};

export const useUpdateCharacterWear = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCharacterWear,
    onSuccess: (_, { petSn }) =>
      qc.invalidateQueries({ queryKey: petKeys.items(petSn) }),
  });
};

export const useShopItems = () =>
  useQuery({ queryKey: petKeys.shopItems(), queryFn: getShopItems });

export const usePurchaseCharacterItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseCharacterItems,
    onSuccess: (_, { petSn }) => {
      qc.invalidateQueries({ queryKey: petKeys.items(petSn) });
      qc.invalidateQueries({ queryKey: pointKeys.balance() });
    },
  });
};

export const useSetRepresentativePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setRepresentativePet,
    onSuccess: () => qc.invalidateQueries({ queryKey: petKeys.all }),
  });
};

export const useSentInvitations = () =>
  useQuery({ queryKey: invitationKeys.sent(), queryFn: getSentInvitations });

export const useCreateInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvitation,
    onSuccess: () => qc.invalidateQueries({ queryKey: invitationKeys.sent() }),
  });
};

export const useInvitation = (invitationToken) =>
  useQuery({
    queryKey: invitationKeys.detail(invitationToken),
    queryFn: () => getInvitation(invitationToken),
    enabled: !!invitationToken,
    retry: false,
  });

export const useAcceptInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invitationKeys.all });
      qc.invalidateQueries({ queryKey: petKeys.all });
    },
  });
};

export const useRejectInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectInvitation,
    onSuccess: () => qc.invalidateQueries({ queryKey: invitationKeys.all }),
  });
};
