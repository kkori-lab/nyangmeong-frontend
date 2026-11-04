import { PET_SE } from '@/utils/petCodes';

/**
 * [관리자 품종 API]
 * - 백엔드 `/api/admin/breeds` 없음 -> 메모리 배열 가짜 응답, 새로고침하면 처음 값
 * - 필드 이름은 백엔드 `VRTY`(BreedSummary) 그대로 + useYn
 * - 공용 GET /api/breeds는 사용 안 함 품종이 빠질 수 있어 쓰지 않음
 */

/** 품종 이름 최대 글자 수(가정) */
export const VRTY_NM_MAX = 50;

/** 서버 오류 모양 */
const fakeError = (code, message) => ({
  code,
  message,
  fields: null,
  data: null,
});

const FAKE_BREEDS = {
  [PET_SE.DOG]: {
    prefix: 'DOGV',
    names: [
      '말티즈',
      '푸들',
      '포메라니안',
      '비숑 프리제',
      '시츄',
      '웰시코기',
      '골든 리트리버',
      '요크셔테리어',
      '믹스견',
    ],
  },
  [PET_SE.CAT]: {
    prefix: 'CATV',
    names: [
      '코리안 숏헤어',
      '러시안 블루',
      '페르시안',
      '스코티시 폴드',
      '브리티시 숏헤어',
      '랙돌',
      '먼치킨',
      '믹스묘',
    ],
  },
};

let nextVrtySn = 1;

/** 가짜 품종: 종마다 정렬 10단위, 일곱 번째는 사용 안 함 */
const fakeBreeds = Object.entries(FAKE_BREEDS).flatMap(
  ([petSeCd, { prefix, names }]) =>
    names.map((vrtyNm, index) => ({
      vrtySn: nextVrtySn++,
      vrtyCd: `${prefix}${String(index + 1).padStart(4, '0')}`,
      vrtyNm,
      petSeCd,
      sortSeq: (index + 1) * 10,
      useYn: index !== 6,
    })),
);

const delay = () => new Promise((resolve) => setTimeout(resolve, 200));

/** 같은 종에 같은 이름(공백 무시)이 있으면 409 */
const assertUniqueName = ({ petSeCd, vrtyNm, vrtySn }) => {
  const name = vrtyNm.replace(/\s/g, '');
  const duplicated = fakeBreeds.some(
    (breed) =>
      breed.petSeCd === petSeCd &&
      breed.vrtySn !== vrtySn &&
      breed.vrtyNm.replace(/\s/g, '') === name,
  );
  if (duplicated) {
    throw fakeError(
      'DUPLICATE_VRTY_NM',
      '같은 종에 이미 있는 품종 이름이에요.',
    );
  }
};

const byOrder = (a, b) => a.sortSeq - b.sortSeq || a.vrtySn - b.vrtySn;

/** 종별 품종 목록(정렬순, 사용 안 함 포함): [{ vrtySn, vrtyCd, vrtyNm, petSeCd, sortSeq, useYn }] */
export const getAdminBreeds = async ({ petSeCd }) => {
  await delay();
  return fakeBreeds
    .filter((breed) => breed.petSeCd === petSeCd)
    .sort(byOrder)
    .map((breed) => ({ ...breed }));
};

/** 품종 추가: body { petSeCd, vrtyNm, sortSeq, useYn } */
export const createAdminBreed = async ({ petSeCd, vrtyNm, sortSeq, useYn }) => {
  await delay();
  assertUniqueName({ petSeCd, vrtyNm });
  const { prefix } = FAKE_BREEDS[petSeCd];
  const count = fakeBreeds.filter((breed) => breed.petSeCd === petSeCd).length;
  const breed = {
    vrtySn: nextVrtySn++,
    vrtyCd: `${prefix}${String(count + 1).padStart(4, '0')}`,
    vrtyNm,
    petSeCd,
    sortSeq,
    useYn,
  };
  fakeBreeds.push(breed);
  return { ...breed };
};

/** 품종 수정: 이름·정렬·사용만 바꿈(종·코드는 그대로) */
export const updateAdminBreed = async ({ vrtySn, vrtyNm, sortSeq, useYn }) => {
  await delay();
  const breed = fakeBreeds.find((item) => item.vrtySn === vrtySn);
  if (!breed) throw fakeError('NOT_FOUND', '품종을 찾을 수 없습니다.');
  assertUniqueName({ petSeCd: breed.petSeCd, vrtyNm, vrtySn });
  Object.assign(breed, { vrtyNm, sortSeq, useYn });
  return { ...breed };
};
