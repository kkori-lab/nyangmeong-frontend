import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { formatYmdWeekday, getTodayYmd } from '@/utils/formatDate';
import { CARE_CYCLES, CARE_ZONE, CUSTOM_CYCLE, addCycle } from './careDue';
import { useCreateCareItem } from './queries';

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
const MAX_NAME_LENGTH = 30;

// 관리 항목 추가 모달(FN-HLT-003-21~24·38). 고른 반려동물의 토탈 케어리스트에 추가한다
export default function CareItemModal({ petSn, onClose }) {
  const dialogRef = useRef(null);
  const [careArtclNm, setCareArtclNm] = useState('');
  const [iconChoice, setIconChoice] = useState(null);
  const [careZoneCd, setCareZoneCd] = useState(null);
  const [careCycleCd, setCareCycleCd] = useState(null);
  const [cycleDrctInptDayCnt, setCycleDrctInptDayCnt] = useState('');
  const [lastCmptnYmd, setLastCmptnYmd] = useState('');
  const createCareItem = useCreateCareItem();
  const todayYmd = getTodayYmd();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const isRegular = careZoneCd === CARE_ZONE.REGULAR;
  const isCustomCycle = careCycleCd === CUSTOM_CYCLE;
  const hasValidCycle =
    careCycleCd && (!isCustomCycle || Number(cycleDrctInptDayCnt) >= 1);
  const canSubmit =
    careArtclNm.trim() !== '' &&
    careZoneCd !== null &&
    (!isRegular || hasValidCycle) &&
    !createCareItem.isPending;

  // 비우면 오늘(등록일)부터 센다
  const nextDueYmd =
    isRegular && hasValidCycle
      ? addCycle(lastCmptnYmd || todayYmd, careCycleCd, cycleDrctInptDayCnt)
      : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
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

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
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
  const renderSegment = (options, selected, onSelect) => (
    <div className="flex h-10 rounded-[6px] border border-[#e6eaeb] bg-[#f1f3f4] p-[3px]">
      {options.map((option) => {
        const isSelected = selected === option.cd;
        return (
          <button
            key={option.cd}
            type="button"
            aria-pressed={isSelected}
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
    <dialog
      ref={dialogRef}
      aria-label="관리 항목 추가"
      className="m-auto w-[min(440px,calc(100%-32px))] rounded-[20px] bg-white p-0 shadow-[0_24px_64px_-12px_rgba(15,23,35,0.35)] backdrop:bg-[rgba(15,23,35,0.45)] backdrop:backdrop-blur-[2px]"
      onCancel={handleCancel}
    >
      <form onSubmit={handleSubmit}>
        <header className="flex items-start gap-3.5 border-b border-[#edf1f1] px-7 pt-6 pb-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9f2f2] text-[#285a5c]">
            <Icon name="playlist_add" />
          </span>
          <h2 className="flex-1 text-xl leading-[1.35] font-bold text-[#1a3234]">
            관리 항목 추가
          </h2>
          <button
            type="button"
            aria-label="닫기"
            className="-mt-1 -mr-2 grid size-9 shrink-0 place-items-center rounded-[10px] text-[#566465] hover:bg-[#ebf0f0] hover:text-[#1a3234]"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="flex flex-col gap-5 px-7 pt-6 pb-7">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>항목명{required}</span>
            <input
              value={careArtclNm}
              maxLength={MAX_NAME_LENGTH}
              placeholder="예: 영양제"
              className={inputClass}
              onChange={(event) => setCareArtclNm(event.target.value)}
            />
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
                    className={`grid h-10 place-items-center rounded-[6px] border ${
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
            <legend className={`${labelClass} mb-1.5`}>
              반복 유형{required}
            </legend>
            {renderSegment(
              [
                { cd: CARE_ZONE.DAILY, nm: '매일' },
                { cd: CARE_ZONE.REGULAR, nm: '주기' },
              ],
              careZoneCd,
              setCareZoneCd,
            )}
          </fieldset>

          {isRegular && (
            <>
              <fieldset className="flex flex-col gap-1.5">
                <legend className={`${labelClass} mb-1.5`}>
                  주기{required}
                </legend>
                {renderSegment(CARE_CYCLES, careCycleCd, setCareCycleCd)}
                {isCustomCycle && (
                  <>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        min={1}
                        value={cycleDrctInptDayCnt}
                        placeholder="예: 10"
                        aria-label="반복 일수"
                        className={`${inputClass} pr-16 tabular-nums`}
                        onChange={(event) =>
                          setCycleDrctInptDayCnt(event.target.value)
                        }
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#667374]">
                        일마다
                      </span>
                    </div>
                    <p className={helpClass}>마지막으로 한 날부터 n일마다</p>
                  </>
                )}
              </fieldset>

              <div className="flex flex-col gap-1.5">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>마지막으로 한 날{optional}</span>
                  <input
                    type="date"
                    value={lastCmptnYmd}
                    max={todayYmd}
                    className={`${inputClass} tabular-nums`}
                    onChange={(event) => setLastCmptnYmd(event.target.value)}
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
            </>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 rounded-b-[20px] border-t border-[#e2e7e7] bg-[#fbfcfd] px-7 py-4">
          <p className="mr-auto text-[#566465]">
            <span className="font-bold text-[#b4473a]">*</span> 표시는 필수
            항목이에요
          </p>
          <button
            type="button"
            className="inline-flex h-10 min-w-24 items-center justify-center rounded-[6px] border border-[#e2e7e7] bg-white px-4 text-base font-semibold whitespace-nowrap text-[#1a3234] hover:border-[#b9c4c4] hover:bg-[#f4f6f6]"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-10 min-w-24 items-center justify-center rounded-[6px] bg-[#285a5c] px-4 text-base font-semibold whitespace-nowrap text-white hover:bg-[#1e4a4c] disabled:opacity-40"
          >
            추가하기
          </button>
        </footer>
      </form>
    </dialog>
  );
}
