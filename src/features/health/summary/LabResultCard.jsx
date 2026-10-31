import { generatePath } from 'react-router-dom';
import Card from '@/components/Card';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { CardTitle, MoreLink, SummaryEmpty } from './SummaryParts';
import {
  DIARY_EXAM_PATH,
  formatRange,
  getFunctionTagName,
} from './summaryUtils';

const TH =
  'h-11 border-b border-line bg-surface-2 px-4 text-left font-semibold text-ink-2';

/**
 * [검사 결과] (FN-HLT-011-06)
 * - 최근 1회차 검사의 항목·결과·참고범위. 상태 판정 없음
 * - 행을 누르면(또는 Enter·Space) 옆 검사 수치 추이의 조회 항목 전환
 * - 모바일(640px 미만)은 최근 검사일을 제목 아래 줄로, 표는 2열(검사항목 | 결과 · 참고범위) (추가 요청)
 */
export default function LabResultCard({ lab, selectedNm, onSelect }) {
  return (
    <Card
      title={
        <>
          <CardTitle icon="science">검사 결과</CardTitle>
          {lab && (
            <span className="block text-sm/[1.6] font-medium text-subtle sm:hidden">
              최근 검사일 {formatDate(lab.ckupYmd)}
            </span>
          )}
        </>
      }
      sub={
        lab && (
          <span className="max-sm:hidden">
            최근 검사일 {formatDate(lab.ckupYmd)}
          </span>
        )
      }
      action={
        lab && (
          <MoreLink
            to={generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
              petSn: lab.petSn,
              ckupRcdSn: lab.ckupRcdSn,
            })}
          />
        )
      }
      className="h-full"
    >
      {lab === null ? (
        <SummaryEmpty
          icon="science"
          description="검진상세에서 검사 수치를 넣으면 최근 결과가 보여요"
          action="건강 일지에서 검진기록 등록하기"
          to={DIARY_EXAM_PATH}
        />
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th scope="col" className={TH}>
                검사항목
              </th>
              <th scope="col" className={`${TH} max-sm:text-right`}>
                <span className="max-sm:hidden">결과</span>
                <span className="sm:hidden">결과 · 참고범위</span>
              </th>
              <th scope="col" className={`${TH} max-sm:hidden`}>
                참고범위
              </th>
            </tr>
          </thead>
          <tbody>
            {lab.items.map((item) => {
              const isSelected = item.inspItmNm === selectedNm;
              const select = () => onSelect(item.inspItmNm);
              return (
                <tr
                  key={item.inspSn}
                  tabIndex={0}
                  aria-selected={isSelected}
                  className={`h-12 cursor-pointer border-b border-line-soft last:border-b-0 hover:bg-surface-2 focus-visible:bg-brand-50 ${
                    isSelected ? 'bg-brand-50' : ''
                  }`}
                  onClick={select}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    select();
                  }}
                >
                  <td className="px-4 whitespace-nowrap max-sm:py-2">
                    <span className="mr-2 inline-flex h-6 items-center rounded-full border border-line bg-surface-2 px-2 text-[13px] text-ink-2">
                      {getFunctionTagName(item.fnctTagCd)}
                    </span>
                    {item.inspItmNm}
                  </td>
                  <td className="px-4 whitespace-nowrap max-sm:py-2 max-sm:text-right">
                    <span className="max-sm:block">
                      {item.rsltVal} {item.unitNm}
                    </span>
                    <span className="block text-sm/[1.6] text-subtle sm:hidden">
                      {formatRange(item.refMinVal, item.refMaxVal)}
                    </span>
                  </td>
                  <td className="px-4 max-sm:hidden">
                    {formatRange(item.refMinVal, item.refMaxVal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
