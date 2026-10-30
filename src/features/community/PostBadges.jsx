import { Flame } from 'lucide-react';
import { getBoardName } from './postCodes';

const BOARD_TONES = {
  펫정보: 'bg-[#eaf1fc] text-[#2d5fb8]',
  펫일상: 'bg-[#fcf1df] text-[#9a5c0c]',
};

const BADGE_CLASS =
  'inline-flex h-6 items-center gap-1 rounded-full px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap';

/** 게시판 배지(펫정보·펫일상) + [인기] 배지. 인기순 정렬에서는 인기 배지를 숨긴다(showPopular=false) */
export default function PostBadges({ post, showPopular = true }) {
  const name = getBoardName(post.bbsCd);
  return (
    <div className="flex flex-wrap gap-1.5">
      {name && (
        <span className={`${BADGE_CLASS} ${BOARD_TONES[name]}`}>{name}</span>
      )}
      {showPopular && post.popular && (
        <span className={`${BADGE_CLASS} bg-[#fde8ea] text-[#c0394b]`}>
          <Flame size={13} aria-hidden="true" />
          인기
        </span>
      )}
    </div>
  );
}
