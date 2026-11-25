import { Inbox } from 'lucide-react';
import { generatePath, Link } from 'react-router-dom';
import BoardPagination from '@/components/BoardPagination';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import EmptyResult from '@/components/EmptyResult';
import UnderlineTabs from '@/components/UnderlineTabs';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { INQUIRY_STATUS, isAnswered } from './api';
import InquiryStatusBadge from './InquiryStatusBadge';

const STATUS_TABS = ['', INQUIRY_STATUS.OPEN, INQUIRY_STATUS.DONE];

/** 탭 id `inquiry-status-<all|0|1|2>`. 탭 패널은 고른 탭의 id, 탭 버튼은 `${id}-tab`(UnderlineTabs) */
const tabId = (name) =>
  `inquiry-status-${name ? STATUS_TABS.indexOf(name) : 'all'}`;

export default function InquiryList({
  inquiries,
  status,
  onStatusChange,
  onPageChange,
}) {
  const { content, page, totalPages } = inquiries;

  return (
    <div>
      <UnderlineTabs
        items={STATUS_TABS.map((name) => ({
          id: tabId(name),
          label: name || '전체',
        }))}
        activeId={tabId(status)}
        onSelect={(id) =>
          onStatusChange(STATUS_TABS.find((name) => tabId(name) === id))
        }
        label="처리 상태"
        className="mb-8 max-[760px]:mb-5"
      />

      <div
        id={tabId(status)}
        role="tabpanel"
        aria-labelledby={`${tabId(status)}-tab`}
      >
        {content.length === 0 ? (
          <EmptyResult
            icon={<Inbox size={32} aria-hidden="true" />}
            title={`${status} 문의가 없어요`}
            description="다른 상태의 문의는 전체에서 볼 수 있어요"
          >
            <button
              type="button"
              onClick={() => onStatusChange('')}
              className={BTN_SECONDARY}
            >
              전체 보기
            </button>
          </EmptyResult>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-line bg-white max-[760px]:rounded-[10px]">
            <div
              aria-hidden="true"
              className="grid h-12 grid-cols-[168px_minmax(0,1fr)_112px_128px] items-center border-b border-line bg-surface-2 px-10 text-sm font-semibold text-muted max-[760px]:hidden"
            >
              <span>문의 유형</span>
              <span className="pl-4">제목</span>
              <span className="text-center">상태</span>
              <span className="text-center">접수일</span>
            </div>
            <ul className="divide-y divide-line">
              {content.map((inquiry) => (
                <li key={inquiry.otoInqrySn}>
                  <Link
                    to={generatePath(PATHS.INQUIRY_DETAIL, {
                      otoInqrySn: inquiry.otoInqrySn,
                    })}
                    className="group grid min-h-16 grid-cols-[168px_minmax(0,1fr)_112px_128px] items-center px-10 hover:bg-surface-2 max-[760px]:min-h-0 max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:gap-x-3 max-[760px]:gap-y-2 max-[760px]:px-5 max-[760px]:py-4"
                  >
                    <span className="min-w-0 truncate pr-4 text-base text-ink-2 max-[760px]:order-1 max-[760px]:pr-0">
                      {inquiry.inqryTypeCdNm}
                    </span>
                    <span className="min-w-0 truncate pr-6 pl-4 text-base leading-[1.3] font-medium text-ink group-hover:text-brand-600 max-[760px]:order-3 max-[760px]:col-span-2 max-[760px]:line-clamp-2 max-[760px]:p-0 max-[760px]:whitespace-normal">
                      {inquiry.inqryTtl}
                    </span>
                    <span className="text-center max-[760px]:order-2 max-[760px]:text-right">
                      <InquiryStatusBadge isAnswered={isAnswered(inquiry)} />
                    </span>
                    <time className="text-center text-sm text-subtle tabular-nums max-[760px]:order-4 max-[760px]:col-span-2 max-[760px]:-mt-1 max-[760px]:text-left">
                      {formatDate(inquiry.regDt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/** 새 문의 작성: 상태 필터 결과와 관계없이 항상 표시 */}
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
