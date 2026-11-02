import { ChevronLeft, ExternalLink, Megaphone, Newspaper } from 'lucide-react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import FileImage from '@/components/FileImage';
import PostBody from '@/components/PostBody';
import SharePanel from '@/components/SharePanel';
import { PATHS } from '@/routes/paths';
import { publicFileUrl } from '@/utils/fileUrl';
import { formatDate, formatMonthDayDot } from '@/utils/formatDate';
import NewsCategoryBadge from './NewsCategoryBadge';
import NewsThumb from './NewsThumb';
import { getPressName, hasSummary, NEWS_SRC_ADMIN } from './newsCodes';
import { useNewsList } from './queries';

const LATEST_SIZE = 5;

export default function NewsDetail({ news }) {
  const { state } = useLocation();
  const { data: latest } = useNewsList({ page: 1, size: LATEST_SIZE });
  const isAdmin = news.newsSrcCd === NEWS_SRC_ADMIN;
  const listTo = `${PATHS.COMMUNITY_NEWS}${state?.listSearch ?? ''}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10">
      <article className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-[22px] max-[760px]:pb-5">
        <NewsCategoryBadge news={news} />
        <h2 className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.24px] text-[#1a3234] max-[760px]:text-xl">
          {news.newsTtl}
        </h2>
        <p className="mt-4 flex flex-wrap items-center gap-2 border-b border-[#e2e7e7] pb-6 text-sm text-[#667374] max-[760px]:pb-5">
          {isAdmin ? (
            <Megaphone size={18} className="text-[#667374]" />
          ) : (
            <Newspaper size={18} className="text-[#667374]" />
          )}
          <b className="text-base leading-normal font-semibold text-[#1a3234]">
            {getPressName(news)}
          </b>
          <i className="text-[#b9c4c4] not-italic">·</i>
          <time>{formatDate(news.pblcnDt)}</time>
        </p>

        {isAdmin ? (
          <PostBody content={news.newsCn}>
            {news.atchFileSn != null && (
              <FileImage
                src={publicFileUrl(news.atchFileSn)}
                alt="첨부 이미지"
                className="mx-auto mb-5 block h-auto max-w-full rounded-[10px]"
                fallback={<></>}
              />
            )}
          </PostBody>
        ) : (
          <>
            <figure className="mt-6">
              <NewsThumb
                src={news.thmbUrlPath}
                iconSize={56}
                natural
                className="aspect-[16/9] w-full rounded-[14px]"
              />
              <figcaption className="mt-1.5 text-sm text-[#667374]">
                사진 출처: {news.srcPressNm}
              </figcaption>
            </figure>
            {hasSummary(news) && (
              <p className="mt-6 border-l-[3px] border-[#22744a] pl-4 text-lg leading-[1.6] text-[#1a3234]">
                <span className="mb-1.5 block text-sm font-semibold text-[#22744a]">
                  기사 요약
                </span>
                {news.newsCn}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e2e7e7] bg-[#f4f6f6] px-6 py-5">
              <p className="text-sm leading-normal text-[#3d4a4b]">
                <b className="block text-base text-[#1a3234]">
                  기사 전문은 {news.srcPressNm}에서 볼 수 있어요
                </b>
              </p>
              <a
                href={news.orgtxtPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-md bg-[#285a5c] px-4 text-base font-semibold text-white"
              >
                원문 기사 보기
                <ExternalLink size={16} />
                <span className="sr-only">(새 창)</span>
              </a>
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[#e2e7e7] pt-6">
          <Link
            to={listTo}
            className="inline-flex items-center gap-1.5 text-base leading-normal font-medium text-[#566465]"
          >
            <ChevronLeft size={14} />
            목록으로
          </Link>
          <SharePanel title={news.newsTtl} />
        </div>
      </article>

      <aside aria-label="펫뉴스 더 보기" className="flex flex-col gap-10">
        <section aria-labelledby="news-latest-title">
          <h2
            id="news-latest-title"
            className="pb-3 text-lg leading-[1.4] font-bold text-[#1a3234]"
          >
            펫뉴스 최신 기사
          </h2>
          <ul>
            {latest?.content.map((item) => (
              <li
                key={item.newsSn}
                className="border-t border-[#e2e7e7] first:border-t-0"
              >
                <Link
                  to={generatePath(PATHS.COMMUNITY_NEWS_DETAIL, {
                    newsSn: item.newsSn,
                  })}
                  state={state}
                  className="group flex flex-col gap-0.5 py-3"
                >
                  <span className="truncate text-base leading-[1.6] text-[#3d4a4b] group-hover:text-[#285a5c]">
                    {item.newsTtl}
                  </span>
                  <time className="text-sm text-[#667374]">
                    {formatMonthDayDot(item.pblcnDt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
