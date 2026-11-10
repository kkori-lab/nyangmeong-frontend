import { PATHS } from '@/routes/paths';
import { MEAL, STOOL, WALK, WATER, WEIGHT } from '../diaryTypes';
import { DIARY_EXAM_PATH, DIARY_OBS_PATH } from '../summary/summaryUtils';

/**
 * [건강기록 대시보드 기록 항목] (※신규 정책, 흐름도 D1~D11)
 * - 4묶음 13개(첨부 자료 추가-2 포함). AI 건강분석 리포트는 항상 표시라 고르는 대상이 아님(D9)
 * - 화면 안에서는 id(weight…care)를 쓰고, 서버와 주고받을 때만 공통코드 dshbdWdgtCd(HLTC0084~0096)로 바꿈
 * - 이름·설명·빈 상태 문구·링크는 프로토타입 원문
 * - moveTo: 카드 오른쪽 위 [더보기]가 가는 곳 (※신규 정책, 대시보드 카드 이동). 빈 상태 링크가 같은 곳이면 빼고 [더보기]만 둠
 */

const DIARY_GRAPH_PATH = `${PATHS.HEALTH_DIARY}#hlt002-graph`;
const CALENDAR_PATH = `${PATHS.HEALTH_CALENDAR}#hlt003-calendar`;
const CARE_LIST_PATH = `${PATHS.HEALTH_CALENDAR}#hlt003-care`;

export const WIDGET_GROUPS = [
  {
    name: '매일 기록',
    sub: '건강 일지',
    items: [
      {
        id: 'weight',
        dshbdWdgtCd: 'HLTC0084',
        nm: '체중',
        icon: 'monitor_weight',
        typeCd: WEIGHT,
        desc: '첫 기록을 남기면 그래프로 보여요',
        emptyText: '기록이 없어요',
        moveTo: DIARY_GRAPH_PATH,
      },
      {
        id: 'meal',
        dshbdWdgtCd: 'HLTC0085',
        nm: '식사량',
        icon: 'restaurant',
        typeCd: MEAL,
        desc: '하루 먹은 양을 남겨요',
        emptyText: '기록이 없어요',
        moveTo: DIARY_GRAPH_PATH,
      },
      {
        id: 'water',
        dshbdWdgtCd: 'HLTC0086',
        nm: '음수량',
        icon: 'water_drop',
        typeCd: WATER,
        desc: '하루 마신 물의 양을 남겨요',
        emptyText: '기록이 없어요',
        moveTo: DIARY_GRAPH_PATH,
      },
      {
        id: 'walk',
        dshbdWdgtCd: 'HLTC0087',
        nm: '산책',
        icon: 'directions_walk',
        typeCd: WALK,
        desc: '산책 시간을 남겨요',
        emptyText: '기록이 없어요',
        moveTo: DIARY_GRAPH_PATH,
      },
      {
        id: 'poop',
        dshbdWdgtCd: 'HLTC0088',
        nm: '배변 상태',
        icon: 'wc',
        typeCd: STOOL,
        desc: '배변 모양과 횟수를 남겨요',
        emptyText: '기록이 없어요',
        moveTo: DIARY_GRAPH_PATH,
      },
    ],
  },
  {
    name: '병원·검사',
    sub: '종합 건강기록',
    items: [
      {
        id: 'ckup',
        dshbdWdgtCd: 'HLTC0089',
        nm: '검진기록',
        icon: 'local_hospital',
        desc: '병원에 다녀오면 남겨요',
        emptyText: '병원에 다녀온 기록을 남기면 여기에 시간순으로 모여요',
        moveTo: DIARY_EXAM_PATH,
      },
      {
        id: 'insp',
        dshbdWdgtCd: 'HLTC0090',
        nm: '검사 수치',
        icon: 'science',
        desc: '검사 결과지 수치를 남겨요',
        emptyText: '검사 기록이 없어요',
        moveTo: DIARY_EXAM_PATH,
      },
      {
        id: 'presc',
        dshbdWdgtCd: 'HLTC0091',
        nm: '처방·투약',
        icon: 'medication',
        desc: '처방받은 약과 투약 일정을 남겨요',
        emptyText: '검진상세에서 처방약을 등록하면 여기에 모여요',
        /** 처방이 있으면 카드 본문이 가장 위 처방의 검진상세 처방약 탭으로 바꿈(WidgetCard) */
        moveTo: DIARY_EXAM_PATH,
      },
      /** 첨부 자료 (※신규 정책, 추가-2) */
      {
        id: 'atch',
        dshbdWdgtCd: 'HLTC0092',
        nm: '첨부 자료',
        icon: 'description',
        desc: '검진기록에 올린 결과지·증명서를 모아 봐요',
        emptyText: '검진상세에 올린 결과지·증명서·영상 사진이 여기에 모여요',
        moveTo: DIARY_EXAM_PATH,
      },
    ],
  },
  {
    name: '관찰·주의',
    sub: '건강 일지 · 종합 건강기록',
    items: [
      {
        id: 'obsv',
        dshbdWdgtCd: 'HLTC0093',
        nm: '지속 관찰',
        icon: 'photo_camera',
        desc: '지켜볼 증상을 사진으로 남겨요',
        emptyText:
          '계속 지켜볼 곳을 사진으로 남기면 처음과 최근을 비교해 보여요',
        moveTo: DIARY_OBS_PATH,
      },
      {
        id: 'allergy',
        dshbdWdgtCd: 'HLTC0094',
        nm: '알레르기·기저질환',
        icon: 'warning',
        desc: '주의할 점을 적어 둬요',
        emptyText: '등록된 내용 없음',
        moveTo: PATHS.MYPAGE_PETS,
      },
    ],
  },
  {
    name: '케어 일정',
    sub: '케어 캘린더',
    items: [
      {
        id: 'vacc',
        dshbdWdgtCd: 'HLTC0095',
        nm: '예방접종·정기검진',
        icon: 'vaccines',
        desc: '다음 접종일을 등록해요',
        emptyText: '등록된 예정 일정 없음',
        moveTo: CALENDAR_PATH,
      },
      {
        id: 'care',
        dshbdWdgtCd: 'HLTC0096',
        nm: '케어리스트',
        /** 카드 머리 제목 바로 오른쪽 글자 */
        titleNote: '보기 전용',
        icon: 'checklist',
        desc: '매일 챙길 케어를 만들어요',
        emptyText: '보일 케어 항목이 없어요',
        /** 빈 상태 링크는 캘린더 탭(케어 항목 설정), [더보기]는 케어리스트 탭이라 둘 다 둠 */
        linkText: '케어 캘린더에서 설정하기',
        to: PATHS.HEALTH_CALENDAR,
        moveTo: CARE_LIST_PATH,
      },
    ],
  },
];

export const WIDGET_ITEMS = WIDGET_GROUPS.flatMap((group) => group.items);

export const findWidgetItem = (id) =>
  WIDGET_ITEMS.find((item) => item.id === id);

/**
 * [더보기] 이동 state: 매일 기록은 건강 일지 그래프에서 그 항목을 고른 채로(HealthDiaryPage가 읽음),
 * 알레르기·기저질환은 마이페이지 반려동물 관리에서 그 아이로(PetListPage가 읽음). 건강기록 화면끼리는 공통 카드가 아이를 유지
 */
export const getMoveState = (item, petSn) => {
  if (item.typeCd) return { typeCd: item.typeCd };
  if (item.id === 'allergy') return { petSn };
  return undefined;
};

/** 처음 추천 항목: 체중·식사량·음수량 (D4 수정) (※신규 정책) */
export const RECOMMENDED_IDS = ['weight', 'meal', 'water'];

/** 휴대폰(640px 미만)에서 그리지 않는 항목: 요약 띠와 같은 정보 (※신규 정책) */
export const MOBILE_HIDDEN_IDS = ['ckup', 'insp'];

/** 매일 기록 5개(건강 일지 [오늘 기록하기] 종류와 짝) */
export const DAILY_ITEMS = WIDGET_GROUPS[0].items;

/** 4묶음 순서로 정렬·중복 제거, 모르는 키는 버림 (D8) */
export const orderWidgetIds = (ids) =>
  WIDGET_ITEMS.map((item) => item.id).filter((id) => ids.includes(id));

/**
 * 받은 순서를 지키고 중복·모르는 키만 버림 (※신규 정책, 카드 순서 바꾸기)
 * - 저장된 카드 순서를 쓰는 곳(대시보드·편집 저장·건강 일지 [항목 추가])용. 4묶음 순서로 다시 정렬하지 않음
 */
export const keepWidgetOrder = (ids) => {
  const knownIds = WIDGET_ITEMS.map((item) => item.id);
  return ids.filter(
    (id, index) => knownIds.includes(id) && ids.indexOf(id) === index,
  );
};

/**
 * 서버 응답 widgets → 보이는 항목 id 배열(sortSeq 순, indctYn=true만). 모르는 코드는 버림
 */
export const toShownWidgetIds = (widgets) =>
  [...widgets]
    .sort((a, b) => a.sortSeq - b.sortSeq)
    .filter((widget) => widget.indctYn)
    .map(
      (widget) =>
        WIDGET_ITEMS.find((item) => item.dshbdWdgtCd === widget.dshbdWdgtCd)
          ?.id,
    )
    .filter((id) => id != null);

/**
 * 보이는 항목 id 배열 → PUT 본문 widgets(13개 전부, 보낸 순서가 저장 순서)
 * - 고른 항목은 받은 순서대로 indctYn=true, 나머지는 4묶음 순서로 뒤에 indctYn=false
 */
export const toWidgetBody = (shownIds) => {
  const ids = keepWidgetOrder(shownIds);
  const hiddenIds = WIDGET_ITEMS.map((item) => item.id).filter(
    (id) => !ids.includes(id),
  );
  return [
    ...ids.map((id) => ({
      dshbdWdgtCd: findWidgetItem(id).dshbdWdgtCd,
      indctYn: true,
    })),
    ...hiddenIds.map((id) => ({
      dshbdWdgtCd: findWidgetItem(id).dshbdWdgtCd,
      indctYn: false,
    })),
  ];
};

/** 항목 이름을 '·'로 이은 문구. 받은 순서(저장 순서) 그대로 */
export const joinWidgetNames = (ids) =>
  keepWidgetOrder(ids)
    .map((id) => findWidgetItem(id).nm)
    .join('·');
