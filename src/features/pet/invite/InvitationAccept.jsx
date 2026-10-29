import { Info } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkeletonCard from '@/components/SkeletonCard';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { formatAge, getVrtyName } from '@/utils/petFormat';
import { useAcceptInvitation, useInvitation } from '../queries';
import PetFace from '@/components/PetFace';
import InvitationMismatch from './InvitationMismatch';
import InvitationRejectDialog from './InvitationRejectDialog';

/**
 * [초대 수락]
 * - 카드마다 체크로 수락할 반려동물을 고른다(처음엔 모두 선택, 1마리 이상이어야 [수락] 활성). 고르지 않은 동물은 거절 처리
 * - [거절]은 선택과 관계없이 초대 전체 거절
 * - 수락 -> 반려동물 관리로 이동해 방금 연동된 동물 표시
 * - 초대받은 이메일과 로그인 계정이 다르면(emlMtchYn === 'N') 수락 화면 대신 안내
 * - 만료·처리된 초대는 이 화면에 오지 않음(InvitationPage가 InvitationClosed로 전달)
 */

const CARD =
  'mx-auto w-full max-w-[560px] overflow-hidden rounded-card border border-line bg-white shadow-depth-sm';

function InvitePetCard({ pet, checked, onToggle }) {
  const desc = [getVrtyName(pet), formatAge(pet.petBrdt)]
    .filter(Boolean)
    .join(' · ');
  return (
    <li>
      <label className="relative flex cursor-pointer flex-col items-center gap-1 rounded-box bg-surface-2 px-5 pt-[22px] pb-4 text-center shadow-[inset_0_0_0_1.5px_var(--color-line)] has-checked:bg-brand-50 has-checked:shadow-[inset_0_0_0_2px_var(--color-brand-500)]">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label={`${pet.petNm} 수락`}
          className="absolute top-3 left-3 size-5 cursor-pointer accent-brand-500"
        />
        <PetFace
          petSn={pet.petSn}
          petSeCd={pet.petSeCd}
          chrcSttsCd={pet.chrcSttsCd}
          className="mb-2 size-28 rounded-full bg-white text-brand-500"
          iconClassName="size-12"
        />
        <b>{pet.petNm}</b>
        <span className="text-sm text-subtle">{desc}</span>
      </label>
    </li>
  );
}

export default function InvitationAccept({
  invitationToken,
  onSwitchAccount,
  isSwitching,
}) {
  const navigate = useNavigate();
  const {
    data: invitation,
    isPending,
    isError,
  } = useInvitation(invitationToken);
  const acceptInvitation = useAcceptInvitation();
  const [isRejecting, setIsRejecting] = useState(false);
  /** null: 손대기 전(초대의 모든 동물이 선택된 상태) */
  const [selectedPetSns, setSelectedPetSns] = useState(null);

  if (isPending) {
    return (
      <div aria-busy="true">
        <SkeletonCard className="mx-auto h-[477px] w-full max-w-[560px]" />
      </div>
    );
  }
  if (isError) {
    return (
      <p className={`${CARD} px-[22px] py-10 text-center text-muted`}>
        초대를 찾을 수 없어요. 링크를 다시 확인해 주세요
      </p>
    );
  }

  if (invitation.emlMtchYn === 'N') {
    return (
      <InvitationMismatch
        invtEmlMskd={invitation.invtEmlMskd}
        onLogin={onSwitchAccount}
        isPending={isSwitching}
      />
    );
  }

  const petNames = invitation.pets.map((pet) => pet.petNm).join(', ');
  const pickedPetSns =
    selectedPetSns ?? invitation.pets.map((pet) => pet.petSn);

  const handleToggle = (petSn) =>
    setSelectedPetSns(
      pickedPetSns.includes(petSn)
        ? pickedPetSns.filter((sn) => sn !== petSn)
        : [...pickedPetSns, petSn],
    );

  const handleAccept = () =>
    acceptInvitation.mutate(
      { invitationToken, petSns: pickedPetSns },
      {
        onSuccess: () =>
          navigate(PATHS.MYPAGE_PETS, {
            state: {
              petSn: invitation.pets.find((pet) =>
                pickedPetSns.includes(pet.petSn),
              ).petSn,
            },
          }),
        onError: () =>
          showToast('수락하지 못했어요. 잠시 후 다시 시도해 주세요'),
      },
    );

  return (
    <section aria-labelledby="invitation-title" className={CARD}>
      <div className="border-b border-line-strong px-7 pt-4 pb-2">
        <h2
          id="invitation-title"
          className="text-lg leading-[1.35] font-bold break-keep"
        >
          {petNames}의 공동양육자가 되어주세요
        </h2>
        <p className="mt-1 text-muted">{invitation.invtrNcnm}님이 초대했어요</p>
      </div>
      <div className="flex flex-col gap-5 px-[22px] pt-5 pb-[22px]">
        <ul className="grid grid-cols-2 gap-3">
          {invitation.pets.map((pet) => (
            <InvitePetCard
              key={pet.petSn}
              pet={pet}
              checked={pickedPetSns.includes(pet.petSn)}
              onToggle={() => handleToggle(pet.petSn)}
            />
          ))}
        </ul>
        <p className="flex items-start gap-2.5 rounded-lg bg-surface-2 px-3.5 py-3 text-muted">
          <Info
            className="mt-0.5 size-4 shrink-0 text-subtle"
            aria-hidden="true"
          />
          <span>
            함께 돌볼 반려동물을 골라 주세요. 빼면 그 반려동물만 거절돼요
          </span>
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line bg-[#fbfcfd] px-7 py-4">
        <Link
          to={PATHS.MYPAGE}
          className="inline-flex h-10 items-center justify-center rounded-md px-4 font-semibold text-ink-2 hover:bg-surface-2"
        >
          나중에 하기
        </Link>
        <button
          type="button"
          onClick={() => setIsRejecting(true)}
          disabled={acceptInvitation.isPending}
          className={BTN_SECONDARY}
        >
          거절
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={acceptInvitation.isPending || pickedPetSns.length === 0}
          className={BTN_PRIMARY}
        >
          수락
        </button>
      </div>
      {isRejecting && (
        <InvitationRejectDialog
          invitation={invitation}
          onClose={() => setIsRejecting(false)}
        />
      )}
    </section>
  );
}
