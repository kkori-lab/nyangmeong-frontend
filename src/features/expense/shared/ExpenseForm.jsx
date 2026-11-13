import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import AmountInput from '@/components/AmountInput';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import ExpenseCategoryChips from './ExpenseCategoryChips';
import { MissingNotice, Required } from './ExpenseRequired';
import { FILTER_SHARED, HOSPITAL_CLSF_CD } from './expenseCodes';
import { PLACE_MAX_LENGTH, getPlace } from './expenseFormat';
import {
  HOSPITAL_NOTICE,
  getActivePets,
  getDefaultPetValue,
  getMaxExpndYmd,
  getPetOptions,
  toPetSn,
  toPetValue,
} from './expenseInput';

const FORM_ID = 'expense-form';
const LABEL = 'font-semibold';
const INPUT =
  'block h-10 w-full rounded-md border border-input-line bg-white px-3 placeholder:text-placeholder hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none';

/** 지출 입력 모달: 등록·수정 공용 */
export default function ExpenseForm({
  expense,
  expndYmd,
  pets,
  isPending,
  onSubmit,
  onClose,
}) {
  const isEdit = Boolean(expense);
  const [ymd, setYmd] = useState(expense?.expndYmd ?? expndYmd);
  const [petValue, setPetValue] = useState(() =>
    isEdit
      ? toPetValue(expense.petSn)
      : getDefaultPetValue(getActivePets(pets)),
  );
  const [expndClsfCd, setExpndClsfCd] = useState(expense?.expndClsfCd ?? null);
  const [digits, setDigits] = useState(isEdit ? String(expense.expndAmt) : '');
  const [place, setPlace] = useState(expense ? getPlace(expense) : '');
  const [dtlMttr, setDtlMttr] = useState(expense?.dtlMttr ?? '');
  const [hasHospitalNotice, setHasHospitalNotice] = useState(false);

  const maxYmd = getMaxExpndYmd();
  const keepPet = isEdit
    ? (pets.find((pet) => pet.petSn === expense.petSn) ?? null)
    : null;
  const petOptions = getPetOptions({
    pets,
    expndClsfCd,
    currentValue: petValue,
    keepPet,
  });
  const canSave =
    ymd !== '' &&
    ymd <= maxYmd &&
    petValue !== '' &&
    expndClsfCd !== null &&
    Number(digits) >= 1;
  /** [저장]이 막힌 이유: 빠진 항목을 화면 순서대로 */
  const missing = [
    ymd === '' && '날짜',
    petValue === '' && '반려동물',
    expndClsfCd === null && '카테고리',
    Number(digits) < 1 && '금액(1원 이상)',
  ].filter(Boolean);

  /** 병원 카테고리 공용 선택 비우기·안내 */
  const handleChangeClsf = (code) => {
    setExpndClsfCd(code);
    if (code === HOSPITAL_CLSF_CD && petValue === FILTER_SHARED) {
      setPetValue('');
      setHasHospitalNotice(true);
    }
  };
  const handleChangePet = (value) => {
    setPetValue(value);
    setHasHospitalNotice(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    onSubmit({
      petSn: toPetSn(petValue),
      expndClsfCd,
      expndAmt: Number(digits),
      dtlMttr: dtlMttr.trim(),
      expndPlcusNm: place.trim(),
      expndYmd: ymd,
    });
  };

  return (
    <Modal
      title={isEdit ? '지출 수정' : '직접 입력'}
      isSheet
      isPending={isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={BTN_SECONDARY}
          >
            취소
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
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expense-ymd" className={LABEL}>
              날짜
              <Required />
            </label>
            <DatePicker
              id="expense-ymd"
              value={ymd}
              max={maxYmd}
              onChange={setYmd}
              className="mt-2"
            />
          </div>
          <div>
            <span className={LABEL}>
              반려동물
              <Required />
            </span>
            <Select
              label="반려동물 (필수)"
              value={petValue}
              onChange={handleChangePet}
              options={petOptions}
              className="mt-2"
            />
          </div>
        </div>
        {hasHospitalNotice && petValue === '' && (
          <p role="alert" className="-mt-2 text-sm text-danger">
            {HOSPITAL_NOTICE}
          </p>
        )}
        <div>
          <span className={LABEL}>
            카테고리
            <Required />
          </span>
          <div className="mt-2">
            <ExpenseCategoryChips
              isRequired
              value={expndClsfCd}
              onChange={handleChangeClsf}
            />
          </div>
        </div>
        <div>
          <label htmlFor="expense-amt" className={LABEL}>
            금액
            <Required />
          </label>
          <AmountInput
            isRequired
            id="expense-amt"
            value={digits}
            onChange={setDigits}
            className="mt-2"
          />
        </div>
        <div>
          <label htmlFor="expense-place" className={LABEL}>
            사용처 <span className="font-normal text-subtle">선택</span>
          </label>
          <input
            id="expense-place"
            value={place}
            maxLength={PLACE_MAX_LENGTH}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="예: 애견미용실"
            className={`${INPUT} mt-2`}
          />
        </div>
        <div>
          <label htmlFor="expense-memo" className={LABEL}>
            내용 <span className="font-normal text-subtle">선택</span>
          </label>
          <input
            id="expense-memo"
            value={dtlMttr}
            onChange={(event) => setDtlMttr(event.target.value)}
            placeholder="예: 부분 미용"
            className={`${INPUT} mt-2`}
          />
        </div>
        {!canSave && (
          <MissingNotice
            missing={missing}
            isFutureYmd={ymd !== '' && ymd > maxYmd}
          />
        )}
      </form>
    </Modal>
  );
}
