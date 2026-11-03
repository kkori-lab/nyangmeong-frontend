import { PET_SE } from '@/utils/petCodes';
import {
  diffDays,
  formatDate,
  formatMonthDayDot,
  getTodayYmd,
  getWeekdayIndex,
  getYmdOf,
  WEEKDAYS,
} from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';

export const FOUND_PRIVATE_TEXT = '게시글 정보는 비공개로 바뀌었어요';

/** 지역 표시: 서버의 「시도 시군구 읍면동」에서 시도를 빼고 「전주시 효자동」처럼 */
export const formatArea = (post) =>
  post.rgnNm?.split(' ').slice(1).join(' ') || post.rgnNm;

/** 게시 종료까지 남은 일수. 게시 종료 일시(expryCrtrDt)는 작성자에게만 옴 */
export const getRemainDays = (post) =>
  diffDays(getTodayYmd(), getYmdOf(post.expryCrtrDt));

/** 「2026.10.10 (토) 17:00」 */
export const formatSeenAt = (dateTime) =>
  `${formatDate(dateTime)} (${WEEKDAYS[getWeekdayIndex(dateTime)]}) ${dateTime.slice(11, 16)}`;

/** 「10.10 (토) 17:00」 */
export const formatSeenAtShort = (dateTime) =>
  `${formatMonthDayDot(dateTime)} (${WEEKDAYS[getWeekdayIndex(dateTime)]}) ${dateTime.slice(11, 16)}`;

/** 입력창 id: 「댓글로 제보하기」가 이 입력창으로 이동 */
export const MISSING_COMMENT_INPUT_ID = 'missing-cmnt-input';

/**
 * 서버 글 → 폼 값. 개인정보 동의는 수정할 때도 재체크
 * - 서버 vrtyNm은 마스터 품종명 또는 직접 입력명: vrtySn이 있으면 목록 품종, 없으면 직접 입력
 * - 장소는 서버에 이름·좌표만 있어 주소 자리에 장소 이름, 실종 지역은 서버 rgnNm
 */
export const toFormValues = (post) => ({
  petSeCd: post.petSeCd,
  petNm: post.petNm,
  colrNm: post.colrNm,
  breed: post.vrtySn
    ? { vrtyNm: post.vrtyNm, vrtyDrctInptNm: null, typed: '' }
    : { vrtyNm: null, vrtyDrctInptNm: post.vrtyNm ?? '', typed: '' },
  chrcCn: post.chrcCn ?? '',
  seenDate: post.lastWtnsDt.slice(0, 10),
  seenTime: post.lastWtnsDt.slice(11, 16),
  place: {
    wtnsPlcNm: post.wtnsPlcNm,
    wtnsPlcAddr: post.wtnsPlcNm,
    rgnNm: post.rgnNm,
    wtnsPlcLat: Number(post.wtnsPlcLat),
    wtnsPlcLot: Number(post.wtnsPlcLot),
  },
  title: post.pstTtl,
  body: post.pstCn,
  cnpl: post.cnpl,
  images: post.imgs.map(({ atchFileSn }, index) => ({
    id: `file-${atchFileSn}`,
    atchFileSn,
    name: `첨부 이미지 ${index + 1}`,
    url: publicFileUrl(atchFileSn),
  })),
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
