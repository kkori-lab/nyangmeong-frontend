import { EXPND_CLSF, EXPND_CLSF_LIST } from './expenseCodes';
import { getPetFilterLabel } from './expenseFormat';

export const sumAmt = (expenses) =>
  expenses.reduce((sum, expense) => sum + expense.expndAmt, 0);

export const getRatio = (amt, totalAmt) =>
  totalAmt === 0 ? 0 : Math.round((amt / totalAmt) * 100);

/** 합계 100 보정 비율 (항목별 반올림 시 99·101 방지) */
const getRatiosSummingTo100 = (amts) => {
  const total = amts.reduce((sum, amt) => sum + amt, 0);
  const exacts = amts.map((amt) => (amt / total) * 100);
  const ratios = exacts.map(Math.floor);
  let rest = 100 - ratios.reduce((sum, ratio) => sum + ratio, 0);
  exacts
    .map((exact, index) => ({ index, fraction: exact - Math.floor(exact) }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ index }) => {
      if (rest > 0) {
        ratios[index] += 1;
        rest -= 1;
      }
    });
  return ratios;
};

/** 서버 카테고리 합계(금액 큰 순, 기타 마지막으로 정렬돼 옴)에 이름·색·비율을 붙임 */
export const getCategoryStats = (categories) => {
  const stats = categories
    .filter((item) => item.totalExpndAmt > 0 && EXPND_CLSF[item.expndClsfCd])
    .map((item) => ({
      ...EXPND_CLSF_LIST.find((clsf) => clsf.code === item.expndClsfCd),
      totalAmt: item.totalExpndAmt,
    }));
  const ratios = getRatiosSummingTo100(stats.map((stat) => stat.totalAmt));
  return stats.map((stat, index) => ({ ...stat, ratio: ratios[index] }));
};

/**
 * 반려동물별 지출 집계
 * 연동 중인 동물은 0원이어도 보이고, 연동 해제·삭제된 동물은 지출이 있을 때만 보인다
 */
export const getPetStats = (statistics, pets) => {
  const { totalExpndAmt, pets: petItems, commonTotalExpndAmt } = statistics;
  const amtOf = (petSn) =>
    petItems.find((item) => item.petSn === petSn)?.totalExpndAmt ?? 0;
  const known = new Set(pets.map((pet) => pet.petSn));
  /** 옵션에 없는 동물(드문 경우)도 응답 값으로 그린다 */
  const options = [
    ...pets,
    ...petItems
      .filter((item) => !known.has(item.petSn))
      .map((item) => ({ ...item, petLinked: false })),
  ];
  const stats = options
    .filter((pet) => pet.petLinked || amtOf(pet.petSn) > 0)
    .map((pet) => ({
      petSn: pet.petSn,
      label: getPetFilterLabel(pet),
      totalAmt: amtOf(pet.petSn),
      ratio: getRatio(amtOf(pet.petSn), totalExpndAmt),
    }));
  return {
    pets: stats,
    shared:
      commonTotalExpndAmt > 0
        ? {
            totalAmt: commonTotalExpndAmt,
            ratio: getRatio(commonTotalExpndAmt, totalExpndAmt),
          }
        : null,
  };
};

/** 6주 42칸 달력 그리드: days는 서버가 준 날짜별 합계·건수(1건인 날만 동물·카테고리) */
export const getCalendarCells = (ym, days) => {
  const [year, month] = ym.split('-').map(Number);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const dayCount = new Date(year, month, 0).getDate();
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > dayCount) return { day: null };
    const expndYmd = `${ym}-${String(day).padStart(2, '0')}`;
    const item = days.find((d) => d.expndYmd === expndYmd);
    return {
      day,
      expndYmd,
      count: item?.expndCnt ?? 0,
      totalAmt: item?.totalExpndAmt ?? 0,
      only: item?.expndCnt === 1 ? item : null,
    };
  });
};

/** 같은 날짜끼리 묶음 */
export const groupByDay = (expenses) => {
  const groups = [];
  expenses.forEach((expense) => {
    const last = groups[groups.length - 1];
    if (last && last.expndYmd === expense.expndYmd) {
      last.items.push(expense);
    } else {
      groups.push({ expndYmd: expense.expndYmd, items: [expense] });
    }
  });
  return groups.map((group) => ({ ...group, totalAmt: sumAmt(group.items) }));
};

export const getClsfName = (code) => EXPND_CLSF[code]?.name ?? '';
