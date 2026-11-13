/**
 * [마지막으로 고른 반려동물 번호] 회원별 localStorage 보관 (※신규 정책)
 * - 건강기록 3개 화면이 고를 때 쓰고, AI 채팅은 처음 칩을 정할 때 읽기만 한다
 * - 키를 건강기록 전용 이름에서 바꿨다. 새 키가 없으면 예전 키 값을 읽는다
 * - 저장소를 쓸 수 없거나 값이 없으면 null (화면은 저장 없이도 동작)
 */
const storageKey = (mbrSn) => `nyangmeong.lastPetSn.${mbrSn}`;
const legacyKey = (mbrSn) => `nyangmeong.health.petSn.${mbrSn}`;

export const readLastPetSn = (mbrSn) => {
  if (mbrSn == null) return null;
  try {
    const value =
      localStorage.getItem(storageKey(mbrSn)) ??
      localStorage.getItem(legacyKey(mbrSn));
    return Number(value) || null;
  } catch {
    return null;
  }
};

export const writeLastPetSn = (mbrSn, petSn) => {
  if (mbrSn == null) return;
  try {
    localStorage.setItem(storageKey(mbrSn), String(petSn));
  } catch {
    // 저장소를 못 써도 화면 안 선택은 그대로 동작한다
  }
};
