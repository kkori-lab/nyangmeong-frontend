import { Megaphone, Newspaper, SearchX } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import {
  BTN_SECONDARY,
  FILTER_CHIP,
  FILTER_CHIP_ON,
} from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import LoadMore from '@/components/LoadMore';
import { THUMB_COLS } from '@/constants/listLayout';
import SearchInput from '@/components/SearchInput';
import useSearchDraft from '@/hooks/useSearchDraft';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import NewsCategoryBadge from './NewsCategoryBadge';
import NewsThumb from './NewsThumb';
import {
  getPressName,
  hasSummary,
  NEWS_CATEGORIES,
  NEWS_SRC_ADMIN,
} from './newsCodes';

/**
 * 뉴스 카드 한 장
 * - 썸네일이 없거나 불러오지 못하면 칸을 접어 제목·요약이 카드 전체 폭을 쓴다(점선 자리 표시 없음)
 * - 요약은 2줄 높이를 늘 차지해(1줄이어도, 없어도) 카드 높이를 맞춘다
 */
function NewsCard({ item, search }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const isAdmin = item.newsSrcCd === NEWS_SRC_ADMIN;
  /** 관리자 글은 첨부 공개 파일, 수집 기사는 썸네일 URL */
  const thumbSrc = isAdmin ? publicFileUrl(item.atchFileSn) : item.thmbUrlPath;
  const hasThumb = Boolean(thumbSrc) && !thumbFailed;
  return (
    <li className="@container">
      <Link
        to={generatePath(PATHS.COMMUNITY_NEWS_DETAIL, {
          newsSn: item.newsSn,
        })}
        state={{ listSearch: search }}
        className={`group grid gap-x-8 gap-y-4 rounded-[14px] border border-line bg-white px-7 py-6 transition hover:border-brand-100 max-[760px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-4 max-[760px]:pt-4 max-[760px]:pb-5 max-[760px]:overflow-hidden ${hasThumb ? THUMB_COLS : 'grid-cols-1'}`}
      >
        <div className="min-w-0 max-[760px]:order-2">
          <NewsCategoryBadge news={item} />
          <h3 className="mt-3 truncate text-lg leading-[1.4] font-semibold tracking-[-0.01em] text-ink group-hover:text-brand-500 max-[760px]:line-clamp-2 max-[760px]:whitespace-normal">
            {item.newsTtl}
          </h3>
          <p className="mt-4 line-clamp-2 min-h-[3.2em] text-base leading-[1.6] text-ink-2 max-[760px]:mt-2 max-[760px]:text-sm">
            {hasSummary(item) ? item.newsCn : ''}
          </p>
        </div>
        {hasThumb && (
          /** 이미지는 칸 안에 absolute로 채워 사진 크기가 카드 높이를 키우지 않고, 칸이 카드 안쪽 높이를 채워 위·아래 여백이 글과 같다 */
          <div className="relative col-start-2 row-span-2 row-start-1 min-h-[150px] w-full max-[760px]:-mx-4 max-[760px]:-mt-4 max-[760px]:rounded-none max-[760px]:border-b max-[760px]:border-line max-[760px]:w-auto max-[760px]:order-1 max-[760px]:col-start-1 max-[760px]:row-span-1 max-[760px]:row-start-auto max-[760px]:aspect-[16/9] max-[760px]:min-h-0">
            <NewsThumb
              src={thumbSrc}
              onError={() => setThumbFailed(true)}
              className="absolute inset-0 h-full w-full max-[760px]:rounded-none"
            />
          </div>
        )}
        <div className="flex items-center gap-x-3 text-sm text-subtle max-[760px]:order-3">
          <span className="inline-flex items-center gap-2 font-semibold text-ink-2">
            {isAdmin ? <Megaphone size={16} /> : <Newspaper size={16} />}
            {getPressName(item)}
          </span>
          <i className="text-line-strong not-italic">·</i>
          <time>{formatDate(item.pblcnDt)}</time>
        </div>
      </Link>
    </li>
  );
}

export default function NewsList({
  news,
  category,
  keyword,
  onCategoryChange,
  onSearch,
  hasNext,
  isFetchingNext,
  onLoadMore,
  onReset,
}) {
  const { input, setInput, commit } = useSearchDraft(keyword);
  const { search } = useLocation();
  const { content } = news;

  const tabClass = (selected) =>
    `${selected ? FILTER_CHIP_ON : FILTER_CHIP} cursor-pointer`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
        <div
          role="tablist"
          aria-label="뉴스 카테고리"
          className="flex gap-2 overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!category}
            onClick={() => onCategoryChange('', commit())}
            className={tabClass(!category)}
          >
            전체
          </button>
          {NEWS_CATEGORIES.map((item) => (
            <button
              key={item.code}
              type="button"
              role="tab"
              aria-selected={category === item.name}
              onClick={() =>
                onCategoryChange(
                  category === item.name ? '' : item.name,
                  commit(),
                )
              }
              className={tabClass(category === item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <SearchInput
          value={input}
          onChange={setInput}
          onSubmit={() => {
            const next = commit();
            if (next !== keyword) onSearch(next);
          }}
          liveDelay={150}
          placeholder="제목 또는 내용 검색"
          className="w-[300px] max-[760px]:w-full"
        />
      </div>

      <div className="min-w-0">
        {content.length === 0 ? (
          <EmptyResult
            icon={<SearchX size={32} aria-hidden="true" />}
            title="해당하는 뉴스가 없어요"
            description="다른 카테고리를 고르거나 검색어를 바꿔 보세요"
          >
            <button
              type="button"
              onClick={() => {
                setInput('');
                onReset();
              }}
              className={BTN_SECONDARY}
            >
              전체 뉴스 보기
            </button>
          </EmptyResult>
        ) : (
          <ul className="flex flex-col gap-3 max-[760px]:gap-3">
            {content.map((item) => (
              <NewsCard key={item.newsSn} item={item} search={search} />
            ))}
          </ul>
        )}

        <LoadMore
          hasNext={hasNext}
          isFetching={isFetchingNext}
          onLoad={onLoadMore}
        />
      </div>
    </div>
  );
}
