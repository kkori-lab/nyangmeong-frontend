import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import FieldError from '../diary/FieldError';
import { DECIMAL_MESSAGE } from '../numberFormat';
import { INPUT_CLASS } from '../diary/formStyles';
import { getExcludeReason } from './labRows';

const TH_CLASS =
  'h-12 whitespace-nowrap border-b border-line bg-surface-2 px-3 text-left font-semibold text-ink-2';
const TD_CLASS = 'h-14 border-b border-line-soft px-3 group-last:border-b-0';
const CELL_INPUT_CLASS = `${INPUT_CLASS} w-[120px] max-[760px]:w-full`;

const EXCLUDE_LABEL = {
  registered: '이미 등록됨 · 저장 제외',
  nonBlood: '혈액검사 아님 · 저장 제외',
};

/** 분석 실패 안내: 서버 문구가 없을 때만 쓴다 */
const ANALYZE_ERROR_MESSAGE = {
  NOT_LAB_RESULT: '검사결과지가 아닌 PDF예요. 검사결과지인지 확인해 주세요',
  PDF_ANALYZE_TIMEOUT: '분석 시간이 초과됐어요. 잠시 뒤 다시 분석해 주세요',
  PDF_ANALYZE_API_ERROR: 'PDF를 분석하지 못했어요. 잠시 뒤 다시 분석해 주세요',
};
const DEFAULT_ANALYZE_ERROR =
  'PDF를 분석하지 못했어요. 잠시 뒤 다시 분석해 주세요';

/**
 * [분석 결과 확인] (FN-HLT-007-04·05·06)
 * - PDF 분석으로 들어왔을 때만 표시. 값은 저장하기 전까지 미확정
 * - 인식 실패 항목은 빈 값으로 두고 직접 입력, 단위가 없는 행은 단위도 입력
 * - 이미 등록된 항목·혈액검사가 아닌 항목은 저장 대상에서 제외
 * - unitErrorNames: 값은 있는데 단위가 빈 행의 항목 이름
 * - decimalErrorNames: 결과값이 소수 셋째 자리 이상인 행의 항목 이름 (※신규 정책)
 * - analysisError: 분석 실패(NOT_LAB_RESULT·PDF_ANALYZE_TIMEOUT·PDF_ANALYZE_API_ERROR 등)면 표 대신 안내, 다시 분석·직접 입력은 그대로
 * - AI 주의 문구는 분석 결과 행이 있을 때만
 */
export default function AnalysisReview({
  fileName,
  rows,
  registeredNames,
  unitErrorNames,
  decimalErrorNames,
  analysisError,
  isAnalyzing,
  onChangeRow,
  onRerun,
  onManual,
}) {
  return (
    <Card
      title="분석 결과 확인"
      sub={
        analysisError
          ? fileName
          : `${fileName ? `${fileName} · ` : ''}${rows.length}건 인식`
      }
      className="[&>div:last-child]:flex [&>div:last-child]:flex-col [&>div:last-child]:gap-4"
    >
      {analysisError && (
        <p
          role="alert"
          className="flex gap-2.5 rounded-[10px] bg-danger-soft px-3.5 py-3 text-danger"
        >
          <Icon name="error" className="mt-0.5 text-lg" />
          <span>
            {analysisError.message ||
              ANALYZE_ERROR_MESSAGE[analysisError.code] ||
              DEFAULT_ANALYZE_ERROR}
          </span>
        </p>
      )}

      {!analysisError && (
        <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH_CLASS}>
                  검사 종류
                </th>
                <th scope="col" className={TH_CLASS}>
                  검사 항목
                </th>
                <th scope="col" className={TH_CLASS}>
                  결과값
                </th>
                <th scope="col" className={TH_CLASS}>
                  단위
                </th>
                <th scope="col" aria-label="상태" className={TH_CLASS} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const reason = getExcludeReason(row, registeredNames);
                const isExcluded = reason !== null;
                const hasUnitInput = row.hasUnitInput && !isExcluded;
                return (
                  <tr
                    key={row.key}
                    className={`group ${isExcluded ? 'text-subtle' : ''}`}
                  >
                    <td className={TD_CLASS}>
                      {row.isBlood ? '혈액검사' : '—'}
                    </td>
                    <td className={TD_CLASS}>{row.name}</td>
                    <td className={TD_CLASS}>
                      <input
                        value={row.rsltNvl}
                        disabled={isExcluded}
                        inputMode="decimal"
                        aria-invalid={decimalErrorNames.includes(row.name)}
                        placeholder={
                          row.rsltNvl === '' ? '인식 실패' : undefined
                        }
                        aria-label={`${row.name} 결과값${isExcluded ? ` (${EXCLUDE_LABEL[reason]})` : ''}`}
                        className={CELL_INPUT_CLASS}
                        onChange={(event) =>
                          onChangeRow(row.key, 'rsltNvl', event.target.value)
                        }
                      />
                    </td>
                    <td className={TD_CLASS}>
                      {hasUnitInput ? (
                        <input
                          value={row.unitNm}
                          maxLength={20}
                          placeholder="단위"
                          aria-label={`${row.name} 단위`}
                          aria-invalid={unitErrorNames.includes(row.name)}
                          className={CELL_INPUT_CLASS}
                          onChange={(event) =>
                            onChangeRow(row.key, 'unitNm', event.target.value)
                          }
                        />
                      ) : (
                        row.unitNm || '—'
                      )}
                    </td>
                    <td className={`${TD_CLASS} whitespace-nowrap`}>
                      {isExcluded && (
                        <span className="inline-flex h-6 items-center rounded-full bg-white px-2.5 text-[13px] text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]">
                          {EXCLUDE_LABEL[reason]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {unitErrorNames.length > 0 && (
        <FieldError>
          단위를 입력해 주세요: {unitErrorNames.join(', ')}
        </FieldError>
      )}

      {decimalErrorNames.length > 0 && (
        <FieldError>
          {DECIMAL_MESSAGE}: {decimalErrorNames.join(', ')}
        </FieldError>
      )}

      {!analysisError && rows.length > 0 && (
        <p className="flex gap-2.5 rounded-[10px] border border-warn-line bg-warn-soft px-3.5 py-3 text-warn">
          <Icon name="warning" className="mt-0.5 text-lg" />
          <span>
            AI가 자동으로 인식·판정한 결과이며 실수가 있을 수 있습니다. 저장
            전에 반드시 확인해 주세요.
          </span>
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isAnalyzing}
          className={`${BTN_SECONDARY} flex-1`}
          onClick={onRerun}
        >
          다시 분석하기
        </button>
        <button
          type="button"
          disabled={isAnalyzing}
          className={`${BTN_SECONDARY} flex-1`}
          onClick={onManual}
        >
          직접 입력하기
        </button>
      </div>
    </Card>
  );
}
