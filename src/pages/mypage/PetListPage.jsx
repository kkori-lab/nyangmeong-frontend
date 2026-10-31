import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import InviteModal from '@/features/pet/list/InviteModal';
import PetDeleteDialog from '@/features/pet/list/PetDeleteDialog';
import PetEmpty from '@/features/pet/list/PetEmpty';
import PetFormModal from '@/features/pet/list/PetFormModal';
import PetSlide from '@/features/pet/list/PetSlide';
import PetUnlinkDialog from '@/features/pet/list/PetUnlinkDialog';
import SentInvitations from '@/features/pet/list/SentInvitations';
import { BRUP_ROLE, MAX_OWN_PETS } from '@/utils/petCodes';
import { usePets } from '@/features/pet/queries';
import SubPageLayout from '@/layouts/SubPageLayout';

export default function PetListPage() {
  const { data: pets = [], isPending } = usePets();
  /** 초대 수락 직후 보여 줄 동물 */
  const focusPetSn = useLocation().state?.petSn;
  const [slideIndex, setSlideIndex] = useState(null);
  /** undefined: 닫힘, null: 등록, 숫자: 해당 petSn 수정 */
  const [modalPetSn, setModalPetSn] = useState(undefined);
  const [deletingPet, setDeletingPet] = useState(null);
  const [unlinkingPet, setUnlinkingPet] = useState(null);
  const [invitingPet, setInvitingPet] = useState(null);

  const focusIndex = pets.findIndex((pet) => pet.petSn === focusPetSn);
  /** 마지막 자리(pets.length)는 등록 슬라이드. 삭제로 위치가 끝을 넘으면 그 자리로 */
  const currentIndex = Math.min(
    slideIndex ?? Math.max(focusIndex, 0),
    pets.length,
  );
  const ownPetCount = pets.filter(
    (pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY,
  ).length;
  const isFull = ownPetCount >= MAX_OWN_PETS;

  return (
    <SubPageLayout section="mypage">
      {isPending ? (
        <PageSkeleton>
          <SkeletonCard className="h-[577px] max-[760px]:h-[683px]" />
          <div aria-hidden="true" className="mt-7 flex flex-col gap-5">
            <Skeleton className="h-7 w-32" />
            <SkeletonCard className="h-[427px]" />
          </div>
        </PageSkeleton>
      ) : pets.length === 0 ? (
        <PetEmpty onRegister={() => setModalPetSn(null)} />
      ) : (
        <PetSlide
          pets={pets}
          index={currentIndex}
          onMove={setSlideIndex}
          onEdit={(pet) => setModalPetSn(pet.petSn)}
          onDelete={setDeletingPet}
          onUnlink={setUnlinkingPet}
          onInvite={setInvitingPet}
          onAdd={() => setModalPetSn(null)}
          isFull={isFull}
        />
      )}
      {!isPending && <SentInvitations />}
      {modalPetSn !== undefined && (
        <PetFormModal
          petSn={modalPetSn}
          onClose={() => setModalPetSn(undefined)}
        />
      )}
      {deletingPet && (
        <PetDeleteDialog
          pet={deletingPet}
          onClose={() => setDeletingPet(null)}
        />
      )}
      {invitingPet && (
        <InviteModal
          pets={pets}
          initialPetSn={invitingPet.petSn}
          onClose={() => setInvitingPet(null)}
        />
      )}
      {unlinkingPet && (
        <PetUnlinkDialog
          pet={unlinkingPet}
          onClose={() => setUnlinkingPet(null)}
        />
      )}
    </SubPageLayout>
  );
}
