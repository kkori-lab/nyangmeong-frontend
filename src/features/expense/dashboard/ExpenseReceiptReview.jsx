import { Plus, Receipt, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import AmountInput from '@/components/AmountInput';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import ExpenseCategoryChips from '../shared/ExpenseCategoryChips';
import { FILTER_SHARED, HOSPITAL_CLSF_CD } from '../shared/expenseCodes';
import {
  HOSPITAL_NOTICE,
  getActivePets,
  getDefaultPetValue,
  getMaxExpndYmd,
  getPetOptions,
  toPetSn,
} from '../shared/expenseInput';
import { PLACE_MAX_LENGTH, formatWon } from '../shared/expenseFormat';

const FORM_ID = 'expense-receipt-form';
const LABEL = 'font-semibold';
const INPUT =
  'block h-10 w-full rounded-md border border-input-line bg-white px-3 placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none';

let nextRowKey = 1;
const newRow = (petValue, digits) => ({
  key: nextRowKey++,
  petValue,
  digits,
});

/** 영수증 인식 결과 확인·수정 */
export default function ExpenseReceiptReview({
  result,
  fallbackYmd,
  previewUrl,
  pets,
  isPending,
  onSubmit,
  onRetake,
  onClose,
}) {
  const activePets = getActivePets(pets);
  const [ymd, setYmd] = useState(result.expndYmd ?? fallbackYmd);
  const [expndClsfCd, setExpndClsfCd] = useState(result.expndClsfCd);
  const [place, setPlace] = useState(() =>
    (result.expndPlcusNm ?? '').slice(0, PLACE_MAX_LENGTH),
  );
  const [dtlMttr, setDtlMttr] = useState(result.dtlMttr ?? '');
  const [rows, setRows] = useState(() => [
    newRow(
      activePets.length === 1 ? getDefaultPetValue(activePets) : '',
      result.expndAmt == null ? '' : String(result.expndAmt),
    ),
  ]);
  const [hasHospitalNotice, setHasHospitalNotice] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const maxYmd = getMaxExpndYmd();
  const totalAmt = rows.reduce((sum, row) => sum + Number(row.digits), 0);
  const hasReceiptAmt = result.expndAmt != null;
  const canSave =
    ymd !== '' &&
    ymd <= maxYmd &&
    expndClsfCd !== null &&
    rows.every((row) => row.petValue !== '' && Number(row.digits) >= 1);
  const canAddRow = rows.length < activePets.length;

  const updateRow = (key, patch) =>
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  /** 병원 카테고리 공용 선택 비우기·안내 */
  const handleChangeClsf = (code) => {
    setExpndClsfCd(code);
    if (
      code === HOSPITAL_CLSF_CD &&
      rows.some((row) => row.petValue === FILTER_SHARED)
    ) {
      setRows((current) =>
        current.map((row) =>
          row.petValue === FILTER_SHARED ? { ...row, petValue: '' } : row,
        ),
      );
      setHasHospitalNotice(true);
    }
  };
  const handleChangePet = (key, petValue) => {
    updateRow(key, { petValue });
    setHasHospitalNotice(false);
  };
  const handleAddRow = () => setRows((current) => [...current, newRow('', '')]);
  const handleRemoveRow = (key) =>
    setRows((current) => current.filter((row) => row.key !== key));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    onSubmit(
      rows.map((row) => ({
        petSn: toPetSn(row.petValue),
        expndClsfCd,
        expndAmt: Number(row.digits),
        dtlMttr: dtlMttr.trim(),
        expndPlcusNm: place.trim(),
        expndYmd: ymd,
      })),
    );
  };

  return (
    <>
      <Modal
        title="인식 결과 확인"
        isSheet
        isPending={isPending}
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={onRetake}
              disabled={isPending}
              className={BTN_SECONDARY}
            >
              다시 촬영
            </button>
            <button
              type="submit"
              form={FORM_ID}
              disabled={!canSave || isPending}
              className={BTN_PRIMARY}
            >
              저장
            </button>
          </>
        }
      >
        {/** AI 인식 요소 점선 테두리 */}
        <div className="rounded-box border-2 border-dashed border-brand-500 p-4">
          <form
            id={FORM_ID}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4 rounded-box bg-surface-2 p-3">
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label="영수증 원본 크게 보기"
                className="grid h-20 w-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-dashed border-line-strong bg-white text-sm text-subtle"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="영수증 원본"
                    className="size-full object-cover"
                  />
                ) : (
                  <Receipt className="size-5" aria-hidden="true" />
                )}
              </button>
              <p className="text-sm text-muted">
                인식 결과를 확인하고 고칠 수 있어요
                <br />
                원본을 누르면 크게 볼 수 있어요
              </p>
            </div>
            <div>
              <label htmlFor="receipt-ymd" className={LABEL}>
                날짜
              </label>
              <DatePicker
                id="receipt-ymd"
                value={ymd}
                max={maxYmd}
                onChange={setYmd}
                className="mt-2"
              />
            </div>
            <div>
              <span className={LABEL}>카테고리</span>
              <div className="mt-2">
                <ExpenseCategoryChips
                  value={expndClsfCd}
                  onChange={handleChangeClsf}
                />
              </div>
            </div>
            <div>
              <label htmlFor="receipt-place" className={LABEL}>
                사용처 <span className="font-normal text-subtle">선택</span>
              </label>
              <input
                id="receipt-place"
                value={place}
                maxLength={PLACE_MAX_LENGTH}
                onChange={(event) => setPlace(event.target.value)}
                className={`${INPUT} mt-2`}
              />
            </div>
            <div>
              <label htmlFor="receipt-memo" className={LABEL}>
                내용 <span className="font-normal text-subtle">선택</span>
              </label>
              <input
                id="receipt-memo"
                value={dtlMttr}
                onChange={(event) => setDtlMttr(event.target.value)}
                placeholder="예: 종합 검진"
                className={`${INPUT} mt-2`}
              />
            </div>
            <div>
              <span className={LABEL}>반려동물별 금액</span>
              <div className="mt-2 flex flex-col gap-2">
                {rows.map((row, index) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,140px)_auto] items-center gap-2"
                  >
                    <Select
                      label={`반려동물 ${index + 1}`}
                      value={row.petValue}
                      onChange={(value) => handleChangePet(row.key, value)}
                      options={getPetOptions({
                        pets,
                        expndClsfCd,
                        currentValue: row.petValue,
                        takenValues: rows
                          .filter((other) => other.key !== row.key)
                          .map((other) => other.petValue),
                      })}
                    />
                    <AmountInput
                      label={`금액 ${index + 1}`}
                      value={row.digits}
                      onChange={(digits) => updateRow(row.key, { digits })}
                    />
                    {rows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.key)}
                        aria-label="줄 빼기"
                        className="grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-2"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <span className="size-8" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
              {hasHospitalNotice && rows.some((row) => row.petValue === '') && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {HOSPITAL_NOTICE}
                </p>
              )}
              {canAddRow && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="mt-2 flex h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-md border border-dashed border-line-strong bg-surface-2 font-semibold text-muted hover:border-brand-500 hover:text-brand-600"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  반려동물 추가
                </button>
              )}
              <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-subtle">
                {hasReceiptAmt ? (
                  <span className="tabular-nums">
                    영수증 금액 {formatWon(result.expndAmt)}
                  </span>
                ) : (
                  <span />
                )}
                <span>
                  나눈 합계{' '}
                  <b className="text-ink tabular-nums">{formatWon(totalAmt)}</b>
                </span>
              </p>
              {hasReceiptAmt && totalAmt !== result.expndAmt && (
                <p role="status" className="mt-1 text-sm text-warn">
                  영수증 금액과 합계가 달라요
                </p>
              )}
            </div>
            <p className="flex items-start gap-2 rounded-box bg-warn-soft px-4 py-3 text-sm text-warn">
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              AI가 자동으로 인식한 결과라 실수가 있을 수 있어요. 저장 전에 꼭
              확인해 주세요
            </p>
          </form>
        </div>
      </Modal>
      {isZoomOpen && (
        <Modal
          title="영수증 원본"
          onClose={() => setIsZoomOpen(false)}
          footer={
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className={BTN_SECONDARY}
            >
              닫기
            </button>
          }
        >
          <img
            src={previewUrl}
            alt="영수증 원본"
            className="mx-auto max-h-[60vh] rounded-md object-contain"
          />
        </Modal>
      )}
    </>
  );
}
