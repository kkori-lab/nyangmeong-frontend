import {
  CalendarDays,
  MapPin,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
} from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { RCRT_STTS, isOpen } from '../careCodes';
import CareStatusBadge from './CareStatusBadge';
import { formatArea, formatScheduleShort, unitText } from './careUtils';

const BOX_CLASS =
  'rounded-[14px] border border-line bg-white px-[22px] pt-[22px] pb-5 shadow-sm';

const AUTO_HELP = {
  [RCRT_STTS.OPEN]: '채팅에서 매칭이 끝나면 자동으로 매칭완료로 바뀌어요',
  [RCRT_STTS.MATCHED]: '거래가 끝나면 자동으로 거래완료로 바뀌어요',
  [RCRT_STTS.DONE]: '돌봄이 끝난 글이에요',
};

function Summary({ post }) {
  return (
    <>
      <p className="text-sm text-muted">비용</p>
      <p className="mt-0.5 text-2xl font-bold tracking-[-0.01em]">
        {post.cstAmt.toLocaleString()}원
        <small className="ml-1 text-sm font-medium text-muted">
          {unitText(post)}
        </small>
      </p>
      <ul className="mt-3.5 border-t border-line pt-3.5 text-sm text-ink-2">
        <li className="flex items-start gap-2 py-1">
          <CalendarDays
            size={18}
            aria-hidden="true"
            className="shrink-0 text-subtle"
          />
          {formatScheduleShort(post)}
        </li>
        <li className="flex items-start gap-2 py-1">
          <MapPin
            size={18}
            aria-hidden="true"
            className="shrink-0 text-subtle"
          />
          {formatArea(post)} 인근
        </li>
      </ul>
    </>
  );
}

/** 작성자: 모집 상태(자동) · 채팅 중인 사람 수 · [채팅 목록 보기] */
function OwnerPanel({ post, onOpenList }) {
  return (
    <>
      <div className="mt-4 rounded-lg bg-surface-2 px-3.5 py-3">
        <p className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-2">
          모집 상태
          <CareStatusBadge post={post} />
        </p>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-[1.6] text-muted">
          <RefreshCw
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-tone-green-fg"
          />
          {AUTO_HELP[post.rcrtSttsCd]}
        </p>
      </div>
      {isOpen(post) && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-brand-50 px-3.5 py-3 text-brand-600">
          <MessagesSquare size={20} aria-hidden="true" />
          <span>
            지금 <b className="font-bold">{post.aplcntCnt}명</b>과 채팅 중
          </span>
        </p>
      )}
      <button
        type="button"
        onClick={onOpenList}
        className={`${isOpen(post) ? BTN_PRIMARY : BTN_SECONDARY} mt-4 w-full`}
      >
        <MessageCircle size={16} aria-hidden="true" />
        {isOpen(post) ? '채팅 목록 보기' : '이 글의 채팅 목록'}
      </button>
    </>
  );
}

/** 방문자: 모집중이면 [채팅하기], 끝났으면 비활성 */
function VisitorPanel({ post, onChat }) {
  if (!isOpen(post)) {
    return (
      <button
        type="button"
        disabled
        className={`${BTN_PRIMARY} mt-[18px] w-full`}
      >
        모집이 끝났어요
      </button>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={onChat}
        className={`${BTN_PRIMARY} mt-[18px] w-full`}
      >
        <MessageCircle size={16} aria-hidden="true" />
        채팅하기
      </button>
      <p className="mt-2.5 text-center text-sm leading-[1.6] text-muted">
        문의와 일정 협의는 채팅으로 나눠 주세요
      </p>
    </>
  );
}

/** 상세 오른쪽 요약 상자: 비용 · 일정 · 장소와 채팅 진입 (작성자는 채팅 현황) */
export default function CareSideBox({ post, onChat, onOpenList }) {
  return (
    <aside aria-label="돌봄 요청 요약" className={BOX_CLASS}>
      <Summary post={post} />
      {post.owner ? (
        <OwnerPanel post={post} onOpenList={onOpenList} />
      ) : (
        <VisitorPanel post={post} onChat={onChat} />
      )}
    </aside>
  );
}
