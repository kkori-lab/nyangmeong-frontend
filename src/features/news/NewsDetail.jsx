import { ExternalLink, Megaphone, Newspaper } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useLocation } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import FileImage from '@/components/FileImage';
import PostBody from '@/components/PostBody';
import SharePanel from '@/components/SharePanel';
import { PATHS } from '@/routes/paths';
import { publicFileUrl } from '@/utils/fileUrl';
import { formatDate, formatMonthDayDot } from '@/utils/formatDate';
import { LIST_RAIL_COLS } from '@/constants/listLayout';
import NewsCategoryBadge from './NewsCategoryBadge';
import NewsThumb from './NewsThumb';
import { getPressName, hasSummary, NEWS_SRC_ADMIN } from './newsCodes';
import { useNewsList } from './queries';

const LATEST_SIZE = 5;

export default function NewsDetail({ news }) {
  const { state } = useLocation();
  const { data: latest } = useNewsList({ page: 1, size: LATEST_SIZE });
  const [photoFailed, setPhotoFailed] = useState(false);
  const isAdmin = news.newsSrcCd === NEWS_SRC_ADMIN;

  return (
    <div
      className={`grid ${LIST_RAIL_COLS} items-start gap-8 max-[1100px]:grid-cols-1 max-[1100px]:gap-10`}
    >
      <article className="rounded-[14px] border border-line bg-white px-9 pt-8 pb-7 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-5">
        <NewsCategoryBadge news={news} />
        <h2 className="mt-3 text-2xl leading-[1.35] font-bold tracking-[-0.01em] text-ink max-[760px]:text-lg">
          {news.newsTtl}
        </h2>
        <p className="mt-4 flex flex-wrap items-center gap-2 border-b border-line pb-6 text-sm text-subtle max-[760px]:pb-5">
          {isAdmin ? (
            <Megaphone size={18} className="text-subtle" />
          ) : (
            <Newspaper size={18} className="text-subtle" />
          )}
          <b className="text-base leading-normal font-semibold text-ink">
            {getPressName(news)}
          </b>
          <i className="text-line-strong not-italic">·</i>
          <time>{formatDate(news.pblcnDt)}</time>
        </p>

        {isAdmin ? (
          <PostBody content={news.newsCn} mediaFirst>
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
            {/* 사진이 없거나 불러오지 못하면 사진과 출처 캡션을 함께 숨긴다 */}
            {news.thmbUrlPath && !photoFailed && (
              <figure className="mt-6">
                <NewsThumb
                  src={news.thmbUrlPath}
                  natural
                  onError={() => setPhotoFailed(true)}
                />
                <figcaption className="mt-2 text-sm text-subtle">
                  사진 출처: {news.srcPressNm}
                </figcaption>
              </figure>
            )}
            {hasSummary(news) && (
              <p className="mt-6 border-l-[3px] border-tone-green-fg pl-4 text-lg leading-[1.6] text-ink">
                <span className="mb-2 block text-sm font-semibold text-tone-green-fg">
                  기사 요약
                </span>
                {news.newsCn}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-6 py-5">
              <p className="text-sm leading-normal text-ink-2">
                <b className="block text-base text-ink">
                  기사 전문은 {news.srcPressNm}에서 볼 수 있어요
                </b>
              </p>
              <a
                href={news.orgtxtPath}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_PRIMARY} min-w-[140px]`}
              >
                원문 기사 보기
                <ExternalLink size={16} />
                <span className="sr-only">(새 창)</span>
              </a>
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-start border-t border-line pt-6">
          <SharePanel title={news.newsTtl} />
        </div>
      </article>

      <aside aria-label="펫뉴스 더 보기" className="flex flex-col gap-10">
        <section aria-labelledby="news-latest-title">
          <h2
            id="news-latest-title"
            className="pb-3 text-lg leading-[1.4] font-bold text-ink"
          >
            펫뉴스 최신 기사
          </h2>
          <ul>
            {latest?.content.map((item) => (
              <li
                key={item.newsSn}
                className="border-t border-line first:border-t-0"
              >
                <Link
                  to={generatePath(PATHS.COMMUNITY_NEWS_DETAIL, {
                    newsSn: item.newsSn,
                  })}
                  state={state}
                  className="group flex flex-col gap-1 py-3"
                >
                  <span className="truncate text-base leading-[1.6] text-ink-2 group-hover:text-brand-500">
                    {item.newsTtl}
                  </span>
                  <time className="text-sm text-subtle">
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
