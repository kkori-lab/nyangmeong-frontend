import { useState } from 'react';
import BoardPagination from '@/components/BoardPagination';
import { isForbiddenError } from '@/utils/isForbiddenError';
import { OCR_SOURCES } from './processingLabels';
import ProcessingFilter from './ProcessingFilter';
import ProcessingListError from './ProcessingListError';
import ProcessingSkeleton from './ProcessingSkeleton';
import ProcessingStatCards from './ProcessingStatCards';
import { useAdminReceipts, useOcrStatuses } from './queries';
import ReceiptImageModal from './ReceiptImageModal';
import ReceiptTable from './ReceiptTable';

const PAGE_SIZE = 20;

/** 필터 칸 이름(URL 쿼리와 같다) */
const FILTER_NAMES = ['fromYmd', 'toYmd', 'ocrDmndSrcCd', 'ocrPrcsSttsCd'];

/** 값이 있는 칸만 남긴 객체 */
const pickFilled = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/** 실패율(소수 첫째 자리) */
const formatFailRate = (failCnt, totCnt) =>
  `${totCnt ? ((failCnt / totCnt) * 100).toFixed(1) : '0.0'}%`;

/**
 * [영수증 OCR 현황 탭]
 * - 기간·출처 기준 건수 카드 + 상태까지 건 목록, [원본 보기] 모달
 * - params는 URL 쿼리, 바꾸면 onParamsChange
 */
export default function OcrStatusPanel({
  params,
  onParamsChange,
  renderForbidden,
}) {
  const [viewing, setViewing] = useState(null);

  const page = Number(params.page) || 1;
  const filter = Object.fromEntries(
    FILTER_NAMES.map((name) => [name, params[name] ?? '']),
  );

  const receipts = useAdminReceipts({
    ...pickFilled(filter),
    page,
    size: PAGE_SIZE,
  });
  const statuses = useOcrStatuses();

  const handleSearch = (nextFilter) => onParamsChange(pickFilled(nextFilter));
  const handlePageChange = (nextPage) =>
    onParamsChange({ ...pickFilled(filter), page: nextPage });

  if (receipts.isPending || statuses.isPending) {
    return (
      <ProcessingSkeleton
        filterClass="h-10 w-full max-w-[820px] max-[760px]:h-[184px]"
        cardCount={5}
        cardGridClass="min-[761px]:grid-cols-5"
        cardClass="h-[106px]"
        tableClass="h-[1105px]"
      />
    );
  }
  if (isForbiddenError(receipts.error)) {
    return renderForbidden(receipts.error);
  }

  const summary = receipts.data?.summary;

  return (
    <>
      <ProcessingFilter
        key={JSON.stringify(filter)}
        filter={filter}
        selects={[
          { name: 'ocrDmndSrcCd', label: '출처', codes: OCR_SOURCES },
          { name: 'ocrPrcsSttsCd', label: '상태', codes: statuses.data },
        ]}
        onSearch={handleSearch}
      />
      {receipts.isError ? (
        <ProcessingListError
          message="영수증 OCR 현황을 불러오지 못했어요."
          onRetry={() => receipts.refetch()}
        />
      ) : (
        <>
          <ProcessingStatCards
            className="min-[761px]:grid-cols-5"
            items={[
              { key: 'tot', label: '요청', value: summary.totCnt },
              { key: 'scs', label: '성공', value: summary.scsCnt },
              {
                key: 'fail',
                label: '인식 실패',
                value: summary.failCnt,
                note: `실패율 ${formatFailRate(summary.failCnt, summary.totCnt)}`,
                isDanger: summary.failCnt > 0,
              },
              { key: 'prcs', label: '처리 중', value: summary.prcsCnt },
              { key: 'err', label: '일시 오류', value: summary.errCnt },
            ]}
          />
          {receipts.data.content.length === 0 ? (
            <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
              영수증 OCR 요청이 없어요
            </p>
          ) : (
            <>
              <ReceiptTable
                receipts={receipts.data.content}
                statuses={statuses.data}
                onOpenImage={setViewing}
              />
              <p className="mt-3 mb-2 text-sm text-subtle">
                총 {receipts.data.totalElements.toLocaleString()}건 ·{' '}
                {PAGE_SIZE}건씩
              </p>
              <BoardPagination
                page={page}
                totalPages={receipts.data.totalPages}
                onChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
      {viewing && (
        <ReceiptImageModal receipt={viewing} onClose={() => setViewing(null)} />
      )}
    </>
  );
}
