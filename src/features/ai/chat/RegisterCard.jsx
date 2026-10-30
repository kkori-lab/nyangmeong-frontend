import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleX,
  ListChecks,
} from 'lucide-react';
import aiCharacter from '@/assets/ai-character.png';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { openInMainWindow } from './openInMainWindow';
import {
  CARD_TYPE,
  CARE_CYCLE_NAMES,
  CARE_ZONE_NAMES,
  CHECKUP_TYPE_NAMES,
  HOSPITAL_KIND,
  PERIODIC_ZONE,
  SCHEDULE_KIND_NAMES,
} from '../shared/registerCodes';

const EMPTY_MARK = '—';

const buttonClass =
  'h-8 w-[54px] rounded-md text-base font-semibold disabled:cursor-not-allowed disabled:border-0 disabled:bg-[#ebf0f0] disabled:text-[#b9c4c4]';

/** 주기: 직접입력은 n일마다 */
const cycleLabel = (card) =>
  CARE_CYCLE_NAMES[card.careCycleCd] ?? `${card.cycleDays}일마다`;

/** 카드 종류별 표시 칸 */
const buildRows = (card) => {
  if (card.cardType === CARD_TYPE.CARE_ITEM) {
    return [
      ['반려동물', card.petNm],
      ['항목명', card.careArtclNm],
      ['반복 유형', CARE_ZONE_NAMES[card.careZoneCd]],
      ...(card.careZoneCd === PERIODIC_ZONE
        ? [['주기', cycleLabel(card)]]
        : []),
      [
        '마지막으로 한 날',
        card.lastCmptnYmd ? formatDate(card.lastCmptnYmd) : '등록일',
      ],
      [
        '다음 예정일',
        card.nxtmPrnmntYmd ? formatDate(card.nxtmPrnmntYmd) : EMPTY_MARK,
      ],
    ];
  }
  const isHospital = card.schdlKndCd === HOSPITAL_KIND;
  return [
    ['반려동물', card.petNm],
    ['종류', SCHEDULE_KIND_NAMES[card.schdlKndCd]],
    ...(isHospital
      ? [
          ['검진유형', CHECKUP_TYPE_NAMES[card.ckupTypeCd]],
          ['병원명', card.hsptlNm],
        ]
      : [['일정명', card.schdlNm]]),
    ['날짜', formatDate(card.schdlYmd, { weekday: true })],
    ['시간', card.schdlTm ?? EMPTY_MARK],
    ['메모', card.memoCn ?? EMPTY_MARK],
  ];
};

/**
 * [일정·케어 항목 미리보기 카드]
 * - 서버가 해석한 값을 보여 주는 AI 말풍선, 가장 최근 카드의 [등록]·[취소]만 활성
 * - 결과 문구는 서버가 저장한 AI 메시지와 같은 텍스트
 */
export default function RegisterCard({
  card,
  status,
  resultText,
  isActive,
  isBusy,
  hasError,
  hasCalendarLink,
  onConfirm,
  onCancel,
}) {
  const isCare = card.cardType === CARD_TYPE.CARE_ITEM;
  const HeaderIcon = isCare ? ListChecks : CalendarDays;
  const isEnabled = isActive && status === 'pending' && !isBusy;
  const isRegistered = status === 'registered';

  return (
    <div className="flex min-w-0 items-start gap-3">
      <img
        src={aiCharacter}
        alt=""
        width="36"
        height="36"
        className="size-9 shrink-0 rounded-full border border-[#e2e7e7] bg-[#e9f2f2] object-contain p-1"
      />
      <section
        aria-label={isCare ? '케어 항목 등록 확인' : '일정 등록 확인'}
        className="w-full max-w-[520px] rounded-[14px] border border-[#e2e7e7] bg-white p-5"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#1a3234]">
          <HeaderIcon aria-hidden="true" className="size-5 text-[#285a5c]" />
          {isCare
            ? '토탈 케어리스트에 이렇게 추가할까요?'
            : '일정을 이렇게 등록할까요?'}
        </h2>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-[10px] bg-[#f4f6f6] p-4">
          {buildRows(card).map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-[#667374]">{label}</dt>
              <dd className="break-words text-base font-semibold text-[#1a3234]">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {isCare && card.duplicateName && status === 'pending' && (
          <p className="mt-3 text-[15px] text-[#3d4a4b]">{card.notice}</p>
        )}

        {status !== 'cancelled' && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={!isEnabled}
              className={`${buttonClass} bg-[#285a5c] text-white enabled:hover:bg-[#1e4a4c]`}
              onClick={onConfirm}
            >
              등록
            </button>
            <button
              type="button"
              disabled={!isEnabled}
              className={`${buttonClass} border border-[#e2e7e7] bg-white text-[#1a3234] enabled:hover:bg-[#f4f6f6]`}
              onClick={onCancel}
            >
              취소
            </button>
          </div>
        )}

        {hasError && isActive && (
          <p role="alert" className="mt-2 text-sm text-[#b42318]">
            처리하지 못했어요. 잠시 뒤 다시 시도해 주세요
          </p>
        )}

        {resultText && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#edf1f1] pt-3 text-base font-semibold">
            <span
              className={`flex items-center gap-2 ${
                isRegistered ? 'text-[#2f6f57]' : 'text-[#667374]'
              }`}
            >
              {isRegistered ? (
                <CircleCheck aria-hidden="true" className="size-[18px]" />
              ) : (
                <CircleX aria-hidden="true" className="size-[18px]" />
              )}
              {resultText.replace(/^✔\s*/, '')}
            </span>
            {isRegistered && hasCalendarLink && (
              <button
                type="button"
                className="ml-auto flex items-center gap-1 text-[#1e4a4c] hover:underline"
                onClick={() => openInMainWindow(PATHS.HEALTH_CALENDAR)}
              >
                케어 캘린더에서 보기
                <ArrowRight aria-hidden="true" className="size-[18px]" />
              </button>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
