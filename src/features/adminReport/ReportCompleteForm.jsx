import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useCompleteReport } from './queries';
import {
  getActionLabel,
  REPORT_ACTION_OPTIONS,
  REPORT_ACTION_SUSPEND,
  SUSPENSION_DAY_OPTIONS,
} from './reportLabels';

const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
const RADIO_LABEL_CLASS = 'inline-flex items-center gap-1.5 text-base text-ink';

/** 메모·사유 최대 글자 수 */
const MAX_MEMO_LENGTH = 1000;

/**
 * [신고 처리 영역]
 * - 조치 필수 -> 같은 대상의 접수 신고 함께 처리
 * - 작성자 정지는 회원 제재와 같은 입력: 종류·기간·사유
 * - 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function ReportCompleteForm({ report, onReject }) {
  const [dclrActnCd, setDclrActnCd] = useState('');
  const [prcsMemo, setPrcsMemo] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [suspnDayCnt, setSuspnDayCnt] = useState(SUSPENSION_DAY_OPTIONS[0]);
  const [suspnRsn, setSuspnRsn] = useState('');
  const complete = useCompleteReport();

  const isSuspend = dclrActnCd === REPORT_ACTION_SUSPEND;
  const trimmedRsn = suspnRsn.trim();
  const trimmedMemo = prcsMemo.trim();
  const canSubmit = dclrActnCd && (!isSuspend || trimmedRsn);

  const handleSubmit = () =>
    complete.mutate(
      {
        dclrSn: report.dclrSn,
        dclrActnCd,
        ...(trimmedMemo && { prcsMemo: trimmedMemo }),
        ...(isSuspend && {
          suspnDayCnt: isPermanent ? null : suspnDayCnt,
          suspnRsn: trimmedRsn,
        }),
      },
      { onSuccess: () => showToast('신고를 처리했어요') },
    );

  return (
    <section className="space-y-4 rounded-[14px] border border-line bg-white p-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink-2">
          조치
        </legend>
        <div className="flex flex-wrap gap-4">
          {REPORT_ACTION_OPTIONS.map(({ value }) => (
            <label key={value} className={RADIO_LABEL_CLASS}>
              <input
                type="radio"
                name="report-action"
                className="accent-brand-500"
                checked={dclrActnCd === value}
                onChange={() => setDclrActnCd(value)}
              />
              {getActionLabel(value, report)}
            </label>
          ))}
        </div>
      </fieldset>
      {isSuspend && (
        <>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink-2">
              종류
            </legend>
            <div className="flex gap-4">
              <label className={RADIO_LABEL_CLASS}>
                <input
                  type="radio"
                  name="suspend-type"
                  className="accent-brand-500"
                  checked={!isPermanent}
                  onChange={() => setIsPermanent(false)}
                />
                기간 정지
              </label>
              <label className={RADIO_LABEL_CLASS}>
                <input
                  type="radio"
                  name="suspend-type"
                  className="accent-brand-500"
                  checked={isPermanent}
                  onChange={() => setIsPermanent(true)}
                />
                영구 정지
              </label>
            </div>
          </fieldset>
          {!isPermanent && (
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-ink-2">
                기간
              </legend>
              <div className="flex gap-4">
                {SUSPENSION_DAY_OPTIONS.map((dayCnt) => (
                  <label key={dayCnt} className={RADIO_LABEL_CLASS}>
                    <input
                      type="radio"
                      name="suspend-days"
                      className="accent-brand-500"
                      checked={suspnDayCnt === dayCnt}
                      onChange={() => setSuspnDayCnt(dayCnt)}
                    />
                    {dayCnt}일
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <label className="block text-sm font-semibold text-ink-2">
            정지 사유
            <textarea
              value={suspnRsn}
              placeholder="정지 사유를 입력해 주세요"
              className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
              onChange={(event) => setSuspnRsn(event.target.value)}
            />
          </label>
        </>
      )}
      <label className="block text-sm font-semibold text-ink-2">
        처리 메모
        <textarea
          value={prcsMemo}
          maxLength={MAX_MEMO_LENGTH}
          placeholder="처리 메모를 입력해 주세요"
          className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
          onChange={(event) => setPrcsMemo(event.target.value)}
        />
      </label>
      {complete.isError && (
        <p role="alert" className="text-sm text-danger">
          {complete.error.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={complete.isPending}
          onClick={onReject}
        >
          반려
        </button>
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={!canSubmit || complete.isPending}
          onClick={handleSubmit}
        >
          처리 완료
        </button>
      </div>
    </section>
  );
}
