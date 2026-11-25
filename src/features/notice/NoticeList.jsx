import { SearchX } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link } from 'react-router-dom';
import Badge from '@/components/Badge';
import BoardPagination from '@/components/BoardPagination';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import SearchInput from '@/components/SearchInput';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';

export default function NoticeList({
  notices,
  keyword,
  onSearch,
  onPageChange,
}) {
  const [input, setInput] = useState(keyword);
  const { content, page, size, totalElements, totalPages } = notices;

  const handleReset = () => {
    setInput('');
    onSearch('');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between max-[760px]:mb-4 max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:gap-3">
        <p className="text-base leading-[1.6] text-muted">
          전체 <b className="font-bold text-ink">{totalElements}</b> 건
        </p>
        <SearchInput
          value={input}
          onChange={setInput}
          onSubmit={() => onSearch(input.trim())}
          placeholder="제목 또는 내용 검색"
          className="w-[300px] max-[760px]:w-full"
        />
      </div>

      {content.length === 0 ? (
        <EmptyResult
          icon={keyword && <SearchX size={32} aria-hidden="true" />}
          title={keyword ? '검색 결과가 없어요' : '등록된 공지가 없어요'}
          description={keyword && '검색어를 바꿔 다시 찾아보세요'}
        >
          {keyword && (
            <button
              type="button"
              onClick={handleReset}
              className={BTN_SECONDARY}
            >
              전체 공지 보기
            </button>
          )}
        </EmptyResult>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-line bg-white">
          <div className="flex h-12 items-center border-b border-line bg-surface-2 text-sm font-medium text-muted max-[760px]:hidden">
            <span className="w-[104px] shrink-0 pl-4 text-center">번호</span>
            <span className="flex-1">제목</span>
            <span className="w-[100px] shrink-0 text-center">작성일</span>
            <span className="w-9 shrink-0" />
          </div>
          <ul className="divide-y divide-line">
            {content.map((notice, index) => (
              <li key={notice.ntcMttrSn} className="h-16 max-[760px]:h-auto">
                {/** 좁은 화면: 제목 한 줄 + 작성일 한 줄, 번호 숨김, 고정 공지 배지 유지 */}
                <Link
                  to={generatePath(PATHS.NOTICE_DETAIL, {
                    ntcMttrSn: notice.ntcMttrSn,
                  })}
                  className={`flex h-full items-center hover:bg-surface-2 max-[760px]:flex-wrap max-[760px]:gap-x-3 max-[760px]:gap-y-2 max-[760px]:px-4 max-[760px]:py-3 ${notice.upendFixYn ? 'bg-brand-50 hover:bg-brand-50' : ''}`}
                >
                  <span
                    className={`flex w-[104px] shrink-0 justify-center pl-4 text-sm text-subtle max-[760px]:order-2 max-[760px]:w-auto max-[760px]:pl-0 ${notice.upendFixYn ? '' : 'max-[760px]:hidden'}`}
                  >
                    {notice.upendFixYn ? (
                      <Badge tone="solid">공지</Badge>
                    ) : (
                      // 번호는 DB 고유번호가 아니라 전체 건수 기준 순번(최신이 가장 큼)
                      totalElements - (page - 1) * size - index
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-base leading-normal font-medium text-ink max-[760px]:order-1 max-[760px]:basis-full max-[760px]:flex-none">
                    {notice.ntcMttrTtl}
                  </span>
                  <span className="w-[100px] shrink-0 text-center text-sm text-subtle max-[760px]:order-3 max-[760px]:w-auto">
                    {formatDate(notice.regDt)}
                  </span>
                  <span className="w-9 shrink-0 max-[760px]:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 max-[760px]:mt-8">
        <BoardPagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}
