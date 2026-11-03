import { ChevronLeft, Megaphone } from 'lucide-react';
import { generatePath, Link } from 'react-router-dom';
import PostBody from '@/components/PostBody';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { useNotices } from './queries';

const LATEST_SIZE = 5;

export default function NoticeDetail({ notice }) {
  const { data: latest } = useNotices({
    page: 1,
    size: LATEST_SIZE,
    latestYn: true,
  });

  return (
    <div className="flex flex-col gap-4">
      <article className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 pt-8 pb-10 max-[760px]:px-5 max-[760px]:pt-6 max-[760px]:pb-8">
        <h2 className="text-2xl leading-[1.35] font-bold tracking-[-0.24px] text-[#1a3234] max-[760px]:text-xl">
          {notice.ntcMttrTtl}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-[#e2e7e7] pb-6">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#e9f2f2] text-[#285a5c]">
            <Megaphone size={18} />
          </span>
          <b className="text-base leading-normal font-medium text-[#1a3234]">
            관리자
          </b>
          <i className="text-sm text-[#b9c4c4] not-italic">·</i>
          <time className="text-sm text-[#667374]">
            {formatDate(notice.regDt)}
          </time>
        </div>

        <PostBody content={notice.ntcMttrCn} />

        <div className="border-t border-[#e2e7e7] pt-[21px]">
          <Link
            to={PATHS.NOTICES}
            className="inline-flex items-center gap-1.5 text-base leading-normal font-medium text-[#566465]"
          >
            <ChevronLeft size={14} />
            목록으로
          </Link>
        </div>
      </article>

      <section className="rounded-[14px] border border-[#e2e7e7] bg-white px-9 py-8 max-[760px]:px-5 max-[760px]:py-6">
        <h3 className="text-lg leading-[1.4] font-bold tracking-[-0.18px] text-[#1a3234]">
          최신 공지
        </h3>
        <ul className="mt-5">
          {latest?.content.map((item) => (
            <li
              key={item.ntcMttrSn}
              className="border-t border-[#e2e7e7] py-[13px] first:border-t-0 first:pt-0 last:pb-0"
            >
              <Link
                to={generatePath(PATHS.NOTICE_DETAIL, {
                  ntcMttrSn: item.ntcMttrSn,
                })}
                className="flex items-center justify-between gap-4"
              >
                <span className="truncate text-base leading-[1.6] text-[#3d4a4b]">
                  {item.ntcMttrTtl}
                </span>
                <span className="shrink-0 text-sm text-[#667374]">
                  {formatDate(item.regDt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
