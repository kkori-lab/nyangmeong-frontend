import { ChevronDown, ChevronUp, Flame } from 'lucide-react';
import FileImage from '@/components/FileImage';
import { useAdminItemImage } from './queries';
import { canBakeItem } from './useItemBake';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = [
  '순서',
  '이미지',
  '부위',
  '이름',
  '포인트',
  '판매',
  '보유 회원',
  '굽기',
];
const EDIT_COLUMNS = ['순서', '이미지', '부위', '이름', '포인트', '이동'];

const CELL = 'px-4 py-2 max-[760px]:px-1.5';
const MOVE_BUTTON =
  'grid size-8 place-items-center rounded-[6px] border border-line bg-white text-ink-2 hover:enabled:bg-surface-2 disabled:border-transparent disabled:bg-surface-3 disabled:text-line-strong';

/** 아이템 이미지 칸: 파일이 없거나 열리지 않으면 아이콘 칸 */
export function ItemImage({ item, className = '' }) {
  const { src, isPending } = useAdminItemImage(item);
  return (
    <FileImage
      src={src}
      pending={isPending}
      alt={item.itemNm}
      className={`rounded-[6px] object-contain ${className}`}
    />
  );
}

/**
 * [아이템 목록 표]
 * - 보기: 행 클릭·Enter -> 수정 모달
 * - 순서 편집(isOrdering): 행 클릭 대신 [위]·[아래]로 onMove(인덱스, -1|1), 판매·보유 회원 칸 대신 이동 칸
 * - 좁은 폭에서는 이름만 줄여 표 폭을 화면에 맞춘다
 * - 굽기 칸: 굽기 대상 행만 [굽기] -> onBake(아이템), 굽는 중(isBaking)에는 막음. 행 클릭과 겹치지 않게 전파를 끊음
 */
export default function ItemTable({
  items,
  isOrdering = false,
  onSelect,
  onMove,
  onBake,
  isBaking = false,
}) {
  const columns = isOrdering ? EDIT_COLUMNS : COLUMNS;
  const lastIndex = items.length - 1;

  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col className="w-[72px] max-[760px]:w-[36px]" />
          <col className="w-[88px] max-[760px]:w-[52px]" />
          <col className="w-[96px] max-[760px]:w-[44px]" />
          <col />
          <col className="w-[104px] max-[760px]:w-[58px]" />
          {isOrdering ? (
            <col className="w-[104px] max-[760px]:w-[76px]" />
          ) : (
            <>
              <col className="w-[80px] max-[760px]:w-[38px]" />
              <col className="w-[104px] max-[760px]:w-[44px]" />
              <col className="w-[72px] max-[760px]:w-[40px]" />
            </>
          )}
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-1.5 max-[760px]:text-xs max-[760px]:leading-4 max-[760px]:whitespace-normal"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.itemSn}
              tabIndex={isOrdering ? undefined : 0}
              className={`border-b border-line text-ink-2 last:border-b-0 ${
                isOrdering ? '' : 'cursor-pointer hover:bg-surface-2'
              }`}
              onClick={isOrdering ? undefined : () => onSelect(item)}
              onKeyDown={
                isOrdering
                  ? undefined
                  : (event) => {
                      if (event.key === 'Enter') onSelect(item);
                    }
              }
            >
              <td className={`${CELL} tabular-nums`}>{item.sortSeq}</td>
              <td className={CELL}>
                <ItemImage
                  item={item}
                  className="size-12 bg-surface-2 max-[760px]:size-10"
                />
              </td>
              <td className={`${CELL} truncate`}>{item.itemRegnCdNm}</td>
              <td className={`${CELL} truncate`}>{item.itemNm}</td>
              <td className={`${CELL} whitespace-nowrap tabular-nums`}>
                {item.needPnt.toLocaleString()}P
              </td>
              {isOrdering ? (
                <td className={CELL}>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`${item.itemNm} 위로`}
                      className={MOVE_BUTTON}
                      disabled={index === 0}
                      onClick={() => onMove(index, -1)}
                    >
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${item.itemNm} 아래로`}
                      className={MOVE_BUTTON}
                      disabled={index === lastIndex}
                      onClick={() => onMove(index, 1)}
                    >
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              ) : (
                <>
                  <td
                    className={`${CELL} whitespace-nowrap ${
                      item.ntslYn ? '' : 'text-subtle'
                    }`}
                  >
                    {item.ntslYn ? '판매' : '중지'}
                  </td>
                  <td className={`${CELL} tabular-nums`}>
                    {item.hldMbrCnt.toLocaleString()}
                  </td>
                  <td className={CELL}>
                    {canBakeItem(item) ? (
                      <button
                        type="button"
                        aria-label={`${item.itemNm} 굽기`}
                        title="안 구운 캐릭터에 굽기"
                        className={MOVE_BUTTON}
                        disabled={isBaking}
                        onClick={(event) => {
                          event.stopPropagation();
                          onBake(item);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <Flame className="size-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="text-subtle" aria-label="굽기 대상 아님">
                        -
                      </span>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
