import { Heart, MessageCircle, SearchX } from 'lucide-react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import FileImage from '@/components/FileImage';
import LoadMore from '@/components/LoadMore';
import useSearchDraft from '@/hooks/useSearchDraft';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import ImagePlaceholder from './ImagePlaceholder';
import PostBadges from './PostBadges';
import PostFilters from './PostFilters';
import {
  FOOTER_WRAP_NARROW,
  LIST_RAIL_COLS,
  THUMB_COLS,
} from '@/constants/listLayout';
import StoryRail from './StoryRail';

/** 왼쪽(필터·목록)과 오른쪽 레일. 로딩 자리도 같은 배치를 쓴다 */
export const POST_LIST_GRID = `grid ${LIST_RAIL_COLS} items-start gap-x-8 gap-y-10 max-[1100px]:grid-cols-2 max-[1100px]:gap-x-5 max-[760px]:grid-cols-1`;

export default function PostList({
  posts,
  board,
  sort,
  keyword,
  mine,
  onBoardChange,
  onSortChange,
  onMineChange,
  onSearch,
  hasNext,
  isFetchingNext,
  onLoadMore,
  onReset,
  action,
}) {
  const { input, setInput, commit } = useSearchDraft(keyword);
  const { search } = useLocation();
  const { content, totalElements } = posts;

  const handleReset = () => {
    setInput('');
    onReset();
  };

  return (
    <div className={POST_LIST_GRID}>
      <div className="flex min-w-0 flex-col gap-5 max-[1100px]:col-span-full">
        <PostFilters
          board={board}
          sort={sort}
          mine={mine}
          search={{
            value: input,
            onChange: setInput,
            onSubmit: () => {
              const next = commit();
              if (next !== keyword) onSearch(next);
            },
          }}
          onBoardChange={(next) => onBoardChange(next, commit())}
          onSortChange={(next) => onSortChange(next, commit())}
          onMineChange={(next) => onMineChange(next, commit())}
        />

        <p aria-live="polite" className="text-sm text-muted">
          전체 <b className="font-bold text-ink">{totalElements}</b> 건
        </p>

        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title={mine ? '내가 쓴 글이 없어요' : '검색 결과가 없어요'}
          >
            <button
              type="button"
              onClick={handleReset}
              className={`${BTN_SECONDARY} cursor-pointer`}
            >
              펫이야기 목록으로
            </button>
          </EmptyResult>
        ) : (
          <ul className="flex flex-col gap-3 max-[760px]:gap-2">
            {content.map((item) => (
              <li key={item.pstSn} className="@container">
                <Link
                  to={generatePath(PATHS.COMMUNITY_POST_DETAIL, {
                    pstSn: item.pstSn,
                  })}
                  state={{ listSearch: search }}
                  className={`group grid gap-x-8 gap-y-4 rounded-[14px] border border-line bg-white px-7 py-6 transition hover:border-brand-100 max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-5 max-[760px]:overflow-hidden ${item.thumbAtchFileSn ? THUMB_COLS : 'grid-cols-1'}`}
                >
                  <div className="min-w-0 max-[760px]:order-2">
                    <PostBadges post={item} showPopular={sort !== 'hot'} />
                    <h3 className="mt-3 truncate text-lg leading-[1.4] font-semibold tracking-[-0.01em] text-ink group-hover:text-brand-500">
                      {item.pstTtl}
                    </h3>
                    <p
                      className={`mt-3 line-clamp-2 text-base leading-[1.6] text-ink-2 max-[760px]:text-sm ${item.thumbAtchFileSn ? 'min-h-[3.2em]' : ''}`}
                    >
                      {item.pstCn}
                    </p>
                  </div>
                  {item.thumbAtchFileSn && (
                    <span
                      aria-hidden="true"
                      className="relative col-start-2 row-span-2 row-start-1 min-h-[150px] self-stretch overflow-hidden rounded-[10px] bg-surface-2 max-[760px]:-mx-4 max-[760px]:-mt-4 max-[760px]:rounded-none max-[760px]:border-b max-[760px]:border-line max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0"
                    >
                      <FileImage
                        src={publicFileUrl(item.thumbAtchFileSn)}
                        className="absolute inset-0 size-full object-cover"
                        fallback={
                          <ImagePlaceholder className="absolute inset-0" />
                        }
                      />
                    </span>
                  )}
                  <div
                    className={`col-start-1 flex items-center justify-between gap-x-3 gap-y-2 text-sm text-subtle max-[760px]:order-3 ${FOOTER_WRAP_NARROW}`}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Avatar
                        src={publicFileUrl(item.mbrAtchFileSn)}
                        className="size-6"
                        iconSize={14}
                      />
                      <span className="truncate font-medium text-ink-2">
                        {item.mbrNcnm}
                      </span>
                      <i className="text-line-strong not-italic">·</i>
                      <time className="shrink-0">
                        {formatRelativeTime(item.regDt)}
                      </time>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Heart size={15} aria-hidden="true" />
                        <span className="sr-only">좋아요</span>
                        {item.rcmdtnCnt}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle size={15} aria-hidden="true" />
                        <span className="sr-only">댓글</span>
                        {item.cmntCnt}
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <LoadMore
          hasNext={hasNext}
          isFetching={isFetchingNext}
          onLoad={onLoadMore}
        />
      </div>

      <StoryRail action={action} />
    </div>
  );
}
