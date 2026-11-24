import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Modal from '@/components/Modal';
import TocButton from '@/components/TocButton';
import ZoomBox from '@/components/ZoomBox';
import ZoomOverlay from '@/components/ZoomOverlay';
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_ACTION,
} from '@/components/buttonStyles';
import guide01PetCard from '@/assets/health-guide/guide-01-pet-card.png';
import guide02RecordLink from '@/assets/health-guide/guide-02-record-link.png';
import guide02TodayModal from '@/assets/health-guide/guide-02-today-modal.png';
import guide03EditButton from '@/assets/health-guide/guide-03-edit-button.png';
import guide03EditModal from '@/assets/health-guide/guide-03-edit-modal.png';
import guide04TodayCard from '@/assets/health-guide/guide-04-today-card.png';
import guide05Graph from '@/assets/health-guide/guide-05-graph.png';
import guide05Observation from '@/assets/health-guide/guide-05-observation.png';
import guide06CheckupList from '@/assets/health-guide/guide-06-checkup-list.png';
import guide06CheckupModal from '@/assets/health-guide/guide-06-checkup-modal.png';
import guide07Calendar from '@/assets/health-guide/guide-07-calendar.png';
import guide07ScheduleModal from '@/assets/health-guide/guide-07-schedule-modal.png';
import guide08Carelist from '@/assets/health-guide/guide-08-carelist.png';

/** 두 그림 사이 라벨 기본값 */
const FROM_LABEL = '여기를 누르면';
const TO_LABEL = '이 화면이 열려요';

/**
 * 장 목록: group(목차 묶음) · title · desc · tip · images(1~2장, 누를 곳 테두리는 그림에 있음)
 * - linkText: TIP 상자 오른쪽 끝 「대시보드 편집 바로 열기 ›」. 종합 건강기록에서만 보이고, 그 밖의 화면은 TIP 상자째 숨김
 * - note: 마지막 장 footer 왼쪽 회색 안내
 */
const CHAPTERS = [
  {
    group: '종합 건강기록',
    title: '아이 바꾸기',
    desc: '왼쪽 「선택한 아이」 카드를 눌러 아이를 골라요. 건강기록 세 화면이 모두 그 아이 기록으로 바뀌어요.',
    tip: '아이 등록은 마이페이지에서 할 수 있어요.',
    images: [
      {
        src: guide01PetCard,
        alt: '사이드 메뉴 아래 「선택한 아이」 카드. 카드를 누르면 아이를 고를 수 있음',
      },
    ],
  },
  {
    group: '종합 건강기록',
    title: '기록하러 가기',
    desc: '매일 기록 카드의 [기록하기 ›]를 누르면 건강 일지에서 「오늘 기록하기」 창이 바로 열려요.',
    tip: '검진·처방 카드는 [검진 기록 보기 ›]·[처방 보기 ›]로 자세히 봐요.',
    images: [
      {
        src: guide02RecordLink,
        alt: '대시보드 체중 카드 오른쪽 위의 [기록하기 ›]',
      },
      {
        src: guide02TodayModal,
        alt: '건강 일지의 「오늘 기록하기」 창. 종류를 고르고 값을 입력함',
      },
    ],
  },
  {
    group: '종합 건강기록',
    title: '대시보드 바꾸기',
    desc: '[대시보드 편집]에서 보여 줄 기록을 고르고 오른쪽 미리보기에서 카드를 끌어 순서를 바꿔요.',
    /** 3장 TIP 문장: 검사 수치 카드 안내 (※신규 정책, 2026-11-23) */
    tip: '검사 수치 카드를 켜면 항목별 수치 변화를 볼 수 있어요.',
    linkText: '대시보드 편집 바로 열기',
    images: [
      {
        src: guide03EditButton,
        alt: '건강 대시보드 제목 줄 오른쪽의 [대시보드 편집] 버튼',
      },
      {
        src: guide03EditModal,
        alt: '「대시보드 편집」 창. 왼쪽에서 기록을 고르고 오른쪽 미리보기에서 카드 순서를 바꿈',
      },
    ],
  },
  {
    group: '건강 일지',
    title: '오늘의 기록 남기기',
    desc: '건강 일지 「오늘의 기록」에서 [오늘 기록 추가]를 누르면 종류를 골라 체중·식사량·음수량 등을 남길 수 있어요.',
    tip: '[항목 편집]으로 기록할 종류를 켜고 끌 수 있어요. 켜고 끈 종류는 종합 건강기록 대시보드에도 같이 반영돼요.',
    images: [
      {
        src: guide04TodayCard,
        alt: '건강 일지 「오늘의 기록」 카드의 [오늘 기록 추가]',
      },
      {
        src: guide02TodayModal,
        alt: '「오늘 기록하기」 창. 종류를 고르고 값을 입력함',
      },
    ],
  },
  {
    group: '건강 일지',
    title: '변화 보기·지속 관찰',
    desc: '「건강기록 변화」에서 종류를 골라 그래프로 보고, 「지속 관찰」에서 피부·눈·상처를 회차별로 비교해요.',
    tip: '오른쪽 그림은 「지속 관찰」 탭이에요. [관찰 항목 추가]로 시작해요.',
    fromLabel: '이 화면에서',
    toLabel: '이렇게 관찰해요',
    images: [
      {
        src: guide05Graph,
        alt: '「건강기록 변화」 그래프. 종류 탭을 골라 기록 변화를 봄',
      },
      {
        src: guide05Observation,
        alt: '「지속 관찰」 탭. 관찰 항목의 사진을 회차별로 비교함',
      },
    ],
  },
  {
    group: '건강 일지',
    title: '검진기록 남기기',
    desc: '「검진기록」에서 [검진기록 추가]를 누르면 직접 입력하거나 영수증 사진으로 추가할 수 있어요.',
    tip: '영수증으로 추가하면 사진에서 내용을 읽어 채워 줘요.',
    images: [
      {
        src: guide06CheckupList,
        alt: '건강 일지 「검진기록」 목록의 [검진기록 추가]',
      },
      {
        src: guide06CheckupModal,
        alt: '검진기록 추가 창. 직접 입력과 영수증 사진 중에서 고름',
      },
    ],
  },
  {
    group: '케어 캘린더',
    title: '일정 등록하기',
    desc: '케어 캘린더에서 날짜를 고르고 [새 일정 추가]를 누르면 종류·날짜·시간을 넣어 일정을 남길 수 있어요.',
    tip: '다가오는 일정은 오른쪽 아래에 가까운 순으로 3건 보여요.',
    images: [
      {
        src: guide07Calendar,
        alt: '케어 캘린더에서 날짜를 고른 모습과 [새 일정 추가]',
      },
      {
        src: guide07ScheduleModal,
        alt: '새 일정 추가 창. 종류·날짜·시간을 입력함',
      },
    ],
  },
  {
    group: '케어 캘린더',
    title: '케어리스트 체크하기',
    desc: '「케어리스트」 탭에서 오늘 한 케어를 눌러 체크해요. [항목 관리]에서 챙길 항목을 고르고 주기를 바꿀 수 있어요.',
    note: '다시 보고 싶으면 왼쪽 아이 말풍선의 [같이 둘러보기]를 눌러 주세요.',
    images: [
      {
        src: guide08Carelist,
        alt: '케어 캘린더 「케어리스트」 탭. 케어 줄을 눌러 체크하고 [항목 관리]로 항목을 고름',
      },
    ],
  },
];

const GROUPS = [...new Set(CHAPTERS.map((chapter) => chapter.group))];

/**
 * [건강기록 둘러보기 모달] (※신규 정책)
 * - 사이드 아이 말풍선 [같이 둘러보기]로 1장부터 엶. 반려동물과 상관없이 같은 내용 8장
 * - 760px 이상: 왼쪽 회색 목차(화면별 3묶음, 지금 장 흰 칸 + 초록 번호, 지난 장 체크, 남은 장 회색 번호, 누르면 그 장으로), 오른쪽 장 내용
 * - 760px 미만: 목차 대신 맨 위 「n / 8」과 진행 점, 그림 2장은 위아래로 쌓음
 * - 메인 서비스 둘러보기(ServiceTutorialModal)와 같은 틀: 1040×660 고정, 목차는 본문 높이를 꽉 채우고 오른쪽은 위에 붙임 (※신규 정책, 2026-11-20)
 * - 장 내용: 묶음 이름 → 제목 → 설명 → TIP 상자 → 그림(남은 높이를 모두 차지) (※신규 정책, 2026-11-20). 마지막 장은 footer 왼쪽 회색 안내 + [시작해 볼게요]로 닫음
 * - onOpenDashboardEdit이 있으면(종합 건강기록) 3장 TIP 상자 오른쪽 「대시보드 편집 바로 열기 ›」: 이 모달을 닫고 대시보드 편집을 엶. 없으면 3장 TIP 상자를 숨김
 * - 사진 [크게 보기] → 모달 안 확대 화면, [닫기]·바깥 누르면 닫힘 (※신규 정책)
 *   열린 동안은 Modal isDismissDisabled로 Esc·배경이 둘러보기를 닫지 않게 하고, Esc는 확대 화면만 닫음. 장을 옮기면 닫힘
 */
export default function HealthGuideModal({ onOpenDashboardEdit, onClose }) {
  const [index, setIndex] = useState(0);
  /** 확대 화면: null이면 닫힘. { image, label, trigger(포커스를 되돌릴 [크게 보기]) } */
  const [zoom, setZoom] = useState(null);

  /** 장을 옮기면 확대 화면도 닫음 */
  const goTo = (nextIndex) => {
    setZoom(null);
    setIndex(nextIndex);
  };

  const closeZoom = () => {
    zoom?.trigger?.focus();
    setZoom(null);
  };

  const chapter = CHAPTERS[index];
  const isFirst = index === 0;
  const isLast = index === CHAPTERS.length - 1;
  /** 링크가 있는 TIP(3장)은 링크를 쓸 수 있는 화면에서만 보임 */
  const hasTip = chapter.tip && (!chapter.linkText || onOpenDashboardEdit);

  const openDashboardEdit = () => {
    onClose();
    onOpenDashboardEdit();
  };

  const footer = (
    <>
      {isLast && chapter.note && (
        <p className="text-sm break-keep text-subtle max-[760px]:basis-full">
          {chapter.note}
        </p>
      )}
      <div className="ml-auto flex gap-2">
        {!isFirst && (
          <button
            type="button"
            className={`${BTN_SECONDARY} min-w-20`}
            onClick={() => goTo(index - 1)}
          >
            이전
          </button>
        )}
        <button
          type="button"
          className={`${BTN_PRIMARY} min-w-20`}
          onClick={isLast ? onClose : () => goTo(index + 1)}
        >
          {isLast ? '시작해 볼게요' : '다음'}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      title="건강기록 둘러보기"
      isTitleHidden
      isHeaderBorderHidden
      isLarge
      width={1040}
      footer={footer}
      isDismissDisabled={zoom !== null}
      onClose={onClose}
    >
      <div className="flex min-h-0 flex-1 gap-6 px-6 pb-5 text-left max-[760px]:flex-col max-[760px]:gap-4">
        <nav
          aria-label="둘러보기 목차"
          className="flex w-64 shrink-0 flex-col gap-5 rounded-card bg-surface-2 p-4 max-[760px]:hidden"
        >
          <div>
            <p className="text-lg font-bold text-ink">건강기록 둘러보기</p>
            <p className="mt-1 text-sm text-muted">
              세 화면, 8가지만 알면 충분해요
            </p>
          </div>
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="px-2 text-badge font-semibold text-subtle">
                {group}
              </p>
              <ol className="mt-1.5 flex flex-col gap-1">
                {CHAPTERS.map((item, itemIndex) =>
                  item.group === group ? (
                    <li key={item.title}>
                      <TocButton
                        no={itemIndex + 1}
                        title={item.title}
                        state={
                          itemIndex === index
                            ? 'current'
                            : itemIndex < index
                              ? 'done'
                              : 'next'
                        }
                        onClick={() => goTo(itemIndex)}
                      />
                    </li>
                  ) : null,
                )}
              </ol>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-3 min-[760px]:hidden">
          <p className="text-sm font-semibold text-ink">
            <span className="text-brand-600">{index + 1}</span> /{' '}
            {CHAPTERS.length}
          </p>
          <ol aria-hidden="true" className="flex items-center gap-1.5">
            {CHAPTERS.map((item, itemIndex) => (
              <li
                key={item.title}
                className={`h-1.5 rounded-full ${
                  itemIndex === index
                    ? 'w-4 bg-brand-500'
                    : itemIndex < index
                      ? 'w-1.5 bg-brand-100'
                      : 'w-1.5 bg-line-strong'
                }`}
              />
            ))}
          </ol>
        </div>

        <section
          aria-live="polite"
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-3"
        >
          <p className="text-badge font-semibold text-subtle">
            {chapter.group}
          </p>
          <h3 className="text-lg font-bold text-ink">{chapter.title}</h3>
          <p className="leading-[1.6] break-keep whitespace-pre-line text-ink-2">
            {chapter.desc}
          </p>

          {hasTip && (
            <div className="flex items-center gap-2 rounded-box bg-brand-50 px-3.5 py-3 text-sm break-keep text-ink-2">
              <b className="shrink-0 text-brand-600">TIP</b>
              <p className="min-w-0 flex-1">{chapter.tip}</p>
              {chapter.linkText && (
                <button
                  type="button"
                  className={`${TEXT_ACTION} shrink-0`}
                  onClick={openDashboardEdit}
                >
                  <span className="font-semibold text-brand-600">
                    {chapter.linkText} ›
                  </span>
                </button>
              )}
            </div>
          )}

          <GuidePicture chapter={chapter} no={index + 1} onZoom={setZoom} />
        </section>
      </div>

      {zoom && <ZoomOverlay zoom={zoom} onClose={closeZoom} />}
    </Modal>
  );
}

/**
 * 그림 칸: 남은 높이를 모두 차지하고 그림은 비율을 지켜 칸을 채움(ZoomBox isFill, 메인 서비스 둘러보기와 같음) (※신규 정책, 2026-11-20)
 * - 2장이면 「여기를 누르면」 → 「이 화면이 열려요」(760px 미만 위아래). 초록 번호 배지는 「여기를 누르면」 글자 바로 왼쪽
 */
function GuidePicture({ chapter, no, onZoom }) {
  const [from, to] = chapter.images;
  if (!to) {
    return (
      <div className="flex min-h-0 flex-1 rounded-card bg-surface-2 p-4">
        <ZoomBox image={from} label={chapter.title} isFill onZoom={onZoom} />
      </div>
    );
  }
  const fromLabel = chapter.fromLabel ?? FROM_LABEL;
  const toLabel = chapter.toLabel ?? TO_LABEL;
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-card bg-surface-2 p-4 max-[760px]:grid-cols-1">
      <figure className="flex h-full min-h-0 min-w-0 flex-col gap-2">
        <figcaption className="flex items-center gap-1.5 text-badge font-semibold text-subtle">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-500 text-badge font-bold text-white">
            {no}
          </span>
          {fromLabel}
        </figcaption>
        <ZoomBox
          image={from}
          label={`${fromLabel} · ${chapter.title}`}
          isFill
          className="min-h-0 flex-1"
          onZoom={onZoom}
        />
      </figure>
      <ArrowRight
        aria-hidden="true"
        className="size-5 text-subtle max-[760px]:mx-auto max-[760px]:rotate-90"
      />
      <figure className="flex h-full min-h-0 min-w-0 flex-col gap-2">
        <figcaption className="text-badge font-semibold text-subtle">
          {toLabel}
        </figcaption>
        <ZoomBox
          image={to}
          label={`${toLabel} · ${chapter.title}`}
          isFill
          className="min-h-0 flex-1"
          onZoom={onZoom}
        />
      </figure>
    </div>
  );
}
