import { useId, useState } from 'react';
import DatePicker from '@/components/DatePicker';
import DropdownSelect from '@/components/DropdownSelect';
import FieldError, { Required } from '@/components/FieldError';
import FieldFoot from '@/components/FieldFoot';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import NoticeBox from '@/components/NoticeBox';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { INPUT, LABEL, TEXTAREA } from '@/components/formStyles';
import {
  formatDate,
  getDay,
  getMonth,
  getTodayYmd,
  getYmdOf,
} from '@/utils/formatDate';
import {
  useCreateChatCheckup,
  useFindChatNearSchedule,
  useSaveCheckupCard,
} from '../queries';

/** 칸 길이: 건강 일지 검진기록 추가 모달과 같다(서버 상한) */
const MAX_HOSPITAL_NAME_LENGTH = 80;
const MAX_CONTENT_LENGTH = 500;
const MAX_MEMO_LENGTH = 200;

const REQUIRED = <Required />;
const REQUEST_FAILED = '잠시 뒤 다시 시도해 주세요.';

/** "9/12" */
const formatMonthDaySlash = (ymd) => `${getMonth(ymd)}/${getDay(ymd)}`;

/**
 * [대화창 검진기록 만들기] (SCR-AIM-013 추가-1·2)
 * - 검사결과지 분석 뒤 검진기록이 없을 때: 서버 요약 말풍선(먼저 등록할지 묻는 글은 ai가 저장) 바로 아래 버튼, [검진기록 등록하기]면 대화창 안 모달(모바일 바텀시트)
 * - 칸·문구는 건강 일지 검진기록 추가 모달(SCR-HLT-002)과 같고, 반려동물은 분석한 아이로 고정
 * - 앞뒤 7일 안 예정 병원 일정이 있으면 모달 안에서 옮겨 연결할지 묻는다(FN-HLT-002-46)
 * - 만든 뒤 같은 분석 결과로 checkup-card를 다시 불러 확인 카드를 받는다(onDone), PDF는 다시 분석하지 않음
 * - draft: { aiCnvrsRoomSn, pet, request }, checkupTypes: [{ cd, nm }], onCancel: [나중에]
 */
export default function CheckupCreateCard({
  draft,
  checkupTypes,
  onDone,
  onCancel,
}) {
  const { pet } = draft;
  const [ckupYmd, setCkupYmd] = useState(getTodayYmd);
  const [hsptlNm, setHsptlNm] = useState('');
  const [ckupTypeCd, setCkupTypeCd] = useState('');
  const [ckupCn, setCkupCn] = useState('');
  const [ckupMemoCn, setCkupMemoCn] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const formId = useId();
  /** 옮겨 연결할지 물을 예정 일정 */
  const [nearSchedule, setNearSchedule] = useState(null);
  /** 만든 검진기록: 결과 저장만 실패하면 [다시 시도]가 검진기록을 또 만들지 않게 */
  const [created, setCreated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const findNear = useFindChatNearSchedule();
  const createCheckup = useCreateChatCheckup();
  const saveCard = useSaveCheckupCard();
  const isPending =
    findNear.isPending || createCheckup.isPending || saveCard.isPending;

  const errors = {
    date: ckupYmd === '',
    hosp: hsptlNm.trim() === '',
    type: ckupTypeCd === '',
  };
  const isInvalid = (field) => isSubmitted && errors[field];

  /** 같은 분석 결과로 확인 카드 다시 받기 */
  const requestCard = async () => {
    setErrorMessage(null);
    try {
      const saved = await saveCard.mutateAsync({
        aiCnvrsRoomSn: draft.aiCnvrsRoomSn,
        petSn: pet.petSn,
        ...draft.request,
      });
      onDone(saved);
    } catch {
      setErrorMessage(
        `검진기록은 만들었어요. 결과를 대화에 저장하지 못했어요. ${REQUEST_FAILED}`,
      );
    }
  };

  /** schdlSn: 검진일로 옮겨 연결할 예정 일정 */
  const save = async (schdlSn) => {
    setErrorMessage(null);
    try {
      const checkup = await createCheckup.mutateAsync({
        petSn: pet.petSn,
        body: {
          ckupYmd,
          hsptlNm: hsptlNm.trim(),
          ckupTypeCd,
          ckupCn: ckupCn.trim(),
          ckupMemoCn: ckupMemoCn.trim(),
          schdlSn,
        },
      });
      setNearSchedule(null);
      setCreated(checkup);
      await requestCard();
    } catch (error) {
      setErrorMessage(
        error?.message || `검진기록을 만들지 못했어요. ${REQUEST_FAILED}`,
      );
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (created) return;
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    setErrorMessage(null);
    findNear.mutate(
      { petSn: pet.petSn, ckupYmd },
      {
        onSuccess: (schedule) => {
          if (schedule) setNearSchedule(schedule);
          else save();
        },
        onError: () =>
          setErrorMessage(`일정을 확인하지 못했어요. ${REQUEST_FAILED}`),
      },
    );
  };

  const nearTypeNm = nearSchedule
    ? checkupTypes.find((type) => type.cd === nearSchedule.ckupTypeCd)?.nm
    : null;

  return (
    <>
      <div className="pl-12 tracking-[-0.03em]">
        <div className="flex gap-2">
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => setIsOpen(true)}
          >
            검진기록 등록하기
          </button>
          <button type="button" className={BTN_SECONDARY} onClick={onCancel}>
            나중에
          </button>
        </div>
      </div>

      {isOpen && (
        <Modal
          title="검진기록 추가"
          width={560}
          isPending={isPending}
          onClose={() => setIsOpen(false)}
          footer={
            !nearSchedule && (
              <>
                {created ? (
                  <button
                    type="button"
                    className={BTN_PRIMARY}
                    disabled={isPending}
                    onClick={requestCard}
                  >
                    다시 시도
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={BTN_SECONDARY}
                      disabled={isPending}
                      onClick={() => setIsOpen(false)}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      form={formId}
                      className={BTN_PRIMARY}
                      disabled={isPending || nearSchedule !== null}
                    >
                      등록하기
                    </button>
                  </>
                )}
              </>
            )
          }
        >
          <form
            id={formId}
            noValidate
            className="flex flex-col gap-4 tracking-[-0.03em]"
            onSubmit={handleSubmit}
          >
            {created ? (
              <p className="rounded-[8px] bg-surface-2 px-3 py-2 text-sm leading-[22px] text-ink-2">
                {saveCard.isPending
                  ? '검진기록을 만들었어요. 검사 수치 확인 카드를 불러오고 있어요…'
                  : '검진기록을 만들었어요.'}
              </p>
            ) : (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>검진일{REQUIRED}</span>
                  <DatePicker
                    value={ckupYmd}
                    invalid={isInvalid('date')}
                    disabled={isPending || nearSchedule !== null}
                    onChange={setCkupYmd}
                  />
                  <p className="text-subtle">
                    예정된 일정은 케어 캘린더에서 등록해 주세요
                  </p>
                  {isInvalid('date') && (
                    <FieldError>검진일을 입력해 주세요</FieldError>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-x-4 max-[760px]:grid-cols-1 max-[760px]:gap-y-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={LABEL}>동물병원명{REQUIRED}</span>
                    <input
                      value={hsptlNm}
                      maxLength={MAX_HOSPITAL_NAME_LENGTH}
                      aria-invalid={isInvalid('hosp')}
                      disabled={isPending || nearSchedule !== null}
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
                      disabled={isPending || nearSchedule !== null}
                      placeholder="선택해 주세요"
                      options={checkupTypes.map((type) => ({
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
                    disabled={isPending || nearSchedule !== null}
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
                    disabled={isPending || nearSchedule !== null}
                    className={INPUT}
                    onChange={(event) => setCkupMemoCn(event.target.value)}
                  />
                  <FieldFoot value={ckupMemoCn} max={MAX_MEMO_LENGTH} />
                </label>

                <NoticeBox className="flex gap-2">
                  <Icon name="event" className="shrink-0 text-lg" />
                  저장하면 케어 캘린더에도 표시됩니다. 같은 날짜에 등록한 병원
                  일정이 있으면 그 일정과 자동으로 연결됩니다
                </NoticeBox>
              </>
            )}

            {nearSchedule && !created && (
              <section
                aria-label="가까운 예정 일정"
                className="flex flex-col gap-3 rounded-[10px] border border-line p-4"
              >
                <div>
                  <p className="text-base leading-[1.3] font-semibold text-ink">
                    {formatMonthDaySlash(getYmdOf(nearSchedule.schdlDt))}{' '}
                    {nearTypeNm ?? '병원'} 일정이 있어요
                  </p>
                  <p className="mt-1 text-sm leading-[22px] text-subtle">
                    이 검진기록과 연결하고 일정을 {formatMonthDaySlash(ckupYmd)}
                    로 옮길까요?
                  </p>
                </div>
                <p className="rounded-[8px] bg-surface-2 px-3 py-2 text-sm leading-[22px] text-ink-2 tabular-nums">
                  [병원]{' '}
                  {formatDate(getYmdOf(nearSchedule.schdlDt), {
                    separator: '-',
                    hasYear: false,
                  })}{' '}
                  ·{' '}
                  {[pet.petNm, nearTypeNm, nearSchedule.hsptlNm]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    disabled={isPending}
                    onClick={() => setNearSchedule(null)}
                  >
                    돌아가기
                  </button>
                  <button
                    type="button"
                    className={BTN_SECONDARY}
                    disabled={isPending}
                    onClick={() => save()}
                  >
                    새 일정으로 저장하기
                  </button>
                  <button
                    type="button"
                    className={BTN_PRIMARY}
                    disabled={isPending}
                    onClick={() => save(nearSchedule.schdlSn)}
                  >
                    {formatMonthDaySlash(ckupYmd)}로 옮겨 연결하기
                  </button>
                </div>
              </section>
            )}

            {errorMessage && (
              <NoticeBox tone="danger" role="alert">
                {errorMessage}
              </NoticeBox>
            )}
          </form>
        </Modal>
      )}
    </>
  );
}
