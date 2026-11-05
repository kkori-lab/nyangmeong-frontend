import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { BRUP_ROLE } from '@/utils/petCodes';
import { useCaregivers, useLeavePet } from '../queries';

/** 공동격 조사 선택 (영문·숫자 끝 이름은 "와(과)") */
const withTogetherParticle = (name) => {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${name}와(과)`;
  return `${name}${code % 28 === 0 ? '와' : '과'}`;
};

export default function PetUnlinkDialog({ pet, onClose }) {
  const leavePet = useLeavePet();
  const { data: caregivers } = useCaregivers(pet.petSn);

  /** 공동양육자에게 오는 목록에서 공동양육자 줄이 본인 것 */
  const myRelation = caregivers?.find(
    (caregiver) => caregiver.brupRoleCd === BRUP_ROLE.CO_PARENT,
  );

  /** 요청 중에는 닫기 불가 */
  const close = () => {
    if (!leavePet.isPending) onClose();
  };

  const handleLeave = () =>
    leavePet.mutate(
      { petSn: pet.petSn, brupRelSn: myRelation.brupRelSn },
      {
        onSuccess: () => {
          onClose();
          showToast('연동을 해제했어요');
        },
        onError: (error) => {
          if (error.code === 'CAREGIVER_NOT_FOUND') onClose();
          showToast(error.message);
        },
      },
    );

  return (
    <Modal
      isConfirm
      isSpacious
      isPending={leavePet.isPending}
      title={`${withTogetherParticle(pet.petNm)}의 가족 연동을 해제할까요?`}
      description={`해제하면 ${pet.petNm}의 건강기록·프로필에 더 이상 접근할 수 없어요. 다시 연동하려면 재요청이 필요해요.`}
      onClose={close}
      footer={
        <>
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
            disabled={leavePet.isPending || !myRelation}
            className="h-11 min-w-0 flex-1 rounded-md bg-danger font-semibold text-white hover:bg-[#983a2f] disabled:bg-surface-3 disabled:text-line-strong"
          >
            해제
          </button>
        </>
      }
    />
  );
}
