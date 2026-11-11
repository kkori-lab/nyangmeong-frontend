import { useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '@/components/Skeleton';
import { pickGreeting } from '@/features/dashboard/greeting';
import HeroAsk from '@/features/dashboard/HeroAsk';
import MainShortcuts from '@/features/dashboard/MainShortcuts';
import { useMyPets } from '@/features/health/queries';
import { useMe } from '@/features/member/queries';
import { PATHS } from '@/routes/paths';

/**
 * [메인페이지 SCR-MAN-001] 구글 시작 화면형(팀 회의 2026-11-08 개편)
 * - 위에서부터 인사말 → AI 매니저 검색창 → 반려동물 바로가기, 화면 맨 아래에 픽셀 띠(푸터 없음)
 *   (제안 카드 [AI 건강분석 리포트]·[영수증 올리기]는 뺐다, 사람 요청 2026-11-09)
 * - `/main`은 회원만 들어온다(mainRoutes `auth: 'member'`)
 * - 헤더 아래 → 인사말: PC 120px·760px 이하 56px 고정(UserLayout main pt-6 24px 포함), 바로가기 줄 수와 상관없이 같은 자리(사람 요청 2026-11-11). 메인은 푸터 없이 스크롤하지 않는다
 * - 세 묶음 사이 PC 56px·760px 이하 40px(사람 요청 2026-11-11)
 */
export default function MainPage() {
  const { data: pets, isError } = useMyPets();
  const { data: me } = useMe();
  const representativePet =
    pets?.find((pet) => pet.rprsPetYn) ?? pets?.[0] ?? null;
  /** 인사말 시간대는 들어온 시각으로 한 번 정한다(머무는 동안 다시 그려도 그대로) */
  const [enteredAt] = useState(() => new Date());

  return (
    <section
      aria-labelledby="main-title"
      className="flex flex-col items-center gap-14 pt-24 text-center max-[760px]:gap-10 max-[760px]:pt-8"
    >
      {!pets && !isError ? (
        <MainSkeleton />
      ) : (
        <>
          <h1
            id="main-title"
            className="flex items-center gap-2 text-[28px] leading-[36px] font-bold tracking-[-0.03em] text-ink max-[760px]:text-xl max-[760px]:leading-[28px]"
          >
            {pickGreeting(enteredAt, representativePet?.petNm)}
          </h1>
          <HeroAsk petNm={representativePet?.petNm ?? '우리 아이'} />
          {pets?.length > 0 ? (
            <MainShortcuts pets={pets} mbrSn={me?.mbrSn} />
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
    </section>
  );
}

/** 첫 진입: 인사말·검색창·바로가기 자리 */
function MainSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex w-full flex-col items-center gap-14 max-[760px]:gap-10"
    >
      <h1 id="main-title" className="sr-only">
        냥멍케어 메인
      </h1>
      <Skeleton className="h-9 w-[320px] max-w-full" />
      <Skeleton className="h-[52px] w-full max-w-[600px] rounded-full" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[120px] w-24 rounded-box" />
        ))}
      </div>
    </div>
  );
}
