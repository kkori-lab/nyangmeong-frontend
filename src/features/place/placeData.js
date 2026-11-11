import { Hospital, Hotel, PawPrint, Scissors, ShoppingBag } from 'lucide-react';

// code는 서버 공통코드 PLCG01
export const CATEGORIES = [
  {
    key: 'hospital',
    code: 'PLCC0001',
    name: '동물병원',
    label: '병원',
    Icon: Hospital,
  },
  {
    key: 'beauty',
    code: 'PLCC0002',
    name: '미용',
    label: '미용',
    Icon: Scissors,
  },
  {
    key: 'goods',
    code: 'PLCC0003',
    name: '용품',
    label: '용품',
    Icon: ShoppingBag,
  },
  {
    key: 'pet-friendly',
    code: 'PLCC0004',
    name: '동반장소',
    label: '동반',
    Icon: PawPrint,
  },
  { key: 'hotel', code: 'PLCC0005', name: '호텔', label: '호텔', Icon: Hotel },
];

export const DEFAULT_CATEGORY = 'hospital';

// value는 서버 sort 값. 추천순(RECOMMEND)은 카카오 정확도순을 이름만 바꾼 것이라 뺐다
export const SORT_OPTIONS = [
  { label: '거리순', value: 'DISTANCE' },
  { label: '이름순', value: 'NAME' },
];

export const DEFAULT_SORT = 'DISTANCE';

// 처음 진입할 때와 카테고리를 바꿀 때 검색하는 전주시 대표 영역(거리 기준은 중앙)
export const JEONJU_AREA = {
  swLat: 35.78,
  swLot: 127.05,
  neLat: 35.89,
  neLot: 127.2,
  cntrLat: 35.832,
  cntrLot: 127.1385,
};
