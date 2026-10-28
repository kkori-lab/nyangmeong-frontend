import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import CareList from '@/features/health/CareList';
import DiaryTabs from '@/features/health/diary/DiaryTabs';
import MonthCalendar from '@/features/health/MonthCalendar';
import PetFilterChips from '@/features/health/PetFilterChips';
import ScheduleDayDetail from '@/features/health/ScheduleDayDetail';
import ScheduleModal from '@/features/health/ScheduleModal';
import UpcomingSchedules from '@/features/health/UpcomingSchedules';
import SubPageLayout from '@/layouts/SubPageLayout';
import { usePets, useSchedules } from '@/features/health/queries';
import {
  addMonths,
  getDaysInMonth,
  getMonth,
  getTodayYmd,
  getYear,
  getYmdOf,
  makeYmd,
} from '@/utils/formatDate';

/** 공용 페이지 머리·사이드 메뉴 설정 */
const LAYOUT_PROPS = {
  section: 'health',
  description: '모든 반려동물의 일정을 한눈에 확인하는 통합 캘린더',
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

export default function CareCalendarPage() {
  const { hash } = useLocation();
  const [sectionId, setSectionId] = useState(() => getTabFromHash(hash));
  const todayYmd = getTodayYmd();
  const [viewMonthYmd, setViewMonthYmd] = useState(() =>
    makeYmd(getYear(todayYmd), getMonth(todayYmd), 1),
  );
  const [selectedYmd, setSelectedYmd] = useState(todayYmd);
  // null은 전체 선택이다. 반려동물 목록이 늦게 와도 전체로 시작한다
  const [filterPetSns, setFilterPetSns] = useState(null);
  const [tabPetSn, setTabPetSn] = useState(null);
  const [modal, setModal] = useState(null);

  const {
    data: pets,
    isPending: isPetsPending,
    isError: isPetsError,
  } = usePets();
  const year = getYear(viewMonthYmd);
  const month = getMonth(viewMonthYmd);
  const allPetSns = pets?.map((pet) => pet.petSn);
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
      <SubPageLayout {...LAYOUT_PROPS}>
        <CalendarSkeleton sectionId={sectionId} />
      </SubPageLayout>
    );
  if (isPetsError) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <p role="alert" className="text-[#566465]">
          반려동물 정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      </SubPageLayout>
    );
  }

  const visiblePetSns = filterPetSns ?? allPetSns;
  const isAllPets = visiblePetSns.length === allPetSns.length;
  const petLabel = isAllPets
    ? '전체 반려동물'
    : pets
        .filter((pet) => visiblePetSns.includes(pet.petSn))
        .map((pet) => pet.petNm)
        .join(', ');
  const selectedTabPetSn = tabPetSn ?? pets[0]?.petSn ?? null;

  /** 표시 반려동물만, 태그·행에 쓸 반려동물 이름 결합 */
  const filterByPet = (schedules = []) =>
    schedules
      .filter((schedule) => visiblePetSns.includes(schedule.petSn))
      .map((schedule) => ({
        ...schedule,
        petNm: pets.find((pet) => pet.petSn === schedule.petSn)?.petNm,
      }));
  const monthSchedules = filterByPet(monthData);
  const upcomingSchedules = filterByPet(upcomingData);

  const handleFilterChange = (petSns) =>
    setFilterPetSns(petSns.length === allPetSns.length ? null : petSns);

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
  const openEdit = (schedule) =>
    setModal({
      key: Date.now(),
      schedule,
      defaultYmd: getYmdOf(schedule.schdlDt),
    });

  return (
    <SubPageLayout {...LAYOUT_PROPS}>
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
          >
            <PetFilterChips
              pets={pets}
              selectedPetSns={visiblePetSns}
              onChange={handleFilterChange}
            />
          </MonthCalendar>

          {/* 넓은 화면에서는 이 열의 높이를 캘린더 카드에 맞추고, 다가오는 일정 카드는 내용 높이로 맨 아래에 붙고 남는 높이는 날짜 상세 카드가 채운다 */}
          <div className="flex min-w-0 flex-col gap-5 min-[1101px]:h-0 min-[1101px]:min-h-full min-[1101px]:self-stretch">
            <ScheduleDayDetail
              className="min-[1101px]:min-h-0 min-[1101px]:flex-1"
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
              className="min-[1101px]:shrink-0"
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
          {/* 반려동물 셀렉트는 카드 제목 왼쪽에 있다. 고른 반려동물은 새 일정 모달 기본값에도 쓰인다 */}
          {selectedTabPetSn != null && (
            <CareList
              petSn={selectedTabPetSn}
              pets={pets}
              onSelectPet={setTabPetSn}
            />
          )}
        </div>
      )}

      {modal && (
        <ScheduleModal
          key={modal.key}
          pets={pets}
          schedule={modal.schedule}
          defaultPetSn={selectedTabPetSn}
          defaultYmd={modal.defaultYmd}
          onClose={() => setModal(null)}
          onCreateNew={() => openCreate(modal.defaultYmd)}
        />
      )}
    </SubPageLayout>
  );
}

/**
 * 로딩 자리: 탭 막대(48px) + 처음 열릴 탭의 모양. 높이는 불러온 뒤 실측값이다
 * - 캘린더: 달력(5줄 달, 760px 이하는 점 표시 달력) + 날짜 상세·다가오는 일정. 1101px 이상은 오른쪽 두 장의 합이 달력과 같다
 * - 케어리스트: 토탈 케어리스트 카드 한 장(CareList 로딩 자리와 같은 높이)
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
            <SkeletonCard className="h-[664px] max-[760px]:h-[468px]" />
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
