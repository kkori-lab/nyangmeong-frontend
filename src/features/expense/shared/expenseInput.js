import { FILTER_SHARED, HOSPITAL_CLSF_CD } from './expenseCodes';
import { getPetFilterLabel } from './expenseFormat';

export const PET_PLACEHOLDER = { value: '', label: '선택해 주세요' };
export const HOSPITAL_NOTICE = '병원비는 반려동물을 선택해 주세요';

/** 한국 시간 기준 오늘(UTC 변환으로 하루 어긋나지 않게 시간대를 지정해 포맷) */
export const getTodayYmd = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

/** 지출 날짜 최대값: 오늘 (미래 날짜는 등록할 수 없다) */
export const getMaxExpndYmd = getTodayYmd;

export const getActivePets = (pets) => pets.filter((pet) => pet.petLinked);

/** 가장 최근 등록 동물 */
export const getDefaultPetValue = (activePets) =>
  activePets.length === 0
    ? ''
    : String(activePets[activePets.length - 1].petSn);

/** 반려동물 칸 선택지 */
export const getPetOptions = ({
  pets,
  expndClsfCd,
  currentValue,
  takenValues = [],
  keepPet = null,
}) => {
  const activePets = getActivePets(pets);
  const options = activePets.map((pet) => ({
    value: String(pet.petSn),
    label: pet.petNm,
  }));
  if (keepPet && !options.some((o) => o.value === String(keepPet.petSn))) {
    options.push({
      value: String(keepPet.petSn),
      label: getPetFilterLabel(keepPet),
    });
  }
  const hasShared =
    expndClsfCd !== HOSPITAL_CLSF_CD &&
    (activePets.length > 1 || currentValue === FILTER_SHARED);
  if (hasShared) options.push({ value: FILTER_SHARED, label: '공용' });
  const selectable = options.filter(
    (option) =>
      option.value === currentValue || !takenValues.includes(option.value),
  );
  return currentValue === '' ? [PET_PLACEHOLDER, ...selectable] : selectable;
};

export const toPetSn = (petValue) =>
  petValue === FILTER_SHARED ? null : Number(petValue);

export const toPetValue = (petSn) =>
  petSn == null ? FILTER_SHARED : String(petSn);
