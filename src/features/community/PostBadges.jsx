import { Flame } from 'lucide-react';
import Badge from '@/components/Badge';
import { getBoardName } from './postCodes';

const POPULAR_CLASS =
  'inline-flex h-6 items-center gap-1 rounded-full px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap bg-[#fde8ea] text-[#c0394b] ring-1 ring-current/10 ring-inset';

/** 순서: [내 글] → [인기] → 게시판 배지(펫정보·펫일상, 펫돌봄 카드와 같은 기본 outline). 인기순 정렬에서는 인기 배지를 숨긴다(showPopular=false) */
export default function PostBadges({ post, showPopular = true }) {
  const name = getBoardName(post.bbsCd);
  return (
    <div className="flex flex-wrap gap-1.5">
      {post.owner && (
        <Badge tone="mine" bordered>
          내 글
        </Badge>
      )}
      {showPopular && post.popular && (
        <span className={POPULAR_CLASS}>
          <Flame size={13} aria-hidden="true" />
          인기
        </span>
      )}
      {name && <Badge tone="outline">{name}</Badge>}
    </div>
  );
}
