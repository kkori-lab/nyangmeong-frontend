import { useEffect, useRef, useState } from 'react';
import Badge from '@/components/Badge';
import DropdownSelect from '@/components/DropdownSelect';
import DatePicker from '@/components/DatePicker';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import Toggle from '@/components/Toggle';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import FieldError, { Required } from '@/components/FieldError';
import { INPUT, LABEL } from '@/components/formStyles';
import { formatDate } from '@/utils/formatDate';
import CareShortageNotice from '../CareShortageNotice';
import FormModal from '../diary/FormModal';
import FieldFoot from '@/components/FieldFoot';
import { useBulkSavePrescriptions, useDeletePrescription } from '../queries';
import { DOSE_STATUSES, DOSING } from './checkupTypes';

const MAX_MEDICINE_NAME_LENGTH = 40;

const REQUIRED = <Required />;

const NEW_MEDICINE_NAME = '새 약';

/** 칸별 오류 문구(서버 오류가 없을 때 보이는 기본 문구) */
const ERROR_MESSAGES = {
  name: '약품명을 입력해 주세요',
  begin: '복용 시작일을 입력해 주세요',
  end: '복용 종료일을 시작일 이후로 입력해 주세요',
  count: '1일 복용 횟수를 1회 이상으로 입력해 주세요',
};

/** 서버 칸 이름 → 약 한 개 칸 */
const SERVER_FIELDS = {
  mdcnNm: 'name',
  mdcnBgngYmd: 'begin',
  mdcnEndYmd: 'end',
  dayMdcnNmtm: 'count',
};

/** 서버 칸별 오류 이름: values[0].mdcnNm */
const SERVER_FIELD_PATTERN = /^values\[(\d+)\]\.(\w+)$/;

/** 모달 안 약 구분 키(저장 전 새 약은 prscSn이 없어서) */
let lastMedicineKey = 0;
const createKey = () => {
  lastMedicineKey += 1;
  return lastMedicineKey;
};

const toMedicine = (key, prescription, isOpen) => ({
  key,
  prscSn: prescription?.prscSn ?? null,
  mdcnNm: prescription?.mdcnNm ?? '',
  mdcnBgngYmd: prescription?.mdcnBgngYmd ?? '',
  mdcnEndYmd: prescription?.mdcnEndYmd ?? '',
  dayMdcnNmtm: prescription ? String(prescription.dayMdcnNmtm) : '',
  prscSttsCd: prescription?.prscSttsCd ?? DOSING,
  careRfltYn: prescription?.careRfltYn ?? false,
  isOpen,
});

const getMedicineErrors = (medicine) => ({
  name: medicine.mdcnNm.trim() === '',
  begin: medicine.mdcnBgngYmd === '',
  end:
    medicine.mdcnEndYmd === '' ||
    (medicine.mdcnBgngYmd !== '' && medicine.mdcnEndYmd < medicine.mdcnBgngYmd),
  count:
    !Number.isInteger(Number(medicine.dayMdcnNmtm)) ||
    Number(medicine.dayMdcnNmtm) < 1,
});

const hasError = (medicine) =>
  Object.values(getMedicineErrors(medicine)).some(Boolean);

const getMedicineName = (medicine) =>
  medicine.mdcnNm.trim() || NEW_MEDICINE_NAME;

/**
 * [처방·투약 추가·수정 모달] 한 모달에서 여러 약을 한 번에 저장 (FN-HLT-005-03)
 * - 추가: 빈 약 하나가 펼쳐진 채 시작. 수정(editSn): 이 검진의 약이 모두 채워져 들어오고 누른 약만 펼침
 * - 약 칸: 약품명·복용 시작일·종료일·1일 복용 횟수·복용 상태 모두 필수, 종료일은 시작일 이후만, 주기 체크는 약마다
 * - 머리 줄을 눌러 펼치고 접음. 여러 약을 동시에 펼칠 수 있음. [＋ 약 추가]는 펼친 약을 접고 새 약만 펼친 채 그 위치로 스크롤
 * - 모달 높이는 약 개수와 상관없이 고정(FormModal isFixedHeight), 약 목록 본문만 안에서 스크롤
 * - 쓰레기통: 확인 뒤 저장된 약은 바로 삭제(DELETE), 저장 전 새 약은 모달에서 뺌
 * - [저장하기]: 모달의 약 전부를 일괄 저장 한 번. 400이면 아무것도 저장되지 않아 모달을 두고 틀린 약을 펼쳐 칸 아래에 오류
 */
export default function PrescriptionModal({
  petSn,
  ckupRcdSn,
  prescriptions,
  editSn,
  onClose,
}) {
  const isEdit = editSn != null;
  const [medicines, setMedicines] = useState(() =>
    isEdit
      ? prescriptions.map((prescription) =>
          toMedicine(createKey(), prescription, prescription.prscSn === editSn),
        )
      : [toMedicine(createKey(), null, true)],
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  /** 서버 칸별 오류: { [약 key]: { name|begin|end|count: 문구 } } */
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const bulkSave = useBulkSavePrescriptions();
  const deletePrescription = useDeletePrescription();
  const isPending = bulkSave.isPending || deletePrescription.isPending;

  const changeMedicine = (key, field, value) => {
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.key === key ? { ...medicine, [field]: value } : medicine,
      ),
    );
    setServerErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleMedicine = (key) =>
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.key === key
          ? { ...medicine, isOpen: !medicine.isOpen }
          : medicine,
      ),
    );

  /** [＋ 약 추가]: 펼친 약은 모두 접고 새 약만 펼침. 새 약은 그려질 때 보이는 위치로 스크롤(isAdded) */
  const addMedicine = () =>
    setMedicines((prev) => [
      ...prev.map((medicine) => ({ ...medicine, isOpen: false })),
      { ...toMedicine(createKey(), null, true), isAdded: true },
    ]);

  const removeMedicine = (key) =>
    setMedicines((prev) => prev.filter((medicine) => medicine.key !== key));

  const handleDelete = () => {
    const target = deleteTarget;
    if (target.prscSn == null) {
      removeMedicine(target.key);
      setDeleteTarget(null);
      return;
    }
    deletePrescription.mutate(
      { petSn, ckupRcdSn, prscSn: target.prscSn },
      {
        onSuccess: () => {
          removeMedicine(target.key);
          setDeleteTarget(null);
        },
      },
    );
  };

  /** 서버 칸별 오류를 약마다 나눈다. 칸에 붙일 수 없는 문구는 모달 아래 오류 줄로 */
  const showServerErrors = (error, sentMedicines) => {
    const byKey = {};
    const hidden = [];
    error.fields.forEach(({ field, message }) => {
      const match = SERVER_FIELD_PATTERN.exec(field);
      const medicine = match && sentMedicines[Number(match[1])];
      const localField = match && SERVER_FIELDS[match[2]];
      if (medicine && localField) {
        byKey[medicine.key] = { ...byKey[medicine.key], [localField]: message };
      } else {
        hidden.push(message);
      }
    });
    setServerErrors(byKey);
    setFormError(hidden.length > 0 ? [...new Set(hidden)].join(' ') : null);
    setMedicines((prev) =>
      prev.map((medicine) =>
        byKey[medicine.key] ? { ...medicine, isOpen: true } : medicine,
      ),
    );
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setFormError(null);
    if (medicines.some(hasError)) {
      setMedicines((prev) =>
        prev.map((medicine) =>
          hasError(medicine) ? { ...medicine, isOpen: true } : medicine,
        ),
      );
      return;
    }
    const sentMedicines = medicines;
    bulkSave.mutate(
      {
        petSn,
        ckupRcdSn,
        values: sentMedicines.map((medicine) => ({
          ...(medicine.prscSn != null && { prscSn: medicine.prscSn }),
          mdcnNm: medicine.mdcnNm.trim(),
          mdcnBgngYmd: medicine.mdcnBgngYmd,
          mdcnEndYmd: medicine.mdcnEndYmd,
          dayMdcnNmtm: Number(medicine.dayMdcnNmtm),
          prscSttsCd: medicine.prscSttsCd,
          careRfltYn: medicine.careRfltYn,
        })),
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (error.fields) showServerErrors(error, sentMedicines);
        },
      },
    );
  };

  return (
    <>
      <FormModal
        title={isEdit ? '처방·투약 수정' : '처방·투약 추가'}
        isFixedHeight
        isPending={isPending}
        isSubmitDisabled={medicines.length === 0}
        onSubmit={handleSubmit}
        onClose={onClose}
      >
        {medicines.length === 0 ? (
          <p className="text-muted">추가할 약이 없어요</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {medicines.map((medicine) => (
              <MedicineItem
                key={medicine.key}
                medicine={medicine}
                errors={getShownErrors(
                  medicine,
                  isSubmitted,
                  serverErrors[medicine.key],
                )}
                isPending={isPending}
                onToggle={() => toggleMedicine(medicine.key)}
                onChange={(field, value) =>
                  changeMedicine(medicine.key, field, value)
                }
                onDelete={() => setDeleteTarget(medicine)}
              />
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={isPending}
          className={`${BTN_SECONDARY} w-full shrink-0`}
          onClick={addMedicine}
        >
          <Icon name="add" className="text-lg" />약 추가
        </button>
        {formError && <FieldError>{formError}</FieldError>}
      </FormModal>

      {deleteTarget && (
        <Modal
          isConfirm
          title="이 처방약을 삭제할까요?"
          description="삭제하면 되돌릴 수 없어요."
          isPending={deletePrescription.isPending}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deletePrescription.isPending}
                onClick={() => setDeleteTarget(null)}
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
        >
          {/** 저장된 약을 지우면 케어리스트가 5개 미만이 될 때만 안내 (※신규 정책) */}
          {deleteTarget.prscSn != null && (
            <CareShortageNotice
              petSn={petSn}
              isTarget={(item) => item.prscSn === deleteTarget.prscSn}
            />
          )}
        </Modal>
      )}
    </>
  );
}

/** 보여 줄 칸별 오류 문구: 제출 뒤 입력 검증 문구, 없으면 서버 문구 */
function getShownErrors(medicine, isSubmitted, serverError = {}) {
  const localErrors = isSubmitted ? getMedicineErrors(medicine) : {};
  return Object.fromEntries(
    Object.keys(ERROR_MESSAGES)
      .map((field) => [
        field,
        localErrors[field] ? ERROR_MESSAGES[field] : serverError[field],
      ])
      .filter(([, message]) => message),
  );
}

/** 약 한 개: 접힌 한 줄 또는 펼친 머리 줄 + 칸 영역 */
function MedicineItem({
  medicine,
  errors,
  isPending,
  onToggle,
  onChange,
  onDelete,
}) {
  const name = getMedicineName(medicine);
  const itemRef = useRef(null);

  /**
   * [＋ 약 추가]로 생긴 약: 처음 그려질 때 머리 줄이 보이게 폼 본문만 내림
   * - scrollIntoView는 바깥 모달 감싸개까지 밀어 제목 줄이 움직여서 폼(스크롤 영역)을 직접 스크롤
   */
  useEffect(() => {
    if (!medicine.isAdded) return;
    const item = itemRef.current;
    const scroller = item.closest('form');
    const paddingTop = parseFloat(getComputedStyle(scroller).paddingTop);
    scroller.scrollTo({
      top:
        scroller.scrollTop +
        item.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        paddingTop,
      behavior: 'smooth',
    });
    // 처음 그려질 때 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteButton = (
    <button
      type="button"
      aria-label={`${name} 삭제`}
      disabled={isPending}
      className="grid size-9 shrink-0 place-items-center rounded-md text-danger hover:enabled:bg-danger-soft disabled:opacity-50"
      onClick={onDelete}
    >
      <Icon name="delete" className="text-xl" />
    </button>
  );

  if (!medicine.isOpen) {
    const hasDates = medicine.mdcnBgngYmd !== '' || medicine.mdcnEndYmd !== '';
    return (
      <li
        ref={itemRef}
        className="flex items-center gap-2 border-b border-line-soft bg-white py-1 pr-2 pl-3"
      >
        <button
          type="button"
          aria-expanded={false}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left"
          onClick={onToggle}
        >
          <Icon name="chevron_right" className="text-lg text-subtle" />
          <span className="truncate font-semibold">{name}</span>
          {hasDates && (
            <span className="shrink-0 text-subtle tabular-nums">
              · {formatDate(medicine.mdcnBgngYmd)}~
              {formatDate(medicine.mdcnEndYmd)}
            </span>
          )}
        </button>
        <Badge tone={medicine.prscSttsCd === DOSING ? 'ok' : 'gray'}>
          {medicine.prscSttsCd === DOSING ? '복용 중' : '종료'}
        </Badge>
        {deleteButton}
      </li>
    );
  }

  return (
    <li
      ref={itemRef}
      className="overflow-hidden rounded-xl border border-brand-100"
    >
      <div className="flex items-center gap-2 bg-brand-50 py-1 pr-2 pl-3">
        <button
          type="button"
          aria-expanded
          className="flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left font-semibold text-brand-600"
          onClick={onToggle}
        >
          <Icon name="expand_more" className="text-lg" />
          <span className="truncate">{name}</span>
        </button>
        {deleteButton}
      </div>
      <MedicineFields medicine={medicine} errors={errors} onChange={onChange} />
    </li>
  );
}

/** 약 한 개의 입력칸 */
function MedicineFields({ medicine, errors, onChange }) {
  return (
    <div className="grid gap-5 bg-white p-5">
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>약품명{REQUIRED}</span>
        <input
          value={medicine.mdcnNm}
          maxLength={MAX_MEDICINE_NAME_LENGTH}
          aria-invalid={Boolean(errors.name)}
          className={INPUT}
          onChange={(event) => onChange('mdcnNm', event.target.value)}
        />
        <FieldFoot
          value={medicine.mdcnNm}
          max={MAX_MEDICINE_NAME_LENGTH}
          error={errors.name}
        />
      </label>

      <div className="grid gap-x-8 gap-y-5 min-[760px]:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>복용 시작일{REQUIRED}</span>
          <DatePicker
            value={medicine.mdcnBgngYmd}
            invalid={Boolean(errors.begin)}
            onChange={(value) => onChange('mdcnBgngYmd', value)}
          />
          {errors.begin && <FieldError>{errors.begin}</FieldError>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>복용 종료일{REQUIRED}</span>
          <DatePicker
            value={medicine.mdcnEndYmd}
            min={medicine.mdcnBgngYmd || undefined}
            invalid={Boolean(errors.end)}
            onChange={(value) => onChange('mdcnEndYmd', value)}
          />
          <p className="text-sm text-muted">
            시작일 이후 날짜만 선택할 수 있어요
          </p>
          {errors.end && <FieldError>{errors.end}</FieldError>}
        </label>
      </div>

      <div className="grid gap-x-8 gap-y-5 min-[760px]:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>1일 복용 횟수{REQUIRED}</span>
          <span className="relative">
            <input
              type="number"
              min="1"
              value={medicine.dayMdcnNmtm}
              aria-invalid={Boolean(errors.count)}
              className={`${INPUT} pr-11 tabular-nums`}
              onChange={(event) => onChange('dayMdcnNmtm', event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
              회
            </span>
          </span>
          {errors.count && <FieldError>{errors.count}</FieldError>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>복용 상태{REQUIRED}</span>
          <DropdownSelect
            value={medicine.prscSttsCd}
            options={DOSE_STATUSES.map((status) => ({
              value: status.cd,
              label: status.nm,
            }))}
            onChange={(value) => onChange('prscSttsCd', value)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>주기 체크</span>
        <span className="flex items-center gap-2.5">
          <Toggle
            checked={medicine.careRfltYn}
            label={`${getMedicineName(medicine)} 주기 체크`}
            onChange={(value) => onChange('careRfltYn', value)}
          />
          <span className="text-sm text-muted">
            ON 시 케어리스트에 투약 항목 자동 추가
          </span>
        </span>
      </div>
    </div>
  );
}
