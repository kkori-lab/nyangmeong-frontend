import { findBloodItem } from './bloodItems';

/** 행을 저장에서 빼는 이유: 'registered' 이미 등록됨, 'nonBlood' 혈액검사 아님, 없으면 null */
export const getExcludeReason = (row, registeredNames) => {
  if (!row.isBlood) return 'nonBlood';
  if (registeredNames.has(row.inspItmNm)) return 'registered';
  return null;
};

/** 저장 요청 1행: 목록 12종은 항목 코드(HLTG12), 그 밖의 이름은 직접입력명으로 보낸다 */
export const toInspectionValue = (name, value) => {
  const bloodItem = findBloodItem(name);
  return {
    ...(bloodItem
      ? { inspArtclCd: bloodItem.inspArtclCd }
      : { inspArtclDrctInptNm: name }),
    ...value,
  };
};

/** 직접입력은 이름, 목록 항목은 코드로 같은 항목인지 본다(응답의 목록 항목은 직접입력명이 null) */
const getValueKey = (value) => value.inspArtclDrctInptNm ?? value.inspArtclCd;

/** 보낸 항목 중 저장 응답에 없는 것(이미 등록돼 서버가 뺀 항목)의 이름 */
export const getSkippedNames = (names, values, savedValues) => {
  const savedKeys = new Set(savedValues.map(getValueKey));
  return names.filter(
    (_name, index) => !savedKeys.has(getValueKey(values[index])),
  );
};
