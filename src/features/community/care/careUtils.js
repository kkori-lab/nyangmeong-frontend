import {
  addDays,
  formatDate,
  formatMonthDayDot,
  getWeekdayIndex,
  WEEKDAYS,
} from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { PET_SE } from '@/utils/petCodes';
import {
  CST_UNIT,
  getBreedName,
  getShapeName,
  getSizeName,
} from '../careCodes';

/** 지역 표시: 「완산구 서곡동」처럼 전주시는 구부터 */
export const formatArea = (post) => post.rlsRgnNm.replace('전주시 ', '');

/** 공개 동네명 「전주시 완산구 서곡동」 → { sggNm: '전주시 완산구', emdNm: '서곡동' }. 한 단어면 시·군·구만 */
export const splitRegion = (rlsRgnNm) => {
  const words = rlsRgnNm.split(' ');
  if (words.length === 1) return { sggNm: rlsRgnNm, emdNm: '' };
  return { sggNm: words.slice(0, -1).join(' '), emdNm: words.at(-1) };
};

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

/** 「2026년 11월 09일」 */
const formatKoreanDate = (ymd) =>
  formatDate(ymd, { separator: '-' }).replace(
    /^(\d+)-(\d+)-(\d+)$/,
    '$1년 $2월 $3일',
  );

/** 상세 일정 두 줄: 날짜 범위와 시간 범위 */
export const formatScheduleDetail = (post) => {
  if (!post.prtcBgngDt) return { date: '채팅으로 협의해요', time: '' };
  const from = post.prtcBgngDt.slice(0, 10);
  const to = post.prtcEndDt.slice(0, 10);
  const date =
    from === to
      ? formatKoreanDate(from)
      : `${formatKoreanDate(from)} ~ ${formatKoreanDate(to)}`;
  const time = `${hm(post.prtcBgngDt)} ~ ${hm(post.prtcEndDt)}`;
  return {
    date,
    time: post.schdlCnsltnPsbltyYn ? `${time} · 일정 협의 가능` : time,
  };
};

/** 카드·상세 배지: 돌봄 형태 이름들 */
export const getShapeNames = (post) => post.prtcShpCds.map(getShapeName);

/** 상세 반려동물 줄: 「강아지 · 몰티즈 · 소형견」 여러 마리면 줄바꿈 */
export const formatPetKinds = (post) =>
  post.pets.map((kind) => {
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

/** 일정 칸에 쓰는 12시간 표기 목록: 12:00, 12:30, 1:00 … 11:30 (오전·오후는 따로 고른다) */
export const TIME_12 = Array.from({ length: 24 }, (_, index) => {
  const hour = Math.floor(index / 2) === 0 ? 12 : Math.floor(index / 2);
  return `${hour}:${index % 2 === 0 ? '00' : '30'}`;
});

/** "HH:mm"(24시간) → 'AM'|'PM'. 빈 값이면 '' */
export const periodOf = (time) =>
  time ? (Number(time.slice(0, 2)) < 12 ? 'AM' : 'PM') : '';

/** "14:00" → "2:00", "00:30" → "12:30". 빈 값이면 '' */
export const to12Label = (time) => {
  if (!time) return '';
  const hour = Number(time.slice(0, 2)) % 12;
  return `${hour === 0 ? 12 : hour}:${time.slice(3, 5)}`;
};

/** 오전·오후 + "2:00" → "HH:mm"(24시간) */
export const to24Time = (period, label) => {
  const [hour, minute] = label.split(':').map(Number);
  const hour24 = (hour % 12) + (period === 'PM' ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

/** 시작 일시에 2시간을 더한 종료 기본값. 자정을 넘으면 다음 날 */
export const plusTwoHours = (date, time) => {
  const total = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) + 120;
  const nextDay = total >= 24 * 60;
  const minutes = total % (24 * 60);
  return {
    date: nextDay ? addDays(date, 1) : date,
    time: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
  };
};

/** 「11/24(월) 오후 2:00」 */
const shortWhen = (date, time) =>
  `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}(${WEEKDAYS[getWeekdayIndex(date)]}) ${periodOf(time) === 'AM' ? '오전' : '오후'} ${to12Label(time)}`;

/**
 * 일정 요약 한 줄: 「11/24(월) 오후 2:00 ~ 11/26(수) 오전 10:00 · 2일 20시간」
 * 시작·종료가 모두 골라지고 종료가 시작보다 뒤일 때만 문자열, 아니면 ''
 */
export const scheduleSummary = ({ fromDate, fromTime, toDate, toTime }) => {
  if (!fromDate || !fromTime || !toDate || !toTime) return '';
  const diffMinutes =
    (new Date(`${toDate}T${toTime}`) - new Date(`${fromDate}T${fromTime}`)) /
    60000;
  if (!(diffMinutes > 0)) return '';
  const days = Math.floor(diffMinutes / 1440);
  const hours = Math.floor((diffMinutes % 1440) / 60);
  const minutes = diffMinutes % 60;
  const length = [
    days && `${days}일`,
    hours && `${hours}시간`,
    minutes && `${minutes}분`,
  ]
    .filter(Boolean)
    .join(' ');
  return `${shortWhen(fromDate, fromTime)} ~ ${shortWhen(toDate, toTime)} · ${length}`;
};

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
  const dogKind = post.pets.find((kind) => kind.petSeCd === PET_SE.DOG);
  const catKind = post.pets.find((kind) => kind.petSeCd === PET_SE.CAT);
  const breedOf = (kind) =>
    kind
      ? {
          vrtyNm: kind.vrtySn == null ? null : kind.vrtyNm,
          vrtyDrctInptNm: kind.vrtySn == null ? kind.vrtyNm : null,
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
    nego: post.schdlCnsltnPsbltyYn,
    cstUnitCd: post.cstUnitCd,
    amount: String(post.cstAmt),
    title: post.pstTtl,
    body: post.pstCn,
    images: post.imgs.map(({ atchFileSn }, index) => ({
      id: `file-${atchFileSn}`,
      atchFileSn,
      name: `첨부 이미지 ${index + 1}`,
      url: publicFileUrl(atchFileSn),
    })),
    place: splitRegion(post.rlsRgnNm),
    agree: false,
  };
};
