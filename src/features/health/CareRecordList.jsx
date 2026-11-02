import { useState } from 'react';
import Icon from '@/components/Icon';
import { formatMonthDayDot, getTodayYmd } from '@/utils/formatDate';

const PAGE_SIZE = 10;

// 기록 내용(FN-HLT-003-12). 토탈 케어리스트 카드 안에 놓는다. 아이콘을 누르면 그날 완료 기록이 취소되고, 마우스를 올리면 아이콘이 ✕로 바뀐다
// 날짜 10줄씩 페이지로 나눠 보여 준다. 기록을 취소해 줄어들면 마지막 페이지로 당겨 온다
// regularSns: 정기관리 항목 번호(완료 기록 응답에 구역이 없어 R 표시에 쓴다)
export default function CareRecordList({ records, regularSns, onCancel }) {
  const [page, setPage] = useState(1);
  const todayYmd = getTodayYmd();
  const dates = [...new Set(records.map((record) => record.cmptnYmd))]
    .sort()
    .reverse();
  const pageCount = Math.max(1, Math.ceil(dates.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageDates = dates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const pagerClass =
    'grid h-9 min-w-9 place-items-center rounded-full px-2 font-medium';

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-baseline gap-3 border-b-2 border-[#b9c4c4] pb-2">
        <h3 className="text-lg font-semibold text-[#1a3234]">기록 내용</h3>
        <span className="text-[#667374]">일상관리·정기관리 완료 기록 통합</span>
      </div>
      {dates.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#b9c4c4]">
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <span className="grid size-10 place-items-center rounded-full bg-[#f4f6f6] text-[#667374]">
              <Icon name="task_alt" />
            </span>
            <p className="text-sm font-semibold text-[#1a3234]">
              아직 완료한 케어가 없어요
            </p>
            <p className="text-sm text-[#566465]">
              위 케어 항목을 누르면 완료로 표시되고 여기에 날짜별로 쌓여요
            </p>
          </div>
        </div>
      ) : (
        <ul>
          {pageDates.map((ymd) => (
            <li
              key={ymd}
              className="flex items-start gap-3.5 border-b border-[#edf1f1] py-3.5 last:border-b-0"
            >
              <span className="w-[88px] flex-none text-[#3d4a4b] tabular-nums">
                {ymd === todayYmd
                  ? `오늘 · ${formatMonthDayDot(ymd)}`
                  : formatMonthDayDot(ymd)}
              </span>
              <span className="flex flex-wrap gap-x-3 gap-y-2">
                {records
                  .filter((record) => record.cmptnYmd === ymd)
                  .map((record) => (
                    <button
                      key={record.careCmptnHstrySn}
                      type="button"
                      aria-label={`${formatMonthDayDot(ymd)} ${record.careArtclNm} 완료 기록 취소`}
                      className="group inline-flex items-center gap-1 text-[#1a3234]"
                      onClick={() => onCancel(record)}
                    >
                      <span className="relative grid size-7 place-items-center rounded-full bg-[#ebf0f0] text-[#566465] group-hover:bg-[#fbeeec] group-hover:text-[#b4473a]">
                        <Icon
                          name={record.rprsIconId}
                          className="text-[18px] group-hover:hidden"
                        />
                        <Icon
                          name="close"
                          className="hidden text-[18px] group-hover:inline-flex"
                        />
                        {regularSns.has(record.careArtclSn) && (
                          <span
                            aria-hidden="true"
                            className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-[#5f49b0] text-[13px] leading-none font-semibold text-white"
                          >
                            R
                          </span>
                        )}
                      </span>
                      {record.careArtclNm}
                    </button>
                  ))}
              </span>
            </li>
          ))}
        </ul>
      )}
      {pageCount > 1 && (
        <nav
          aria-label="기록 내용 페이지"
          className="mt-6 flex items-center justify-center gap-1"
        >
          <button
            type="button"
            aria-label="이전 페이지"
            disabled={currentPage === 1}
            className={`${pagerClass} text-[#3d4a4b] hover:bg-[#ebf0f0] disabled:pointer-events-none disabled:text-[#b9c4c4]`}
            onClick={() => setPage(currentPage - 1)}
          >
            <Icon name="chevron_left" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (number) => (
              <button
                key={number}
                type="button"
                aria-current={number === currentPage ? 'page' : undefined}
                className={`${pagerClass} ${
                  number === currentPage
                    ? 'bg-[#285a5c] font-bold text-white'
                    : 'text-[#3d4a4b] hover:bg-[#ebf0f0]'
                }`}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="다음 페이지"
            disabled={currentPage === pageCount}
            className={`${pagerClass} text-[#3d4a4b] hover:bg-[#ebf0f0] disabled:pointer-events-none disabled:text-[#b9c4c4]`}
            onClick={() => setPage(currentPage + 1)}
          >
            <Icon name="chevron_right" />
          </button>
        </nav>
      )}
    </div>
  );
}
