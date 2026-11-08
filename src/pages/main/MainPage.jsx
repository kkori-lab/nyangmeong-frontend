import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '@/components/Skeleton';
import ReceiptUploadModal from '@/features/ai/receipt/ReceiptUploadModal';
import HeroAsk from '@/features/dashboard/HeroAsk';
import MainShortcuts from '@/features/dashboard/MainShortcuts';
import { useMyPets } from '@/features/health/queries';
import { PATHS } from '@/routes/paths';
import { pickJosa } from '@/utils/josa';

/**
 * [메인페이지 SCR-MAN-001] 구글 시작 화면형(팀 회의 2026-11-08 개편)
 * - 첫 화면 세로 가운데에 인사말 → AI 매니저 검색창 → 제안 카드 → 반려동물 바로가기, 그 아래 바로 푸터
 * - `/main`은 회원만 들어온다(mainRoutes `auth: 'member'`)
 * - [영수증 올리기]: 건강기록 영수증 업로드 모달을 여기서 열고, 인식 결과 확인·직접 입력은 건강일지가 이어받는다(추가-3)
 *   건강일지는 ?recptSn=&petSn=이면 결과 확인, ?checkup=manual&recptSn=이면 검진기록 입력으로 시작한다
 * - 높이: 화면 − 헤더(64px) − 본문 위아래 여백(UserLayout main pt-6, pb-[160px] / 760px 이하 pb-20)
 */
export default function MainPage() {
  const { data: pets, isError } = useMyPets();
  const representativePet =
    pets?.find((pet) => pet.rprsPetYn) ?? pets?.[0] ?? null;
  const navigate = useNavigate();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  /** 반려동물이 없으면 영수증을 연결할 곳이 없어 등록으로 보낸다 */
  const handleReceipt = () => {
    if (representativePet) setIsReceiptOpen(true);
    else navigate(`${PATHS.MYPAGE_PETS}?register=1`);
  };

  const handleRecognized = ({ recptSn, petSn }) =>
    navigate(
      `${PATHS.HEALTH_DIARY}?${new URLSearchParams({ recptSn, petSn })}`,
    );

  const handleManualInput = ({ recptSn } = {}) =>
    navigate(
      `${PATHS.HEALTH_DIARY}?${new URLSearchParams({
        checkup: 'manual',
        ...(recptSn != null && { recptSn }),
      })}`,
    );

  return (
    <section
      aria-labelledby="main-title"
      className="flex min-h-[calc(100svh-248px)] flex-col items-center justify-center gap-6 text-center max-[760px]:min-h-[calc(100svh-168px)]"
    >
      {!pets && !isError ? (
        <MainSkeleton />
      ) : (
        <>
          <h1
            id="main-title"
            className="flex items-center gap-2 text-[26px] leading-[1.35] font-bold tracking-[-0.02em] text-ink max-[760px]:text-xl"
          >
            <Sparkles
              className="size-6 shrink-0 text-brand-500"
              aria-hidden="true"
            />
            {representativePet
              ? `오늘 ${representativePet.petNm}${pickJosa(representativePet.petNm, '은/는')} 어땠나요?`
              : '오늘 하루는 어땠나요?'}
          </h1>
          <HeroAsk
            petNm={representativePet?.petNm ?? '우리 아이'}
            onReceipt={handleReceipt}
          />
          {pets?.length > 0 ? (
            <MainShortcuts pets={pets} />
          ) : (
            <p className="text-muted">
              {isError
                ? '반려동물 정보를 불러오지 못했어요.'
                : '등록된 반려동물이 없어요.'}{' '}
              {!isError && (
                <Link
                  to={`${PATHS.MYPAGE_PETS}?register=1`}
                  className="font-semibold text-brand-600 underline"
                >
                  반려동물 등록하기
                </Link>
              )}
            </p>
          )}
        </>
      )}
      {isReceiptOpen && (
        <ReceiptUploadModal
          pets={pets}
          defaultPetSn={representativePet.petSn}
          onRecognized={handleRecognized}
          onManualInput={handleManualInput}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </section>
  );
}

/** 첫 진입: 인사말·검색창·제안 카드·바로가기 자리 */
function MainSkeleton() {
  return (
    <div aria-busy="true" className="flex w-full flex-col items-center gap-6">
      <h1 id="main-title" className="sr-only">
        냥멍케어 메인
      </h1>
      <Skeleton className="h-9 w-[320px] max-w-full" />
      <Skeleton className="h-[52px] w-full max-w-[600px] rounded-full" />
      <div className="grid w-full max-w-[440px] grid-cols-2 gap-3 max-[480px]:grid-cols-1">
        <Skeleton className="h-[58px] rounded-box" />
        <Skeleton className="h-[58px] rounded-box" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[96px] w-[80px] rounded-box" />
        ))}
      </div>
    </div>
  );
}
