import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import PetFace from '@/components/PetFace';
import { PATHS } from '@/routes/paths';
import { diffDays, formatDate } from '@/utils/formatDate';
import { BRUP_ROLE, MAX_OWN_PETS } from '@/utils/petCodes';
import { formatAge, getGndrName, getVrtyName } from '@/utils/petFormat';
import { DOSING } from '../checkup/checkupTypes';
import { usePixelCharacters } from '../queries';
import { getInspectionName } from '../summaryApi';
import { countItems, formatRange } from './summaryUtils';

const REGISTER_PATH = `${PATHS.MYPAGE_PETS}?register=1`;
/** 칩 줄 PC 배치 기준 폭. 클래스의 min-[1101px]와 같음 */
const PC_QUERY = '(min-width: 1101px)';
/** 마우스 스와이프: 이만큼 움직여야 끌기로 봄, 이만큼 밀어야 다음·이전 묶음으로 (px) */
const DRAG_START = 5;
const SWIPE_MIN = 40;

/**
 * [종합 건강기록 히어로]
 * - 반려동물 선택 탭 + 조회 기준일 + 요약 바 (FN-HLT-011-01·02)
 * - 탭은 반려동물이 2마리 이상일 때만. 칩마다 캐릭터 그림(없으면 종별 기본 이미지) 원 + 이름(등록 순서 그대로), 선택한 칩만 노란색
 * - 탭 뒤 세로 구분선과 점선 [+ 반려동물 등록] 버튼. 주양육 반려동물이 MAX_OWN_PETS면 둘 다 숨김
 * - 칩 줄은 모든 폭에서 한 줄 가로 스크롤. PC(1101px 이상)는 같은 줄 오른쪽에 진행 점·구분선·기준일
 * - 칩과 큰 이미지 모두 공용 PetFace(캐릭터 얼굴). 이미지가 없거나 못 받으면 종별 기본 아이콘, 캐릭터 오류 확인 중(bscCharSbstYn)이면 흑백
 * - 큰 이미지 자리: 주양육이고 캐릭터가 없으면(GET /pixel-characters 행에 pixelCharSn 없음) "캐릭터 만들기" 빈 자리 카드
 * - 공동양육·캐릭터 있음(생성 중·실패 포함)·캐릭터 목록 조회 중·실패는 PetFace
 */
export default function SummaryHero({
  pets,
  pet,
  summary,
  onSelect,
}) {
  const { pet: profile, weight, latestCheckup, lab, prescriptions } = summary;
  const firstLabItem = lab?.items[0];
  const firstDosing = prescriptions.find((item) => item.prscSttsCd === DOSING);
  const allergyCount = countItems(profile.algyCn);
  const diseaseCount = countItems(profile.dssCn);
  const { data: pixelCharacters } = usePixelCharacters();
  const pixelCharacter = pixelCharacters?.find(
    (item) => item.petSn === pet.petSn,
  );
  const isCharacterSlot =
    pet.brupRoleCd === BRUP_ROLE.PRIMARY &&
    pixelCharacter != null &&
    pixelCharacter.pixelCharSn == null;
  // 주양육 반려동물이 상한이면 등록 버튼·그 앞 구분선을 숨김 (마이페이지와 같은 기준)
  const isFull =
    pets.filter((item) => item.brupRoleCd === BRUP_ROLE.PRIMARY).length >=
    MAX_OWN_PETS;
  const petRowRef = useRef(null);
  const [hasMoreRight, setHasMoreRight] = useState(false);
  const [page, setPage] = useState({ count: 1, index: 0 });

  // 반려동물 줄이 오른쪽으로 더 밀리면 끝을 흐리게, 끝까지 밀면 흐림을 뺌 (추가 요청)
  // PC 진행 점: 묶음 수 = 줄 전체 길이 ÷ 보이는 폭, 끝까지 밀면 마지막 묶음 (추가 요청)
  useEffect(() => {
    const row = petRowRef.current;
    if (!row) return undefined;
    const update = () => {
      const { scrollLeft, clientWidth, scrollWidth } = row;
      const isEnd = scrollLeft + clientWidth >= scrollWidth - 1;
      const count = Math.max(1, Math.ceil((scrollWidth - 1) / clientWidth));
      setHasMoreRight(!isEnd);
      setPage({
        count,
        index: isEnd
          ? count - 1
          : Math.min(count - 1, Math.round(scrollLeft / clientWidth)),
      });
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pets, pet.petSn]);

  // PC는 선택한 칩이 안 보이면 그 칩이 다 보이는 첫 묶음으로 (점을 누를 때와 같은 묶음 단위, 추가 요청)
  useEffect(() => {
    const row = petRowRef.current;
    if (!row || !window.matchMedia(PC_QUERY).matches) return;
    const chip = row.querySelector('[aria-selected="true"]');
    if (!chip) return;
    const { clientWidth, scrollWidth } = row;
    const rowRect = row.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    // 칩의 줄 안 위치 (스크롤과 무관)
    const left = chipRect.left - rowRect.left + row.scrollLeft;
    const right = left + chipRect.width;
    const isVisible = (scrollLeft) =>
      left >= scrollLeft - 1 && right <= scrollLeft + clientWidth + 1;
    const maxLeft = scrollWidth - clientWidth;
    const count = Math.ceil((scrollWidth - 1) / clientWidth);
    const pageLefts = Array.from({ length: count }, (_, index) =>
      Math.min(index * clientWidth, maxLeft),
    );
    // 칩이 보이고 묶음 경계에 맞춰져 있으면 그대로 (묶음 사이에 멈추면 점과 어긋남)
    const isOnPage = pageLefts.some(
      (pageLeft) => Math.abs(pageLeft - row.scrollLeft) <= 1,
    );
    if (isVisible(row.scrollLeft) && isOnPage) return;
    // 묶음 경계에 걸친 칩은 오른쪽 끝이 들어가는 묶음으로
    row.scrollLeft =
      pageLefts.find(isVisible) ??
      pageLefts[Math.min(count - 1, Math.floor((right - 1) / clientWidth))];
    // 점·구분선이 생기면 칩 줄 폭이 줄어드니 묶음 수가 바뀔 때도 다시 맞춤
  }, [pets, pet.petSn, page.count]);

  const movePage = (index) => {
    const row = petRowRef.current;
    row.scrollTo({ left: index * row.clientWidth, behavior: 'smooth' });
  };

  // PC 마우스 스와이프: 끄는 동안 칩 줄이 따라 움직이고, 놓으면 민 방향의 다음·이전 묶음으로 (추가 요청)
  // 터치·트랙패드는 브라우저 기본 가로 스크롤
  const dragRef = useRef(null);
  const handlePointerDown = (event) => {
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      page.count < 2 ||
      !window.matchMedia(PC_QUERY).matches
    ) {
      return;
    }
    dragRef.current = {
      startX: event.clientX,
      startLeft: petRowRef.current.scrollLeft,
      startIndex: page.index,
      isMoved: false,
    };
  };
  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (!drag.isMoved && Math.abs(dx) < DRAG_START) return;
    if (!drag.isMoved) petRowRef.current.setPointerCapture(event.pointerId);
    drag.isMoved = true;
    petRowRef.current.scrollLeft = drag.startLeft - dx;
  };
  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.isMoved) {
      dragRef.current = null;
      return;
    }
    const dx = event.clientX - drag.startX;
    let index = drag.startIndex;
    if (dx <= -SWIPE_MIN) index += 1;
    if (dx >= SWIPE_MIN) index -= 1;
    movePage(Math.min(page.count - 1, Math.max(0, index)));
    // 놓은 직후의 클릭만 막고 그 뒤 키보드 선택 등은 그대로
    setTimeout(() => (dragRef.current = null), 0);
  };
  // 끌고 난 뒤의 클릭은 칩 선택으로 보지 않음
  const handleClickCapture = (event) => {
    if (dragRef.current?.isMoved) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragRef.current = null;
  };

  return (
    <section
      aria-label="종합 건강기록 요약"
      className="relative overflow-hidden rounded-[20px] bg-brand-500 px-5 py-6 text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] before:bg-size-[20px_20px] before:mask-[linear-gradient(105deg,transparent_35%,#000_75%)] before:content-[''] max-sm:px-4 max-sm:py-5 sm:px-10 sm:pb-8 sm:max-[1101px]:pt-9 min-[1101px]:pt-8 [&>*]:relative [&>*]:z-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-5 max-[760px]:flex-col max-[1100px]:flex-nowrap max-[760px]:gap-3 min-[761px]:max-[1100px]:items-center min-[1101px]:flex-nowrap min-[1101px]:items-center">
        {/* 줄바꿈 없이 가로로 밀어 봄 (추가 요청) */}
        <div
          ref={petRowRef}
          className={`flex flex-wrap items-center gap-2 [scrollbar-width:none] max-[760px]:w-full min-[761px]:max-[1100px]:min-w-0 min-[761px]:max-[1100px]:flex-1 max-[1100px]:flex-nowrap max-[1100px]:overflow-x-auto min-[1101px]:min-w-0 min-[1101px]:flex-1 min-[1101px]:flex-nowrap min-[1101px]:overflow-x-auto ${
            hasMoreRight ? 'mask-r-from-80%' : ''
          } ${page.count > 1 ? 'min-[1101px]:cursor-grab min-[1101px]:select-none' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => (dragRef.current = null)}
          onClickCapture={handleClickCapture}
          onDragStart={(event) => dragRef.current && event.preventDefault()}
        >
          {pets.length > 1 && (
            <>
              <div
                role="tablist"
                aria-label="반려동물 선택"
                className="flex flex-wrap items-center gap-2 max-[1100px]:flex-nowrap min-[1101px]:flex-nowrap"
              >
                {pets.map((item) => {
                  const isSelected = item.petSn === pet.petSn;
                  return (
                    <button
                      key={item.petSn}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border pr-3.5 pl-1.25 font-semibold whitespace-nowrap ${
                        isSelected
                          ? 'border-[#f9eaa6] bg-[#f9eaa6] text-ink'
                          : 'border-white/26 hover:border-white/50 focus-visible:border-white'
                      }`}
                      onClick={() => onSelect(item.petSn)}
                    >
                      <PetImage
                        pet={item}
                        className={`size-7.5 ${isSelected ? 'bg-ink/10' : 'bg-white/18'}`}
                      />
                      {item.petNm}
                    </button>
                  );
                })}
              </div>
              {!isFull && <Divider />}
            </>
          )}
          {!isFull && (
            <Link
              to={REGISTER_PATH}
              className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-dashed border-white/50 pr-3.5 pl-1.25 text-sm font-semibold whitespace-nowrap hover:border-white hover:bg-white/12 focus-visible:border-white"
            >
              <span
                aria-hidden="true"
                className="grid size-7.5 place-items-center rounded-full border border-dashed border-white/50 group-hover:border-white"
              >
                <Plus className="size-4.5" />
              </span>
              반려동물 등록
            </Link>
          )}
        </div>
        {/* PC는 칩 줄 한 줄에 [진행 점] [구분선] [기준일], 점이 없으면 기준일만 (추가 요청) */}
        {page.count > 1 && (
          <>
            <PageDots count={page.count} index={page.index} onMove={movePage} />
            {/* 아래 요약 3칸 사이 구분선과 같은 선 */}
            <span
              aria-hidden="true"
              className="hidden h-6 shrink-0 border-l border-white/26 min-[1101px]:block"
            />
          </>
        )}
        <span className="inline-flex items-center gap-2 max-[760px]:order-first max-[760px]:self-end max-[1100px]:text-sm min-[761px]:max-[1100px]:shrink-0 min-[761px]:max-[1100px]:whitespace-nowrap min-[1101px]:shrink-0 min-[1101px]:whitespace-nowrap before:size-2 before:rounded-full before:bg-[#f9eaa6] before:shadow-[0_0_0_4px_rgba(249,234,166,0.25)] before:content-['']">
          {formatDate(summary.baseYmd)} 기준
        </span>
      </div>

      <div className="mt-7 grid gap-4 max-sm:mt-4 max-sm:gap-3 min-[1000px]:grid-cols-[minmax(280px,370px)_minmax(0,1fr)]">
        <div className="flex items-center gap-4 rounded-[14px] border border-white/16 bg-[rgba(9,32,34,0.28)] p-5 max-sm:gap-3 max-sm:p-3.5">
          {isCharacterSlot ? (
            <CharacterSlot />
          ) : (
            <PetImage pet={pet} className="size-28 max-sm:size-20" isLarge />
          )}
          <div className="min-w-0">
            <p className="text-lg leading-none font-bold">{pet.petNm}</p>
            <p className="mt-1 text-[#dbe8e8] max-sm:text-sm">
              {getVrtyName(profile)} ·{' '}
              {formatAge(profile.petBrdt, new Date(summary.baseYmd))} ·{' '}
              {getGndrName(profile)}
            </p>
            {/* 모바일은 태그를 한 줄로 (추가 요청) */}
            <div className="mt-2 flex flex-wrap gap-1 max-sm:flex-nowrap">
              {weight != null && <ProfileTag>{weight}kg</ProfileTag>}
              {allergyCount > 0 && <ProfileTag>알레르기 {allergyCount}</ProfileTag>}
              {diseaseCount > 0 && <ProfileTag>기저질환 {diseaseCount}</ProfileTag>}
            </div>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[14px] border border-white/16 bg-[rgba(9,32,34,0.28)] max-sm:grid-cols-1 sm:grid-cols-3">
          <Stat
            icon="calendar_month"
            label="최근 검진"
            value={
              latestCheckup
                ? diffDays(latestCheckup.ckupYmd, summary.baseYmd)
                : null
            }
            unit="일 전"
            sub={
              latestCheckup &&
              `${formatDate(latestCheckup.ckupYmd)} · ${latestCheckup.hsptlNm}`
            }
            mobileSub={
              latestCheckup &&
              `${formatDate(latestCheckup.ckupYmd).slice(5)} · ${latestCheckup.hsptlNm}`
            }
          />
          <Stat
            icon="science"
            label={`검사 수치${firstLabItem ? ` · ${getInspectionName(firstLabItem)}` : ''}`}
            value={firstLabItem?.rsltNvl ?? null}
            unit={firstLabItem?.unitNm}
            sub={
              firstLabItem &&
              `참고범위 ${formatRange(firstLabItem.refLlmtNvl, firstLabItem.refUplmtNvl, '~')}`
            }
            mobileSub={
              firstLabItem &&
              `참고 ${formatRange(firstLabItem.refLlmtNvl, firstLabItem.refUplmtNvl, '~')}`
            }
          />
          <Stat
            icon="medication"
            label="현재 처방"
            value={summary.dosingCount}
            unit="건"
            sub={
              summary.dosingCount > 0 ? (
                <>
                  <span className="block">{firstDosing.mdcnNm}</span>
                  <span className="block">복용 중</span>
                </>
              ) : (
                '복용 중인 처방 없음'
              )
            }
            mobileSub={
              summary.dosingCount > 0 ? firstDosing.mdcnNm : '복용 중인 처방 없음'
            }
          />
        </div>
      </div>
    </section>
  );
}

/** 캐릭터 얼굴: 이미지가 없거나 못 받으면 종별 기본 아이콘. 테두리는 캐릭터가 있을 때와 같음 */
function PetImage({ pet, className, isLarge = false }) {
  return (
    <PetFace
      petSn={pet.petSn}
      petSeCd={pet.petSeCd}
      isError={pet.bscCharSbstYn}
      className={`shrink-0 overflow-hidden ${
        isLarge
          ? 'rounded-modal bg-white text-subtle'
          : 'rounded-full border border-line text-current'
      } ${className}`}
      iconClassName="size-3/5"
    />
  );
}

/**
 * 캐릭터 미생성(주양육)일 때 큰 이미지 자리의 빈 자리 카드
 * - 큰 이미지와 같은 크기, 전체가 마이페이지 캐릭터 목록으로 가는 링크 (모달은 열지 않음)
 * - 겉은 반투명 흰 점선(반려동물 등록 버튼과 같음), "+" 뒤 빛번짐은 2초 주기로 밝아졌다 흐려짐. 움직임 줄이기 설정이면 멈춤
 */
function CharacterSlot() {
  return (
    <Link
      to={PATHS.MYPAGE_CHARACTERS}
      className="group flex size-28 shrink-0 flex-col items-center justify-center gap-2 rounded-modal border border-dashed border-white/50 bg-white/12 text-center text-badge leading-tight font-semibold hover:border-white hover:bg-white/20 focus-visible:border-white max-sm:size-20 max-sm:gap-1"
    >
      <span
        aria-hidden="true"
        className="relative grid size-9 place-items-center max-sm:size-7"
      >
        <span className="absolute inset-0 animate-pulse rounded-full bg-white/40 blur-sm motion-reduce:animate-none" />
        <span className="relative grid size-full place-items-center rounded-full border border-white/80 text-white">
          <Plus className="size-5 max-sm:size-4" />
        </span>
      </span>
      <span>캐릭터 만들기</span>
    </Link>
  );
}

/**
 * PC 칩 줄 진행 점 (1101px 이상만 보임)
 * - 현재 묶음은 길게·선택 칩 노란색, 나머지는 작고 흐리게. 모양은 마이페이지 반려동물 슬라이드 점과 같음
 */
function PageDots({ count, index, onMove }) {
  return (
    <nav
      aria-label="반려동물 칩 묶음"
      className="ml-3 hidden shrink-0 items-center gap-2 min-[1101px]:flex"
    >
      {Array.from({ length: count }, (_, dotIndex) => (
        <button
          key={dotIndex}
          type="button"
          aria-label={`${dotIndex + 1}번째 묶음`}
          aria-current={dotIndex === index ? 'true' : undefined}
          className={`h-2 rounded-full transition-[width] duration-200 ${
            dotIndex === index ? 'w-[22px] bg-[#f9eaa6]' : 'w-2 bg-white/26'
          }`}
          onClick={() => onMove(dotIndex)}
        />
      ))}
    </nav>
  );
}

/** 반려동물 칩 묶음과 등록 버튼 사이의 세로 구분선 */
function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 h-6 shrink-0 border-l border-white/26"
    />
  );
}

function ProfileTag({ children }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-white/26 px-2 text-[13px] font-semibold whitespace-nowrap max-sm:px-1.5">
      {children}
    </span>
  );
}

/**
 * 요약 수치 한 칸
 * - PC: 아이콘·항목명 / 큰 값 / 설명을 세로로
 * - 모바일(640px 미만): 한 줄 목록. 왼쪽 아이콘·항목명, 오른쪽 큰 값과 짧은 설명(mobileSub) (추가 요청)
 */
function Stat({ icon, label, value, unit, sub, mobileSub }) {
  const mobileText = mobileSub ?? sub ?? '등록된 기록 없음';

  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-white/26 px-4 py-[18px] max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:border-t max-sm:py-2.5 max-sm:first:border-t-0 sm:border-l sm:first:border-l-0">
      {/* 제목도 설명 줄처럼 넘치면 한 줄 말줄임 (추가 요청) */}
      <span className="flex min-w-0 items-center gap-1.5 text-[#dbe8e8] max-sm:shrink-0">
        <Icon name={icon} className="shrink-0 text-xl" />
        <span className="truncate" title={label}>
          {label}
        </span>
      </span>
      <div className="contents max-sm:flex max-sm:min-w-0 max-sm:flex-col max-sm:items-end max-sm:gap-0.5">
        <span className="text-[30px] leading-[1.1] font-bold tracking-[-0.02em] max-sm:text-xl [&_small]:leading-[1.1]">
          {value ?? '-'}
          {value != null && unit && (
            <small className="ml-[3px] text-base font-semibold text-[#dbe8e8]">
              {unit}
            </small>
          )}
        </span>
        {/* 반려동물을 바꿔도 히어로 높이가 같도록 설명 줄은 늘 두 줄 높이,
            글자 한 줄 설명은 꺾지 않고 넘치면 말줄임 (추가 요청) */}
        <span
          className={`min-h-[2lh] leading-[1.45] text-[#dbe8e8] max-sm:hidden ${
            typeof sub === 'string' ? 'truncate' : ''
          }`}
          title={typeof sub === 'string' ? sub : undefined}
        >
          {sub ?? '등록된 기록 없음'}
        </span>
        <span
          className="max-w-full truncate text-sm text-[#dbe8e8] sm:hidden"
          title={mobileText}
        >
          {mobileText}
        </span>
      </div>
    </div>
  );
}
