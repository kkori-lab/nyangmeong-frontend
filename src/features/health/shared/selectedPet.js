import { createContext, useContext } from 'react';

/**
 * [건강기록 공통 반려동물 선택값] (※신규 정책)
 * - 값: { pets, pet, selectPet(petSn), isPending, isError }
 * - pet은 공통 카드에서 고른 반려동물. 반려동물이 0마리면 null
 */
export const SelectedPetContext = createContext(null);

export const useSelectedPet = () => useContext(SelectedPetContext);

/** 마지막으로 고른 반려동물 번호를 회원별로 보관하는 localStorage 키 (※신규 정책) */
const storageKey = (mbrSn) => `nyangmeong.health.petSn.${mbrSn}`;

/** 저장된 번호를 읽는다. 저장소를 쓸 수 없거나 값이 없으면 null (화면은 저장 없이도 동작) */
export const readStoredPetSn = (mbrSn) => {
  if (mbrSn == null) return null;
  try {
    return Number(localStorage.getItem(storageKey(mbrSn))) || null;
  } catch {
    return null;
  }
};

export const writeStoredPetSn = (mbrSn, petSn) => {
  if (mbrSn == null) return;
  try {
    localStorage.setItem(storageKey(mbrSn), String(petSn));
  } catch {
    // 저장소를 못 써도 화면 안 선택은 그대로 동작한다
  }
};
