import {
  formatDate,
  formatMonthDayDot,
  getWeekdayIndex,
  WEEKDAYS,
} from '@/utils/formatDate';
import { PET_SE } from '@/utils/petCodes';
import {
  CST_UNIT,
  getBreedName,
  getShapeName,
  getSizeName,
} from '../careCodes';

/** 지역 표시: 「완산구 서곡동」처럼 전주시는 구부터 */
export const formatArea = (post) =>
  `${post.sggNm.replace('전주시 ', '')} ${post.emdNm}`;

const hm = (dateTime) => dateTime.slice(11, 16);

/** 카드 한 줄 일정: 「10.14 (수) 18:00」 · 「10.13 ~ 11.26 · 19:00」 · 「일정 협의」 */
export const formatScheduleShort = (post) => {
  if (!post.prtcBgngDt) return '일정 협의';
  const from = post.prtcBgngDt.slice(0, 10);
  const to = post.prtcEndDt.slice(0, 10);
  if (from === to) {
    return `${formatMonthDayDot(from)} (${WEEKDAYS[getWeekdayIndex(from)]}) ${hm(post.prtcBgngDt)}`;
  }
  return `${formatMonthDayDot(from)} ~ ${formatMonthDayDot(to)} · ${hm(post.prtcBgngDt)}`;
};

/** 상세 일정 두 줄: 날짜 범위와 시간 범위 */
export const formatScheduleDetail = (post) => {
  if (!post.prtcBgngDt) return { date: '채팅으로 협의해요', time: '' };
  const from = post.prtcBgngDt.slice(0, 10);
  const to = post.prtcEndDt.slice(0, 10);
  const date =
    from === to ? formatDate(from) : `${formatDate(from)} ~ ${formatDate(to)}`;
  const time = `${hm(post.prtcBgngDt)} ~ ${hm(post.prtcEndDt)}`;
  return {
    date,
    time: post.schdlCnsltnPsbltyYn === 'Y' ? `${time} · 일정 협의 가능` : time,
  };
};

/** 카드·상세 배지: 돌봄 형태 이름들 */
export const getShapeNames = (post) => post.prtcShpCds.map(getShapeName);

/** 상세 반려동물 줄: 「강아지 · 몰티즈 · 소형견」 여러 마리면 줄바꿈 */
export const formatPetKinds = (post) =>
  post.petKnds.map((kind) => {
    const species = kind.petSeCd === PET_SE.CAT ? '고양이' : '강아지';
    return [species, getBreedName(kind), getSizeName(kind.petSizeCd)]
      .filter(Boolean)
      .join(' · ');
  });

export const unitText = (post) =>
  post.cstUnitCd === CST_UNIT.HOUR ? '/ 시간' : '/ 건';

/** 시작·종료 시간 선택지: 00:00~23:30, 30분 단위 */
export const CARE_TIMES = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  return `${hour}:${index % 2 === 0 ? '00' : '30'}`;
});

const emptyBreed = () => ({ vrtyNm: null, vrtyDrctInptNm: null, typed: '' });

export const EMPTY_FORM = {
  dog: true,
  cat: false,
  dogBreed: emptyBreed(),
  catBreed: emptyBreed(),
  dogSizeCd: '',
  shapes: [],
  fromDate: '',
  fromTime: '',
  toDate: '',
  toTime: '',
  nego: false,
  cstUnitCd: CST_UNIT.HOUR,
  amount: '',
  title: '',
  body: '',
  images: [],
  place: null,
  agree: false,
};

/** 서버 글 → 폼 값. 정확한 좌표는 응답에 없어 장소는 동네만 채우고, 다시 고르지 않으면 유지. 동의는 수정할 때도 재체크 */
export const toFormValues = (post) => {
  const dogKind = post.petKnds.find((kind) => kind.petSeCd === PET_SE.DOG);
  const catKind = post.petKnds.find((kind) => kind.petSeCd === PET_SE.CAT);
  const breedOf = (kind) =>
    kind
      ? {
          vrtyNm: kind.vrtyNm,
          vrtyDrctInptNm: kind.vrtyDrctInptNm,
          typed: '',
        }
      : emptyBreed();
  return {
    dog: Boolean(dogKind),
    cat: Boolean(catKind),
    dogBreed: breedOf(dogKind),
    catBreed: breedOf(catKind),
    dogSizeCd: dogKind?.petSizeCd ?? '',
    shapes: post.prtcShpCds,
    fromDate: post.prtcBgngDt?.slice(0, 10) ?? '',
    fromTime: post.prtcBgngDt?.slice(11, 16) ?? '',
    toDate: post.prtcEndDt?.slice(0, 10) ?? '',
    toTime: post.prtcEndDt?.slice(11, 16) ?? '',
    nego: post.schdlCnsltnPsbltyYn === 'Y',
    cstUnitCd: post.cstUnitCd,
    amount: String(post.cstAmt),
    title: post.pstTtl,
    body: post.pstCn,
    images: post.atchFiles,
    place: { sggNm: post.sggNm, emdNm: post.emdNm },
    agree: false,
  };
};
