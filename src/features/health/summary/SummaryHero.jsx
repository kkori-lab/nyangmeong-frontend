import { useEffect, useRef, useState } from 'react';
import { Cat, Dog, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import { PATHS } from '@/routes/paths';
import { diffDays, formatDate } from '@/utils/formatDate';
import { CHRC_STTS, PET_REL, PET_SE } from '@/utils/petCodes';
import { formatAge, getGndrName, getVrtyName } from '@/utils/petFormat';
import { DOSING } from '../checkup/checkupTypes';
import { countItems, formatRange } from './summaryUtils';

const REGISTER_PATH = `${PATHS.MYPAGE_PETS}?register=1`;

/**
 * [종합 건강기록 히어로]
 * - 반려동물 선택 탭 + 조회 기준일 + 요약 바 (FN-HLT-011-01·02)
 * - 탭은 반려동물이 2마리 이상일 때만. 칩마다 캐릭터 그림(없으면 종별 기본 이미지) 원 + 이름(등록 순서 그대로), 선택한 칩만 노란색
 * - 탭 뒤 세로 구분선과 점선 [+ 반려동물 등록] 버튼, 항상 보임
 * - 캐릭터 미생성이면 큰 이미지 자리가 빈 자리 카드(마이페이지 캐릭터 목록 이동), 공동양육은 기본 캐릭터만 (추가 요청)
 */
export default function SummaryHero({
  pets,
  pet,
  summary,
  onSelect,
}) {
  const { profile, latestCheckup, lab, prescriptions } = summary;
  const firstLabItem = lab?.items[0];
  const dosing = prescriptions.filter((item) => item.dosSttsCd === DOSING);
  const allergyCount = countItems(profile.allrgCn);
  const diseaseCount = countItems(profile.undrlDiseCn);
  const petRowRef = useRef(null);
  const [hasMoreRight, setHasMoreRight] = useState(false);

  // 모바일 반려동물 줄이 오른쪽으로 더 밀리면 끝을 흐리게, 끝까지 밀면 흐림을 뺌 (추가 요청)
  useEffect(() => {
    const row = petRowRef.current;
    if (!row) return undefined;
    const update = () =>
      setHasMoreRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pets, pet.petSn]);

  return (
    <section
      aria-label="종합 건강기록 요약"
      className="relative overflow-hidden rounded-[20px] bg-brand-500 px-5 py-6 text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] before:bg-size-[20px_20px] before:mask-[linear-gradient(105deg,transparent_35%,#000_75%)] before:content-[''] max-sm:px-4 max-sm:py-5 sm:px-10 sm:pt-9 sm:pb-8 [&>*]:relative [&>*]:z-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-5 max-sm:flex-col max-sm:flex-nowrap max-sm:gap-3">
        {/* 모바일은 줄바꿈 없이 가로로 밀어 봄 (추가 요청) */}
        <div
          ref={petRowRef}
          className={`flex flex-wrap items-center gap-2 [scrollbar-width:none] max-sm:w-full max-sm:flex-nowrap max-sm:overflow-x-auto ${
            hasMoreRight ? 'max-sm:mask-r-from-80%' : ''
          }`}
        >
          {pets.length > 1 && (
            <>
              <div
                role="tablist"
                aria-label="반려동물 선택"
                className="flex flex-wrap items-center gap-2 max-sm:flex-nowrap"
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
              <Divider />
            </>
          )}
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
        </div>
        <span className="inline-flex items-center gap-2 max-sm:order-first max-sm:self-end max-sm:text-sm before:size-2 before:rounded-full before:bg-[#f9eaa6] before:shadow-[0_0_0_4px_rgba(249,234,166,0.25)] before:content-['']">
          {formatDate(summary.baseYmd)} 기준
        </span>
      </div>

      <div className="mt-7 grid gap-4 max-sm:mt-4 max-sm:gap-3 min-[1101px]:grid-cols-[minmax(280px,370px)_minmax(0,1fr)]">
        <div className="flex items-center gap-4 rounded-[14px] border border-white/16 bg-[rgba(9,32,34,0.28)] p-5 max-sm:gap-3 max-sm:p-3.5">
          {pet.chrcSttsCd === CHRC_STTS.NONE &&
          pet.petRelCd !== PET_REL.CO_PARENT ? (
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
              <ProfileTag>{profile.wghtVal}kg</ProfileTag>
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
              `${formatDate(latestCheckup.ckupYmd)} · ${latestCheckup.hospNm}`
            }
            mobileSub={
              latestCheckup &&
              `${formatDate(latestCheckup.ckupYmd).slice(5)} · ${latestCheckup.hospNm}`
            }
          />
          <Stat
            icon="science"
            label={`검사 수치${firstLabItem ? ` · ${firstLabItem.inspItmNm}` : ''}`}
            value={firstLabItem?.rsltVal ?? null}
            unit={firstLabItem?.unitNm}
            sub={
              firstLabItem &&
              `참고범위 ${formatRange(firstLabItem.refMinVal, firstLabItem.refMaxVal, '~')}`
            }
            mobileSub={
              firstLabItem &&
              `참고 ${formatRange(firstLabItem.refMinVal, firstLabItem.refMaxVal, '~')}`
            }
          />
          <Stat
            icon="medication"
            label="현재 처방"
            value={dosing.length}
            unit="건"
            sub={
              dosing.length > 0 ? (
                <>
                  <span className="block">{dosing[0].medNm}</span>
                  <span className="block">복용 중</span>
                </>
              ) : (
                '복용 중인 처방 없음'
              )
            }
            mobileSub={dosing.length > 0 ? dosing[0].medNm : '복용 중인 처방 없음'}
          />
        </div>
      </div>
    </section>
  );
}

/** 캐릭터가 없으면 종별 기본 캐릭터. 테두리는 캐릭터가 있을 때와 같음 */
function PetImage({ pet, className, isLarge = false }) {
  const hasCharacter = pet.chrcSttsCd === CHRC_STTS.DONE && pet.chrctrImgPath;
  const DefaultCharacter = pet.petSeCd === PET_SE.DOG ? Dog : Cat;

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden ${
        isLarge
          ? 'rounded-modal bg-white text-subtle'
          : 'rounded-full border border-line text-current'
      } ${className}`}
    >
      {hasCharacter ? (
        <img src={pet.chrctrImgPath} alt="" className="size-full object-cover" />
      ) : (
        <DefaultCharacter className="size-3/5" />
      )}
    </span>
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
      className="group flex size-28 shrink-0 flex-col items-center justify-center gap-2 rounded-modal max-sm:size-20 max-sm:gap-1 border border-dashed border-white/50 bg-white/12 text-center text-badge leading-tight font-semibold hover:border-white hover:bg-white/20 focus-visible:border-white"
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
      <span className="flex items-center gap-1.5 text-[#dbe8e8] max-sm:shrink-0">
        <Icon name={icon} className="text-xl" />
        {label}
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
