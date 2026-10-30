import { useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { getTodayYmd } from '@/utils/formatDate';
import { CARE_CYCLES, CUSTOM_CYCLE } from '../careDue';
import FieldError from '../diary/FieldError';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
} from '../diary/formStyles';
import { useCreatePrevention } from '../queries';
import { SUB_BOX } from './checkupStyles';
import { PREVENTION_ITEMS } from './checkupTypes';

const REQUIRED = <span className="ml-0.5 font-bold text-danger">*</span>;

// 한달(HLTG15)
const DEFAULT_CYCLE = 'HLTC0040';

/**
 * [반복 예방 입력 영역]
 * - 예방 항목·반복 주기(직접입력이면 일수)·시작일 모두 필수, 시작일 기본값은 오늘 (FN-HLT-005-05)
 * - 입력한 시작일이 케어 캘린더 정기관리 항목의 첫 예정일
 */
export default function PreventionForm({ ckupRcdSn, onClose }) {
  const formRef = useRef(null);
  const [prvntItmCd, setPrvntItmCd] = useState(PREVENTION_ITEMS[0].cd);
  const [rptCycleCd, setRptCycleCd] = useState(DEFAULT_CYCLE);
  const [rptCycleDayCnt, setRptCycleDayCnt] = useState('');
  const [startYmd, setStartYmd] = useState(getTodayYmd);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createPrevention = useCreatePrevention();
  const isCustom = rptCycleCd === CUSTOM_CYCLE;

  useEffect(() => {
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const errors = {
    days:
      isCustom &&
      (!Number.isInteger(Number(rptCycleDayCnt)) || Number(rptCycleDayCnt) < 1),
    start: startYmd === '',
  };
  const isInvalid = (field) => isSubmitted && errors[field];

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    createPrevention.mutate(
      {
        ckupRcdSn,
        prvntItmCd,
        rptCycleCd,
        rptCycleDayCnt: isCustom ? Number(rptCycleDayCnt) : null,
        startYmd,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <form
      ref={formRef}
      noValidate
      className={`${SUB_BOX} grid gap-5`}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>예방 항목{REQUIRED}</span>
          <select
            value={prvntItmCd}
            className={SELECT_CLASS}
            style={SELECT_ARROW_STYLE}
            onChange={(event) => setPrvntItmCd(event.target.value)}
          >
            {PREVENTION_ITEMS.map((item) => (
              <option key={item.cd} value={item.cd}>
                {item.nm}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>반복 주기{REQUIRED}</span>
          <select
            value={rptCycleCd}
            className={SELECT_CLASS}
            style={SELECT_ARROW_STYLE}
            onChange={(event) => setRptCycleCd(event.target.value)}
          >
            {CARE_CYCLES.map((cycle) => (
              <option key={cycle.cd} value={cycle.cd}>
                {cycle.nm}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isCustom && (
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>일수{REQUIRED}</span>
          <span className="relative">
            <input
              type="number"
              min="1"
              value={rptCycleDayCnt}
              placeholder="예: 10"
              aria-invalid={isInvalid('days')}
              className={`${INPUT_CLASS} pr-16 tabular-nums`}
              onChange={(event) => setRptCycleDayCnt(event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
              일마다
            </span>
          </span>
          {isInvalid('days') && (
            <FieldError>일수를 1일 이상으로 입력해 주세요</FieldError>
          )}
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>시작일{REQUIRED}</span>
        <input
          type="date"
          value={startYmd}
          aria-invalid={isInvalid('start')}
          className={`${INPUT_CLASS} tabular-nums`}
          onChange={(event) => setStartYmd(event.target.value)}
        />
        <p className="text-sm text-muted">
          입력한 시작일이 토탈 케어리스트의 첫 예정일이 됩니다
        </p>
        {isInvalid('start') && <FieldError>시작일을 입력해 주세요</FieldError>}
      </label>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={createPrevention.isPending}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="submit"
          className={BTN_PRIMARY}
          disabled={createPrevention.isPending}
        >
          저장하기
        </button>
      </div>
    </form>
  );
}
