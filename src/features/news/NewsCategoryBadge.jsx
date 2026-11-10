import Badge from '@/components/Badge';
import { getCategoryName, NEWS_SRC_ADMIN } from './newsCodes';

const CATEGORY_TONES = {
  건강: 'bg-[#e6f4ec] text-[#22744a] ring-1 ring-current/10 ring-inset',
  생활: 'bg-[#fcf1df] text-[#9a5c0c] ring-1 ring-current/10 ring-inset',
  정책: 'bg-[#eaf1fc] text-[#2d5fb8] ring-1 ring-current/10 ring-inset',
  여행: 'bg-[#efecfa] text-[#5f49b0] ring-1 ring-current/10 ring-inset',
};

/** 카테고리 배지 + 관리자 등록 뉴스면 「관리자 등록」 배지 */
export default function NewsCategoryBadge({ news }) {
  const name = getCategoryName(news.newsClsfCd);
  return (
    <div className="flex flex-wrap gap-1.5">
      {name && (
        <span
          className={`inline-flex h-6 items-center rounded-full px-2.5 pt-[1.5px] text-[13px] leading-none font-semibold whitespace-nowrap ${CATEGORY_TONES[name]}`}
        >
          {name}
        </span>
      )}
      {news.newsSrcCd === NEWS_SRC_ADMIN && (
        <Badge tone="brand" bordered>
          관리자 등록
        </Badge>
      )}
    </div>
  );
}
