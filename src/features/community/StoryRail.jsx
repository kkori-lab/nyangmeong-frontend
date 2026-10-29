import { ChevronRight, Heart } from 'lucide-react';
import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatWeekdayLong, getDay, getMonth } from '@/utils/formatDate';
import { getPostImageUrl } from './api';
import { useHealthTips, usePopularPhoto, useTodayStory } from './queries';

const CARD_CLASS =
  'rounded-[14px] border border-[#e2e7e7] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(26,50,52,0.06)] max-[1100px]:mt-10 max-[760px]:[&+section]:mt-4';

const detailPath = (pstSn) =>
  generatePath(PATHS.COMMUNITY_POST_DETAIL, { pstSn });

/** 「10월 9일 금요일」 */
const formatStoryDate = (ymd) =>
  `${getMonth(ymd)}월 ${getDay(ymd)}일 ${formatWeekdayLong(ymd)}`;

/** 오른쪽 레일: 오늘의 한마디 · 인기 포토 · 오늘의 건강 팁 (1100px 이하는 목록 아래) */
export default function StoryRail() {
  const { data: story } = useTodayStory();
  const { data: photo } = usePopularPhoto();
  const { data: tips } = useHealthTips();

  return (
    <aside
      aria-label="오늘의 콘텐츠"
      className="flex min-w-0 flex-col gap-4 max-[1100px]:contents"
    >
      {story && (
        <div className="rounded-[14px] bg-[#e9f2f2] px-5 py-5 max-[1100px]:order-first max-[1100px]:col-span-full max-[1100px]:mb-6">
          <p className="text-sm font-semibold text-[#285a5c]">오늘의 한마디</p>
          <q className="mt-2 block text-base leading-[1.6] text-[#1a3234] [quotes:none]">
            {story.cmtryCn}
          </q>
          <small className="mt-3 block text-sm text-[#667374]">
            {formatStoryDate(story.cmtryCrtrYmd)}
          </small>
        </div>
      )}

      {photo?.imgs.length > 0 && (
        <section aria-labelledby="post-photo-title" className={CARD_CLASS}>
          <div className="flex items-baseline justify-between">
            <h2
              id="post-photo-title"
              className="text-lg font-bold text-[#1a3234]"
            >
              인기 포토
            </h2>
            <span className="text-sm text-[#667374]">이번 주</span>
          </div>
          <Link to={detailPath(photo.pstSn)} className="group mt-3 block">
            <img
              src={getPostImageUrl(photo.imgs[0].atchFileSn)}
              alt=""
              className="aspect-[4/3] w-full rounded-[10px] bg-[#f4f6f6] object-cover"
            />
            <span className="mt-2.5 block truncate text-base font-semibold text-[#1a3234] group-hover:text-[#285a5c]">
              {photo.pstTtl}
            </span>
            <span className="mt-1 flex items-center justify-between text-sm text-[#667374]">
              <span>{photo.mbrNcnm}</span>
              <span className="inline-flex items-center gap-1">
                <Heart size={14} aria-hidden="true" />
                <span className="sr-only">좋아요</span>
                {photo.rcmdtnCnt}
              </span>
            </span>
          </Link>
        </section>
      )}

      <section aria-labelledby="post-tip-title" className={CARD_CLASS}>
        <h2 id="post-tip-title" className="text-lg font-bold text-[#1a3234]">
          오늘의 건강 팁
        </h2>
        <ul className="mt-2">
          {tips?.map((tip) => (
            <li
              key={tip.pstSn}
              className="border-t border-[#e2e7e7] first:border-t-0"
            >
              <Link to={detailPath(tip.pstSn)} className="group block py-3">
                <span className="block truncate text-base font-semibold text-[#1a3234] group-hover:text-[#285a5c]">
                  {tip.pstTtl}
                </span>
                <span className="mt-0.5 line-clamp-2 text-sm leading-normal text-[#566465]">
                  {tip.pstCn.split('\n')[0]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to={PATHS.HEALTH}
          className="mt-3 flex h-10 items-center justify-center gap-1 rounded-md bg-[#e9f2f2] text-base font-semibold text-[#1e4a4c] hover:bg-[#dcebeb]"
        >
          내 펫 건강 체크하기
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </aside>
  );
}
