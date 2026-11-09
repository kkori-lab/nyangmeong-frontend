const compact = (text) => String(text ?? '').replace(/\s+/g, '');

/**
 * 새 방의 펫 태그: 글에 이름이 나온 반려동물이 하나뿐이면 그 아이, 아니면 칩
 * - 이름 비교는 AI 서버와 같이 공백을 뺀 글로 한다
 * - chipPetSn: 선택한 칩의 petSn([전체]면 null)
 */
export const petTagFor = (cnvrsCn, pets, chipPetSn) => {
  const text = compact(cnvrsCn);
  const named = (pets ?? []).filter(
    (pet) => pet.petNm && text.includes(compact(pet.petNm)),
  );
  return named.length === 1 ? named[0].petSn : (chipPetSn ?? null);
};
