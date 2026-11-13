import {
  COLR_DRCT_INPT,
  COLR_OPTIONS,
  findColrName,
  PET_GNDR_OPTIONS,
  PET_SE_OPTIONS,
} from './petCodes';

const findName = (options, code) =>
  options?.find((option) => option.code === code)?.name ?? '';

export const getPetSeName = (pet) => findName(PET_SE_OPTIONS, pet.petSeCd);

export const getVrtyName = (pet) => pet.vrtyNm ?? pet.vrtyDrctInptNm ?? '';

/** 품종명(종류) 표기 */
export const formatSpecies = (pet) => {
  const vrtyName = getVrtyName(pet);
  return vrtyName ? `${vrtyName}(${getPetSeName(pet)})` : getPetSeName(pet);
};

export const getGndrName = (pet) => findName(PET_GNDR_OPTIONS, pet.petGndrCd);

export const getColrName = (pet) =>
  pet.colrCd === COLR_DRCT_INPT
    ? (pet.colrDrctInptNm ?? '')
    : findName(COLR_OPTIONS[pet.petSeCd], pet.colrCd) ||
      findColrName(pet.colrCd);

/** 저장된 털색이 그 종의 선택지에 없으면 true (직접 입력은 어느 종에서나 맞다) */
export const isColrMismatch = (pet) =>
  pet.colrCd !== COLR_DRCT_INPT &&
  !COLR_OPTIONS[pet.petSeCd]?.some((colr) => colr.code === pet.colrCd);

/** 소수 셋째 자리에서 반올림해 둘째 자리까지, 끝 0은 생략 (4.20 → 4.2kg, 5.00 → 5kg) */
export const formatWeight = (kg) => `${Number(Number(kg).toFixed(2))}kg`;

/** 쉼표 문자열 -> 배열 */
export const splitList = (value) => (value ? value.split(',') : []);

// "3살 2개월". 생일이 없으면 빈 문자열
export const formatAge = (petBrdt, today = new Date()) => {
  if (!petBrdt) return '';
  const birth = new Date(petBrdt);
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    today.getMonth() -
    birth.getMonth();
  if (today.getDate() < birth.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest}개월`;
  return rest === 0 ? `${years}살` : `${years}살 ${rest}개월`;
};

// "21.04.12 (5살 6개월)". 날짜 문자열을 그대로 잘라 쓴다. 생일이 없으면 빈 문자열
export const formatBirthAge = (petBrdt, today = new Date()) => {
  if (!petBrdt) return '';
  const [year, month, day] = petBrdt.slice(0, 10).split('-');
  const age = formatAge(`${year}-${month}-${day}T00:00:00`, today);
  return `${year.slice(2)}.${month}.${day} (${age})`;
};
