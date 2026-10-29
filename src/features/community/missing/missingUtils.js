import { PET_SE } from '@/utils/petCodes';
import {
  formatDate,
  formatMonthDayDot,
  getWeekdayIndex,
  WEEKDAYS,
} from '@/utils/formatDate';

export const FOUND_PRIVATE_TEXT = '게시글 정보는 비공개로 바뀌었어요';

/** 지역 표시: 「완산구 서곡동」처럼 전주시는 구부터 */
export const formatArea = (post) =>
  `${post.sggNm.replace('전주시 ', '')} ${post.emdNm}`;

/** 「2026.10.10 (토) 17:00」 */
export const formatSeenAt = (dateTime) =>
  `${formatDate(dateTime)} (${WEEKDAYS[getWeekdayIndex(dateTime)]}) ${dateTime.slice(11, 16)}`;

/** 「10.10 (토) 17:00」 */
export const formatSeenAtShort = (dateTime) =>
  `${formatMonthDayDot(dateTime)} (${WEEKDAYS[getWeekdayIndex(dateTime)]}) ${dateTime.slice(11, 16)}`;

/** 입력창 id: 「댓글로 제보하기」가 이 입력창으로 이동 */
export const MISSING_COMMENT_INPUT_ID = 'missing-cmnt-input';

/** 서버 글 → 폼 값. 개인정보 동의는 수정할 때도 재체크 */
export const toFormValues = (post) => ({
  petSeCd: post.petSeCd,
  petNm: post.petNm,
  colrNm: post.colrNm,
  breed: {
    vrtyNm: post.vrtyNm,
    vrtyDrctInptNm: post.vrtyDrctInptNm,
    typed: '',
  },
  chrcCn: post.chrcCn,
  seenDate: post.lastWtnsDt.slice(0, 10),
  seenTime: post.lastWtnsDt.slice(11, 16),
  place: {
    wtnsPlcNm: post.wtnsPlcNm,
    wtnsPlcAddr: post.wtnsPlcAddr,
    sggNm: post.sggNm,
    emdNm: post.emdNm,
    wtnsPlcLat: post.wtnsPlcLat,
    wtnsPlcLot: post.wtnsPlcLot,
  },
  title: post.pstTtl,
  body: post.pstCn,
  cnpl: post.cnpl,
  images: post.atchFiles,
  agree: false,
});

export const EMPTY_FORM = {
  petSeCd: PET_SE.DOG,
  petNm: '',
  colrNm: '',
  breed: { vrtyNm: null, vrtyDrctInptNm: null, typed: '' },
  chrcCn: '',
  seenDate: '',
  seenTime: '',
  place: null,
  title: '',
  body: '',
  cnpl: '',
  images: [],
  agree: false,
};
