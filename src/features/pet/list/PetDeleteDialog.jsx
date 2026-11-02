import { useEffect } from 'react';
import { showToast } from '@/components/toastStore';
import { useDeletePet } from '../queries';

/** 목적격 조사 선택 (영문·숫자 끝 이름은 "을(를)") */
const withObjectParticle = (name) => {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${name}을(를)`;
  return `${name}${code % 28 === 0 ? '를' : '을'}`;
};

export default function PetDeleteDialog({ pet, onClose }) {
  const deletePet = useDeletePet();

  /** 요청 중에는 닫기 불가 */
  const close = () => {
    if (!deletePet.isPending) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const handleDelete = () =>
    deletePet.mutate(pet.petSn, {
      onSuccess: () => {
        onClose();
        showToast('반려동물을 삭제했어요');
      },
      onError: (error) => {
        if (error.code === 'PET_NOT_FOUND') onClose();
        showToast(error.message);
      },
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
        aria-labelledby="pet-delete-title"
        aria-describedby="pet-delete-desc"
        className="relative m-auto flex w-full max-w-[440px] shrink-0 flex-col rounded-modal bg-white shadow-depth-lg"
      >
        <div className="px-10 pt-10 pb-8 text-center">
          <h2
            id="pet-delete-title"
            className="text-lg leading-[1.35] font-bold break-keep"
          >
            {withObjectParticle(pet.petNm)} 삭제하시겠습니까?
          </h2>
          <p
            id="pet-delete-desc"
            className="mt-2 leading-[1.6] break-keep text-muted"
          >
            삭제하면 건강기록·픽셀 캐릭터 등 연결된 데이터도 함께 사라지고
            복구할 수 없어요
          </p>
          <p className="mt-1 leading-[1.6] break-keep text-muted">
            가계부 지출 기록은 유지되고 반려동물 이름 옆에{' '}
            <span className="whitespace-nowrap">&quot;(삭제됨)&quot;으로</span>{' '}
            표기돼요
          </p>
        </div>
        <div className="flex gap-2 px-10 pb-6">
          <button
            type="button"
            onClick={close}
            disabled={deletePet.isPending}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-white font-semibold hover:border-line-strong hover:bg-surface-2"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePet.isPending}
            className="h-11 min-w-0 flex-1 rounded-md bg-danger font-semibold text-white hover:bg-[#983a2f] disabled:bg-surface-3 disabled:text-line-strong"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
