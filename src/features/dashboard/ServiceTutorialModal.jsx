import { useLayoutEffect, useRef, useState } from 'react';
import Modal from '@/components/Modal';
import TocButton from '@/components/TocButton';
import ZoomBox from '@/components/ZoomBox';
import ZoomOverlay from '@/components/ZoomOverlay';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import aiShot from '@/assets/tutorial/ai.png';
import communityShot from '@/assets/tutorial/community.png';
import healthShot from '@/assets/tutorial/health.png';
import mypageShot from '@/assets/tutorial/mypage.png';
import placesShot from '@/assets/tutorial/places.png';
import { useSaveServiceTutorialSeen } from './queries';

/** 열기·닫기 연출: AI 매니저 플로팅 버튼으로 연 대화창(pages/ai/AiChatModal)과 같은 값 */
const MOTION_MS = 320;
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const SHRUNK = { transform: 'scale(0.1)', opacity: 0 };
const FULL = { transform: 'scale(1)', opacity: 1 };

/** 760px 미만은 공용 Modal 아래 시트: 올라오는 연출은 Modal이 하고, 닫을 때만 아래로 내린다 */
const isSheetWidth = () => window.matchMedia('(width < 760px)').matches;
const SHEET_MOTION_MS = 200;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 모달 dialog와 뒤 어두운 막을 함께 움직인다. 막(::backdrop)을 못 움직이는 브라우저면 dialog만 */
const playMotion = (dialog, keyframes, backdropKeyframes, options) => {
  try {
    dialog.animate(backdropKeyframes, {
      ...options,
      pseudoElement: '::backdrop',
    });
  } catch {
    /** 막 연출은 없어도 된다 */
  }
  return dialog.animate(keyframes, options);
};

/**
 * 항목 목록: title · desc · tip(있으면 TIP 상자) · image(로컬 1280×800 화면 캡처, 플레이스는 지도를 뺀 목록만)
 * - note: 마지막 항목 footer 왼쪽 회색 안내
 */
const FEATURES = [
  {
    title: 'AI 매니저',
    desc: '메인 검색창에 묻거나 사진을 올리면 AI 매니저가 답하고 일정·영수증을 정리해요.\n검색창 오른쪽 [AI 매니저]를 누르면 바로 AI 대화 화면으로 넘어가요.',
    tip: '다른 화면에서는 오른쪽 아래 버튼으로 열어요. AI 매니저(캐릭터)·반려동물 등록(발바닥)·맨 위로(TOP)',
    image: {
      src: aiShot,
      alt: '메인 화면. 가운데 AI 매니저 검색창과 아래 반려동물 바로가기',
    },
  },
  {
    title: '건강기록',
    desc: '종합 건강기록·건강 일지·케어 캘린더로 체중·식사·검진과 챙길 케어를 기록해요',
    image: {
      src: healthShot,
      alt: '건강 일지 화면. 건강기록 변화 그래프와 오늘의 기록',
    },
  },
  {
    title: '플레이스',
    desc: '병원·미용·용품·동반·호텔 장소를 지도에서 찾아요',
    image: {
      src: placesShot,
      alt: '플레이스 화면 왼쪽 목록. 종류 메뉴·검색창·장소 목록',
    },
  },
  {
    title: '커뮤니티',
    desc: '펫이야기·우리동네 펫돌봄·실종센터·펫뉴스에서 이웃과 이야기해요',
    image: {
      src: communityShot,
      alt: '펫이야기 목록 화면. 글 목록과 오른쪽 글쓰기·인기 포토',
    },
  },
  {
    title: '마이페이지',
    desc: '반려동물 관리·픽셀 캐릭터·포인트와 케어미션·가계부를 모아 봐요',
    note: '다시 보고 싶으면 메인 왼쪽 아래 [?]를 눌러 주세요.',
    image: {
      src: mypageShot,
      alt: '마이페이지 홈. 포인트·이번달 지출액·케어미션과 내 반려동물',
    },
  },
];

/**
 * [서비스 튜토리얼 모달] (SCR-MAN-001, 명세 기능 ID 추가 전). 건강기록 둘러보기 모달(HealthGuideModal)과 같은 모양
 * - 높이 고정(isLarge, isAutoHeight 없음): 항목을 바꿔도 크기가 그대로
 * - 760px 이상: 왼쪽 회색 목차는 본문 높이를 꽉 채우고 오른쪽 항목 내용은 위쪽에 붙임. 목차(지금 항목 흰 칸 + 초록 번호, 지난 항목 체크, 남은 항목 회색 번호, 누르면 그 항목으로), 오른쪽 항목 내용
 * - 760px 미만: 목차 대신 맨 위 「n / 5」와 진행 점
 * - 항목 내용: 제목 → 설명 → TIP 상자(있을 때) → 그림(남은 높이를 모두 차지, [크게 보기]). 마지막 항목은 footer 왼쪽 회색 안내 + [시작해 볼게요]
 * - 본문은 왼쪽 정렬로 고정한다(여는 화면의 text-center 등을 물려받지 않게)
 * - 760px 이상: 열고 닫을 때 왼쪽 아래 기준 스케일 연출(AI 매니저 플로팅 버튼 대화창과 같음). 760px 미만: 다른 시트처럼 아래에서 올라오고 아래로 내려가며 닫힘. 동작 줄이기면 없음
 * - ×·Esc·배경·[시작해 볼게요] 모두 봤음을 저장하고 연출 뒤 닫는다. 저장 실패는 알리지 않는다(다음 접속 때 다시 열림)
 * - 사진 확대 화면이 열린 동안은 Esc·배경이 이 모달을 닫지 않고 확대 화면만 닫는다. 항목을 옮기면 확대 화면도 닫힌다
 */
export default function ServiceTutorialModal({ onClose }) {
  const [index, setIndex] = useState(0);
  /** 확대 화면: null이면 닫힘. { image, label, trigger(포커스를 되돌릴 [크게 보기]) } */
  const [zoom, setZoom] = useState(null);
  const saveSeen = useSaveServiceTutorialSeen();
  /** 모달 본문: 연출할 dialog를 찾는 기준 */
  const bodyRef = useRef(null);
  const isClosingRef = useRef(false);
  const feature = FEATURES[index];
  const isFirst = index === 0;
  const isLast = index === FEATURES.length - 1;

  const goTo = (nextIndex) => {
    setZoom(null);
    setIndex(nextIndex);
  };

  const closeZoom = () => {
    zoom?.trigger?.focus();
    setZoom(null);
  };

  /** 열 때: 왼쪽 아래를 기준으로 작게 시작해 커진다 */
  useLayoutEffect(() => {
    const dialog = bodyRef.current?.closest('dialog');
    if (!dialog?.animate || prefersReducedMotion() || isSheetWidth())
      return undefined;
    dialog.style.transformOrigin = 'bottom left';
    const animation = playMotion(
      dialog,
      [SHRUNK, FULL],
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: MOTION_MS, easing: EASE_OUT },
    );
    return () => animation.cancel();
  }, []);

  /** 닫을 때: 봤음을 저장하고, 왼쪽 아래로 줄어든 뒤 닫는다. 연출 중 다시 눌러도 한 번만 */
  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    /** 저장은 연출이 끝난 뒤에: 저장 성공이 봤음 캐시를 바꾸면 처음 열린 모달이 연출 도중 사라진다 */
    const finish = () => {
      saveSeen.mutate();
      onClose();
    };
    const dialog = bodyRef.current?.closest('dialog');
    if (!dialog?.animate || prefersReducedMotion()) {
      finish();
      return;
    }
    if (isSheetWidth()) {
      /** 제목 줄을 끌어 닫았으면 Modal이 이미 아래로 내렸다 */
      if (dialog.style.transform === 'translateY(100%)') {
        finish();
        return;
      }
      playMotion(
        dialog,
        [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: SHEET_MOTION_MS, easing: EASE_IN, fill: 'forwards' },
      ).finished.then(finish, finish);
      return;
    }
    playMotion(dialog, [FULL, SHRUNK], [{ opacity: 1 }, { opacity: 0 }], {
      duration: MOTION_MS,
      easing: EASE_IN,
      fill: 'forwards',
    }).finished.then(finish, finish);
  };

  const footer = (
    <>
      {isLast && feature.note && (
        <p className="text-sm break-keep text-subtle max-[760px]:basis-full">
          {feature.note}
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
          onClick={isLast ? handleClose : () => goTo(index + 1)}
        >
          {isLast ? '시작해 볼게요' : '다음'}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      title="서비스 둘러보기"
      isTitleHidden
      isHeaderBorderHidden
      isLarge
      width={1040}
      footer={footer}
      isDismissDisabled={zoom !== null}
      onClose={handleClose}
    >
      <div
        ref={bodyRef}
        className="flex min-h-0 flex-1 gap-6 px-6 pb-5 text-left max-[760px]:flex-col max-[760px]:gap-4"
      >
        <nav
          aria-label="둘러보기 목차"
          className="flex w-64 shrink-0 flex-col gap-5 rounded-card bg-surface-2 p-4 max-[760px]:hidden"
        >
          <p className="text-lg font-bold text-ink">
            pawever에서 할 수 있는 것
          </p>
          <ol className="flex flex-col gap-1">
            {FEATURES.map((item, itemIndex) => (
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
            ))}
          </ol>
        </nav>

        <div className="flex items-center justify-between gap-3 min-[760px]:hidden">
          <p className="text-sm font-semibold text-ink">
            <span className="text-brand-600">{index + 1}</span> /{' '}
            {FEATURES.length}
          </p>
          <ol aria-hidden="true" className="flex items-center gap-1.5">
            {FEATURES.map((item, itemIndex) => (
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
          <h3 className="text-lg font-bold text-ink">{feature.title}</h3>
          <p className="leading-[1.6] break-keep whitespace-pre-line text-ink-2">
            {feature.desc}
          </p>

          {feature.tip && (
            <div className="flex items-center gap-2 rounded-box bg-brand-50 px-3.5 py-3 text-sm break-keep text-ink-2">
              <b className="shrink-0 text-brand-600">TIP</b>
              <p className="min-w-0 flex-1">{feature.tip}</p>
            </div>
          )}

          {/** 그림 상자가 남은 높이를 모두 차지하고, 그림은 비율을 지켜 상자를 채운다 */}
          <div className="flex min-h-0 flex-1 rounded-card bg-surface-2 p-4">
            <ZoomBox
              image={feature.image}
              label={feature.title}
              isFill
              onZoom={setZoom}
            />
          </div>
        </section>
      </div>

      {zoom && <ZoomOverlay zoom={zoom} onClose={closeZoom} />}
    </Modal>
  );
}
