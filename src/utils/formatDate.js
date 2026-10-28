/**
 * [날짜 표기 유틸]
 * - 'YYYY-MM-DD' 문자열(시간이 붙으면 앞 10자리)과 Date를 같은 옵션으로 표기
 * - formatDate 옵션: separator·hasYear·weekday·weekdayGap
 */

export const WEEKDAYS = '일월화수목금토';

const pad = (value) => String(value).padStart(2, '0');

/** 'YYYY-MM-DD' → 로컬 Date */
export const parseYmd = (ymd) => {
  const [year, month, day] = ymd.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Date → 'YYYY-MM-DD' */
export const toYmd = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 화면 표기 변환: 기본 '2026.10.06' */
export const formatDate = (
  value,
  { separator = '.', hasYear = true, weekday = false, weekdayGap = ' ' } = {},
) => {
  const date = value instanceof Date ? value : parseYmd(value);
  const parts = [pad(date.getMonth() + 1), pad(date.getDate())];
  if (hasYear) parts.unshift(date.getFullYear());
  const base = parts.join(separator);
  return weekday ? `${base}${weekdayGap}(${WEEKDAYS[date.getDay()]})` : base;
};

/**
 * [케어 캘린더 날짜 계산·표시]
 * - 서버 날짜("2026-10-12")는 시간대 없는 한국 날짜다. new Date('2026-10-12')는 UTC 자정으로 읽혀
 *   시간대에 따라 하루가 밀리므로, 날짜 계산과 표시는 이 파일의 함수로 한다(docs/convention/api.md)
 */

export const getTodayYmd = () => toYmd(new Date());

export const makeYmd = (year, month, day) =>
  `${year}-${pad(month)}-${pad(day)}`;

export const getYear = (ymd) => Number(ymd.slice(0, 4));

export const getMonth = (ymd) => Number(ymd.slice(5, 7));

export const getDay = (ymd) => Number(ymd.slice(8, 10));

export const addDays = (ymd, days) => {
  const date = parseYmd(ymd);
  date.setDate(date.getDate() + days);
  return toYmd(date);
};

// 1월 31일 + 1개월처럼 그 달에 없는 날짜는 그 달 마지막 날로 맞춘다
export const addMonths = (ymd, months) => {
  const date = parseYmd(ymd);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  date.setDate(Math.min(day, lastDay));
  return toYmd(date);
};

// to - from 의 일수. to가 앞이면 음수
export const diffDays = (fromYmd, toYmdValue) =>
  Math.round((parseYmd(toYmdValue) - parseYmd(fromYmd)) / 86400000);

export const getWeekdayIndex = (ymd) => parseYmd(ymd).getDay();

export const getDaysInMonth = (year, month) =>
  new Date(year, month, 0).getDate();

// "8월 12일(수)"
export const formatMonthDayWeekday = (ymd) =>
  `${getMonth(ymd)}월 ${getDay(ymd)}일(${WEEKDAYS[getWeekdayIndex(ymd)]})`;

// "2026-09-19(금)"
export const formatYmdWeekday = (ymd) =>
  `${ymd}(${WEEKDAYS[getWeekdayIndex(ymd)]})`;

// "08.29"
export const formatMonthDayDot = (ymd) =>
  `${ymd.slice(5, 7)}.${ymd.slice(8, 10)}`;

// "월요일"
export const formatWeekdayLong = (ymd) =>
  `${WEEKDAYS[getWeekdayIndex(ymd)]}요일`;

// "10:00" → "오전 10:00", "15:00" → "오후 3:00"
export const formatTime = (hhmm) => {
  const [hour, minute] = hhmm.split(':').map(Number);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${pad(minute)}`;
};

/** 서버 일시 문자열: 'YYYY-MM-DD' + 'HH:mm'(없으면 자정) */
export const makeDateTime = (ymd, hm) => `${ymd}T${hm || '00:00'}:00`;

/** 서버 일시의 날짜 'YYYY-MM-DD' */
export const getYmdOf = (dateTime) => dateTime.slice(0, 10);

/** 서버 일시의 시각 'HH:mm' */
export const getHmOf = (dateTime) => dateTime.slice(11, 16);

// 지금 시각 "13:05"
export const getNowHm = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

// 채팅 목록 시각 "2026-10-22T14:20:00" → 오늘 "14:20", 어제 "어제", 그 전 "10.04"
export const formatChatListTime = (dateTime) => {
  const today = getTodayYmd();
  const ymd = dateTime.slice(0, 10);
  if (ymd === today) return dateTime.slice(11, 16);
  if (ymd === addDays(today, -1)) return '어제';
  return formatMonthDayDot(ymd);
};

// "2026-10-22 14:20:00" → 로컬 Date (시간대 밀림 없이)
const parseDateTime = (dateTime) => {
  const [year, month, day] = dateTime.slice(0, 10).split('-').map(Number);
  const [hour, minute] = dateTime.slice(11, 16).split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

// "2026.10.22 14:20"
export const formatDateTime = (dateTime) =>
  `${formatDate(dateTime)} ${dateTime.slice(11, 16)}`;

// 게시글·댓글 시각: "방금 전" · "5분 전" · "3시간 전" · "어제" · "2일 전", 일주일이 지나면 "2026.10.22"
export const formatRelativeTime = (dateTime, now = new Date()) => {
  const minutes = Math.floor((now - parseDateTime(dateTime)) / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  const days = diffDays(dateTime, toYmd(now));
  if (days <= 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return formatDate(dateTime);
};
