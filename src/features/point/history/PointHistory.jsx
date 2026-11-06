import { ChevronDown, Receipt } from 'lucide-react';
import { useState } from 'react';
import MonthNav from '@/components/MonthNav';
import { formatYm, getCurrentYm, shiftYm } from '@/utils/yearMonth';
import { usePointHistory } from '../queries';
import { PNT_DLNG_TYPE } from '../shared/pointCodes';
import { formatSignedPoint } from '../shared/pointFormat';
import { CARD, CARD_HEAD, CARD_TITLE } from '../shared/pointStyles';

/** 앱은 안쪽 스크롤 없이 이만큼만 보이고 나머지는 [더보기] */
const MOBILE_VISIBLE = 5;

/** 내용: 관리자 조정은 고정 문구, 그 밖은 메모, 없으면 유형 이름 */
const getTitle = (item) =>
  item.pntDlngTypeCd === PNT_DLNG_TYPE.ADMIN_ADJUST
    ? '관리자 조정'
    : (item.memoCn ?? item.pntDlngTypeCdNm);

const sumBy = (items, predicate) =>
  items.filter(predicate).reduce((sum, item) => sum + item.dlngPnt, 0);

export default function PointHistory() {
  const maxYm = getCurrentYm();
  const [ym, setYm] = useState(maxYm);
  const [isOpen, setIsOpen] = useState(false);
  const { data } = usePointHistory(ym);

  const moveYm = (step) => {
    setYm(shiftYm(ym, step));
    setIsOpen(false);
  };

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
        <MonthNav
          onPrev={() => moveYm(-1)}
          onNext={() => moveYm(1)}
          isNextDisabled={ym >= maxYm}
        >
          <b className="min-w-28 text-center">{formatYm(ym)}</b>
        </MonthNav>
      </div>
      <div className="grid grid-cols-2 border-b border-line-soft text-muted">
        <div className="flex items-center justify-between px-6 py-3">
          <span>적립</span>
          <b className="text-brand-600">{formatSignedPoint(earnTotal)}</b>
        </div>
        <div className="flex items-center justify-between border-l border-line-soft px-6 py-3">
          <span>사용</span>
          <b className="text-ink">{formatSignedPoint(useTotal)}</b>
        </div>
      </div>
      {/* PC: 카드 높이를 채우고 넘치면 영역 안에서 스크롤 / 앱: 스크롤 없이 5건 + 더보기 */}
      <ul
        tabIndex={0}
        aria-label={`${formatYm(ym)} 포인트 내역`}
        className="min-h-80 flex-1 basis-0 overflow-y-auto px-6 pt-1 max-[760px]:h-auto max-[760px]:min-h-0 max-[760px]:flex-none max-[760px]:overflow-visible"
      >
        {data.length === 0 && (
          <li className="py-10 text-center text-subtle">
            이 달의 내역이 없어요
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
              <b className={isUse ? 'text-ink-2' : 'text-brand-600'}>
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
