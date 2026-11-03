import { Clock, MapPin, PartyPopper, PawPrint } from 'lucide-react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import Badge from '@/components/Badge';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import { getBreedName, isFound } from '../missingCodes';
import MissingStatusBadge from './MissingStatusBadge';
import { FOUND_PRIVATE_TEXT, formatArea } from './missingUtils';

/**
 * 실종 카드: 사진 · 상태 배지 · 이름(품종) · 지역 · 경과 시간 · 특징 한 줄
 * - 내 글(owner)은 상태 배지 옆에 「내 글」 배지
 * - 남의 찾았어요 글은 서버가 이름·지역 등을 null로 줌: 이름 자리에 제목, 지역은 숨김
 */
export default function MissingCard({ post }) {
  const { search } = useLocation();
  const found = isFound(post);
  const breed = getBreedName(post);

  return (
    <Link
      to={generatePath(PATHS.COMMUNITY_MISSING_DETAIL, {
        lostTpofSn: post.lostTpofSn,
      })}
      state={{ listSearch: search }}
      className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_1px_2px_rgba(26,50,52,0.06)] transition hover:border-brand-100 hover:shadow-[0_4px_12px_rgba(26,50,52,0.1)]"
    >
      <span
        className={`relative grid aspect-[4/3] place-items-center overflow-hidden border-b border-line ${found ? 'bg-tone-green-bg text-tone-green-fg' : 'bg-surface-2 text-line-strong'}`}
      >
        {found ? (
          <span className="flex flex-col items-center gap-1.5 font-semibold">
            <PartyPopper size={40} aria-hidden="true" />
            가족 품으로 돌아갔어요
          </span>
        ) : post.thumbAtchFileSn ? (
          <img
            src={publicFileUrl(post.thumbAtchFileSn)}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <PawPrint size={48} aria-hidden="true" />
        )}
        <span className="absolute top-3 left-3 flex gap-1.5 [&>*]:shadow-[0_1px_2px_rgba(15,23,35,0.12)]">
          <MissingStatusBadge post={post} />
          {post.owner && <Badge tone="amber">내 글</Badge>}
        </span>
      </span>
      <span className="flex flex-col gap-1.5 px-[18px] pt-4 pb-[18px]">
        <span className="truncate text-lg leading-[1.4] font-semibold text-ink group-hover:text-brand-600">
          {post.petNm ?? post.pstTtl}
          {breed && (
            <small className="ml-1 text-sm font-medium text-muted">
              {breed}
            </small>
          )}
        </span>
        <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-ink-2">
          {post.rgnNm && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={16} aria-hidden="true" className="text-subtle" />
              {formatArea(post)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock size={16} aria-hidden="true" className="text-subtle" />
            {formatRelativeTime(post.regDt)}
          </span>
        </span>
        <span className="mt-1 truncate border-t border-line pt-2.5 text-sm text-muted">
          {found ? FOUND_PRIVATE_TEXT : post.chrcCn}
        </span>
      </span>
    </Link>
  );
}
