import { BTN_SECONDARY } from '@/components/buttonStyles';
import { TERMS_KINDS } from './termsKinds';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['약관 종류', '현재 버전', '제목', '필수', '사용', ''];

const CELL = 'px-4 py-3 max-[760px]:px-2';

/**
 * [약관 목록 표]
 * - 관리 대상 종류마다 한 줄. 사용 중 버전이 없으면 "—"
 * - 행 끝 [이력] -> onHistory(종류 키)
 */
export default function TermsTable({ terms, onHistory }) {
  const currentByKind = new Map(
    terms.map((item) => [item.trmsFixIdntfKey, item]),
  );

  return (
    <div className={`relative ${ADMIN_TABLE_BOX}`}>
      <table className="w-full min-w-[640px] table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col className="w-[200px] max-[760px]:w-[148px]" />
          <col className="w-[104px] max-[760px]:w-[72px]" />
          <col />
          <col className="w-[80px] max-[760px]:w-[56px]" />
          <col className="w-[80px] max-[760px]:w-[56px]" />
          <col className="w-[96px] max-[760px]:w-[76px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-2"
              >
                {column || <span className="sr-only">이력</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TERMS_KINDS.map(({ trmsFixIdntfKey, name }) => {
            const current = currentByKind.get(trmsFixIdntfKey);
            return (
              <tr
                key={trmsFixIdntfKey}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <th
                  scope="row"
                  className={`${CELL} truncate font-semibold text-ink`}
                >
                  {name}
                </th>
                <td className={`${CELL} tabular-nums`}>
                  {current?.trmsVerId ?? '—'}
                </td>
                <td className={`${CELL} truncate`}>
                  {current?.trmsTtl ?? '—'}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {current ? (current.esntlAgreYn ? '필수' : '선택') : '—'}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {current ? '사용' : '—'}
                </td>
                <td className={`${CELL} text-right`}>
                  <button
                    type="button"
                    aria-label={`${name} 이력`}
                    className={`${BTN_SECONDARY} h-8 px-3 text-sm`}
                    onClick={() => onHistory(trmsFixIdntfKey)}
                  >
                    이력
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
