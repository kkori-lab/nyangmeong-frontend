import { Heart, MessageCircle, Pencil, SearchX, User } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import DropdownSelect from '@/components/DropdownSelect';
import EmptyResult from '@/components/EmptyResult';
import SearchInput from '@/components/SearchInput';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import PostBadges from './PostBadges';
import { POST_BOARDS } from './postCodes';

const SORT_OPTIONS = [
  { value: 'new', label: '최신순' },
  { value: 'hot', label: '인기순' },
];

export default function PostList({
  posts,
  board,
  sort,
  keyword,
  onBoardChange,
  onSortChange,
  onSearch,
  onPageChange,
  onReset,
}) {
  const [input, setInput] = useState(keyword);
  const { search } = useLocation();
  const { content, page, totalPages } = posts;

  const tabClass = (selected) =>
    `h-14 shrink-0 cursor-pointer px-4 text-base leading-none whitespace-nowrap max-[760px]:h-12 ${selected ? 'border-b-2 border-[#285a5c] font-bold text-[#1a3234]' : 'font-medium text-[#566465] hover:text-[#1a3234]'}`;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3 border-b border-[#d3dae2] max-[760px]:flex-col max-[760px]:items-stretch">
        <div role="tablist" aria-label="게시판 구분" className="flex">
          <button
            type="button"
            role="tab"
            aria-selected={!board}
            onClick={() => onBoardChange('')}
            className={tabClass(!board)}
          >
            전체
          </button>
          {POST_BOARDS.map((item) => (
            <button
              key={item.code}
              type="button"
              role="tab"
              aria-selected={board === item.name}
              onClick={() => onBoardChange(item.name)}
              className={tabClass(board === item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="mb-3 flex items-center gap-2 max-[760px]:flex-wrap">
          <DropdownSelect
            label="정렬 기준"
            value={sort}
            options={SORT_OPTIONS}
            onChange={onSortChange}
            className="w-[120px]"
          />
          <SearchInput
            value={input}
            onChange={setInput}
            onSubmit={() => onSearch(input.trim())}
            placeholder="제목 또는 내용 검색"
            className="w-[260px] max-[760px]:w-full max-[760px]:flex-1"
          />
        </div>
      </div>

      {content.length === 0 ? (
        <EmptyResult
          icon={<SearchX size={32} aria-hidden="true" />}
          title="검색 결과가 없어요"
          description="다른 단어로 검색하거나 필터를 바꿔 보세요"
        >
          <button
            type="button"
            onClick={() => {
              setInput('');
              onReset();
            }}
            className="h-9 cursor-pointer rounded-md border border-[#e2e7e7] bg-white px-3 text-sm font-medium text-[#1a3234] hover:bg-[#f4f6f6]"
          >
            전체 글 보기
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
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e9f2f2] text-[#285a5c]"
                    >
                      <User size={14} />
                    </span>
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

      <div className="flex justify-end">
        <Link to={PATHS.COMMUNITY_POST_NEW} className={BTN_PRIMARY}>
          <Pencil size={16} aria-hidden="true" />
          글쓰기
        </Link>
      </div>
      <BoardPagination
        page={page}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </div>
  );
}
