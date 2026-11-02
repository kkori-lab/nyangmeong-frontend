import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { useReleaseMember } from './queries';

const TEXTAREA_CLASS =
  'block min-h-24 w-full resize-none rounded-[6px] border border-[#d3dae2] bg-white px-3 py-2 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';

/**
 * [정지 해제 모달]
 * - 사유 필수, 실패하면 입력을 유지하고 서버 문구 표시
 */
export default function ReleaseModal({ member, onClose }) {
  const [rlsRsn, setRlsRsn] = useState('');
  const release = useReleaseMember();

  const trimmedRsn = rlsRsn.trim();

  const handleRelease = () =>
    release.mutate(
      { mbrSn: member.mbrSn, rlsRsn: trimmedRsn },
      {
        onSuccess: () => {
          showToast('정지를 해제했어요');
          onClose();
        },
      },
    );

  return (
    <Modal
      title={`${member.mbrNcnm} 정지 해제`}
      isPending={release.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={release.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={!trimmedRsn || release.isPending}
            onClick={handleRelease}
          >
            해제
          </button>
        </>
      }
    >
      <label className="block text-sm font-semibold text-ink-2">
        사유
        <textarea
          value={rlsRsn}
          placeholder="해제 사유를 입력해 주세요"
          className={`${TEXTAREA_CLASS} mt-1.5 font-normal`}
          onChange={(event) => setRlsRsn(event.target.value)}
        />
      </label>
      {release.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {release.error.message}
        </p>
      )}
    </Modal>
  );
}
