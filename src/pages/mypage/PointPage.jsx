import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import PetFormModal from '@/features/pet/list/PetFormModal';
import { usePets } from '@/features/pet/queries';
import { BRUP_ROLE } from '@/features/pet/shared/petCodes';
import PointGuide from '@/features/point/guide/PointGuide';
import PointHistory from '@/features/point/history/PointHistory';
import CareMission from '@/features/point/mission/CareMission';
import PointSummary from '@/features/point/summary/PointSummary';
import { PATHS } from '@/routes/paths';
import { toYmd } from '@/utils/formatDate';
import SubPageLayout from '@/layouts/SubPageLayout';

const scrollToSection = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function PointPage() {
  const navigate = useNavigate();
  const [todayYmd] = useState(() => toYmd(new Date()));
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const { data: pets } = usePets();

  /** 케어미션은 내가 주양육자인 동물만 */
  const ownPets = pets
    ?.filter((pet) => pet.brupRoleCd === BRUP_ROLE.PRIMARY)
    .map(({ petSn, petNm }) => ({ petSn, petNm }));

  const goCharacter = () => navigate(PATHS.MYPAGE_CHARACTERS);

  return (
    <SubPageLayout
      section="mypage"
      description="케어미션을 달성하면 포인트가 쌓이고, 모은 포인트로 픽셀 캐릭터 아이템을 살 수 있어요"
    >
      <div className="flex flex-col gap-5">
        <PointSummary
          todayYmd={todayYmd}
          onScrollTo={scrollToSection}
          onGoHealth={() => showToast('준비 중인 기능이에요')}
          onGoCharacter={goCharacter}
        />
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <CareMission
            todayYmd={todayYmd}
            ownPets={ownPets}
            onRegister={() => setIsPetModalOpen(true)}
          />
          <PointHistory />
        </div>
        <PointGuide onGoCharacter={goCharacter} />
      </div>
      {isPetModalOpen && (
        <PetFormModal onClose={() => setIsPetModalOpen(false)} />
      )}
    </SubPageLayout>
  );
}
