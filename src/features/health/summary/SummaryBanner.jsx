import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Icon from '@/components/Icon';
import PetFace from '@/components/PetFace';
import { PATHS } from '@/routes/paths';
import { diffDays, formatDate } from '@/utils/formatDate';
import { BRUP_ROLE } from '@/utils/petCodes';
import { formatAge, getPetSeName } from '@/utils/petFormat';
import { DOSING } from '../checkup/checkupTypes';
import { usePixelCharacters } from '../queries';
import { getInspectionName } from '../summaryApi';
import { formatRange } from './summaryUtils';

/** 캐릭터 무대 원 크기: 640px 미만 64px(요약 띠 높이, ※신규 정책) · 640~1023px 128px · 1024px 이상(lg) 160px */
const STAGE_SIZE = 'size-16 sm:size-32 lg:size-40';

/**
 * [종합 건강기록 배너] (※신규 정책, 기능 ID 없음. FN-HLT-011-02 요약 바를 대신한다)
 * - 흰 카드. 왼쪽 캐릭터 무대(연한 청록 원), 오른쪽 위 이름·기준일, 오른쪽 아래 요약 3칸(최근 검진·검사 수치·현재 처방)
 * - 반려동물 선택은 건강기록 공통 반려동물 카드(shared/PetSwitcher)가 맡는다. 품종·나이·성별·체중은 그 카드와 겹쳐 뺐다
 * - 주양육이고 캐릭터가 없으면(GET /pixel-characters 행에 pixelCharSn 없음) 같은 크기·자리에 점선 원 [캐릭터 만들기]
 * - 공동양육·캐릭터 있음(생성 중·실패 포함)·캐릭터 목록 조회 중·실패는 PetFace
 * - 640px 미만: 연한 청록 띠(테두리 없음), 위 줄 캐릭터 + 이름·종·나이·기준일, 아래 요약 3칸 흰 상자 가로 (※신규 정책)
 */
export default function SummaryBanner({ pet, summary }) {
  const { latestCheckup, lab, prescriptions } = summary;
  const firstLabItem = lab?.items[0];
  const firstDosing = prescriptions.find((item) => item.prscSttsCd === DOSING);
  const { data: pixelCharacters } = usePixelCharacters();
  const pixelCharacter = pixelCharacters?.find(
    (item) => item.petSn === pet.petSn,
  );
  /** 640px 미만 기준일 앞 종·나이 */
  const petMeta = [getPetSeName(pet), formatAge(pet.petBrdt)]
    .filter(Boolean)
    .map((text) => `${text} · `)
    .join('');
  const isCharacterSlot =
    pet.brupRoleCd === BRUP_ROLE.PRIMARY &&
    pixelCharacter != null &&
    pixelCharacter.pixelCharSn == null;

  return (
    <section
      aria-label="종합 건강기록 요약"
      className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-card bg-brand-50 p-4 sm:gap-x-8 sm:gap-y-4 sm:border sm:border-line sm:bg-white sm:p-6"
    >
      {isCharacterSlot ? (
        <CharacterSlot />
      ) : (
        <div
          className={`grid shrink-0 place-items-center self-center rounded-full bg-white sm:row-span-2 sm:bg-brand-50 ${STAGE_SIZE}`}
        >
          <PetFace
            petSn={pet.petSn}
            petSeCd={pet.petSeCd}
            isError={pet.bscCharSbstYn}
            className="size-14 shrink-0 overflow-hidden rounded-modal text-subtle sm:size-24 lg:size-32"
            iconClassName="size-3/5"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-col justify-center gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="truncate text-lg font-bold text-brand-500 sm:text-2xl">
          {pet.petNm}
        </p>
        <p className="text-sm whitespace-nowrap text-subtle max-sm:truncate">
          {petMeta && <span className="sm:hidden">{petMeta}</span>}
          {formatDate(summary.baseYmd)} 기준
        </p>
      </div>

      <div className="col-span-2 grid grid-cols-3 gap-2 divide-line sm:col-span-1 sm:gap-0 sm:divide-x">
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
          mobileSub={latestCheckup?.hsptlNm}
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
    </section>
  );
}

/**
 * 캐릭터 미생성(주양육)일 때 무대 원 자리의 점선 원
 * - 무대 원과 같은 크기, 전체가 마이페이지 캐릭터 목록으로 가는 링크 (모달은 열지 않음)
 */
function CharacterSlot() {
  return (
    <Link
      to={PATHS.MYPAGE_CHARACTERS}
      aria-label="캐릭터 만들기"
      className={`flex shrink-0 flex-col items-center justify-center gap-1 self-center rounded-full border border-dashed border-line-strong text-center text-badge font-semibold text-brand-500 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:row-span-2 ${STAGE_SIZE}`}
    >
      <Plus className="size-5 sm:size-6" aria-hidden="true" />
      <span className="sm:hidden">캐릭터</span>
      <span className="max-sm:hidden">캐릭터 만들기</span>
    </Link>
  );
}

/**
 * 요약 수치 한 칸
 * - PC: 아이콘·항목명 / 큰 값 / 설명을 세로로
 * - 640px 미만: 흰 작은 상자. 아이콘·항목명 / 값 / 한 줄 짧은 설명(mobileSub)
 * - 값·단위만 청록, 항목명·아이콘·설명은 회색
 */
function Stat({ icon, label, value, unit, sub, mobileSub }) {
  const mobileText = mobileSub ?? sub ?? '등록된 기록 없음';

  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-box bg-white p-2.5 sm:gap-2 sm:rounded-none sm:bg-transparent sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0">
      <span className="flex min-w-0 items-center gap-1 text-sm text-subtle sm:gap-2">
        <Icon name={icon} className="shrink-0 text-lg" />
        <span className="truncate" title={label}>
          {label}
        </span>
      </span>
      <div className="contents">
        <span className="text-base font-bold text-brand-500 max-sm:truncate sm:text-2xl">
          {value ?? '-'}
          {value != null && unit && (
            <small className="ml-1 text-sm font-semibold text-brand-500">
              {unit}
            </small>
          )}
        </span>
        {/* 반려동물을 바꿔도 배너 높이가 같도록 설명 줄은 늘 두 줄 높이,
            글자 한 줄 설명은 꺾지 않고 넘치면 말줄임 */}
        <span
          className={`min-h-[2lh] text-sm text-subtle max-sm:hidden ${
            typeof sub === 'string' ? 'truncate' : ''
          }`}
          title={typeof sub === 'string' ? sub : undefined}
        >
          {sub ?? '등록된 기록 없음'}
        </span>
        <span
          className="truncate text-badge text-subtle sm:hidden"
          title={mobileText}
        >
          {mobileText}
        </span>
      </div>
    </div>
  );
}
