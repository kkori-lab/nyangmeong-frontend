import { useEffect } from 'react';
import { showToast } from '@/components/toastStore';
import { useLeavePet } from '../queries';

/** 공동격 조사 선택 (영문·숫자 끝 이름은 "와(과)") */
const withTogetherParticle = (name) => {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${name}와(과)`;
  return `${name}${code % 28 === 0 ? '와' : '과'}`;
};

export default function PetUnlinkDialog({ pet, onClose }) {
  const leavePet = useLeavePet();

  /** 요청 중에는 닫기 불가 */
  const close = () => {
    if (!leavePet.isPending) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleLeave = () =>
    leavePet.mutate(pet.petSn, {
      onSuccess: () => {
        onClose();
        showToast('연동을 해제했어요');
      },
      onError: () =>
        showToast('해제하지 못했어요. 잠시 후 다시 시도해 주세요'),
    });

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-8">
      <div
        className="fixed inset-0 bg-[rgba(15,23,35,0.45)]"
        onClick={close}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pet-unlink-title"
        aria-describedby="pet-unlink-desc"
        className="relative m-auto flex w-full max-w-[440px] shrink-0 flex-col rounded-modal bg-white shadow-depth-lg"
      >
        <div className="px-10 pt-10 pb-8 text-center">
          <h2
            id="pet-unlink-title"
            className="text-lg leading-[1.35] font-bold break-keep"
          >
            {withTogetherParticle(pet.petNm)}의 가족 연동을 해제할까요?
          </h2>
          <p
            id="pet-unlink-desc"
            className="mt-2 leading-[1.6] break-keep text-muted"
          >
            해제하면 {pet.petNm}의 건강기록·프로필에 더 이상 접근할 수
            없어요. 다시 연동하려면 재요청이 필요해요.
          </p>
        </div>
        <div className="flex gap-2 px-10 pb-6">
          <button
            type="button"
            onClick={close}
            disabled={leavePet.isPending}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-white font-semibold hover:border-line-strong hover:bg-surface-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleLeave}
            disabled={leavePet.isPending}
            className="h-11 min-w-0 flex-1 rounded-md bg-danger font-semibold text-white hover:bg-[#983a2f] disabled:bg-surface-3 disabled:text-line-strong"
          >
            해제
          </button>
        </div>
      </div>
    </div>
  );
}
