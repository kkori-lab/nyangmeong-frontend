import { SELECT_ARROW_STYLE, SELECT_CLASS } from './formStyles';
import {
  SKIP,
  formatAmount,
  getLineAmount,
  getLineName,
  toAmount,
} from './receiptUtils';

/**
 * ["배정 필요" 목록] (FN-HLT-002-43)
 * - 구역이 없는 영수증이 [＋ 반려동물 추가]로 2마리 이상이 되면 품목·처방 약품을 모아 표시
 * - 품목마다 [반려동물 ▾]로 따로 지정하고, [전부 ○○에게]는 한 번에 채우는 단축 버튼
 * - 모두 배정해야 저장할 수 있다. 탭 금액은 배정된 품목의 합
 */
export default function ReceiptAssignList({
  lines,
  tabs,
  pets,
  assign,
  unassignedCount,
  onAssign,
  onAssignAll,
}) {
  /** 반려동물을 고른(저장 안 함 아님) 탭만 배정 대상 */
  const targets = tabs
    .filter((tab) => tab.petSn != null && tab.petSn !== SKIP)
    .map((tab) => ({
      id: tab.id,
      petNm: pets.find((pet) => pet.petSn === tab.petSn)?.petNm,
      amount: toAmount(tab.amt),
    }));
  const targetIds = new Set(targets.map((target) => target.id));

  return (
    <div className="mt-5 rounded-xl border border-dashed border-line-strong p-4">
      <p className="mb-3 text-sm text-subtle">배정 필요</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-sm font-normal text-subtle">
            <th scope="col" className="p-1 font-normal">
              품목
            </th>
            <th scope="col" className="p-1 text-right font-normal">
              금액
            </th>
            <th scope="col" className="p-1 font-normal">
              반려동물
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.lineSn}>
              <td className="p-1">{getLineName(line)}</td>
              <td className="p-1 text-right tabular-nums">
                {getLineAmount(line) == null
                  ? '-'
                  : getLineAmount(line).toLocaleString('ko-KR')}
              </td>
              <td className="p-1">
                <select
                  aria-label={`${getLineName(line)} 반려동물`}
                  value={
                    targetIds.has(assign[line.lineSn])
                      ? assign[line.lineSn]
                      : ''
                  }
                  style={SELECT_ARROW_STYLE}
                  className={`${SELECT_CLASS} h-9 px-2`}
                  onChange={(event) =>
                    onAssign(line.lineSn, event.target.value)
                  }
                >
                  <option value="">선택</option>
                  {targets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.petNm}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap gap-2">
        {targets.map((target) => (
          <button
            key={target.id}
            type="button"
            className="h-8 rounded-md border border-line bg-white px-3 text-sm font-semibold hover:bg-surface-2"
            onClick={() => onAssignAll(target.id)}
          >
            전부 {target.petNm}에게
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-subtle tabular-nums">
        {unassignedCount > 0
          ? `배정하지 않은 품목이 ${unassignedCount}개 있어요`
          : `탭 금액 — ${targets
              .map((target) => `${target.petNm} ${formatAmount(target.amount)}`)
              .join(' · ')}`}
      </p>
    </div>
  );
}
