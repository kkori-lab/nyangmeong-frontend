import { Heart, MessageCircle, SearchX } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import BoardPagination from '@/components/BoardPagination';
import EmptyResult from '@/components/EmptyResult';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import PostBadges from './PostBadges';
import PostFilters from './PostFilters';
import StoryRail from './StoryRail';

/** 머리 아래 진한 선 + 왼쪽(필터·목록)과 오른쪽 레일. 로딩 자리도 같은 배치를 쓴다 */
export const POST_LIST_GRID =
  'grid grid-cols-[minmax(0,1fr)_300px] items-start gap-x-8 gap-y-10 border-t border-line-strong pt-6 max-[1100px]:grid-cols-2 max-[1100px]:gap-x-5 max-[760px]:grid-cols-1';

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
  onPageChange,
  onReset,
}) {
  const [input, setInput] = useState(keyword);
  const { search } = useLocation();
  const { content, page, totalPages, totalElements } = posts;

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
            onSubmit: () => onSearch(input.trim()),
          }}
          totalElements={totalElements}
          onBoardChange={onBoardChange}
          onSortChange={onSortChange}
          onMineChange={onMineChange}
        />

        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title={mine ? '내가 쓴 글이 없어요' : '검색 결과가 없어요'}
          >
            <button
              type="button"
              onClick={handleReset}
              className="h-9 cursor-pointer rounded-md border border-[#e2e7e7] bg-white px-3 text-sm font-medium text-[#1a3234] hover:bg-[#f4f6f6]"
            >
              펫이야기 목록으로
            </button>
          </EmptyResult>
        ) : (
          <ul className="flex flex-col gap-3 max-[760px]:gap-2.5">
            {content.map((item) => (
              <li key={item.pstSn}>
                <Link
                  to={generatePath(PATHS.COMMUNITY_POST_DETAIL, {
                    pstSn: item.pstSn,
                  })}
                  state={{ listSearch: search }}
                  className={`group grid gap-x-8 gap-y-3.5 rounded-[14px] border border-[#e2e7e7] bg-white px-7 py-6 shadow-[0_1px_2px_rgba(26,50,52,0.06)] transition hover:border-[#cfe2e2] hover:shadow-[0_4px_12px_rgba(26,50,52,0.1)] max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-[18px] ${item.thumbAtchFileSn ? 'grid-cols-[minmax(0,1fr)_200px]' : 'grid-cols-1'}`}
                >
                  <div className="min-w-0 max-[760px]:order-2">
                    <PostBadges post={item} showPopular={sort !== 'hot'} />
                    <h3 className="mt-2.5 truncate text-lg leading-[1.4] font-semibold tracking-[-0.18px] text-[#1a3234] group-hover:text-[#285a5c]">
                      {item.pstTtl}
                    </h3>
                    <p
                      className={`mt-2.5 line-clamp-2 text-base leading-[1.6] text-[#3d4a4b] max-[760px]:text-sm ${item.thumbAtchFileSn ? 'min-h-[3.2em]' : ''}`}
                    >
                      {item.pstCn}
                    </p>
                  </div>
                  {item.thumbAtchFileSn && (
                    <span
                      aria-hidden="true"
                      className="relative col-start-2 row-span-2 row-start-1 min-h-[124px] self-stretch overflow-hidden rounded-[10px] bg-[#f4f6f6] max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0"
                    >
                      <img
                        src={publicFileUrl(item.thumbAtchFileSn)}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover"
                      />
                    </span>
                  )}
                  <div className="col-start-1 flex items-center justify-between gap-3 text-sm text-[#667374] max-[760px]:order-3">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Avatar
                        src={publicFileUrl(item.mbrAtchFileSn)}
                        className="size-6"
                        iconSize={14}
                      />
                      <span className="truncate font-medium text-[#3d4a4b]">
                        {item.mbrNcnm}
                      </span>
                      <i className="text-[#b9c4c4] not-italic">·</i>
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

        <div className="mt-5">
          <BoardPagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </div>
      </div>

      <StoryRail />
    </div>
  );
}
