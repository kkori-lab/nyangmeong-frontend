import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import InviteModal from '@/features/pet/list/InviteModal';
import PetDeleteDialog from '@/features/pet/list/PetDeleteDialog';
import { FamilySkeleton } from '@/features/pet/list/FamilySection';
import PetEmpty from '@/features/pet/list/PetEmpty';
import PetFormModal from '@/features/pet/list/PetFormModal';
import PetSlide from '@/features/pet/list/PetSlide';
import PetUnlinkDialog from '@/features/pet/list/PetUnlinkDialog';
import { SLIDE_CARD, STAGE_BOX } from '@/features/pet/list/slideLayout';
import SentInvitations from '@/features/pet/list/SentInvitations';
import { usePetLimit, usePets } from '@/features/pet/queries';
import SubPageLayout from '@/layouts/SubPageLayout';

/** 같은 사이트 안의 주소만: "/"로 시작, "//"·역슬래시는 외부로 갈 수 있어 거른다 */
const isSafeReturnTo = (value) =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\');

/** returnTo에 petSn=<번호>를 넣거나 바꾼다(기존 쿼리·해시는 유지) */
const withPetSn = (returnTo, petSn) => {
  const url = new URL(returnTo, window.location.origin);
  url.searchParams.set('petSn', petSn);
  return `${url.pathname}${url.search}${url.hash}`;
};

/** 첫 로딩: 실제 슬라이드 카드 배치(왼쪽 사각형 + 오른쪽 정보 + 구분선 + 가족 카드 1장). 모바일은 970px 미만 */
function PetSlideSkeleton() {
  return (
    <div aria-hidden="true" className={SLIDE_CARD}>
      <Skeleton className={`${STAGE_BOX} rounded-card`} />
      <div className="flex min-w-0 flex-col max-[970px]:contents">
        <Skeleton className="mb-4 h-[37.8px] w-56 max-w-full max-[970px]:hidden" />
        <div className="grid auto-rows-[56.55px] grid-cols-2 items-center gap-x-10 max-[970px]:hidden">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-6" />
          ))}
        </div>
        <div className="hidden h-[84px] flex-col gap-2 pt-1.5 max-[970px]:flex">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-[18px] w-32" />
        </div>
        <div className="col-span-full mt-4 hidden max-[970px]:block">
          <div className="border-t border-line-strong">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex h-[50.6px] items-center">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-2 h-[37.6px] w-full" />
        </div>
      </div>
      <FamilySkeleton />
    </div>
  );
}

export default function PetListPage() {
  const { data: pets = [], isPending } = usePets();
  const limit = usePetLimit();
  const [searchParams, setSearchParams] = useSearchParams();
  /** 메인 바로가기(?edit=petSn)로 연 수정 대상: 주소에서 지운 뒤에도 쓰려고 처음 값만 둔다 */
  const [editPetSn] = useState(() => Number(searchParams.get('edit')) || null);
  /** 초대 수락 직후 보여 줄 동물(없으면 바로가기 수정 대상) */
  const focusPetSn = useLocation().state?.petSn ?? editPetSn;
  const [slideIndex, setSlideIndex] = useState(null);
  /** undefined: 닫힘, null: 등록, 숫자: 해당 petSn 수정 */
  const navigate = useNavigate();
  const [modalPetSn, setModalPetSn] = useState(() =>
    searchParams.get('register') === '1' ? null : (editPetSn ?? undefined),
  );
  /** ?register=1로 연 등록 모달이 끝나면 돌아갈 주소(처음 열 때 주소에서 읽는다) */
  const [returnTo, setReturnTo] = useState(() => {
    const target = searchParams.get('returnTo');
    return searchParams.get('register') === '1' && isSafeReturnTo(target)
      ? target
      : null;
  });
  /** 방금 등록한 동물(returnTo가 없을 때 목록에서 보여 준다) */
  const [newPetSn, setNewPetSn] = useState(null);
  const [deletingPet, setDeletingPet] = useState(null);
  const [unlinkingPet, setUnlinkingPet] = useState(null);
  const [invitingPet, setInvitingPet] = useState(null);

  /** register·returnTo·edit은 읽은 뒤 주소에서 지운다(새로고침·뒤로 가기에서 다시 열리지 않게) */
  useEffect(() => {
    if (
      !searchParams.has('register') &&
      !searchParams.has('returnTo') &&
      !searchParams.has('edit')
    )
      return;
    const next = new URLSearchParams(searchParams);
    next.delete('register');
    next.delete('returnTo');
    next.delete('edit');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  /** 등록 모달을 닫는다(등록 없이 닫으면 returnTo가 있을 때 그 주소로) */
  const handleModalClose = () => {
    const back = modalPetSn === null ? returnTo : null;
    setModalPetSn(undefined);
    setReturnTo(null);
    if (back) navigate(back, { replace: true });
  };

  const handleCreated = (created) => {
    const back = returnTo;
    setModalPetSn(undefined);
    setReturnTo(null);
    if (back) {
      navigate(withPetSn(back, created.petSn), { replace: true });
    } else {
      setSlideIndex(null);
      setNewPetSn(created.petSn);
    }
  };

  const focusIndex = pets.findIndex((pet) => pet.petSn === focusPetSn);
  const newIndex = pets.findIndex((pet) => pet.petSn === newPetSn);
  /** 마지막 자리(pets.length)는 등록 슬라이드. 삭제로 위치가 끝을 넘으면 그 자리로 */
  const currentIndex = Math.min(
    slideIndex ?? (newIndex >= 0 ? newIndex : Math.max(focusIndex, 0)),
    pets.length,
  );

  return (
    <SubPageLayout section="mypage">
      {isPending ? (
        <PageSkeleton>
          <PetSlideSkeleton />
          <div aria-hidden="true" className="mt-7 flex flex-col gap-5">
            <Skeleton className="h-7 w-32" />
            <SkeletonCard className="h-[427px]" />
          </div>
        </PageSkeleton>
      ) : pets.length === 0 ? (
        <PetEmpty onRegister={() => setModalPetSn(null)} limit={limit} />
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
          limit={limit}
        />
      )}
      {!isPending && <SentInvitations />}
      {/* 수정은 목록에 있는 동물만(바로가기로 온 번호가 내 목록에 없으면 열지 않는다) */}
      {modalPetSn !== undefined &&
        (modalPetSn === null ||
          pets.some((pet) => pet.petSn === modalPetSn)) && (
          <PetFormModal
            petSn={modalPetSn}
            onClose={handleModalClose}
            onCreated={handleCreated}
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
