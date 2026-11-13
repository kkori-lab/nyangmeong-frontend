import { MapPin, MessageCircle, CalendarDays, Wallet } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { getCostLabel, getPetBadges, isOpen } from '../careCodes';
import CareStatusBadge from './CareStatusBadge';
import { formatArea, formatScheduleShort, getShapeNames } from './careUtils';

/** 모집 카드: 배지 · 제목 1행 · 설명 2행 · 지역 · 일정 · 비용 · 작성자 · 경과 시간 · 채팅 n명 · 오른쪽 썸네일 */
export default function CareCard({ post }) {
  const { search } = useLocation();
  const [thumbFailed, setThumbFailed] = useState(false);
  /** 사진이 없거나 불러오지 못하면 썸네일 칸을 접는다(점선 자리 표시 없음) */
  const hasThumb = post.thumbnailAtchFileSn != null && !thumbFailed;
  const badges = [...new Set([...getShapeNames(post), ...getPetBadges(post)])];

  return (
    <Link
      to={generatePath(PATHS.COMMUNITY_PETCARE_DETAIL, {
        petPrtcRcrtSn: post.petPrtcRcrtSn,
      })}
      state={{ listSearch: search }}
      className={`group grid ${hasThumb ? 'grid-cols-[minmax(0,1fr)_200px]' : 'grid-cols-1'} gap-x-8 gap-y-3.5 rounded-[14px] border border-line bg-white px-7 py-6 shadow-[0_1px_2px_rgba(26,50,52,0.06)] transition hover:border-brand-100 hover:shadow-[0_4px_12px_rgba(26,50,52,0.1)] max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-[18px]`}
    >
      <span className="col-start-1 row-start-1 min-w-0 max-[760px]:order-2 max-[760px]:row-start-auto">
        <span className="mb-2.5 flex flex-wrap gap-1.5">
          {post.owner && (
            <Badge tone="mine" bordered>
              내 글
            </Badge>
          )}
          <CareStatusBadge post={post} />
          {badges.map((name) => (
            <Badge key={name} tone="outline">
              {name}
            </Badge>
          ))}
        </span>
        <span className="block truncate text-lg leading-[1.4] font-semibold text-ink group-hover:text-brand-600">
          {post.pstTtl}
        </span>
        <span className="mt-2 line-clamp-2 min-h-[3.2em] text-ink-2">
          {post.pstCn.replaceAll('\n', ' ')}
        </span>
        <span className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-2">
          <span className="inline-flex items-center gap-1">
            <MapPin size={18} aria-hidden="true" className="text-subtle" />
            {formatArea(post)}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays
              size={18}
              aria-hidden="true"
              className="text-subtle"
            />
            {formatScheduleShort(post)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Wallet size={18} aria-hidden="true" className="text-subtle" />
            <b className="font-bold text-ink tabular-nums">
              {getCostLabel(post)}
            </b>
          </span>
        </span>
      </span>
      {hasThumb && (
        <span
          aria-hidden="true"
          className={`relative col-start-2 row-span-2 row-start-1 grid min-h-[132px] place-items-center self-stretch overflow-hidden rounded-[10px] bg-surface-2 ${isOpen(post) ? '' : 'opacity-60'} max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0`}
        >
          <img
            src={publicFileUrl(post.thumbnailAtchFileSn)}
            alt=""
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="absolute inset-0 size-full object-cover"
          />
        </span>
      )}
      <span className="col-start-1 row-start-2 flex flex-wrap items-center max-[760px]:order-3 max-[760px]:row-start-auto gap-x-3 gap-y-1.5 border-t border-line pt-3.5 text-sm text-subtle">
        <span className="flex min-w-0 items-center gap-1.5">
          <Avatar
            src={publicFileUrl(post.mbrAtchFileSn)}
            className="size-6"
            iconSize={14}
          />
          {post.mbrNcnm}
          <i className="text-line-strong not-italic">·</i>
          <time>{formatRelativeTime(post.regDt)}</time>
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-ink-2">
          <MessageCircle
            size={16}
            aria-hidden="true"
            className="text-placeholder"
          />
          채팅 {post.aplcntCnt}명
        </span>
      </span>
    </Link>
  );
}
