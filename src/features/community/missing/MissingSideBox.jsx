import { CalendarDays, MapPin, MessageCircle, PartyPopper } from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { EXTEND_BEFORE_DAYS, isFound } from '../missingCodes';
import CheckList from './CheckList';
import {
  formatArea,
  formatSeenAtShort,
  MISSING_COMMENT_INPUT_ID,
} from './missingUtils';

const BOX_CLASS =
  'rounded-[14px] border border-line bg-white px-[22px] pt-[22px] pb-5 shadow-sm';

const GUIDE_OWNER = [
  ['반경 500m 먼저 찾기', '놀란 아이는 대부분 멀리 못 가고 근처에 숨어 있어요'],
  ['익숙한 냄새 두기', '집 앞에 평소 쓰던 방석 · 옷을 놓아 두세요'],
  ['바로 신고하기', '동물보호관리시스템 · 관할 경찰서에 신고해요'],
  ['링크 공유하기', '공유하기로 이 글을 동네 커뮤니티에 알려 주세요'],
];

const GUIDE_VISITOR = [
  [
    '쫓아가지 않기',
    '놀라서 더 멀리 도망갈 수 있어요. 자리를 지키며 지켜봐 주세요',
  ],
  [
    '사진 · 위치 남기기',
    '가능하면 사진을 찍고 정확한 장소와 시간을 기록해 주세요',
  ],
  ['바로 연락하기', '보호자에게 전화하거나 댓글로 알려 주세요'],
];

function Guide({ title, items }) {
  return (
    <section aria-label={title}>
      <h2 className="pb-3 text-lg leading-[1.4] font-bold text-ink">{title}</h2>
      <CheckList items={items} />
    </section>
  );
}

/** 보는 사람 오른쪽: 「○○를 보셨나요?」 연락 카드 + 목격했을 때 안내 */
export function VisitorSide({ post }) {
  const goComment = () => {
    const input = document.getElementById(MISSING_COMMENT_INPUT_ID);
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  return (
    <>
      <aside aria-label="연락하기" className={BOX_CLASS}>
        <p className="text-sm text-muted">{post.petNm}를 보셨나요?</p>
        <p className="mt-0.5 text-2xl font-bold tracking-[0.01em]">
          {post.cnpl}
        </p>
        <ul className="mt-3.5 border-t border-line pt-3.5 text-sm text-ink-2">
          <li className="flex items-start gap-2 py-1">
            <CalendarDays
              size={18}
              aria-hidden="true"
              className="shrink-0 text-subtle"
            />
            {formatSeenAtShort(post.lastWtnsDt)} 마지막 목격
          </li>
          <li className="flex items-start gap-2 py-1">
            <MapPin
              size={18}
              aria-hidden="true"
              className="shrink-0 text-subtle"
            />
            {formatArea(post)} {post.wtnsPlcNm}
          </li>
        </ul>
        <button
          type="button"
          onClick={goComment}
          className={`${BTN_PRIMARY} mt-[18px] w-full`}
        >
          <MessageCircle size={16} aria-hidden="true" />
          댓글로 제보하기
        </button>
        <p className="mt-2.5 text-center text-sm leading-[1.6] text-muted">
          본 장소와 시간을 함께 알려 주세요
        </p>
      </aside>
      <Guide title="목격했을 때 이렇게 해 주세요" items={GUIDE_VISITOR} />
    </>
  );
}

/**
 * 작성자 오른쪽: 「○○를 찾으셨나요?」 카드(게시 종료일 · 남은 일수 · [찾았어요] · [30일 더 게시하기]) + 실종 Check 가이드
 * - 연장은 게시 종료 7일 전부터. 연장하면 종료일이 늘어 버튼 사라짐
 */
export function OwnerSide({ post, onFound, onExtend }) {
  const found = isFound(post);
  const canExtend = !found && post.rmndDayCnt <= EXTEND_BEFORE_DAYS;

  return (
    <>
      <aside
        aria-label="찾았어요 처리"
        className={`${BOX_CLASS} ${found ? 'border-[#cfe3d6] bg-tone-green-bg' : ''}`}
      >
        {found ? (
          <div className="flex flex-col items-center gap-1.5 py-2 text-center font-semibold">
            <PartyPopper
              size={36}
              aria-hidden="true"
              className="text-tone-green-fg"
            />
            가족 품으로 돌아갔어요
            <p className="text-sm font-normal text-ink-2">
              관심 가져 주셔서 감사해요
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted">{post.petNm}를 찾으셨나요?</p>
            <p className="mt-2 text-sm text-muted">
              게시 종료 {formatDate(post.expryCrtrDt)} ·{' '}
              <b className="font-bold text-warn">{post.rmndDayCnt}일 남음</b>
            </p>
            <button
              type="button"
              onClick={onFound}
              className={`${BTN_PRIMARY} mt-[18px] w-full`}
            >
              <PartyPopper size={16} aria-hidden="true" />
              찾았어요
            </button>
            {canExtend && (
              <button
                type="button"
                onClick={onExtend}
                className={`${BTN_SECONDARY} mt-2 w-full`}
              >
                30일 더 게시하기
              </button>
            )}
            <p className="mt-2.5 text-center text-sm leading-[1.6] text-muted">
              &apos;찾았어요&apos;를 누르면 본문 · 사진 · 연락처 · 위치 · 댓글이
              다른 사용자에게 공개되지 않아요
            </p>
          </>
        )}
      </aside>
      <Guide title="실종 Check 가이드" items={GUIDE_OWNER} />
    </>
  );
}
