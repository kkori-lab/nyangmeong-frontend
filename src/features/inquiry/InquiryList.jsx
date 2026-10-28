import { Inbox } from 'lucide-react';
import { generatePath, Link } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { INQUIRY_STATUS, isAnswered } from './api';
import InquiryStatusBadge from './InquiryStatusBadge';

const STATUS_TABS = ['', INQUIRY_STATUS.OPEN, INQUIRY_STATUS.DONE];

export default function InquiryList({
  inquiries,
  status,
  onStatusChange,
  onPageChange,
}) {
  const { content, page, totalPages } = inquiries;

  return (
    <div>
      <div className="mb-7 border-b border-[#b9c4c4] max-[760px]:mb-5">
        <div role="tablist" aria-label="처리 상태" className="flex">
          {STATUS_TABS.map((name) => {
            const isSelected = name === status;
            return (
              <button
                key={name || 'all'}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onStatusChange(name)}
                className={`relative inline-flex h-[72px] shrink-0 cursor-pointer items-center px-4 text-lg whitespace-nowrap max-[760px]:h-12 ${isSelected ? 'font-bold text-[#2f6f57] after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-sm after:bg-[#2f6f57]' : 'font-semibold text-[#566465] hover:text-[#1a3234]'}`}
              >
                {name || '전체'}
              </button>
            );
          })}
        </div>
      </div>

      {content.length === 0 ? (
        <EmptyResult
          icon={<Inbox size={32} aria-hidden="true" />}
          title={`${status} 문의가 없어요`}
          description="다른 상태의 문의는 전체에서 볼 수 있어요"
        >
          <button
            type="button"
            onClick={() => onStatusChange('')}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[#e2e7e7] bg-white px-3 text-base font-semibold text-[#1a3234] hover:border-[#b9c4c4] hover:bg-[#f4f6f6]"
          >
            전체 보기
          </button>
        </EmptyResult>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-[#e2e7e7] bg-white max-[760px]:rounded-[10px]">
          <div
            aria-hidden="true"
            className="grid h-12 grid-cols-[168px_minmax(0,1fr)_112px_128px] items-center border-b border-[#e2e7e7] bg-[#f4f6f6] px-10 text-sm font-semibold text-[#566465] max-[760px]:hidden"
          >
            <span>문의 유형</span>
            <span className="pl-4">제목</span>
            <span className="text-center">상태</span>
            <span className="text-center">접수일</span>
          </div>
          <ul className="divide-y divide-[#e2e7e7]">
            {content.map((inquiry) => (
              <li key={inquiry.otoInqrySn}>
                <Link
                  to={generatePath(PATHS.INQUIRY_DETAIL, {
                    otoInqrySn: inquiry.otoInqrySn,
                  })}
                  className="group grid min-h-16 grid-cols-[168px_minmax(0,1fr)_112px_128px] items-center px-10 hover:bg-[#f4f6f6] max-[760px]:min-h-0 max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-x-3 max-[760px]:gap-y-2 max-[760px]:px-[18px] max-[760px]:py-4"
                >
                  <span className="min-w-0 truncate pr-4 text-base text-[#3d4a4b] max-[760px]:order-1 max-[760px]:pr-0">
                    {inquiry.inqryTypeCdNm}
                  </span>
                  <span className="min-w-0 truncate pr-6 pl-4 text-base leading-[1.3] font-medium text-[#1a3234] group-hover:text-[#1e4a4c] max-[760px]:order-3 max-[760px]:col-span-2 max-[760px]:line-clamp-2 max-[760px]:p-0 max-[760px]:whitespace-normal">
                    {inquiry.inqryTtl}
                  </span>
                  <span className="text-center max-[760px]:order-2 max-[760px]:text-right">
                    <InquiryStatusBadge isAnswered={isAnswered(inquiry)} />
                  </span>
                  <time className="text-center text-sm text-[#667374] tabular-nums max-[760px]:order-4 max-[760px]:col-span-2 max-[760px]:-mt-1 max-[760px]:text-left">
                    {formatDate(inquiry.regDt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/** 새 문의 작성: 상태 필터 결과와 관계없이 항상 보인다 */}
      <div className="mt-5 flex justify-end max-[760px]:mt-5">
        <Link
          to={PATHS.INQUIRY_NEW}
          className={`${BTN_PRIMARY} min-w-[120px] max-[760px]:h-12 max-[760px]:w-full`}
        >
          새 문의 작성
        </Link>
      </div>

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
