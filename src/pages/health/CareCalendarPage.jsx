import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import Toggle from '@/components/Toggle';
import { showToast } from '@/components/toastStore';
import CareList from '@/features/health/CareList';
import DiaryTabs from '@/features/health/diary/DiaryTabs';
import MonthCalendar from '@/features/health/MonthCalendar';
import PetSwitcher from '@/features/health/shared/PetSwitcher';
import SelectedPetProvider from '@/features/health/shared/SelectedPetProvider';
import { useSelectedPet } from '@/features/health/shared/selectedPet';
import ScheduleDayDetail from '@/features/health/ScheduleDayDetail';
import ScheduleModal from '@/features/health/ScheduleModal';
import UpcomingSchedules from '@/features/health/UpcomingSchedules';
import SubPageLayout from '@/layouts/SubPageLayout';
import { useSchedules } from '@/features/health/queries';
import { useMe } from '@/features/member/queries';
import {
  addMonths,
  getDaysInMonth,
  getMonth,
  getTodayYmd,
  getYear,
  getYmdOf,
  makeYmd,
} from '@/utils/formatDate';
import { pickJosa } from '@/utils/josa';

/** 공용 페이지 머리·사이드 메뉴 설정 */
const LAYOUT_PROPS = {
  section: 'health',
  description: '모든 반려동물의 일정을 한눈에 확인하는 캘린더',
  contentClassName: 'gap-7 min-[1101px]:pt-6',
};

/** 다가오는 케어 일정 최대 건수(FN-HLT-003-40) */
const MAX_UPCOMING = 3;

const SECTION_TABS = [
  { id: 'hlt003-calendar', label: '캘린더' },
  { id: 'hlt003-care', label: '케어리스트' },
];

/** #hlt003-calendar·#hlt003-care로 오면 그 탭으로 시작 */
const getTabFromHash = (hash) =>
  SECTION_TABS.find((tab) => tab.id === hash.slice(1))?.id ??
  SECTION_TABS[0].id;

/**
 * [케어 캘린더 SCR-HLT-003]
 * - 반려동물은 건강기록 공통 반려동물 카드(shared/PetSwitcher)의 선택을 따른다 (※신규 정책)
 */
export default function CareCalendarPage() {
  const { data: me } = useMe();
  return (
    <SelectedPetProvider mbrSn={me?.mbrSn}>
      <CareCalendarContent />
    </SelectedPetProvider>
  );
}

/** 공용 페이지 틀 + 공통 반려동물 카드 (※신규 정책) */
function CalendarLayout({ children }) {
  return (
    <SubPageLayout
      {...LAYOUT_PROPS}
      sideBottom={<PetSwitcher variant="card" />}
    >
      <PetSwitcher variant="pill" />
      {children}
    </SubPageLayout>
  );
}

function CareCalendarContent() {
  const { hash } = useLocation();
  const [sectionId, setSectionId] = useState(() => getTabFromHash(hash));
  const todayYmd = getTodayYmd();
  const [viewMonthYmd, setViewMonthYmd] = useState(() =>
    makeYmd(getYear(todayYmd), getMonth(todayYmd), 1),
  );
  const [selectedYmd, setSelectedYmd] = useState(todayYmd);
  /** 「모든 아이 일정 같이 보기」 스위치(기본 켬). 달력 표시만 바꾸고 공통 카드의 아이는 바꾸지 않는다 (※신규 정책) */
  const [isShowAllPets, setIsShowAllPets] = useState(true);
  const [modal, setModal] = useState(null);

  const {
    pets,
    pet: selectedPet,
    selectPet,
    isPending: isPetsPending,
    isError: isPetsError,
  } = useSelectedPet();
  const year = getYear(viewMonthYmd);
  const month = getMonth(viewMonthYmd);
  // 목록을 받는 동안은 undefined라 일정 요청을 보내지 않는다
  const allPetSns = isPetsPending ? undefined : pets.map((pet) => pet.petSn);
  const { data: monthData, isError: isMonthError } = useSchedules({
    petSns: allPetSns,
    fromYmd: viewMonthYmd,
    toYmd: makeYmd(year, month, getDaysInMonth(year, month)),
  });
  const { data: upcomingData, isError: isUpcomingError } = useSchedules({
    petSns: allPetSns,
    fromYmd: todayYmd,
    size: MAX_UPCOMING,
  });
  /** 월 이동 가능 여부용: 기간 없이 반려동물마다 1건 */
  const { data: anyData } = useSchedules({ petSns: allPetSns, size: 1 });

  /** 첫 진입: 반려동물·이번 달·다가오는 일정이 모두 올 때까지 */
  if (
    isPetsPending ||
    (!isPetsError && !monthData && !isMonthError) ||
    (!isPetsError && !upcomingData && !isUpcomingError)
  )
    return (
      <CalendarLayout>
        <CalendarSkeleton sectionId={sectionId} />
      </CalendarLayout>
    );
  if (isPetsError) {
    return (
      <CalendarLayout>
        <p role="alert" className="text-[#566465]">
          반려동물 정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      </CalendarLayout>
    );
  }

  const petNm = selectedPet?.petNm ?? '';
  /** 스위치 켬: 모든 아이 일정(공통 카드의 아이가 아니면 isOtherPet으로 연하게). 끔: 공통 카드의 아이 일정만 */
  const withPetInfo = (schedules = []) =>
    schedules
      .filter(
        (schedule) => isShowAllPets || schedule.petSn === selectedPet?.petSn,
      )
      .map((schedule) => ({
        ...schedule,
        petNm: pets.find((pet) => pet.petSn === schedule.petSn)?.petNm,
        isOtherPet: schedule.petSn !== selectedPet?.petSn,
      }));
  const monthSchedules = withPetInfo(monthData);
  const upcomingSchedules = withPetInfo(upcomingData);
  const petLabel = isShowAllPets ? '전체 반려동물' : petNm;

  // 인라인 상세는 보고 있는 달의 일정으로 그리므로, 달을 옮기면 선택 날짜도 그 달로 옮긴다(이번 달이면 오늘)
  const handleMoveMonth = (offset) => {
    const nextMonthYmd = addMonths(viewMonthYmd, offset);
    setViewMonthYmd(nextMonthYmd);
    const isThisMonth =
      getYear(nextMonthYmd) === getYear(todayYmd) &&
      getMonth(nextMonthYmd) === getMonth(todayYmd);
    setSelectedYmd(isThisMonth ? todayYmd : nextMonthYmd);
  };

  const openCreate = (ymd) =>
    setModal({ key: Date.now(), schedule: null, defaultYmd: ymd });
  /**
   * 일정을 누르면 수정 모달을 연다. 다른 아이 일정이면 공통 카드를 그 아이로 바꾸고 알린 뒤
   * 원래 하던 동작(수정 모달 열기)은 그대로 이어서 한다 (※신규 정책)
   */
  const openEdit = (schedule) => {
    if (schedule.isOtherPet) {
      selectPet(schedule.petSn);
      showToast(
        `${schedule.petNm}의 일정이라 보고 있는 아이를 ${schedule.petNm}${pickJosa(schedule.petNm, '으로/로')} 바꿨어요`,
      );
    }
    setModal({
      key: Date.now(),
      schedule,
      defaultYmd: getYmdOf(schedule.schdlDt),
    });
  };

  return (
    <CalendarLayout>
      <DiaryTabs
        items={SECTION_TABS}
        activeId={sectionId}
        onSelect={setSectionId}
        label="케어 캘린더 묶음"
      />

      {sectionId === 'hlt003-calendar' && (
        <div
          id="hlt003-calendar"
          role="tabpanel"
          aria-labelledby="hlt003-calendar-tab"
          className="mt-5 grid items-start gap-5 min-[1101px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
        >
          <MonthCalendar
            year={year}
            month={month}
            schedules={monthSchedules}
            selectedYmd={selectedYmd}
            canMoveMonth={(anyData?.length ?? 0) > 0}
            onMoveMonth={handleMoveMonth}
            onSelectDate={setSelectedYmd}
            petSwitch={
              pets.length > 1 && (
                <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Toggle
                    checked={isShowAllPets}
                    onChange={setIsShowAllPets}
                    label="모든 아이 일정 같이 보기"
                  />
                  <span className="font-semibold text-ink">
                    모든 아이 일정 같이 보기
                  </span>
                  <span className="text-sm text-muted">
                    {isShowAllPets
                      ? `진하게 = ${petNm} · 연하게 = 다른 아이`
                      : `${petNm} 일정만 보고 있어요`}
                  </span>
                </div>
              )
            }
          />

          {/* 넓은 화면에서는 이 열의 높이를 캘린더 카드에 맞추고, 날짜 상세 : 다가오는 일정 = 7 : 3으로 나눈다. 다가오는 일정은 3건이 다 보이는 높이보다 줄지 않고, 모자란 만큼 날짜 상세가 줄며 안에서 스크롤 */}
          <div className="flex min-w-0 flex-col gap-5 min-[1101px]:h-0 min-[1101px]:min-h-full min-[1101px]:self-stretch">
            <ScheduleDayDetail
              className="min-[1101px]:min-h-0 min-[1101px]:flex-7"
              bodyClassName="min-[1101px]:min-h-0 min-[1101px]:overflow-y-auto"
              ymd={selectedYmd}
              schedules={monthSchedules}
              petLabel={petLabel}
              onSelectSchedule={openEdit}
              onCreate={() => openCreate(selectedYmd)}
            />
            <UpcomingSchedules
              schedules={upcomingSchedules}
              onSelectSchedule={openEdit}
              className="min-[1101px]:min-h-fit min-[1101px]:flex-3"
            />
          </div>
        </div>
      )}

      {sectionId === 'hlt003-care' && (
        <div
          id="hlt003-care"
          role="tabpanel"
          aria-labelledby="hlt003-care-tab"
          className="mt-5"
        >
          {/* 반려동물은 공통 카드에서 고른 아이. 새 일정 모달 기본값에도 쓰인다 */}
          {selectedPet && (
            <CareList petSn={selectedPet.petSn} />
          )}
        </div>
      )}

      {modal && (
        <ScheduleModal
          key={modal.key}
          pets={pets}
          schedule={modal.schedule}
          defaultPetSn={selectedPet?.petSn ?? null}
          defaultYmd={modal.defaultYmd}
          onClose={() => setModal(null)}
          onCreateNew={() => openCreate(modal.defaultYmd)}
        />
      )}
    </CalendarLayout>
  );
}

/**
 * 로딩 자리: 탭 막대(48px) + 처음 열릴 탭의 모양. 높이는 불러온 뒤 실측값
 * - 캘린더: 달력(5줄 달, 640px 미만은 점 표시 달력) + 날짜 상세·다가오는 일정. 1101px 이상은 오른쪽 두 장의 합이 달력과 같음
 * - 케어리스트: 케어리스트 카드 한 장(CareList 로딩 자리와 같은 높이)
 */
function CalendarSkeleton({ sectionId }) {
  return (
    <PageSkeleton>
      <div
        aria-hidden="true"
        className="flex h-12 items-center gap-8 border-b border-line px-4"
      >
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="mt-7">
        {sectionId === 'hlt003-care' ? (
          <SkeletonCard className="h-[1486px] max-sm:h-[1678px]" />
        ) : (
          <div className="grid gap-5 min-[1101px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <SkeletonCard className="h-[664px] max-sm:h-[468px]" />
            <div className="flex flex-col gap-5">
              <SkeletonCard className="h-[281px] max-[1100px]:h-[222px]" />
              <SkeletonCard className="h-[363px] max-[1100px]:h-[351px]" />
            </div>
          </div>
        )}
      </div>
    </PageSkeleton>
  );
}
