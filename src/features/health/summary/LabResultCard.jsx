import { generatePath } from 'react-router-dom';
import Card from '@/components/Card';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { findBloodItem } from '../labInput/bloodItems';
import { getInspectionName } from '../summaryApi';
import { CardTitle, MoreLink, SummaryEmpty } from './SummaryParts';
import {
  DIARY_EXAM_PATH,
  formatRange,
  getFunctionTagName,
} from './summaryUtils';

const TH =
  'h-11 border-b border-line bg-surface-2 px-4 text-left font-semibold text-ink-2';
/** 표에 보여 줄 최대 항목 수 (추가 요청) */
const MAX_ROWS = 5;

/** 참고범위 이탈: 'HIGH' | 'LOW' | null. 범위 한쪽이 없으면 있는 쪽만 본다 */
const getOutOfRange = (item) => {
  if (item.rsltNvl == null) return null;
  if (item.refUplmtNvl != null && item.rsltNvl > item.refUplmtNvl)
    return 'HIGH';
  if (item.refLlmtNvl != null && item.rsltNvl < item.refLlmtNvl) return 'LOW';
  return null;
};

const OUT_OF_RANGE_NAME = { HIGH: '높음', LOW: '낮음' };

/**
 * 표에 보여 줄 최대 5개 항목을 고른 순서대로 (추가 요청)
 * 1. 참고범위를 벗어난 항목 (표 순서)
 * 2. 남은 자리는 아직 없는 분류(혈액검사 항목의 기능 태그)마다 그 분류의 첫 항목
 * 3. 그래도 남으면 표 순서
 */
const pickVisibleItems = (items) => {
  const picked = items.filter((item) => getOutOfRange(item) !== null);
  const getTag = (item) => findBloodItem(getInspectionName(item))?.fnctTagCd;
  const tags = new Set(picked.map(getTag));
  items.forEach((item) => {
    const tag = getTag(item);
    if (tag == null || tags.has(tag) || picked.includes(item)) return;
    tags.add(tag);
    picked.push(item);
  });
  items.forEach((item) => {
    if (!picked.includes(item)) picked.push(item);
  });
  return picked.slice(0, MAX_ROWS);
};

/**
 * [검사 결과] (FN-HLT-011-06)
 * - 최근 1회차 검사의 항목·결과·참고범위. 최대 5개(pickVisibleItems), 나머지는 "외 N개 항목" (추가 요청)
 * - 참고범위를 벗어난 결과는 위험 색 + [높음]/[낮음] (추가 요청)
 * - 행을 누르면(또는 Enter·Space) 옆 검사 수치 추이의 조회 항목 전환.
 *   추이에서 표에 없는 항목을 고르면 강조 없이 표 그대로
 * - 모바일(640px 미만)은 최근 검사일을 제목 아래 줄로, 표는 2열(검사항목 | 결과 · 참고범위) (추가 요청)
 */
export default function LabResultCard({ lab, selectedNm, onSelect }) {
  const visibleItems = lab ? pickVisibleItems(lab.items) : [];
  const hiddenCount = lab ? lab.items.length - visibleItems.length : 0;

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
        <>
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
              {visibleItems.map((item) => {
                const itemNm = getInspectionName(item);
                const isSelected = itemNm === selectedNm;
                const outOfRange = getOutOfRange(item);
                const select = () => onSelect(itemNm);
                return (
                  <tr
                    key={item.inspNvlSn}
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
                        {getFunctionTagName(findBloodItem(itemNm)?.fnctTagCd)}
                      </span>
                      {itemNm}
                    </td>
                    <td className="px-4 whitespace-nowrap max-sm:py-2 max-sm:text-right">
                      <span className="max-sm:block">
                        <span
                          className={
                            outOfRange ? 'font-semibold text-danger' : ''
                          }
                        >
                          {item.rsltNvl} {item.unitNm}
                        </span>
                        {outOfRange && (
                          <span className="ml-1.5 inline-flex h-6 items-center rounded-full bg-danger-soft px-2 align-middle text-[13px] font-semibold text-danger">
                            {OUT_OF_RANGE_NAME[outOfRange]}
                          </span>
                        )}
                      </span>
                      <span className="block text-sm/[1.6] text-subtle sm:hidden">
                        {formatRange(item.refLlmtNvl, item.refUplmtNvl)}
                      </span>
                    </td>
                    <td className="px-4 max-sm:hidden">
                      {formatRange(item.refLlmtNvl, item.refUplmtNvl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {hiddenCount > 0 && (
            <p className="mt-3 text-center text-sm text-subtle">
              외 {hiddenCount}개 항목
            </p>
          )}
        </>
      )}
    </Card>
  );
}
