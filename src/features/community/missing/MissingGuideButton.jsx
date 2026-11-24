import { ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import useStickBelowMenu from '@/hooks/useStickBelowMenu';

/** 실종 대처 요령(간결한 글 형식). 단계 제목 + 한 줄씩 */
const GUIDE_STEPS = [
  {
    title: '1. 지금 바로 (첫 1시간)',
    items: [
      '마지막으로 본 장소 · 시간을 적어 두세요',
      '집 안을 다시 확인해요(옷장 · 침대 밑 · 세탁기 뒤 · 베란다)',
      '한 사람은 집에 남고, 익숙한 물건을 문 앞에 두세요',
      '반경 500m를 천천히 걸으며 이름을 불러 보세요',
      '관리사무소 · 이웃에 알리고 CCTV 확인을 요청해요',
      '최근 사진 3장 이상을 준비해요',
      '발견해도 쫓아가지 마세요. 몸을 낮추고 간식 소리를 내며 기다려요',
    ],
  },
  {
    title: '2. 첫 24시간 ~ 3일',
    items: [
      '24시간 안: 동물보호관리시스템 · 시군구청에 신고하고 실종센터에 글을 올려요',
      '근처 동물병원 · 펫숍에 사진과 연락처를 남겨요',
      '1~3일: 반경 1km 안에 전단지를 붙이고 보호센터 공고를 매일 확인해요',
      '3일 이후: 목격 제보가 들어온 곳 위주로 범위를 넓혀요',
    ],
  },
  {
    title: '3. 강아지와 고양이는 찾는 법이 달라요',
    items: [
      '강아지: 수 km까지 이동할 수 있어요. 길가 · 공원 · 산책로, 평소 산책 시간에 익숙한 말로 불러요',
      '고양이: 대부분 집 근처 몇십~몇백 m에 숨어 있어요. 차 밑 · 덤불 · 계단 아래를 조용한 밤 · 새벽에 찾고 사료 · 캔 소리로 불러요',
    ],
  },
  {
    title: '4. 신고하고 공고 확인하기',
    items: [
      '등록된 개는 잃어버린 날부터 10일 안에 분실신고해야 해요(넘기면 과태료, 동물보호법 제15조)',
      '동물보호관리시스템 · 시군구청 · 관할 동물보호센터 · 동물병원에 알려요',
    ],
  },
  {
    title: '5. 전단지와 온라인으로 알리기',
    items: [
      '사진은 크게, 글은 짧게: 실종 날짜 · 장소 · 품종 · 크기 · 털색 · 특징 · 연락처',
      '반경 1km 안 엘리베이터 · 편의점 · 동물병원 · 버스정류장에 붙여요(관리자 허락 먼저)',
      '실종센터 · 동네 커뮤니티 · SNS에 사진과 함께 올려요',
      '사례금 금액은 적지 않아요(사기 연락이 늘어요)',
    ],
  },
  {
    title: '6. 찾은 뒤, 그리고 주의할 점',
    items: [
      '동물병원에서 상처 · 건강을 확인하고, 찾은 날부터 30일 안에 변경신고를 해요',
      '실종센터 글을 「찾았어요」로 바꾸고 제보자에게 소식을 알려요',
      '사진 · 영상 확인 없이 돈부터 보내라는 연락은 사기일 수 있어요. 사례금은 직접 만나 확인한 뒤에 줘요',
      '다시 잃어버리지 않게 내장형 인식칩 · 이름표를 달고, 중문 · 안전문 · 방묘창을 점검해요',
    ],
  },
];

/** 버튼 문구 */
const GUIDE_TEXT = '반려동물을 잃어버렸을 때 이렇게 대처하세요.';

const BOX_CLASS =
  'flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-line bg-white px-4 py-4 text-left transition hover:border-brand-100 hover:bg-brand-50';

/**
 * 「실종 체크 가이드」 박스 버튼. 누르면 대처 요령 모달(글 형식, 제목 「실종 체크 가이드」)이 열린다. 아이콘 없이 한 줄 안내 문구와 ›
 * - variant="side"(기본): 760px 이상, SubPageLayout sideBottom(사이드 메뉴 바로 다음). 위에 1px 선, 스크롤하면 사이드 메뉴 바로 아래에 같이 고정(건강기록 반려동물 카드와 같은 간격)
 * - variant="inline": 760px 미만, 「실종 신고 등록」 버튼 바로 아래. 박스 없이 글자 버튼(브랜드 색 + ›)
 */
export default function MissingGuideButton({ variant = 'side' }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const isSide = variant === 'side';

  useStickBelowMenu(rootRef, isSide, 'guide');

  return (
    <>
      <div
        ref={rootRef}
        className={
          isSide
            ? 'z-20 mt-6 border-t border-line pt-6 min-[760px]:sticky max-[760px]:hidden'
            : 'mt-3 min-[760px]:hidden'
        }
      >
        {isSide ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={BOX_CLASS}
          >
            <span className="min-w-0 flex-1 text-base leading-[1.5] font-semibold text-ink">
              {GUIDE_TEXT}
            </span>
            <ChevronRight
              size={18}
              aria-hidden="true"
              className="text-subtle"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500"
          >
            {GUIDE_TEXT}
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {isOpen && (
        <Modal
          title="실종 체크 가이드"
          width={560}
          onClose={() => setIsOpen(false)}
          footer={
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={BTN_PRIMARY}
            >
              확인
            </button>
          }
        >
          <p className="mb-4 text-sm leading-[1.6] text-muted">
            놀란 아이는 대부분 멀리 가지 않고 가까이 숨어 있어요. 처음 몇 시간
            동안 집 근처를 꼼꼼히 찾는 것이 가장 중요해요.
          </p>
          <div className="flex flex-col gap-5">
            {GUIDE_STEPS.map((step) => (
              <section key={step.title} aria-label={step.title}>
                <h3 className="text-base font-bold text-ink">{step.title}</h3>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-[1.6] text-ink-2">
                  {step.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="text-subtle">
                        ·
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
