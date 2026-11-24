import { ChevronDown, Receipt } from 'lucide-react';
import { useState } from 'react';
import EmptyResult from '@/components/EmptyResult';
import LoadError from '@/components/LoadError';
import MonthNav from '@/components/MonthNav';
import MonthPicker from '@/components/MonthPicker';
import SkeletonCard from '@/components/SkeletonCard';
import { formatYm, getCurrentYm, shiftYm } from '@/utils/yearMonth';
import { usePointHistory, usePointMonths } from '../queries';
import { PNT_DLNG_TYPE } from '../shared/pointCodes';
import { formatSignedPoint } from '../shared/pointFormat';
import { CARD, CARD_HEAD, CARD_TITLE } from '../shared/pointStyles';

/** 앱은 안쪽 스크롤 없이 이만큼만 보이고 나머지는 [더보기] */
const MOBILE_VISIBLE = 5;

/** 내용: 관리자 조정은 고정 문구, 검진기록은 "이름 · 유형"(서버 메모가 이름뿐), 그 밖은 메모, 없으면 유형 이름 */
const getTitle = (item) => {
  if (item.pntDlngTypeCd === PNT_DLNG_TYPE.ADMIN_ADJUST) return '관리자 조정';
  if (item.pntDlngTypeCd === PNT_DLNG_TYPE.CHECKUP && item.memoCn)
    return `${item.memoCn} · ${item.pntDlngTypeCdNm}`;
  return item.memoCn ?? item.pntDlngTypeCdNm;
};

const sumBy = (items, predicate) =>
  items.filter(predicate).reduce((sum, item) => sum + item.dlngPnt, 0);

export default function PointHistory() {
  const maxYm = getCurrentYm();
  const [ym, setYm] = useState(maxYm);
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending, isError, refetch } = usePointHistory(ym);

  const { data: months } = usePointMonths();

  const changeYm = (nextYm) => {
    setYm(nextYm);
    setIsOpen(false);
  };

  if (isPending)
    return (
      <div aria-busy="true">
        <SkeletonCard className="h-[476px] min-[1100px]:h-[839px]" />
      </div>
    );
  if (isError && !data)
    return (
      <LoadError
        message="포인트 내역을 불러오지 못했어요"
        onRetry={refetch}
        className="rounded-card border border-line bg-white py-16"
      />
    );
  if (!data) return null;

  const moreCount = data.length - MOBILE_VISIBLE;
  const earnTotal = sumBy(data, (item) => item.dlngPnt > 0);
  const useTotal = sumBy(data, (item) => item.dlngPnt < 0);

  return (
    <section
      id="point-history"
      aria-labelledby="point-history-title"
      className={`${CARD} flex scroll-mt-20 flex-col`}
    >
      <div className={CARD_HEAD}>
        <h2 id="point-history-title" className={CARD_TITLE}>
          <Receipt className="size-5 text-brand-500" aria-hidden="true" />
          포인트 내역
        </h2>
        {/* 모바일은 헤더가 세로로 쌓이므로 가운데에 둬서 선택 창이 화면 밖으로 안 나가게 한다 */}
        <div className="flex max-[760px]:w-full max-[760px]:justify-center">
          <MonthNav
            onPrev={() => changeYm(shiftYm(ym, -1))}
            onNext={() => changeYm(shiftYm(ym, 1))}
            isNextDisabled={ym >= maxYm}
          >
            <MonthPicker
              ym={ym}
              maxYm={maxYm}
              enabledYms={months ?? []}
              emptyNotice="포인트 내역이 없는 달은 선택할 수 없어요"
              onSelect={changeYm}
            />
          </MonthNav>
        </div>
      </div>
      <div className="grid grid-cols-2 border-b border-line-soft text-muted">
        <div className="flex items-center justify-between px-6 py-3">
          <span>적립</span>
          <b className="text-brand-600 tabular-nums">
            {formatSignedPoint(earnTotal)}
          </b>
        </div>
        <div className="flex items-center justify-between border-l border-line-soft px-6 py-3">
          <span>사용</span>
          <b className="text-ink tabular-nums">{formatSignedPoint(useTotal)}</b>
        </div>
      </div>
      {/* PC: 카드 높이를 채우고 넘치면 영역 안에서 스크롤 / 앱: 스크롤 없이 5건 + 더보기 */}
      <ul
        tabIndex={0}
        aria-label={`${formatYm(ym)} 포인트 내역`}
        className="min-h-80 flex-1 basis-0 overflow-y-auto px-6 pt-1 max-[760px]:h-auto max-[760px]:min-h-0 max-[760px]:flex-none max-[760px]:overflow-visible"
      >
        {data.length === 0 && (
          <li className="py-5">
            <EmptyResult title="이 달의 내역이 없어요" isCompact />
          </li>
        )}
        {data.map((item, index) => {
          const isUse = item.dlngPnt < 0;
          return (
            <li
              key={item.pntGnlgrSn}
              className={`flex items-center gap-3 border-t border-line-soft py-3 first:border-t-0 ${index >= MOBILE_VISIBLE && !isOpen ? 'max-[760px]:hidden' : ''}`}
            >
              <span className="w-11 shrink-0 text-sm text-subtle">
                {item.regDt.slice(5, 10)}
              </span>
              <span className="min-w-0 flex-1 font-semibold">
                {getTitle(item)}
              </span>
              <b
                className={`tabular-nums ${isUse ? 'text-ink-2' : 'text-brand-600'}`}
              >
                {formatSignedPoint(item.dlngPnt)}
              </b>
            </li>
          );
        })}
      </ul>
      {moreCount > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="hidden w-full items-center justify-center gap-1 border-t border-line-soft p-3 font-semibold text-muted hover:text-ink max-[760px]:flex"
        >
          {isOpen ? '접기' : `더보기 +${moreCount}`}
          <ChevronDown
            className={`size-4 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </section>
  );
}
