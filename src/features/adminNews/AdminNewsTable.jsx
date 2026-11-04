import { BTN_SECONDARY } from '@/components/buttonStyles';
import Select from '@/components/Select';
import Toggle from '@/components/Toggle';
import {
  getCategoryName,
  getSourceLabel,
  isAdminNews,
  NEWS_CATEGORIES,
} from './newsLabels';

const COLUMNS = ['출처', '카테고리', '제목', '사용', '등록일', '관리'];

const CATEGORY_OPTIONS = NEWS_CATEGORIES.map(({ code, name }) => ({
  value: code,
  label: name,
}));

/**
 * [펫뉴스 목록 표]
 * - 사용 스위치: 끄면 회원 화면에서 숨김
 * - 관리 칸: 수집 기사는 카테고리 변경, 관리자 등록은 [수정]
 * - 좁은 폭에서는 표 안에서 가로 스크롤
 */
export default function AdminNewsTable({
  newsList,
  pendingSn,
  onToggleUse,
  onChangeCategory,
  onEdit,
}) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[760px] table-fixed text-left text-base">
        <colgroup>
          <col className="w-[132px]" />
          <col className="w-[88px]" />
          <col />
          <col className="w-[120px]" />
          <col className="w-[120px]" />
          <col className="w-[132px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {newsList.map((news) => {
            const isPending = pendingSn === news.newsSn;
            return (
              <tr
                key={news.newsSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className="truncate px-4 py-2">{getSourceLabel(news)}</td>
                <td className="truncate px-4 py-2">
                  {getCategoryName(news.newsClsfCd)}
                </td>
                <td
                  className={`truncate px-4 py-2 ${news.useYn ? '' : 'text-subtle'}`}
                >
                  {news.newsTtl}
                </td>
                <td className="px-4 py-2">
                  <div className="flex h-10 items-center gap-2">
                    <Toggle
                      checked={news.useYn}
                      label={`${news.newsTtl} 사용`}
                      disabled={isPending}
                      onChange={(next) => onToggleUse(news, next)}
                    />
                    <span
                      className={`text-sm whitespace-nowrap ${news.useYn ? 'text-ink-2' : 'text-subtle'}`}
                    >
                      {news.useYn ? '사용' : '미사용'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap tabular-nums">
                  {news.regDt.slice(0, 10)}
                </td>
                <td className="px-4 py-2">
                  {isAdminNews(news) ? (
                    <button
                      type="button"
                      className={BTN_SECONDARY}
                      disabled={isPending}
                      onClick={() => onEdit(news)}
                    >
                      수정
                    </button>
                  ) : (
                    <Select
                      label={`${news.newsTtl} 카테고리`}
                      value={news.newsClsfCd}
                      options={CATEGORY_OPTIONS}
                      onChange={(next) => {
                        if (!isPending && next !== news.newsClsfCd) {
                          onChangeCategory(news, next);
                        }
                      }}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
