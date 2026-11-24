import { useId, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import DropdownSelect from '@/components/DropdownSelect';
import DatePicker from '@/components/DatePicker';
import TimeSelect from '@/components/TimeSelect';
import ConfirmModal from '@/components/ConfirmModal';
import FieldError, { Required } from '@/components/FieldError';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { HELP, INPUT, LABEL } from '@/components/formStyles';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import NoticeBox from '@/components/NoticeBox';
import { getHmOf, getYmdOf, makeDateTime } from '@/utils/formatDate';
import {
  BADGE_COLORS,
  CHECKUP_TYPES,
  HOSPITAL,
  SCHEDULE_TYPES,
  TONE_CLASSES,
} from './scheduleTypes';
import {
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
} from './queries';
import { TEXT_BTN } from './checkup/checkupStyles';
import SegmentSwitch from './SegmentSwitch';
import FieldFoot from '@/components/FieldFoot';

const MAX_HOSPITAL_NAME_LENGTH = 80;
const MAX_SCHEDULE_NAME_LENGTH = 40;
const MAX_MEMO_LENGTH = 500;

const toForm = (schedule, defaultPetSn, defaultYmd) => ({
  petSn: schedule?.petSn ?? defaultPetSn ?? null,
  schdlKndCd: schedule?.schdlKndCd ?? null,
  ckupTypeCd: schedule?.ckupTypeCd ?? '',
  hsptlNm: schedule?.hsptlNm ?? '',
  schdlNm: schedule?.schdlNm ?? '',
  scheduleDate: schedule ? getYmdOf(schedule.schdlDt) : defaultYmd,
  scheduleTime: schedule?.hrInptYn ? getHmOf(schedule.schdlDt) : '',
  memoCn: schedule?.memoCn ?? '',
  cldrBadgeColrCd: schedule?.cldrBadgeColrCd ?? '',
});

/**
 * 일정 추가·수정 모달(FN-HLT-003-32~37). schedule이 있으면 수정, 없으면 등록이다
 * - 조건 A(수정 + 병원 일정 + 연결된 검진기록 있음)(※신규 정책): 폼 맨 아래 안내 상자, 삭제 확인창에 안내와 「검진기록 보기 ›」
 *   「검진기록 보기」는 일정을 지우지 않고 닫은 뒤 이동. 연결 1건(schedule.ckupRcdSn)은 검진상세, 아니면 그 반려동물의 건강 일지 검진기록 탭
 */
export default function ScheduleModal({
  pets,
  schedule,
  defaultPetSn,
  defaultYmd,
  onClose,
  onCreateNew,
}) {
  const navigate = useNavigate();
  const formId = useId();
  const petSelectId = useId();
  const isEdit = schedule != null;
  const onlyPetSn = pets.length === 1 ? pets[0].petSn : null;
  const [form, setForm] = useState(() =>
    toForm(schedule, onlyPetSn ?? defaultPetSn, defaultYmd),
  );
  const [confirm, setConfirm] = useState(null);
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const isPending =
    createSchedule.isPending ||
    updateSchedule.isPending ||
    deleteSchedule.isPending;
  const saveError = isEdit ? updateSchedule.error : createSchedule.error;
  const fieldError = (field) =>
    saveError?.fields?.find((item) => item.field === field)?.message;

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  // 종류를 바꾸면 이전 종류의 입력값은 유지하지 않는다(FN-HLT-003-35)
  const handleTypeChange = (schdlKndCd) =>
    setForm((prev) => ({
      ...prev,
      schdlKndCd,
      ckupTypeCd: '',
      hsptlNm: '',
      schdlNm: '',
    }));

  const isHospitalForm = form.schdlKndCd === HOSPITAL;
  const hasLinkedCheckup =
    isEdit && schedule.schdlKndCd === HOSPITAL && schedule.ckupRcdCnt > 0;
  const canSubmit =
    form.petSn != null &&
    form.schdlKndCd !== null &&
    form.scheduleDate !== '' &&
    (isHospitalForm
      ? form.ckupTypeCd !== '' && form.hsptlNm.trim() !== ''
      : form.schdlNm.trim() !== '') &&
    !isPending;

  const toBody = () => ({
    schdlKndCd: form.schdlKndCd,
    schdlDt: makeDateTime(form.scheduleDate, form.scheduleTime),
    hrInptYn: form.scheduleTime !== '',
    ckupTypeCd: isHospitalForm ? form.ckupTypeCd : null,
    hsptlNm: isHospitalForm ? form.hsptlNm.trim() : null,
    schdlNm: isHospitalForm ? null : form.schdlNm.trim(),
    memoCn: form.memoCn.trim(),
    // 고르지 않으면 ''을 보낸다. 등록은 비워 저장하고, 수정은 고른 색을 지운다
    cldrBadgeColrCd: form.cldrBadgeColrCd,
  });

  const save = () => {
    const options = { onSuccess: onClose };
    if (isEdit)
      updateSchedule.mutate(
        {
          petSn: schedule.petSn,
          schdlSn: schedule.schdlSn,
          body: { ...toBody(), petSn: form.petSn },
        },
        options,
      );
    else createSchedule.mutate({ petSn: form.petSn, body: toBody() }, options);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    // 검진기록이 연결된 병원 일정의 반려동물을 바꾸면 연동 데이터도 옮겨지므로 먼저 확인받는다(FN-HLT-003-37)
    const movesLinkedRecords =
      hasLinkedCheckup && form.petSn !== schedule.petSn;
    if (movesLinkedRecords) {
      setConfirm('move');
      return;
    }
    save();
  };

  const handleDelete = () =>
    deleteSchedule.mutate(
      { petSn: schedule.petSn, schdlSn: schedule.schdlSn },
      { onSuccess: onClose },
    );

  /** 일정은 지우지 않고 확인창과 모달을 닫은 뒤 검진기록으로 이동 */
  const goToCheckup = () => {
    const path = schedule.ckupRcdSn
      ? generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
          petSn: schedule.petSn,
          ckupRcdSn: schedule.ckupRcdSn,
        })
      : `${PATHS.HEALTH_DIARY}?petSn=${schedule.petSn}#hlt002-exam`;
    setConfirm(null);
    onClose();
    navigate(path);
  };

  const targetPetNm = pets.find((pet) => pet.petSn === form.petSn)?.petNm;

  const secondaryButtonClass = `${BTN_SECONDARY} min-w-24 whitespace-nowrap`;
  const required = <Required />;
  const optional = (
    <span className="ml-1 text-[13px] font-medium text-subtle">선택</span>
  );

  // 수정일 때만 본문 첫 이름표 줄 오른쪽 끝(제목 줄 ✕ 아래)에 둔다
  const deleteButton = isEdit && (
    <button
      type="button"
      aria-label="일정 삭제"
      disabled={isPending}
      className="-my-2 grid size-9 shrink-0 place-items-center rounded-md bg-danger-soft text-danger disabled:opacity-50"
      onClick={() => setConfirm('delete')}
    >
      <Icon name="delete" className="text-xl" />
    </button>
  );

  const footer = (
    <>
      {isEdit ? (
        <button
          type="button"
          className="text-base font-semibold text-brand-600 hover:underline hover:underline-offset-[3px]"
          onClick={onCreateNew}
        >
          새 일정 추가
        </button>
      ) : (
        <p className="text-muted">
          <Required /> 표시는 필수 항목이에요
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          className={secondaryButtonClass}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="submit"
          form={formId}
          disabled={!canSubmit}
          className={`${BTN_PRIMARY} min-w-24 whitespace-nowrap`}
        >
          {isEdit ? '저장하기' : '등록하기'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <Modal
        title={isEdit ? '일정 수정' : '일정 추가'}
        isLarge
        isAutoHeight
        width={720}
        isPending={isPending}
        onClose={onClose}
        footer={footer}
      >
        <form id={formId} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5 px-6 py-5">
            {onlyPetSn === null && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={petSelectId} className={LABEL}>
                    반려동물{required}
                  </label>
                  {deleteButton}
                </div>
                <DropdownSelect
                  id={petSelectId}
                  value={form.petSn ?? ''}
                  placeholder="반려동물 선택"
                  options={pets.map((pet) => ({
                    value: pet.petSn,
                    label: pet.petNm,
                  }))}
                  onChange={(value) => setField('petSn', value)}
                />
                <FieldError>{fieldError('petSn')}</FieldError>
              </div>
            )}

            <fieldset className="flex flex-col gap-1.5">
              {/* 반려동물이 한 마리라 반려동물 칸이 없으면 이 줄이 첫 줄이므로 삭제 버튼을 여기에 둔다 */}
              <legend
                className={`${LABEL} mb-1.5 flex w-full items-center justify-between gap-3`}
              >
                <span>일정 종류{required}</span>
                {onlyPetSn !== null && deleteButton}
              </legend>
              <SegmentSwitch
                options={SCHEDULE_TYPES}
                selected={form.schdlKndCd}
                onSelect={handleTypeChange}
              />
              <FieldError>{fieldError('schdlKndCd')}</FieldError>
            </fieldset>

            {/* 시간 세 칸이 날짜 옆에 안 들어가는 760px 미만은 위아래로 쌓는다 */}
            <div className="grid grid-cols-2 gap-x-8 max-[760px]:grid-cols-1 max-[760px]:gap-y-5">
              <label className="flex flex-col gap-1.5">
                <span className={LABEL}>날짜{required}</span>
                <DatePicker
                  value={form.scheduleDate}
                  onChange={(value) => setField('scheduleDate', value)}
                />
                <FieldError>{fieldError('schdlDt')}</FieldError>
              </label>
              <div className="flex flex-col gap-1.5">
                <span className={LABEL}>시간{optional}</span>
                <TimeSelect
                  value={form.scheduleTime}
                  onChange={(scheduleTime) =>
                    setField('scheduleTime', scheduleTime)
                  }
                />
                <FieldError>{fieldError('hrInptYn')}</FieldError>
              </div>
            </div>

            {isHospitalForm && (
              <div className="rounded-xl bg-surface-2 p-4">
                <div className="grid grid-cols-2 gap-x-8">
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>검진유형{required}</span>
                    <DropdownSelect
                      value={form.ckupTypeCd}
                      placeholder="선택"
                      options={CHECKUP_TYPES.map((type) => ({
                        value: type.cd,
                        label: type.nm,
                      }))}
                      onChange={(value) => setField('ckupTypeCd', value)}
                    />
                    <FieldError>{fieldError('ckupTypeCd')}</FieldError>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>병원명{required}</span>
                    <input
                      value={form.hsptlNm}
                      maxLength={MAX_HOSPITAL_NAME_LENGTH}
                      className={INPUT}
                      onChange={(event) =>
                        setField('hsptlNm', event.target.value)
                      }
                    />
                    <FieldFoot
                      value={form.hsptlNm}
                      max={MAX_HOSPITAL_NAME_LENGTH}
                      error={fieldError('hsptlNm')}
                    />
                  </label>
                </div>
              </div>
            )}

            {form.schdlKndCd !== null && !isHospitalForm && (
              <label className="flex flex-col gap-1.5">
                <span className={LABEL}>일정명{required}</span>
                <input
                  value={form.schdlNm}
                  maxLength={MAX_SCHEDULE_NAME_LENGTH}
                  className={INPUT}
                  onChange={(event) => setField('schdlNm', event.target.value)}
                />
                <FieldFoot
                  value={form.schdlNm}
                  max={MAX_SCHEDULE_NAME_LENGTH}
                  error={fieldError('schdlNm')}
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>일정 메모{optional}</span>
              <input
                value={form.memoCn}
                maxLength={MAX_MEMO_LENGTH}
                className={INPUT}
                onChange={(event) => setField('memoCn', event.target.value)}
              />
              <FieldFoot
                value={form.memoCn}
                max={MAX_MEMO_LENGTH}
                error={fieldError('memoCn')}
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span id="schedule-badge-color-label" className={LABEL}>
                캘린더 뱃지 색상{optional}
              </span>
              {/* 고른 칩을 다시 누르면 선택을 푼다 */}
              <div
                role="radiogroup"
                aria-labelledby="schedule-badge-color-label"
                className="flex flex-wrap gap-3"
              >
                {BADGE_COLORS.map((color) => {
                  const isChecked = form.cldrBadgeColrCd === color.cd;
                  return (
                    <button
                      key={color.cd}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      title={color.nm}
                      className={`grid size-8 place-items-center rounded-full outline-offset-(--spacing) focus-visible:outline focus-visible:outline-brand-500 ${
                        TONE_CLASSES[color.tone].chip
                      } ${isChecked ? 'outline-solid outline-[length:medium] outline-current' : ''}`}
                      onClick={() =>
                        setField('cldrBadgeColrCd', isChecked ? '' : color.cd)
                      }
                    >
                      <span className="sr-only">{color.nm}</span>
                      {isChecked && (
                        <Icon name="check" className="text-lg font-semibold" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className={HELP}>
                고르지 않으면 일정 종류의 기본 색상이 적용돼요
              </p>
              <FieldError>{fieldError('cldrBadgeColrCd')}</FieldError>
            </div>

            {hasLinkedCheckup && (
              <NoticeBox className="flex gap-2">
                <Icon name="event" className="shrink-0 text-lg" />이 일정에
                연결된 검진기록이 있어요. 날짜·반려동물·검진유형·병원명을 바꾸면
                검진기록에도 함께 반영돼요
              </NoticeBox>
            )}
          </div>
        </form>
      </Modal>

      {confirm === 'move' && (
        <ConfirmModal
          title="반려동물을 바꿀까요?"
          description={`이 일정의 검진기록과 연동된 케어 항목도 ${targetPetNm}(으)로 옮겨집니다.`}
          confirmLabel="옮기기"
          isPending={isPending}
          onConfirm={() => {
            setConfirm(null);
            save();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'delete' && (
        <ConfirmModal
          title="이 일정을 삭제할까요?"
          description={
            hasLinkedCheckup
              ? '연결된 검진기록은 그대로 남지만, 검진일과 반려동물은 더 이상 바꿀 수 없어요. 검진기록도 지우려면 검진기록에서 삭제해 주세요.'
              : undefined
          }
          confirmLabel="삭제하기"
          isDanger
          isPending={isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        >
          {hasLinkedCheckup && (
            <button
              type="button"
              className={`${TEXT_BTN} mt-2`}
              onClick={goToCheckup}
            >
              검진기록 보기
              <Icon name="chevron_right" className="text-lg" />
            </button>
          )}
        </ConfirmModal>
      )}
    </>
  );
}
