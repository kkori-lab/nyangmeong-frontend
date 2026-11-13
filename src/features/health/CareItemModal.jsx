import { useState } from 'react';
import DatePicker from '@/components/DatePicker';
import Icon from '@/components/Icon';
import { formatYmdWeekday, getTodayYmd } from '@/utils/formatDate';
import {
  CARE_CYCLES,
  CARE_ZONE,
  CUSTOM_CYCLE,
  CYCLE_DAYS_ERROR,
  MAX_CYCLE_DAYS,
  addCycle,
  isValidCycleDays,
} from './careDue';
import { toCareIcon } from './careIcons';
import FieldError from './diary/FieldError';
import FormModal from './diary/FormModal';
import CharCount from './shared/CharCount';
import { useCreateCareItem, useUpdateCareItem } from './queries';

// 아이콘 목록과 이름은 퍼블리싱 html/hlt-calendar.html의 관리 항목 추가 모달과 같다
// "기타"는 이모지를 고르지 않고 기본 아이콘(task_alt)을 쓴다
const ICONS = [
  { name: 'brush', label: '빗질' },
  { name: 'cleaning_services', label: '청소' },
  { name: 'dentistry', label: '양치' },
  { name: 'bathtub', label: '목욕' },
  { name: 'hearing', label: '귀' },
  { name: 'content_cut', label: '발톱' },
  { name: 'medication', label: '투약' },
  { name: 'vaccines', label: '주사' },
  { name: 'sentiment_satisfied', label: '구강' },
  { name: 'task_alt', label: '기타 (기본 아이콘)' },
];
const DEFAULT_ICON = 'task_alt';
const MAX_NAME_LENGTH = 40;

// 관리 항목 추가·수정 모달(FN-HLT-003-21~24·38). item이 있으면 수정: 기본 정기관리 항목은 주기만 고치고, 마지막으로 한 날은 수정 Body에 없어 숨긴다
export default function CareItemModal({ petSn, item = null, onClose }) {
  const isEdit = item != null;
  const isBasic = isEdit && item.bscArtclYn;
  const [careArtclNm, setCareArtclNm] = useState(item?.careArtclNm ?? '');
  const [iconChoice, setIconChoice] = useState(
    isEdit ? toCareIcon(item.rprsIconId) : null,
  );
  const [careZoneCd, setCareZoneCd] = useState(item?.careZoneCd ?? null);
  const [careCycleCd, setCareCycleCd] = useState(item?.careCycleCd ?? null);
  const [cycleDrctInptDayCnt, setCycleDrctInptDayCnt] = useState(
    item?.cycleDrctInptDayCnt != null ? String(item.cycleDrctInptDayCnt) : '',
  );
  const [lastCmptnYmd, setLastCmptnYmd] = useState('');
  const createCareItem = useCreateCareItem();
  const updateCareItem = useUpdateCareItem();
  const saveItem = isEdit ? updateCareItem : createCareItem;
  const todayYmd = getTodayYmd();

  const isRegular = careZoneCd === CARE_ZONE.REGULAR;
  const isCustomCycle = careCycleCd === CUSTOM_CYCLE;
  const hasValidCycle =
    careCycleCd && (!isCustomCycle || isValidCycleDays(cycleDrctInptDayCnt));
  // 빈 칸은 버튼만 끄고, 값이 있는데 범위 밖일 때만 안내한다
  const showDaysError =
    isCustomCycle &&
    cycleDrctInptDayCnt !== '' &&
    !isValidCycleDays(cycleDrctInptDayCnt);
  const canSubmit =
    careArtclNm.trim() !== '' &&
    careZoneCd !== null &&
    (!isRegular || hasValidCycle) &&
    !saveItem.isPending;

  // 비우면 오늘(등록일)부터 센다
  const nextDueYmd =
    isRegular && hasValidCycle
      ? addCycle(
          lastCmptnYmd || item?.lastCmptnYmd || todayYmd,
          careCycleCd,
          cycleDrctInptDayCnt,
        )
      : null;

  // 바뀐 칸만 보낸다. 정기관리 주기는 구역·종류·일수 중 하나라도 바뀌면 종류와 일수를 함께 보낸다
  const getUpdateBody = () => {
    const body = {};
    if (!isBasic) {
      if (careArtclNm.trim() !== item.careArtclNm)
        body.careArtclNm = careArtclNm.trim();
      const nextIcon = iconChoice ?? DEFAULT_ICON;
      if (nextIcon !== toCareIcon(item.rprsIconId)) body.rprsIconId = nextIcon;
      if (careZoneCd !== item.careZoneCd) body.careZoneCd = careZoneCd;
    }
    if (isRegular) {
      const days = isCustomCycle ? Number(cycleDrctInptDayCnt) : null;
      if (
        careZoneCd !== item.careZoneCd ||
        careCycleCd !== item.careCycleCd ||
        days !== (item.cycleDrctInptDayCnt ?? null)
      ) {
        body.careCycleCd = careCycleCd;
        if (days != null) body.cycleDrctInptDayCnt = days;
      }
    }
    return body;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isEdit) {
      updateCareItem.mutate(
        { petSn, careArtclSn: item.careArtclSn, body: getUpdateBody() },
        { onSuccess: onClose },
      );
      return;
    }
    createCareItem.mutate(
      {
        petSn,
        body: {
          careArtclNm: careArtclNm.trim(),
          rprsIconId: iconChoice ?? DEFAULT_ICON,
          careZoneCd,
          careCycleCd: isRegular ? careCycleCd : null,
          cycleDrctInptDayCnt:
            isRegular && isCustomCycle ? Number(cycleDrctInptDayCnt) : null,
          lastCmptnYmd: isRegular && lastCmptnYmd ? lastCmptnYmd : null,
        },
      },
      { onSuccess: onClose },
    );
  };

  const labelClass =
    'flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-[#1a3234]';
  const inputClass =
    'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)]';
  const helpClass = 'text-sm leading-normal text-[#566465]';
  const required = <span className="ml-0.5 font-bold text-[#b4473a]">*</span>;
  const optional = (
    <span className="ml-1 text-[13px] font-medium text-[#667374]">선택</span>
  );

  // 시안 .seg: 회색 바탕 안에서 고른 칸만 흰색으로 올라온다
  const renderSegment = (options, selected, onSelect, isLocked = false) => (
    <div className="flex h-10 rounded-[6px] border border-[#e6eaeb] bg-[#f1f3f4] p-[3px]">
      {options.map((option) => {
        const isSelected = selected === option.cd;
        return (
          <button
            key={option.cd}
            type="button"
            aria-pressed={isSelected}
            disabled={isLocked}
            className={`flex flex-1 items-center justify-center rounded-[4px] whitespace-nowrap ${
              isSelected
                ? 'bg-white font-semibold text-[#1e4a4c] shadow-[0_1px_2px_rgba(26,50,52,0.08),0_0_0_1px_rgba(40,90,92,0.18)]'
                : 'font-medium text-[#566465] hover:text-[#1a3234]'
            }`}
            onClick={() => onSelect(option.cd)}
          >
            {option.nm}
          </button>
        );
      })}
    </div>
  );

  return (
    <FormModal
      icon="playlist_add"
      title={isEdit ? '관리 항목 수정' : '관리 항목 추가'}
      submitLabel={isEdit ? '수정하기' : '저장'}
      widthClassName="w-[min(440px,calc(100%-32px))]"
      isSubmitDisabled={!canSubmit}
      isPending={saveItem.isPending}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>항목명{required}</span>
        <input
          value={careArtclNm}
          maxLength={MAX_NAME_LENGTH}
          placeholder="예: 영양제"
          disabled={isBasic}
          className={`${inputClass} disabled:bg-[#f4f6f6] disabled:text-[#667374]`}
          onChange={(event) => setCareArtclNm(event.target.value)}
        />
        {!isBasic && <CharCount value={careArtclNm} max={MAX_NAME_LENGTH} />}
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={`${labelClass} mb-1.5`}>
          카테고리 대표 아이콘{optional}
        </legend>
        <div className="grid grid-cols-5 gap-2">
          {ICONS.map((icon) => {
            const isSelected = iconChoice === icon.name;
            const isEtc = icon.name === DEFAULT_ICON;
            return (
              <button
                key={icon.name}
                type="button"
                title={icon.label}
                aria-label={icon.label}
                aria-pressed={isSelected}
                disabled={isBasic}
                className={`grid h-10 place-items-center rounded-[6px] border disabled:opacity-40 ${
                  isSelected
                    ? 'border-[#285a5c] bg-[#e9f2f2] text-[#1e4a4c]'
                    : `bg-white hover:border-[#b9c4c4] ${
                        isEtc
                          ? 'border-dashed border-[#e2e7e7] text-[#667374]'
                          : 'border-[#e2e7e7] text-[#3d4a4b]'
                      }`
                }`}
                onClick={() => setIconChoice(isSelected ? null : icon.name)}
              >
                <Icon name={icon.name} />
              </button>
            );
          })}
        </div>
        <p className={helpClass}>고르지 않으면 기본 아이콘으로 추가돼요</p>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={`${labelClass} mb-1.5`}>반복 유형{required}</legend>
        {renderSegment(
          [
            { cd: CARE_ZONE.DAILY, nm: '일상관리' },
            { cd: CARE_ZONE.REGULAR, nm: '정기관리' },
          ],
          careZoneCd,
          setCareZoneCd,
          isBasic,
        )}
      </fieldset>

      {isRegular && (
        <>
          <fieldset className="flex flex-col gap-1.5">
            <legend className={`${labelClass} mb-1.5`}>주기{required}</legend>
            {renderSegment(CARE_CYCLES, careCycleCd, setCareCycleCd)}
            {isCustomCycle && (
              <>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min={1}
                    max={MAX_CYCLE_DAYS}
                    value={cycleDrctInptDayCnt}
                    placeholder="예: 10"
                    aria-label="반복 일수"
                    aria-invalid={showDaysError}
                    className={`${inputClass} pr-16 tabular-nums aria-invalid:border-danger`}
                    onChange={(event) =>
                      setCycleDrctInptDayCnt(event.target.value)
                    }
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#667374]">
                    일마다
                  </span>
                </div>
                <p className={helpClass}>마지막으로 한 날부터 n일마다</p>
                {showDaysError && <FieldError>{CYCLE_DAYS_ERROR}</FieldError>}
              </>
            )}
          </fieldset>

          {isEdit ? (
            nextDueYmd && (
              <p className="rounded-xl bg-[#f4f6f6] px-4 py-3 tabular-nums">
                다음 예정일 {formatYmdWeekday(nextDueYmd)}
              </p>
            )
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>마지막으로 한 날{optional}</span>
                <DatePicker
                  value={lastCmptnYmd}
                  max={todayYmd}
                  onChange={setLastCmptnYmd}
                />
              </label>
              <p className={helpClass}>
                마지막으로 한 날을 알려주시면 다음 예정일을 더 정확하게
                계산해요. 비우면 오늘부터 셉니다
              </p>
              {nextDueYmd && (
                <p className="mt-1.5 rounded-xl bg-[#f4f6f6] px-4 py-3 tabular-nums">
                  다음 예정일 {formatYmdWeekday(nextDueYmd)}
                </p>
              )}
            </div>
          )}
        </>
      )}
      {updateCareItem.isError && (
        <p role="alert" className="text-sm text-[#b4473a]">
          {updateCareItem.error.message}
        </p>
      )}
    </FormModal>
  );
}
