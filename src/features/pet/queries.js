import { useRef } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { healthKeys } from '@/features/health/queries';
import { pointKeys } from '@/features/point/queries';
import { getCharState } from './shared/charState';
import { CRT_JOB_STTS } from '@/utils/petCodes';
import {
  acceptInvitation,
  createCharacter,
  createInvitation,
  createPet,
  deleteCaregiver,
  deletePet,
  getCaregivers,
  getCharacterPreview,
  getInvitation,
  getPet,
  getLatestWeightRecord,
  getPets,
  getPixelCharacter,
  getPixelCharacters,
  getShopItems,
  getSentInvitations,
  getVarieties,
  leavePet,
  purchaseItems,
  rejectInvitation,
  saveEquippedImage,
  saveEquippedItems,
  setRepresentativePet,
  updatePet,
} from './api';

export const petKeys = {
  all: ['pets'],
  list: () => ['pets', 'list'],
  detail: (petSn) => ['pets', petSn],
  lastWeight: (petSn) => ['pets', petSn, 'last-weight'],
  caregivers: (petSn) => ['pets', petSn, 'caregivers'],
  varieties: (petSeCd) => ['varieties', petSeCd],
};

/** 캐릭터 꾸미기 상세·상점·미리보기 (반려동물 캐시와 따로 둔다) */
export const characterKeys = {
  detail: (pixelCharSn) => ['pixel-character', pixelCharSn],
  shopItems: (pixelCharSn) => ['pixel-character', pixelCharSn, 'shop-items'],
  /** 같은 조합은 순서와 상관없이 같은 키 */
  preview: (pixelCharSn, itemSns) => [
    'pixel-character',
    pixelCharSn,
    'preview',
    [...itemSns].sort((a, b) => a - b),
  ],
};

export const invitationKeys = {
  all: ['invitations'],
  sent: () => ['invitations', 'sent'],
  detail: (jntBrupInvtnSn) => ['invitations', jntBrupInvtnSn],
};

export const usePets = () =>
  useQuery({ queryKey: petKeys.list(), queryFn: getPets });

const CHAR_POLL_MS = 4000;
const CHAR_POLL_LIMIT_MS = 12 * 60 * 1000;

/**
 * 캐릭터 목록(GET /pixel-characters)
 * - 건강기록 히어로와 같은 키라 캐시가 하나다
 * - isPolling이면 생성 중인 동물이 있는 동안 4초마다 다시 읽는다(처음 본 때부터 12분이 지나면 멈춤)
 */
export const usePixelCharacters = ({ isPolling = false } = {}) => {
  const startedAtRef = useRef(null);
  return useQuery({
    queryKey: healthKeys.pixelCharacters,
    queryFn: getPixelCharacters,
    refetchInterval: isPolling
      ? ({ state }) => {
          const isCreating = state.data?.some(
            (item) =>
              item.crtJobSttsCd === CRT_JOB_STTS.REQUESTED ||
              item.crtJobSttsCd === CRT_JOB_STTS.GENERATING,
          );
          if (!isCreating) {
            startedAtRef.current = null;
            return false;
          }
          startedAtRef.current ??= Date.now();
          return Date.now() - startedAtRef.current < CHAR_POLL_LIMIT_MS
            ? CHAR_POLL_MS
            : false;
        }
      : false,
  });
};

/** 동물 한 마리의 캐릭터 상태 { status, isError }, 목록 로딩 중에는 undefined */
export const useCharState = (petSn) =>
  useQuery({
    queryKey: healthKeys.pixelCharacters,
    queryFn: getPixelCharacters,
    select: (list) => getCharState(list.find((item) => item.petSn === petSn)),
  }).data;

export const usePet = (petSn) =>
  useQuery({
    queryKey: petKeys.detail(petSn),
    queryFn: () => getPet(petSn),
    enabled: petSn != null,
  });

/**
 * 건강 일지의 최신 체중 기록(수정 모달의 체중 잠금 판단)
 * - 조회에 실패하면 기록 없음으로 본다(재시도 없이 바로)
 */
export const useLastWeightRecord = (petSn) =>
  useQuery({
    queryKey: petKeys.lastWeight(petSn),
    queryFn: () => getLatestWeightRecord(petSn),
    enabled: petSn != null,
    retry: false,
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
      if (error.code === 'CAREGIVER_NOT_FOUND')
        return refreshAfterUnlink(petSn);
    },
  });
};

/** 꾸미기 상세: 보유 아이템 heldItems와 착용 여부 equipYn */
export const usePixelCharacter = (pixelCharSn) =>
  useQuery({
    queryKey: characterKeys.detail(pixelCharSn),
    queryFn: () => getPixelCharacter(pixelCharSn),
    enabled: pixelCharSn != null,
  });

/** 모달이 닫혀도 생성은 이어지므로 갱신은 여기(훅 옵션)에서 처리 */
export const useCreateCharacter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCharacter,
    /** 목록을 다시 읽은 뒤 끝내 모달이 바로 "생성 중"으로 바뀌게 한다 */
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: healthKeys.pixelCharacters }),
    /** 409(이미 있음·생성 중)는 상태가 달라졌을 수 있어 다시 읽는다 */
    onError: (error) => {
      if (
        error.code === 'PIXEL_CHARACTER_CREATING' ||
        error.code === 'PIXEL_CHARACTER_ALREADY_EXISTS'
      )
        qc.invalidateQueries({ queryKey: healthKeys.pixelCharacters });
    },
  });
};

/** 저장·구매 응답이 꾸미기 상세라 그대로 캐시에 넣는다 */
const applyCharacter = (qc, pixelCharSn, character) => {
  qc.setQueryData(characterKeys.detail(pixelCharSn), character);
  qc.invalidateQueries({ queryKey: healthKeys.pixelCharacters });
};

/**
 * 착용 저장 (variables: { pixelCharSn, petSn, hldItemSns, itemSns })
 * - 저장 성공 뒤 착용 아이템이 있으면 대표 이미지 저장을 기다리지 않고 부른다(200·409 등 실패여도 알리지 않는다)
 * - 끝나면 character-image(전신·얼굴)를 다시 읽는다. 아이템이 없으면 서버가 대표 이미지를 지워 맨몸이다
 */
export const useSaveEquippedItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pixelCharSn, hldItemSns }) =>
      saveEquippedItems({ pixelCharSn, hldItemSns }),
    onSuccess: (character, { pixelCharSn, petSn, itemSns }) => {
      applyCharacter(qc, pixelCharSn, character);
      const refreshImages = () =>
        qc.invalidateQueries({ queryKey: ['pets', petSn, 'character-image'] });
      if (itemSns.length === 0) {
        refreshImages();
        return;
      }
      saveEquippedImage({ pixelCharSn, itemSns })
        .catch(() => {})
        .finally(refreshImages);
    },
    /** 오류 확인 중으로 바뀐 캐릭터는 목록 상태를 다시 읽는다 */
    onError: (error) => {
      if (error.code === 'PIXEL_CHARACTER_UNDER_REVIEW')
        qc.invalidateQueries({ queryKey: healthKeys.pixelCharacters });
    },
  });
};

/** 상점 목록과 보유 포인트(주양육자만) */
export const useShopItems = (pixelCharSn) =>
  useQuery({
    queryKey: characterKeys.shopItems(pixelCharSn),
    queryFn: () => getShopItems(pixelCharSn),
    enabled: pixelCharSn != null,
  });

export const usePurchaseItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseItems,
    onSuccess: (character, { pixelCharSn }) => {
      applyCharacter(qc, pixelCharSn, character);
      qc.invalidateQueries({ queryKey: characterKeys.shopItems(pixelCharSn) });
      qc.invalidateQueries({ queryKey: pointKeys.balance() });
    },
    /** 이미 보유한 아이템이 있으면 상점을 다시 읽어 보유중을 맞춘다 */
    onError: (error, { pixelCharSn }) => {
      if (error.code === 'ITEM_ALREADY_HELD') {
        qc.invalidateQueries({ queryKey: characterKeys.detail(pixelCharSn) });
        qc.invalidateQueries({
          queryKey: characterKeys.shopItems(pixelCharSn),
        });
      }
    },
  });
};

/**
 * 착용 미리보기(AI 서버 합성 PNG Blob)
 * - 조합이 바뀌면 앞 요청은 취소되고, 새 이미지가 올 때까지 직전 이미지를 유지한다
 */
export const useCharacterPreview = ({ pixelCharSn, itemSns, enabled = true }) =>
  useQuery({
    queryKey: characterKeys.preview(pixelCharSn, itemSns),
    queryFn: ({ signal }) =>
      getCharacterPreview({
        pixelCharSn,
        itemSns: [...itemSns].sort((a, b) => a - b),
        signal,
      }),
    enabled: enabled && pixelCharSn != null,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

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

export const useInvitation = (jntBrupInvtnSn) =>
  useQuery({
    queryKey: invitationKeys.detail(jntBrupInvtnSn),
    queryFn: () => getInvitation(jntBrupInvtnSn),
    enabled: !!jntBrupInvtnSn,
    retry: false,
  });

/** 수락·거절이 만료·처리됨·이메일 불일치로 막히면 초대를 다시 읽어 안내 화면으로 바꾼다 */
const CLOSED_CODES = [
  'CAREGIVER_INVITATION_EXPIRED',
  'CAREGIVER_INVITATION_ALREADY_PROCESSED',
  'CAREGIVER_INVITATION_EMAIL_MISMATCH',
];
const refreshIfClosed = (qc, error) => {
  if (CLOSED_CODES.includes(error.code)) {
    qc.invalidateQueries({ queryKey: invitationKeys.all });
  }
};

export const useAcceptInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invitationKeys.all });
      qc.invalidateQueries({ queryKey: petKeys.all });
    },
    onError: (error) => refreshIfClosed(qc, error),
  });
};

export const useRejectInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectInvitation,
    onSuccess: () => qc.invalidateQueries({ queryKey: invitationKeys.all }),
    onError: (error) => refreshIfClosed(qc, error),
  });
};
