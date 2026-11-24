import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import NoticeBox from '@/components/NoticeBox';
import DropdownSelect from '@/components/DropdownSelect';
import DatePicker from '@/components/DatePicker';
import Icon from '@/components/Icon';
import { PATHS } from '@/routes/paths';
import { getTodayYmd } from '@/utils/formatDate';
import {
  useCreateCheckup,
  useCreateReceiptCheckup,
  useFindNearSchedule,
  useUpdateCheckup,
} from '../queries';
import { CHECKUP_TYPES } from '../scheduleTypes';
import FieldError, { Required } from '@/components/FieldError';
import FormModal from './FormModal';
import NearScheduleModal from './NearScheduleModal';
import FieldFoot from '@/components/FieldFoot';
import { INPUT, LABEL, TEXTAREA } from '@/components/formStyles';

const MAX_HOSPITAL_NAME_LENGTH = 80;
const MAX_CONTENT_LENGTH = 500;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <Required />;

/**
 * [검진기록 추가 모달]
 * - 1단계 방법 선택 → 직접 입력 (FN-HLT-002-33·26~31). [영수증으로 추가하기]는 onReceipt로 부모가 이어받음
 * - initialStep="form": 영수증 인식에 실패해 [직접 입력]으로 연 경우. recptSn이 있으면 그 영수증에 연결해 저장(저장완료, 가계부 기록 없음),
 *   업로드 전 [직접 입력하기]처럼 recptSn이 없으면 영수증 연결 없이 저장
 * - 저장하면 서버가 같은 날 병원 일정에 연결하고, 없고 앞뒤 7일 안에 예정 일정이 있으면 옮겨 연결할지 먼저 확인
 * - 저장 뒤 새 검진기록의 검진상세로 이동
 * - checkup: 검진상세 ⋮ 메뉴 [수정]으로 연 수정 상태. 기존 값이 채워지고 방법 선택·예정 일정 확인 없이 저장 (※신규 정책)
 *   반려동물·검진일은 잠겨(disabled) 바꿀 수 없고, 저장 요청에도 넣지 않음. 병원명·검진 종류는 저장하면 캘린더 일정에도 반영
 *   연결된 일정이 삭제됐으면(schdlDelYn) 안내 상자가 그 사실을 알림. 반려동물·검진일을 바꾸려면 기록을 지우고 다시 등록
 */
export default function CheckupModal({
  pets,
  defaultPetSn,
  initialStep = 'select',
  recptSn,
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
  const [hsptlNm, setHsptlNm] = useState(checkup?.hsptlNm ?? '');
  const [ckupTypeCd, setCkupTypeCd] = useState(checkup?.ckupTypeCd ?? '');
  const [ckupCn, setCkupCn] = useState(checkup?.ckupCn ?? '');
  const [ckupMemoCn, setCkupMemoCn] = useState(checkup?.ckupMemoCn ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nearSchedule, setNearSchedule] = useState(null);
  const findNearSchedule = useFindNearSchedule();
  const createCheckup = useCreateCheckup();
  const createReceiptCheckup = useCreateReceiptCheckup();
  /** 영수증 저장의 중복 클릭·재전송 방지 ID. 다시 저장해도 같은 값을 보낸다 */
  const [idmptDmndId] = useState(() => crypto.randomUUID());
  const updateCheckup = useUpdateCheckup();
  const isPending =
    findNearSchedule.isPending ||
    createCheckup.isPending ||
    createReceiptCheckup.isPending ||
    updateCheckup.isPending;

  const errors = {
    pet: petSn == null,
    date: ckupYmd === '',
    hosp: hsptlNm.trim() === '',
    type: ckupTypeCd === '',
  };
  /** 백엔드가 상세 응답에 새로 추가하는 필드. 아직 없으면 false라 첫 문구가 나옴 */
  const isScheduleDeleted = checkup?.schdlDelYn === true;
  const isInvalid = (field) => isSubmitted && errors[field];

  const toDetailPath = (saved) =>
    generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
      petSn: saved.petSn,
      ckupRcdSn: saved.ckupRcdSn,
    });

  /** schdlSn: 검진일로 옮겨 연결할 예정 일정 */
  const save = (schdlSn) => {
    const body = {
      ckupYmd,
      hsptlNm: hsptlNm.trim(),
      ckupTypeCd,
      ckupCn: ckupCn.trim(),
      ckupMemoCn: ckupMemoCn.trim(),
      schdlSn,
    };
    const options = {
      onSuccess: (saved) => {
        onClose();
        navigate(toDetailPath(saved));
      },
    };
    if (recptSn) {
      createReceiptCheckup.mutate(
        { recptSn, petSn, body: { ...body, idmptDmndId } },
        options,
      );
      return;
    }
    createCheckup.mutate({ petSn, body }, options);
  };

  /** 수정 저장: 반려동물·검진일은 보내지 않는다(서버는 보낸 필드만 바꿈) */
  const saveEdit = () =>
    updateCheckup.mutate(
      {
        petSn: checkup.petSn,
        ckupRcdSn: checkup.ckupRcdSn,
        body: {
          hsptlNm: hsptlNm.trim(),
          ckupTypeCd,
          ckupCn: ckupCn.trim(),
          ckupMemoCn: ckupMemoCn.trim(),
        },
      },
      {
        onSuccess: onClose,
      },
    );

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    if (checkup) {
      saveEdit();
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
        title={checkup ? '검진기록 수정' : '검진기록 추가'}
        submitLabel={checkup ? '저장하기' : '등록하기'}
        hasFooter={step === 'form'}
        width={560}
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
              <span className="text-lg font-semibold text-ink">
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
              <span className="text-lg font-semibold text-ink">
                영수증으로 추가하기
              </span>
              <span className="text-subtle">사진에서 자동 인식</span>
            </button>
          </div>
        ) : (
          <>
            {onlyPetSn === null && (
              <label className="flex flex-col gap-1.5">
                <span className={LABEL}>반려동물{REQUIRED}</span>
                <DropdownSelect
                  value={petSn ?? ''}
                  disabled={Boolean(checkup)}
                  invalid={isInvalid('pet')}
                  placeholder="반려동물 선택"
                  options={pets.map((pet) => ({
                    value: pet.petSn,
                    label: pet.petNm,
                  }))}
                  onChange={setPetSn}
                />
                {isInvalid('pet') && (
                  <FieldError>반려동물을 선택해 주세요</FieldError>
                )}
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>검진일{REQUIRED}</span>
              <DatePicker
                value={ckupYmd}
                disabled={Boolean(checkup)}
                invalid={isInvalid('date')}
                onChange={setCkupYmd}
              />
              {!checkup && (
                <p className="text-subtle">
                  예정된 일정은 케어 캘린더에서 등록해 주세요
                </p>
              )}
              {isInvalid('date') && (
                <FieldError>검진일을 입력해 주세요</FieldError>
              )}
            </label>

            <div className="grid grid-cols-2 gap-x-4">
              <label className="flex flex-col gap-1.5">
                <span className={LABEL}>동물병원명{REQUIRED}</span>
                <input
                  value={hsptlNm}
                  maxLength={MAX_HOSPITAL_NAME_LENGTH}
                  aria-invalid={isInvalid('hosp')}
                  className={INPUT}
                  onChange={(event) => setHsptlNm(event.target.value)}
                />
                <FieldFoot
                  value={hsptlNm}
                  max={MAX_HOSPITAL_NAME_LENGTH}
                  error={isInvalid('hosp') && '병원명을 입력해 주세요'}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={LABEL}>검진 종류{REQUIRED}</span>
                <DropdownSelect
                  value={ckupTypeCd}
                  invalid={isInvalid('type')}
                  placeholder="선택해 주세요"
                  options={CHECKUP_TYPES.map((type) => ({
                    value: type.cd,
                    label: type.nm,
                  }))}
                  onChange={setCkupTypeCd}
                />
                {isInvalid('type') && (
                  <FieldError>검진 종류를 선택해 주세요</FieldError>
                )}
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>검진 내용</span>
              <textarea
                value={ckupCn}
                maxLength={MAX_CONTENT_LENGTH}
                placeholder="진료받은 내용을 적어주세요"
                className={TEXTAREA}
                onChange={(event) => setCkupCn(event.target.value)}
              />
              <FieldFoot value={ckupCn} max={MAX_CONTENT_LENGTH} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>검진 메모</span>
              <input
                value={ckupMemoCn}
                maxLength={MAX_MEMO_LENGTH}
                placeholder="다음에 확인할 것"
                className={INPUT}
                onChange={(event) => setCkupMemoCn(event.target.value)}
              />
              <FieldFoot value={ckupMemoCn} max={MAX_MEMO_LENGTH} />
            </label>

            <NoticeBox className="flex gap-2">
              <Icon
                name={isScheduleDeleted ? 'event_busy' : 'event'}
                className="shrink-0 text-lg"
              />
              {checkup
                ? isScheduleDeleted
                  ? '연결된 케어 캘린더 일정이 삭제되어 반려동물과 검진일은 바꿀 수 없어요. 바꾸려면 이 검진기록을 삭제한 뒤 다시 등록해 주세요'
                  : '반려동물과 검진일은 케어 캘린더에서 이 병원 일정을 수정하면 함께 바뀌어요. 동물병원명과 검진 종류는 저장하면 캘린더 일정에도 반영돼요'
                : '저장하면 케어 캘린더에도 표시됩니다. 같은 날짜에 등록한 병원 일정이 있으면 그 일정과 자동으로 연결됩니다'}
            </NoticeBox>

            {createReceiptCheckup.isError && (
              <NoticeBox tone="danger" role="alert">
                {createReceiptCheckup.error.message}
              </NoticeBox>
            )}
          </>
        )}
      </FormModal>

      {nearSchedule && (
        <NearScheduleModal
          rows={[
            {
              key: 'near',
              schedule: nearSchedule,
              petNm: pets.find((pet) => pet.petSn === petSn)?.petNm,
            },
          ]}
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
