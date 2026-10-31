import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/Modal';
import Toggle from '@/components/Toggle';
import {
  BTN_DANGER,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from '@/components/buttonStyles';
import FieldError from '../diary/FieldError';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
} from '../diary/formStyles';
import {
  useCreatePrescription,
  useDeletePrescription,
  useUpdatePrescription,
} from '../queries';
import { SUB_BOX, TEXT_BTN_DEL } from './checkupStyles';
import { DOSE_STATUSES, DOSING } from './checkupTypes';

const MAX_MEDICINE_NAME_LENGTH = 40;

const REQUIRED = <span className="ml-0.5 font-bold text-danger">*</span>;

/**
 * [처방약 입력 영역]
 * - 약품명·복용 시작일·종료일·1일 복용 횟수·복용 상태 모두 필수, 종료일은 시작일 이후만 (FN-HLT-005-03)
 * - 주기 체크 ON으로 저장하면 케어 캘린더 일상관리에 투약 항목이 생김
 * - prescription이 있으면 기존 값이 채워진 수정 상태이고 [삭제] 제공
 */
export default function PrescriptionForm({
  petSn,
  ckupRcdSn,
  prescription,
  onClose,
}) {
  const formRef = useRef(null);
  const [medNm, setMedNm] = useState(prescription?.mdcnNm ?? '');
  const [dosBgnYmd, setDosBgnYmd] = useState(prescription?.mdcnBgngYmd ?? '');
  const [dosEndYmd, setDosEndYmd] = useState(prescription?.mdcnEndYmd ?? '');
  const [dayDosCnt, setDayDosCnt] = useState(
    prescription ? String(prescription.dayMdcnNmtm) : '',
  );
  const [dosSttsCd, setDosSttsCd] = useState(
    prescription?.prscSttsCd ?? DOSING,
  );
  const [cycleChckYn, setCycleChckYn] = useState(
    prescription?.careRfltYn ?? false,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();
  const deletePrescription = useDeletePrescription();
  const isPending =
    createPrescription.isPending ||
    updatePrescription.isPending ||
    deletePrescription.isPending;

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const errors = {
    name: medNm.trim() === '',
    begin: dosBgnYmd === '',
    end: dosEndYmd === '' || (dosBgnYmd !== '' && dosEndYmd < dosBgnYmd),
    count: !Number.isInteger(Number(dayDosCnt)) || Number(dayDosCnt) < 1,
  };
  const isInvalid = (field) => isSubmitted && errors[field];

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    const body = {
      petSn,
      ckupRcdSn,
      mdcnNm: medNm.trim(),
      mdcnBgngYmd: dosBgnYmd,
      mdcnEndYmd: dosEndYmd,
      dayMdcnNmtm: Number(dayDosCnt),
      prscSttsCd: dosSttsCd,
      careRfltYn: cycleChckYn,
    };
    if (prescription) {
      updatePrescription.mutate(
        { ...body, prscSn: prescription.prscSn },
        { onSuccess: onClose },
      );
    } else {
      createPrescription.mutate(body, { onSuccess: onClose });
    }
  };

  const handleDelete = () =>
    deletePrescription.mutate(
      { petSn, ckupRcdSn, prscSn: prescription.prscSn },
      { onSuccess: onClose },
    );

  return (
    <form
      ref={formRef}
      noValidate
      className={`${SUB_BOX} grid gap-5`}
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>약품명{REQUIRED}</span>
        <input
          value={medNm}
          maxLength={MAX_MEDICINE_NAME_LENGTH}
          aria-invalid={isInvalid('name')}
          className={INPUT_CLASS}
          onChange={(event) => setMedNm(event.target.value)}
        />
        {isInvalid('name') && <FieldError>약품명을 입력해 주세요</FieldError>}
      </label>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>복용 시작일{REQUIRED}</span>
          <input
            type="date"
            value={dosBgnYmd}
            aria-invalid={isInvalid('begin')}
            className={`${INPUT_CLASS} tabular-nums`}
            onChange={(event) => setDosBgnYmd(event.target.value)}
          />
          {isInvalid('begin') && (
            <FieldError>복용 시작일을 입력해 주세요</FieldError>
          )}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>복용 종료일{REQUIRED}</span>
          <input
            type="date"
            value={dosEndYmd}
            min={dosBgnYmd || undefined}
            aria-invalid={isInvalid('end')}
            className={`${INPUT_CLASS} tabular-nums`}
            onChange={(event) => setDosEndYmd(event.target.value)}
          />
          <p className="text-sm text-muted">
            시작일 이후 날짜만 선택할 수 있어요
          </p>
          {isInvalid('end') && (
            <FieldError>복용 종료일을 시작일 이후로 입력해 주세요</FieldError>
          )}
        </label>
      </div>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>1일 복용 횟수{REQUIRED}</span>
          <span className="relative">
            <input
              type="number"
              min="1"
              value={dayDosCnt}
              aria-invalid={isInvalid('count')}
              className={`${INPUT_CLASS} pr-11 tabular-nums`}
              onChange={(event) => setDayDosCnt(event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
              회
            </span>
          </span>
          {isInvalid('count') && (
            <FieldError>1일 복용 횟수를 1회 이상으로 입력해 주세요</FieldError>
          )}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>복용 상태{REQUIRED}</span>
          <select
            value={dosSttsCd}
            className={SELECT_CLASS}
            style={SELECT_ARROW_STYLE}
            onChange={(event) => setDosSttsCd(event.target.value)}
          >
            {DOSE_STATUSES.map((status) => (
              <option key={status.cd} value={status.cd}>
                {status.nm}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>주기 체크</span>
        <span className="flex items-center gap-2.5">
          <Toggle
            checked={cycleChckYn}
            label="주기 체크"
            onChange={setCycleChckYn}
          />
          <span className="text-sm text-muted">
            ON 시 토탈 케어리스트에 투약 항목 자동 추가
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {prescription && (
          <button
            type="button"
            className={TEXT_BTN_DEL}
            disabled={isPending}
            onClick={() => setIsDeleteOpen(true)}
          >
            삭제
          </button>
        )}
        <span className="ml-auto" />
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={isPending}
          onClick={onClose}
        >
          취소
        </button>
        <button type="submit" className={BTN_PRIMARY} disabled={isPending}>
          저장하기
        </button>
      </div>

      {isDeleteOpen && (
        <Modal
          isConfirm
          title="이 처방약을 삭제할까요?"
          isPending={deletePrescription.isPending}
          onClose={() => setIsDeleteOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deletePrescription.isPending}
                onClick={() => setIsDeleteOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deletePrescription.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}
    </form>
  );
}
