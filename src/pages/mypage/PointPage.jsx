import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  const { data: pets, isError: isPetsError, refetch: refetchPets } = usePets();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  /** 메인 바로가기(?petSn=…#care-mission): 그 반려동물로 케어미션 칸을 연다 */
  const [initialPetSn] = useState(
    () => Number(searchParams.get('petSn')) || undefined,
  );

  // 주소에 #칸이 있으면 그 칸이 그려질 때까지(미션을 받은 뒤) 기다렸다가 한 번 내린다. 10초 넘으면 그만둔다
  useEffect(() => {
    if (!hash) return undefined;
    const id = hash.slice(1);
    const startedAt = Date.now();
    let frame;
    const tryScroll = () => {
      if (document.getElementById(id)) {
        scrollToSection(id);
      } else if (Date.now() - startedAt < 10000) {
        frame = requestAnimationFrame(tryScroll);
      }
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [hash]);

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
          onGoHealth={() => navigate(PATHS.HEALTH_DIARY)}
          onGoCharacter={goCharacter}
        />
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <CareMission
            todayYmd={todayYmd}
            ownPets={ownPets}
            isPetsError={isPetsError}
            onRetryPets={refetchPets}
            onRegister={() => setIsPetModalOpen(true)}
            initialPetSn={initialPetSn}
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
