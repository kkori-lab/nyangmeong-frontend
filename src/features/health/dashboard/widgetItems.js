import { PATHS } from '@/routes/paths';
import { MEAL, STOOL, WALK, WATER, WEIGHT } from '../diaryTypes';
import { DIARY_EXAM_PATH, DIARY_OBS_PATH } from '../summary/summaryUtils';

/**
 * [건강기록 대시보드 기록 항목] (※신규 정책, 흐름도 D1~D11)
 * - 4묶음 13개(첨부 자료 추가-2 포함). AI 건강분석 리포트는 항상 표시라 고르는 대상이 아님(D9)
 * - 항목 키는 임시 문자열: 백엔드 B1(MBR_DSHBD_WDGT 건강기록 전용 코드)이 생기면 그 코드로 교체
 * - 이름·설명·빈 상태 문구·링크는 프로토타입 원문
 */

const DIARY_LINK = { linkText: '건강 일지에 기록하기', to: PATHS.HEALTH_DIARY };

export const WIDGET_GROUPS = [
  {
    name: '매일 기록',
    sub: '건강 일지',
    items: [
      {
        id: 'weight',
        nm: '체중',
        icon: 'monitor_weight',
        typeCd: WEIGHT,
        desc: '첫 기록을 남기면 그래프로 보여요',
        emptyText: '기록이 없어요',
        ...DIARY_LINK,
      },
      {
        id: 'meal',
        nm: '식사량',
        icon: 'restaurant',
        typeCd: MEAL,
        desc: '하루 먹은 양을 남겨요',
        emptyText: '기록이 없어요',
        ...DIARY_LINK,
      },
      {
        id: 'water',
        nm: '음수량',
        icon: 'water_drop',
        typeCd: WATER,
        desc: '하루 마신 물의 양을 남겨요',
        emptyText: '기록이 없어요',
        ...DIARY_LINK,
      },
      {
        id: 'walk',
        nm: '산책',
        icon: 'directions_walk',
        typeCd: WALK,
        desc: '산책 시간을 남겨요',
        emptyText: '기록이 없어요',
        ...DIARY_LINK,
      },
      {
        id: 'poop',
        nm: '배변 상태',
        icon: 'wc',
        typeCd: STOOL,
        desc: '배변 모양과 횟수를 남겨요',
        emptyText: '기록이 없어요',
        ...DIARY_LINK,
      },
    ],
  },
  {
    name: '병원·검사',
    sub: '종합 건강기록',
    items: [
      {
        id: 'ckup',
        nm: '검진기록',
        icon: 'local_hospital',
        desc: '병원에 다녀오면 남겨요',
        emptyText: '병원에 다녀온 기록을 남기면 여기에 시간순으로 모여요',
      },
      {
        id: 'insp',
        nm: '검사 수치',
        icon: 'science',
        desc: '검사 결과지 수치를 남겨요',
        emptyText: '검사 기록이 없어요',
        linkText: '검사 결과 등록하기',
        to: DIARY_EXAM_PATH,
      },
      {
        id: 'presc',
        nm: '처방·투약',
        icon: 'medication',
        desc: '처방받은 약과 투약 일정을 남겨요',
        emptyText: '검진상세에서 처방약을 등록하면 여기에 모여요',
      },
      /** 첨부 자료 (※신규 정책, 추가-2) */
      {
        id: 'atch',
        nm: '첨부 자료',
        icon: 'description',
        desc: '검진기록에 올린 결과지·증명서를 모아 봐요',
        emptyText: '검진상세에 올린 결과지·증명서·영상 사진이 여기에 모여요',
      },
    ],
  },
  {
    name: '관찰·주의',
    sub: '건강 일지 · 종합 건강기록',
    items: [
      {
        id: 'obsv',
        nm: '지속 관찰',
        icon: 'photo_camera',
        desc: '지켜볼 증상을 사진으로 남겨요',
        emptyText:
          '계속 지켜볼 곳을 사진으로 남기면 처음과 최근을 비교해 보여요',
        linkText: '건강 일지 지속 관찰로 가기',
        to: DIARY_OBS_PATH,
      },
      {
        id: 'allergy',
        nm: '알레르기·기저질환',
        icon: 'warning',
        desc: '주의할 점을 적어 둬요',
        emptyText: '등록된 내용 없음',
        linkText: '입력하러 가기',
        to: PATHS.MYPAGE_PETS,
      },
    ],
  },
  {
    name: '케어 일정',
    sub: '케어 캘린더',
    items: [
      {
        id: 'vacc',
        nm: '예방접종·구충',
        icon: 'vaccines',
        desc: '다음 접종일을 등록해요',
        emptyText: '등록된 예정 일정 없음',
        linkText: '케어 캘린더에서 일정 등록하기',
        to: PATHS.HEALTH_CALENDAR,
      },
      {
        id: 'care',
        nm: '케어리스트',
        icon: 'checklist',
        desc: '매일 챙길 케어를 만들어요',
        emptyText: '보일 케어 항목이 없어요',
        linkText: '케어 캘린더에서 설정하기',
        to: PATHS.HEALTH_CALENDAR,
      },
    ],
  },
];

export const WIDGET_ITEMS = WIDGET_GROUPS.flatMap((group) => group.items);

export const findWidgetItem = (id) =>
  WIDGET_ITEMS.find((item) => item.id === id);

/** 처음 추천 항목: 체중·식사량·검진기록 (D4) */
export const RECOMMENDED_IDS = ['weight', 'meal', 'ckup'];

/** 매일 기록 5개(건강 일지 [오늘 기록하기] 종류와 짝) */
export const DAILY_ITEMS = WIDGET_GROUPS[0].items;

/** 4묶음 순서로 정렬·중복 제거, 모르는 키는 버림 (D8) */
export const orderWidgetIds = (ids) =>
  WIDGET_ITEMS.map((item) => item.id).filter((id) => ids.includes(id));

/** 튜토리얼 시작 항목 최대 수 (※신규 정책, 추가-8) */
export const START_MAX_COUNT = 6;

/** 남은 자리를 채울 때 묶음을 도는 순서: 병원·검사 → 관찰·주의 → 케어 일정 → 매일 기록 */
const START_GROUP_ORDER = [1, 2, 3, 0];

/**
 * 튜토리얼 시작 항목: [나중에 할래요] 저장값이자 2단계 처음 미리 체크 (D3·D10, 추가-8)
 * - 추천 3개는 항상, 남은 자리는 묶음을 돌며 기록 있는 항목을 하나씩(묶음 안은 항목 순서), 최대 6개
 */
export const pickStartIds = (recordedIds) => {
  const picked = [...RECOMMENDED_IDS];
  const queues = START_GROUP_ORDER.map((index) =>
    WIDGET_GROUPS[index].items
      .map((item) => item.id)
      .filter((id) => recordedIds.includes(id) && !picked.includes(id)),
  );
  while (
    picked.length < START_MAX_COUNT &&
    queues.some((queue) => queue.length > 0)
  ) {
    for (const queue of queues) {
      if (picked.length >= START_MAX_COUNT) break;
      const next = queue.shift();
      if (next) picked.push(next);
    }
  }
  return orderWidgetIds(picked);
};

/** 항목 이름을 '·'로 이은 문구 */
export const joinWidgetNames = (ids) =>
  orderWidgetIds(ids)
    .map((id) => findWidgetItem(id).nm)
    .join('·');
