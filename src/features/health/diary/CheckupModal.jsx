import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { getTodayYmd } from '@/utils/formatDate';
import {
  useCreateCheckup,
  useFindNearSchedule,
  useUpdateCheckup,
} from '../queries';
import { CHECKUP_TYPES } from '../scheduleTypes';
import FieldError from './FieldError';
import FormModal from './FormModal';
import NearScheduleModal from './NearScheduleModal';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
  TEXTAREA_CLASS,
} from './formStyles';

const MAX_HOSPITAL_NAME_LENGTH = 50;
const MAX_CONTENT_LENGTH = 500;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <span className="ml-0.5 font-bold text-[#b4473a]">*</span>;
const OPTIONAL = (
  <span className="ml-1 text-[13px] font-medium text-[#667374]">선택</span>
);

/**
 * [검진기록 등록 모달]
 * - 1단계 방법 선택 → 직접 입력 (FN-HLT-002-33·26~31). [영수증으로 등록하기]는 onReceipt로 부모가 이어받음
 * - initialStep="form"·rcptSn: 영수증 인식에 실패해 [직접 입력]으로 연 경우, 저장 때 이 영수증을 검진기록에 연결
 * - 저장하면 같은 날 병원 일정에 연결하고, 없고 앞뒤 7일 안에 예정 일정이 있으면 옮겨 연결할지 먼저 확인
 * - 저장 뒤 새 검진기록의 검진상세로 이동
 * - checkup: 검진상세 [검진기록 수정]으로 연 수정 상태. 기존 값이 채워지고 방법 선택·예정 일정 확인 없이 저장하며,
 *   반려동물을 바꾸면 연동 케어 항목도 옮겨진다는 확인 뒤 저장
 */
export default function CheckupModal({
  pets,
  defaultPetSn,
  initialStep = 'select',
  rcptSn,
  checkup,
  onReceipt,
  onClose,
}) {
  const navigate = useNavigate();
  const onlyPetSn = pets.length === 1 ? pets[0].petSn : null;
  const [step, setStep] = useState(checkup ? 'form' : initialStep);
  const [petSn, setPetSn] = useState(
    checkup?.petSn ?? onlyPetSn ?? defaultPetSn,
  );
  const [ckupYmd, setCkupYmd] = useState(checkup?.ckupYmd ?? getTodayYmd);
  const [hospNm, setHospNm] = useState(checkup?.hospNm ?? '');
  const [ckupTypeCd, setCkupTypeCd] = useState(checkup?.ckupTypeCd ?? '');
  const [ckupCn, setCkupCn] = useState(checkup?.ckupCn ?? '');
  const [ckupMemoCn, setCkupMemoCn] = useState(checkup?.ckupMemoCn ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nearSchedule, setNearSchedule] = useState(null);
  const [isMoveConfirmOpen, setIsMoveConfirmOpen] = useState(false);
  const findNearSchedule = useFindNearSchedule();
  const createCheckup = useCreateCheckup();
  const updateCheckup = useUpdateCheckup();
  const isPending =
    findNearSchedule.isPending ||
    createCheckup.isPending ||
    updateCheckup.isPending;

  const errors = {
    pet: petSn == null,
    date: ckupYmd === '',
    hosp: hospNm.trim() === '',
    type: ckupTypeCd === '',
  };
  const isInvalid = (field) => isSubmitted && errors[field];

  const save = (nearSchdlSn) =>
    createCheckup.mutate(
      {
        petSn,
        ckupYmd,
        hospNm: hospNm.trim(),
        ckupTypeCd,
        ckupCn: ckupCn.trim(),
        ckupMemoCn: ckupMemoCn.trim(),
        nearSchdlSn,
        rcptSn,
      },
      {
        onSuccess: (checkup) => {
          onClose();
          navigate(
            generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
              ckupRcdSn: checkup.ckupRcdSn,
            }),
          );
        },
      },
    );

  /** 수정 저장: 검진일을 바꾸면 이 검진기록만 바뀐 날짜의 병원 일정으로 옮겨짐 */
  const saveEdit = () =>
    updateCheckup.mutate(
      {
        ckupRcdSn: checkup.ckupRcdSn,
        petSn,
        ckupYmd,
        hospNm: hospNm.trim(),
        ckupTypeCd,
        ckupCn: ckupCn.trim(),
        ckupMemoCn: ckupMemoCn.trim(),
      },
      { onSuccess: onClose },
    );

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    if (checkup) {
      if (petSn === checkup.petSn) saveEdit();
      else setIsMoveConfirmOpen(true);
      return;
    }
    findNearSchedule.mutate(
      { petSn, ckupYmd },
      {
        onSuccess: (schedule) => {
          if (schedule) setNearSchedule(schedule);
          else save();
        },
      },
    );
  };

  return (
    <>
      <FormModal
        icon="local_hospital"
        title={checkup ? '검진기록 수정' : '검진기록 등록'}
        hasFooter={step === 'form'}
        widthClassName="w-[min(560px,calc(100%-32px))]"
        isPending={isPending}
        onSubmit={handleSubmit}
        onClose={onClose}
      >
        {step === 'select' ? (
          <div className="grid gap-3">
            <button
              type="button"
              className="flex flex-col items-center gap-1 rounded-[10px] border border-line px-4 py-6 hover:border-brand-500 hover:bg-brand-50"
              onClick={() => setStep('form')}
            >
              <span className="text-lg/[1.6] font-semibold text-ink">
                직접 입력하기
              </span>
              <span className="text-subtle">
                영수증이 없거나 직접 적고 싶을 때
              </span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 rounded-[10px] border border-line px-4 py-6 hover:border-brand-500 hover:bg-brand-50"
              onClick={onReceipt}
            >
              <span className="text-lg/[1.6] font-semibold text-ink">
                영수증으로 등록하기
              </span>
              <span className="text-subtle">사진에서 자동 인식</span>
            </button>
          </div>
        ) : (
          <>
            {onlyPetSn === null && (
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>반려동물{REQUIRED}</span>
                <select
                  value={petSn ?? ''}
                  aria-invalid={isInvalid('pet')}
                  className={SELECT_CLASS}
                  style={SELECT_ARROW_STYLE}
                  onChange={(event) =>
                    setPetSn(
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="">반려동물 선택</option>
                  {pets.map((pet) => (
                    <option key={pet.petSn} value={pet.petSn}>
                      {pet.petNm}
                    </option>
                  ))}
                </select>
                {isInvalid('pet') && (
                  <FieldError>반려동물을 선택해 주세요</FieldError>
                )}
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className={LABEL_CLASS}>검진일{REQUIRED}</span>
              <input
                type="date"
                value={ckupYmd}
                aria-invalid={isInvalid('date')}
                className={`${INPUT_CLASS} tabular-nums`}
                onChange={(event) => setCkupYmd(event.target.value)}
              />
              <p className="text-subtle">
                예정된 일정은 케어 캘린더에서 등록해 주세요
              </p>
              {isInvalid('date') && (
                <FieldError>검진일을 입력해 주세요</FieldError>
              )}
            </label>

            <div className="grid grid-cols-2 gap-x-4">
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>동물병원명{REQUIRED}</span>
                <input
                  value={hospNm}
                  maxLength={MAX_HOSPITAL_NAME_LENGTH}
                  aria-invalid={isInvalid('hosp')}
                  className={INPUT_CLASS}
                  onChange={(event) => setHospNm(event.target.value)}
                />
                {isInvalid('hosp') && (
                  <FieldError>병원명을 입력해 주세요</FieldError>
                )}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS}>검진 종류{REQUIRED}</span>
                <select
                  value={ckupTypeCd}
                  aria-invalid={isInvalid('type')}
                  className={SELECT_CLASS}
                  style={SELECT_ARROW_STYLE}
                  onChange={(event) => setCkupTypeCd(event.target.value)}
                >
                  <option value="">선택해 주세요</option>
                  {CHECKUP_TYPES.map((type) => (
                    <option key={type.cd} value={type.cd}>
                      {type.nm}
                    </option>
                  ))}
                </select>
                {isInvalid('type') && (
                  <FieldError>검진 종류를 선택해 주세요</FieldError>
                )}
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={LABEL_CLASS}>검진 내용{OPTIONAL}</span>
              <textarea
                value={ckupCn}
                maxLength={MAX_CONTENT_LENGTH}
                placeholder="진료받은 내용을 적어주세요"
                className={TEXTAREA_CLASS}
                onChange={(event) => setCkupCn(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={LABEL_CLASS}>검진 메모{OPTIONAL}</span>
              <input
                value={ckupMemoCn}
                maxLength={MAX_MEMO_LENGTH}
                placeholder="다음에 확인할 것"
                className={INPUT_CLASS}
                onChange={(event) => setCkupMemoCn(event.target.value)}
              />
            </label>

            <p className="flex gap-2 rounded-[10px] bg-surface-2 px-4 py-3 text-muted">
              <Icon name="event" className="shrink-0 text-xl" />
              저장하면 케어 캘린더에도 표시됩니다. 같은 날짜에 등록한 병원
              일정이 있으면 그 일정과 자동으로 연결됩니다
            </p>
          </>
        )}
      </FormModal>

      {isMoveConfirmOpen && (
        <Modal
          isConfirm
          title={`이 검진기록과 연동된 케어 항목도 ${
            pets.find((pet) => pet.petSn === petSn)?.petNm
          }(으)로 옮겨집니다`}
          isPending={isPending}
          onClose={() => setIsMoveConfirmOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={isPending}
                onClick={() => setIsMoveConfirmOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_PRIMARY}
                disabled={isPending}
                onClick={saveEdit}
              >
                옮기기
              </button>
            </>
          }
        />
      )}

      {nearSchedule && (
        <NearScheduleModal
          rows={[{ key: 'near', schedule: nearSchedule }]}
          ckupYmd={ckupYmd}
          isPending={isPending}
          onConfirm={({ near: isMove }) =>
            save(isMove ? nearSchedule.schdlSn : undefined)
          }
          onClose={() => setNearSchedule(null)}
        />
      )}
    </>
  );
}
