import Icon from '@/components/Icon';
import FieldError from './FieldError';
import { INPUT_CLASS, LABEL_CLASS, SELECT_CLASS } from './formStyles';
import {
  DRUG_STATUSES,
  formatAmount,
  getLedgerAmount,
  toAmount,
} from './receiptUtils';

const CELL_INPUT = `${INPUT_CLASS} h-9 px-2`;

/** 약품 카드 칸 이름표 */
const DRUG_LABEL = 'text-sm text-subtle';

const aiClass = (isAi) => (isAi ? 'border-dashed' : '');

/**
 * ["영수증에서 읽은 정보" 블록] (FN-HLT-002-39·40·41·42)
 * - 금액(탭 금액 = 구역 소계 − 할인), 처방 약품 행, 가계부에도 기록 체크
 * - 인식한 값은 점선, 사람이 고친 값은 실선. 약품 금액은 대조용이라 저장 안 함
 * - errors: { drugs: { [rowId]: { drugNm, startYmd, endYmd, perDay } } }
 */
export default function ReceiptInfoBlock({
  tab,
  hospNm,
  errors,
  onAmountChange,
  onLedgerChange,
  onDrugChange,
  onDrugAdd,
  onDrugRemove,
}) {
  const amount = toAmount(tab.amt);
  const ledgerAmount = getLedgerAmount(tab);
  const canLedger = amount >= 1;
  const drugAmountSum = tab.drugs.reduce(
    (sum, drug) => sum + (drug.amt ?? 0),
    0,
  );
  const hasDrugAmountGap = drugAmountSum > 0 && drugAmountSum !== amount;

  return (
    <div className="mt-5 rounded-xl bg-surface-2 p-4">
      <h4 className="mb-3 text-lg/[1.6] font-semibold text-[#1a3234]">
        영수증에서 읽은 정보
      </h4>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`rcpt-amt-${tab.id}`} className={LABEL_CLASS}>
          금액
        </label>
        <div className="relative">
          <input
            id={`rcpt-amt-${tab.id}`}
            inputMode="numeric"
            autoComplete="off"
            value={
              tab.amt === '' ? '' : Number(tab.amt).toLocaleString('ko-KR')
            }
            className={`${INPUT_CLASS} pr-11 text-right ${aiClass(!tab.edited.amt && tab.amt !== '')}`}
            onChange={(event) =>
              onAmountChange(
                event.target.value
                  .replace(/\D/g, '')
                  .replace(/^0+/, '')
                  .slice(0, 9),
              )
            }
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
            원
          </span>
        </div>
        {tab.subtotal != null && tab.discount > 0 && (
          <p className="text-sm/[1.5] text-muted tabular-nums">
            소계 {tab.subtotal.toLocaleString('ko-KR')} − 할인{' '}
            {tab.discount.toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>처방 약품</span>
        {tab.drugs.length > 0 && (
          /** 약품마다 카드 3줄: 약품명·금액·삭제 / 시작일·종료일 / 1일 복용 횟수·상태 (2026-11-08) */
          <ul className="flex flex-col gap-2">
            {tab.drugs.map((drug) => {
              const drugErrors = errors?.drugs?.[drug.rowId] ?? {};
              const isAi = !drug.isEdited;
              const change = (patch) => onDrugChange(drug.rowId, patch);
              return (
                <li
                  key={drug.rowId}
                  className="flex flex-col gap-3 rounded-box border border-line bg-white p-3"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2">
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className={DRUG_LABEL}>약품명</span>
                      <input
                        value={drug.drugNm}
                        aria-invalid={drugErrors.drugNm != null}
                        className={`${CELL_INPUT} ${aiClass(isAi && drug.drugNm !== '')}`}
                        onChange={(event) =>
                          change({ drugNm: event.target.value })
                        }
                      />
                      {drugErrors.drugNm && (
                        <FieldError>{drugErrors.drugNm}</FieldError>
                      )}
                    </label>
                    <div className="flex flex-col gap-1">
                      <span className={DRUG_LABEL}>금액(대조)</span>
                      <span className="flex h-9 items-center justify-end text-subtle tabular-nums">
                        {drug.amt != null
                          ? drug.amt.toLocaleString('ko-KR')
                          : '-'}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label="약품 삭제"
                      className="mt-6 grid size-9 place-items-center rounded-md text-subtle hover:bg-surface-3"
                      onClick={() => onDrugRemove(drug.rowId)}
                    >
                      <Icon name="remove" />
                    </button>
                  </div>

                  {/* 640px 미만은 날짜가 잘리지 않게 시작일·종료일을 위아래로 */}
                  <div className="grid grid-cols-2 items-start gap-2 max-sm:grid-cols-1">
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className={DRUG_LABEL}>시작일</span>
                      <input
                        type="date"
                        value={drug.startYmd}
                        aria-invalid={drugErrors.startYmd != null}
                        className={`${CELL_INPUT} min-w-0 ${aiClass(isAi && drug.startYmd !== '')}`}
                        onChange={(event) =>
                          change({ startYmd: event.target.value })
                        }
                      />
                      {drugErrors.startYmd && (
                        <FieldError>{drugErrors.startYmd}</FieldError>
                      )}
                    </label>
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className={DRUG_LABEL}>종료일</span>
                      <input
                        type="date"
                        value={drug.endYmd}
                        aria-invalid={drugErrors.endYmd != null}
                        className={`${CELL_INPUT} min-w-0 ${aiClass(isAi && drug.endYmd !== '')}`}
                        onChange={(event) =>
                          change({ endYmd: event.target.value })
                        }
                      />
                      {drugErrors.endYmd && (
                        <FieldError>{drugErrors.endYmd}</FieldError>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-2 items-start gap-2">
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className={DRUG_LABEL}>1일 복용 횟수</span>
                      <span className="relative block">
                        <input
                          inputMode="numeric"
                          value={drug.perDay}
                          aria-invalid={drugErrors.perDay != null}
                          className={`${CELL_INPUT} pr-8 text-right tabular-nums ${aiClass(isAi && drug.perDay !== '')}`}
                          onChange={(event) =>
                            change({
                              perDay: event.target.value
                                .replace(/\D/g, '')
                                .slice(0, 2),
                            })
                          }
                        />
                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
                          회
                        </span>
                      </span>
                      {drugErrors.perDay && (
                        <FieldError>{drugErrors.perDay}</FieldError>
                      )}
                    </label>
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className={DRUG_LABEL}>상태</span>
                      <select
                        value={drug.statusCd}
                        className={`${SELECT_CLASS} h-9 px-2 ${aiClass(isAi)}`}
                        onChange={(event) =>
                          change({ statusCd: event.target.value })
                        }
                      >
                        {DRUG_STATUSES.map((status) => (
                          <option key={status.cd} value={status.cd}>
                            {status.nm}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          className="inline-flex w-fit items-center gap-0.5 font-semibold text-brand-600 hover:underline hover:underline-offset-[3px]"
          onClick={onDrugAdd}
        >
          <Icon name="add" className="text-lg" />
          약품 행 추가
        </button>
        {hasDrugAmountGap && (
          <p className="text-sm/[1.5] text-muted">
            약품 금액 합계와 탭 금액이 달라요 · 진료비·처치비가 포함될 수 있어요
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label className="flex w-fit cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed">
          <input
            type="checkbox"
            checked={canLedger && tab.isLedger}
            disabled={!canLedger}
            className="size-5 accent-[#285a5c]"
            onChange={(event) => onLedgerChange(event.target.checked)}
          />
          <span>가계부에도 기록</span>
          {ledgerAmount != null && (
            <span className="text-sm text-subtle tabular-nums">
              병원 · {formatAmount(ledgerAmount)} · 사용처 ={' '}
              {hospNm.trim() || '병원명'}
            </span>
          )}
        </label>
        {!canLedger && (
          <p className="text-sm/[1.5] text-muted">
            금액이 있어야 가계부에 기록돼요
          </p>
        )}
      </div>
    </div>
  );
}
