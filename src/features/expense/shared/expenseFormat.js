const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export const formatWon = (amt) => `${amt.toLocaleString('ko-KR')}원`;

/** 날짜 라벨 (9월 15일 (화)) */
export const formatDayHeader = (expndYmd) => {
  const [year, month, day] = expndYmd.split('-').map(Number);
  const dayName = DAY_NAMES[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${dayName})`;
};

/** 지출 상세 날짜 (2026.09.15 (화)) */
export const formatFullDate = (expndYmd) => {
  const [year, month, day] = expndYmd.split('-').map(Number);
  const dayName = DAY_NAMES[new Date(year, month - 1, day).getDay()];
  return `${expndYmd.replaceAll('-', '.')} (${dayName})`;
};

export const formatFullDayHeader = (expndYmd) =>
  `${expndYmd.slice(0, 4)}년 ${formatDayHeader(expndYmd)}`;

/** 월-일 라벨 (09-15) */
export const formatMonthDay = (expndYmd) => expndYmd.slice(5);

/** 지출 줄·달력의 반려동물 이름 */
export const getPetLabel = (expense) => {
  if (expense.petSn == null) return '공용';
  return expense.petDelYn ? `${expense.petNm}(삭제됨)` : expense.petNm;
};

/** 필터·반려동물별 지출의 이름 */
export const getPetFilterLabel = (pet) => {
  if (pet.petDelYn) return `${pet.petNm}(삭제됨)`;
  if (!pet.petLinked) return `${pet.petNm}(연동 해제)`;
  return pet.petNm;
};

/** 사용처 최대 글자 수 */
export const PLACE_MAX_LENGTH = 80;

export const getPlace = (expense) => expense.expndPlcusNm ?? '';

/** 설명 줄의 "내용 · 사용처" (빈 값은 생략) */
export const getExpenseDesc = (expense) =>
  [expense.dtlMttr, getPlace(expense)].filter(Boolean).join(' · ');
