import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getCareMissions, getPointBalance, getPointHistory } from './api';

export const pointKeys = {
  all: ['points'],
  balance: () => ['points', 'balance'],
  history: (ym) => ['points', 'history', ym],
  missions: (petSn, ymd) => ['points', 'missions', petSn, ymd],
};

/** 보유 포인트·이번 달 적립/사용·오늘 미션 요약 */
export const usePointBalance = () =>
  useQuery({ queryKey: pointKeys.balance(), queryFn: getPointBalance });

/** 월 전환 시 깜박임 방지용 이전 결과 유지 */
export const usePointHistory = (ym) =>
  useQuery({
    queryKey: pointKeys.history(ym),
    queryFn: () => getPointHistory(ym),
    placeholderData: keepPreviousData,
  });

const isSameData = (shown, pets, refs) =>
  shown.refs.length === refs.length &&
  refs.every((ref, index) => ref === shown.refs[index]) &&
  pets.every(
    ({ petSn, petNm }, index) =>
      shown.data.pets[index].petSn === petSn &&
      shown.data.pets[index].petNm === petNm,
  );

/**
 * 주양육 동물마다 그날 미션을 부른다. pets = [{ petSn, petNm }]
 * - data = { pets: [{ petSn, petNm, missions }] }, 요청이 실패한 동물은 missions가 null
 * - 날짜가 바뀌면 queryKey가 새로 생겨 useQueries는 옵저버를 새로 만든다(placeholderData:
 *   keepPreviousData가 이어받을 이전 값이 없다). 그래서 모두 끝난(성공·실패) 마지막 값을
 *   들고 있다가 새 날짜를 받는 동안 그 값을 돌려준다
 * - retry(petSn) = 그 동물 요청만 다시 부른다
 */
export const useCareMissions = (ymd, pets) => {
  const results = useQueries({
    queries: pets.map(({ petSn }) => ({
      queryKey: pointKeys.missions(petSn, ymd),
      queryFn: () => getCareMissions(petSn, ymd),
    })),
  });
  const [shown, setShown] = useState(null);

  const refs = results.map((result) => result.data ?? null);
  const isSettled = results.every((result) => result.data || result.isError);
  const current = isSettled
    ? {
        pets: pets.map(({ petSn, petNm }, index) => ({
          petSn,
          petNm,
          missions: refs[index],
        })),
      }
    : null;
  if (current && !(shown && isSameData(shown, pets, refs))) {
    setShown({ refs, data: current });
  }

  const retry = (petSn) =>
    results[pets.findIndex((pet) => pet.petSn === petSn)]?.refetch();

  /** 새 날짜를 받는 동안 보여 줄 이전 값은 같은 동물 목록일 때만 쓴다 */
  const isSamePets =
    shown?.data.pets.length === pets.length &&
    pets.every((pet, index) => pet.petSn === shown.data.pets[index].petSn);

  return { data: current ?? (isSamePets ? shown.data : undefined), retry };
};
