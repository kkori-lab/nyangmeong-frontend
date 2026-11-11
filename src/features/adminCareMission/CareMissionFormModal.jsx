import { useId, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import Toggle from '@/components/Toggle';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import {
  ACHV_CRTR_NMTM_MAX,
  CMPN_PNT_MAX,
  MSN_POOL_LABELS,
} from './careMissionLabels';
import { useUpdateAdminCareMission } from './queries';

const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';

/** 칸 아래에 서버 오류를 보이는 칸: 나머지 칸 오류는 폼 아래 줄 */
const FIELD_NAMES = ['cmpnPnt', 'achvCrtrNmtm'];

/** 1 이상 정수 */
const POSITIVE_INT_PATTERN = /^[1-9]\d*$/;

/** 칸 값 검사: 틀리면 안내 문구, 맞으면 '' */
const checkCount = (value, max, label) => {
  const trimmed = value.trim();
  if (!POSITIVE_INT_PATTERN.test(trimmed)) {
    return `${label}는 1 이상 정수로 입력해 주세요`;
  }
  if (Number(trimmed) > max) {
    return `${label}는 ${max.toLocaleString()} 이하로 입력해 주세요`;
  }
  return '';
};

/** 칸마다 틀린 값 안내: 없으면 빈 객체 */
const validate = ({ cmpnPnt, achvCrtrNmtm }) => {
  const pntError = checkCount(cmpnPnt, CMPN_PNT_MAX, '보상 포인트');
  const nmtmError = checkCount(
    achvCrtrNmtm,
    ACHV_CRTR_NMTM_MAX,
    '달성 기준 횟수',
  );
  return {
    ...(pntError ? { cmpnPnt: pntError } : {}),
    ...(nmtmError ? { achvCrtrNmtm: nmtmError } : {}),
  };
};

/** 읽기 전용 한 줄 */
function ReadonlyRow({ label, value }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[88px] shrink-0 text-sm font-semibold text-ink-2">
        {label}
      </dt>
      <dd className="min-w-0 text-base break-all text-ink">{value}</dd>
    </div>
  );
}

/** 숫자 칸 + 단위 + 칸 아래 안내 */
function CountField({ id, label, unit, value, error, onChange }) {
  return (
    <div className="w-[160px]">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-ink-2"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          className={`${INPUT_CLASS} tabular-nums`}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="shrink-0 text-base text-ink-2">{unit}</span>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * [케어미션 수정 모달]
 * - 미션명·풀·이동 경로는 코드의 활동과 짝이라 읽기만, 보상 포인트·달성 기준 횟수·사용만 바꾼다
 * - [저장]을 누르면 칸마다 검사하고, 저장하면 토스트 후 닫음. 실패하면 입력 유지 + 서버 문구
 */
export default function CareMissionFormModal({ mission, onClose }) {
  const formId = useId();
  const [cmpnPnt, setCmpnPnt] = useState(String(mission.cmpnPnt));
  const [achvCrtrNmtm, setAchvCrtrNmtm] = useState(
    String(mission.achvCrtrNmtm),
  );
  const [isUsed, setIsUsed] = useState(mission.useYn);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const update = useUpdateAdminCareMission();

  const clientErrors = isSubmitted ? validate({ cmpnPnt, achvCrtrNmtm }) : {};
  // 400 칸별 오류: 클라이언트 안내가 없는 칸에만 서버 문구
  const serverFieldErrors = toFieldErrors(update.error);
  const errors = {
    cmpnPnt: clientErrors.cmpnPnt ?? serverFieldErrors.cmpnPnt,
    achvCrtrNmtm: clientErrors.achvCrtrNmtm ?? serverFieldErrors.achvCrtrNmtm,
  };
  const formError = toFormError(update.error, FIELD_NAMES);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (update.isPending) return;
    setIsSubmitted(true);
    if (Object.keys(validate({ cmpnPnt, achvCrtrNmtm })).length > 0) return;
    update.mutate(
      {
        careMsnSn: mission.careMsnSn,
        cmpnPnt: Number(cmpnPnt.trim()),
        achvCrtrNmtm: Number(achvCrtrNmtm.trim()),
        useYn: isUsed,
      },
      {
        onSuccess: () => {
          showToast('케어미션을 수정했어요');
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title="케어미션 수정"
      isWide
      isPending={update.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={update.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            form={formId}
            className={BTN_PRIMARY}
            disabled={update.isPending}
          >
            저장
          </button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <dl className="space-y-2 rounded-[10px] bg-surface-2 px-4 py-3">
          <ReadonlyRow label="미션명" value={mission.msnNm} />
          <ReadonlyRow
            label="풀"
            value={MSN_POOL_LABELS[mission.msnPoolCd] ?? mission.msnPoolCd}
          />
          <ReadonlyRow label="이동 경로" value={mission.mvmnPath} />
        </dl>
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          <CountField
            id={`${formId}-cmpnPnt`}
            label="보상 포인트"
            unit="P"
            value={cmpnPnt}
            error={errors.cmpnPnt}
            onChange={setCmpnPnt}
          />
          <CountField
            id={`${formId}-achvCrtrNmtm`}
            label="달성 기준 횟수"
            unit="회"
            value={achvCrtrNmtm}
            error={errors.achvCrtrNmtm}
            onChange={setAchvCrtrNmtm}
          />
          <div>
            <p className="mb-1.5 text-sm font-semibold text-ink-2">사용</p>
            <div className="flex h-10 items-center gap-3">
              <Toggle checked={isUsed} onChange={setIsUsed} label="사용" />
              <span className="text-sm text-subtle">
                {isUsed ? '사용' : '미사용'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-subtle">
          바꾼 값은 다음 날 00:00 출제부터 반영돼요. 오늘 출제된 미션은 바뀌지
          않아요.
        </p>
        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}
