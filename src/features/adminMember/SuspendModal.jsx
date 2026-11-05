import { useState } from 'react';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { toFieldErrors, toFormError } from '@/utils/fieldErrors';
import MemberSearch from './MemberSearch';
import { SUSPENSION_DAY_OPTIONS } from './memberLabels';
import { useSuspendMember } from './queries';

const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-danger';
const RADIO_LABEL_CLASS = 'inline-flex items-center gap-1.5 text-base text-ink';

/**
 * [회원 정지 모달]
 * - 회원 검색 -> 기간·영구 -> 7일·30일 -> 사유 필수
 * - member를 넘기면 검색 없이 그 회원으로 시작: 회원 상세 진입용
 * - 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function SuspendModal({ member, onClose }) {
  const [selected, setSelected] = useState(member ?? null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [suspnDayCnt, setSuspnDayCnt] = useState(SUSPENSION_DAY_OPTIONS[0]);
  const [suspnRsn, setSuspnRsn] = useState('');
  const suspend = useSuspendMember();

  // 400 칸별 오류는 사유 칸 아래, 그 밖의 칸·오류는 아래 줄
  const fieldError = toFieldErrors(suspend.error).suspnRsn;
  const formError = toFormError(suspend.error, ['suspnRsn']);
  const trimmedRsn = suspnRsn.trim();

  const handleSuspend = () =>
    suspend.mutate(
      {
        mbrSn: selected.mbrSn,
        suspnDayCnt: isPermanent ? null : suspnDayCnt,
        suspnRsn: trimmedRsn,
      },
      {
        onSuccess: () => {
          showToast('회원을 정지했어요');
          onClose();
        },
      },
    );

  return (
    <Modal
      title="회원 정지"
      isTop
      isPending={suspend.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={suspend.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            disabled={!selected || !trimmedRsn || suspend.isPending}
            onClick={handleSuspend}
          >
            정지
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">회원</p>
          {member ? (
            <p className="text-base text-ink">{member.mbrNcnm}</p>
          ) : (
            <MemberSearch
              selected={selected}
              onSelect={setSelected}
              placeholder="닉네임으로 검색"
              emptyText="정지할 수 있는 회원이 없어요"
            />
          )}
        </div>
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
          사유
          <textarea
            value={suspnRsn}
            placeholder="정지 사유를 입력해 주세요"
            aria-invalid={Boolean(fieldError)}
            className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
            onChange={(event) => setSuspnRsn(event.target.value)}
          />
          {fieldError && (
            <span className="mt-1.5 block font-normal text-danger">
              {fieldError}
            </span>
          )}
        </label>
        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}
      </div>
    </Modal>
  );
}
