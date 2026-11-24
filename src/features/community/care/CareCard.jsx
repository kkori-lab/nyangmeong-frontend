import {
  CalendarDays,
  Heart,
  MapPin,
  MessageCircle,
  Wallet,
} from 'lucide-react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import FileImage from '@/components/FileImage';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { getCostLabel, getPetBadges, isOpen } from '../careCodes';
import ImagePlaceholder from '../ImagePlaceholder';
import CareStatusBadge from './CareStatusBadge';
import { formatArea, formatScheduleShort, getShapeNames } from './careUtils';

/** 모집 카드: 배지 · 제목 1행 · 설명 2행 · 지역 · 일정 · 비용 · 작성자 · 경과 시간 · 채팅 n명 · 오른쪽 썸네일 */
export default function CareCard({ post }) {
  const { search } = useLocation();
  /** 사진이 없으면 썸네일 칸을 접고, 불러오지 못하면 회색 자리를 보인다 */
  const hasThumb = post.thumbnailAtchFileSn != null;
  /** 모집중이 아닌 글은 상태 배지만 또렷하게 두고 나머지 배지와 내용을 흐리게. 마우스를 올리면 선명해진다 */
  const dim = isOpen(post)
    ? ''
    : 'opacity-60 transition-opacity group-hover:opacity-100';
  const badges = [...new Set([...getShapeNames(post), ...getPetBadges(post)])];

  return (
    <Link
      to={generatePath(PATHS.COMMUNITY_PETCARE_DETAIL, {
        petPrtcRcrtSn: post.petPrtcRcrtSn,
      })}
      state={{ listSearch: search }}
      className={`group grid ${hasThumb ? 'grid-cols-[minmax(0,1fr)_240px]' : 'grid-cols-1'} gap-x-8 gap-y-4 rounded-[14px] border border-line bg-white px-7 py-6 transition hover:border-brand-100 max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-5 max-[760px]:overflow-hidden`}
    >
      <span className="col-start-1 row-start-1 min-w-0 max-[760px]:order-2 max-[760px]:row-start-auto">
        <span className="mb-2 flex flex-wrap gap-2">
          {post.owner && (
            <Badge tone="mine" bordered className={dim}>
              내 글
            </Badge>
          )}
          <CareStatusBadge post={post} />
          {badges.map((name) => (
            <Badge key={name} tone="outline" className={dim}>
              {name}
            </Badge>
          ))}
        </span>
        <span
          className={`block truncate text-lg font-semibold text-ink group-hover:text-brand-600 ${dim}`}
        >
          {post.pstTtl}
        </span>
        <span className={`mt-2 line-clamp-2 min-h-[3.2em] text-ink-2 ${dim}`}>
          {post.pstCn.replaceAll('\n', ' ')}
        </span>
        <span
          className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-2 ${dim}`}
        >
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
          className={`relative col-start-2 row-span-2 row-start-1 grid min-h-[150px] place-items-center self-stretch overflow-hidden rounded-[10px] bg-surface-2 ${dim} max-[760px]:-mx-4 max-[760px]:-mt-4 max-[760px]:rounded-none max-[760px]:border-b max-[760px]:border-line max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0`}
        >
          <FileImage
            src={publicFileUrl(post.thumbnailAtchFileSn)}
            className="absolute inset-0 size-full object-cover"
            fallback={<ImagePlaceholder className="absolute inset-0" />}
          />
        </span>
      )}
      <span
        className={`col-start-1 row-start-2 flex flex-wrap items-center max-[760px]:order-3 max-[760px]:row-start-auto gap-x-3 gap-y-2 border-t border-line pt-4 text-sm text-subtle ${dim}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Avatar
            src={publicFileUrl(post.mbrAtchFileSn)}
            className="size-6"
            iconSize={14}
          />
          {post.mbrNcnm}
          <i className="text-line-strong not-italic">·</i>
          <time>{formatRelativeTime(post.regDt)}</time>
        </span>
        <span className="ml-auto inline-flex items-center gap-3 text-ink-2">
          <span className="inline-flex items-center gap-1">
            <Heart size={16} aria-hidden="true" className="text-placeholder" />
            <span className="sr-only">좋아요</span>
            {post.rcmdtnCnt}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle
              size={16}
              aria-hidden="true"
              className="text-placeholder"
            />
            채팅 {post.aplcntCnt}명
          </span>
        </span>
      </span>
    </Link>
  );
}
