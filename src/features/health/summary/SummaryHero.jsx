import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import PetFace from '@/components/PetFace';
import { PATHS } from '@/routes/paths';
import { diffDays, formatDate } from '@/utils/formatDate';
import { BRUP_ROLE } from '@/utils/petCodes';
import { formatAge, getGndrName, getVrtyName } from '@/utils/petFormat';
import { DOSING } from '../checkup/checkupTypes';
import { usePixelCharacters } from '../queries';
import { getInspectionName } from '../summaryApi';
import { countItems, formatRange } from './summaryUtils';

/**
 * [종합 건강기록 히어로]
 * - 조회 기준일 + 요약 바 (FN-HLT-011-02)
 * - 반려동물 선택은 건강기록 공통 반려동물 카드(shared/PetSwitcher)가 맡는다. 이 히어로는 고른 pet을 그대로 보여 준다 (※신규 정책)
 * - 큰 이미지는 공용 PetFace(캐릭터 얼굴). 이미지가 없거나 못 받으면 종별 기본 아이콘, 캐릭터 오류 확인 중(bscCharSbstYn)이면 흑백
 * - 큰 이미지 자리: 주양육이고 캐릭터가 없으면(GET /pixel-characters 행에 pixelCharSn 없음) "캐릭터 만들기" 빈 자리 카드
 * - 공동양육·캐릭터 있음(생성 중·실패 포함)·캐릭터 목록 조회 중·실패는 PetFace
 */
export default function SummaryHero({ pet, summary }) {
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

  return (
    <section
      aria-label="종합 건강기록 요약"
      className="relative overflow-hidden rounded-[20px] bg-brand-500 px-5 py-6 text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] before:bg-size-[20px_20px] before:mask-[linear-gradient(105deg,transparent_35%,#000_75%)] before:content-[''] max-sm:px-4 max-sm:py-5 sm:px-10 sm:pb-8 sm:max-[1101px]:pt-9 min-[1101px]:pt-8 [&>*]:relative [&>*]:z-10"
    >
      <div className="flex justify-end max-[760px]:flex-col max-[760px]:gap-3">
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
              {allergyCount > 0 && (
                <ProfileTag>알레르기 {allergyCount}</ProfileTag>
              )}
              {diseaseCount > 0 && (
                <ProfileTag>기저질환 {diseaseCount}</ProfileTag>
              )}
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
              summary.dosingCount > 0
                ? firstDosing.mdcnNm
                : '복용 중인 처방 없음'
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
