import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadError from '@/components/LoadError';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { BTN_PRIMARY, BTN_SECONDARY, CHIP } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import useMediaQuery from '@/hooks/useMediaQuery';
import CareChipPicker from '../CareChipPicker';
import { MIN_CARE_COUNT, isLinkedCareItem } from '../careDue';
import { toCareIcon } from '../careIcons';
import {
  useCareItems,
  useSaveCareIndications,
  useSaveHealthWidgets,
} from '../queries';
import WidgetPicker from './WidgetPicker';
import {
  RECOMMENDED_IDS,
  findWidgetItem,
  joinWidgetNames,
  keepWidgetOrder,
  orderWidgetIds,
} from './widgetItems';

/** 단계 이름: ② 「기록 고르기」 → 「대시보드 항목」 (※신규 정책, 2026-11-20), ③도 같은 규칙으로 「케어리스트 항목」 (※신규 정책, 2026-11-23) */
const STEPS = ['시작', '대시보드 항목', '케어리스트 항목', '완료'];
const LAST_STEP = STEPS.length;
/** 760px 미만 대시보드 편집 단계 (※신규 정책: ① 「항목 고르기」) */
const NARROW_EDIT_STEPS = ['항목 고르기', '순서 바꾸기'];

/**
 * [튜토리얼 · 대시보드 편집 모달] (※신규 정책, 흐름도 D1~D7·D10)
 * - 2단계(대시보드 항목 고르기)와 편집은 1040px 두 칸, 1·3·4단계는 720px. 단계를 넘기면 너비가 바로 바뀜 (※신규 정책)
 * - mode 'tutorial': 1 시작 → 2 대시보드 항목 → 3 케어리스트 항목 → 4 완료. 1~3단계의 [나중에 할래요]·×·Esc·배경은 추천 3개 저장(D3)이고 케어는 저장하지 않음, 4단계 ×는 [건강기록 보러 가기]와 같음
 * - 3단계 케어리스트 항목: 5개 이상, 처방·반복 예방 연동 항목은 항상 표시. 4단계에서 기록 항목과 함께 저장(케어 먼저: 기록 항목이 저장되면 튜토리얼이 닫힘)
 * - isReplay(이미 고른 항목이 있는 회원이 튜토리얼을 다시 엶): 2단계 처음 체크는 savedIds, 1~3단계의 [나중에 할래요]·×·Esc·배경은 저장 없이 닫음. 4단계 저장은 같음 (※신규 정책)
 * - mode 'edit': 2단계만. [저장]은 고른 항목 저장, [취소]·×·Esc·배경은 저장 없이 닫음(D7)
 *   760px 미만은 1 항목 고르기 → 2 순서 바꾸기 (※신규 정책). 1단계는 [취소]·[다음 ›]만, 저장은 2단계 [저장하기]. [‹ 이전]은 고른 내용을 두고 1단계로
 * - 저장 실패: 서버 message 토스트. [나중에 할래요]·×·Esc는 그래도 닫고(다음에 들어오면 다시 열림), 4단계·편집 저장은 모달을 유지해 다시 시도(저장된 케어는 다시 보내지 않음)
 */
export default function WidgetTutorialModal({
  mode,
  isReplay = false,
  mbrSn,
  petSn,
  petNm,
  savedIds,
  onClose,
}) {
  const isEdit = mode === 'edit';
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const isNarrow = useMediaQuery('(width < 760px)');
  const [narrowEditStep, setNarrowEditStep] = useState(1);
  /** 760px 미만 편집의 단계(1·2). 그 밖은 null */
  const narrowStep = isEdit && isNarrow ? narrowEditStep : null;
  /** 사람이 칩을 누르기 전에는 null: 튜토리얼은 추천 3개를 미리 고름 */
  const [pickedIds, setPickedIds] = useState(
    isEdit || (isReplay && savedIds.length > 0) ? savedIds : null,
  );
  const [lastPickedId, setLastPickedId] = useState(null);
  const saveWidgets = useSaveHealthWidgets();
  /** 케어리스트 항목: 사람이 칩을 누르기 전에는 null -> 서버의 indctYn 그대로 */
  const care = useCareItems(isEdit ? null : petSn);
  const [pickedCareSns, setPickedCareSns] = useState(null);
  const saveIndications = useSaveCareIndications();
  /** 저장을 마친 케어 목록: 기록 항목 저장만 실패했을 때 다시 보내지 않기 위한 값 */
  const savedCareKeyRef = useRef(null);
  const isSaving = saveWidgets.isPending || saveIndications.isPending;

  const careItems = care.data?.careItems ?? [];
  const careSns =
    pickedCareSns ??
    careItems.filter((item) => item.indctYn).map((item) => item.careArtclSn);
  const isCareOn = (item) =>
    isLinkedCareItem(item) || careSns.includes(item.careArtclSn);
  const pickedCareItems = careItems.filter(isCareOn);
  const isCareShort = pickedCareItems.length < MIN_CARE_COUNT;

  const handleToggleCare = (item) =>
    setPickedCareSns(
      careSns.includes(item.careArtclSn)
        ? careSns.filter((sn) => sn !== item.careArtclSn)
        : [...careSns, item.careArtclSn],
    );

  /** 시작 항목: [나중에 할래요] 저장값과 2단계 처음 미리 체크가 같음 */
  const startIds = orderWidgetIds(RECOMMENDED_IDS);
  const draftIds = pickedIds ?? startIds;
  const isEmpty = draftIds.length === 0;

  /** isClosedOnError: 실패해도 닫음([나중에 할래요]·×·Esc). 토스트는 useSaveHealthWidgets가 띄움 */
  const save = (widgetIds, message, isClosedOnError = false) => {
    if (saveWidgets.isPending) return;
    saveWidgets.mutate(
      /** 미리보기 순서(고른 순서 + 새 항목 맨 뒤, 끌어서 바꾼 순서) 그대로 저장. 튜토리얼 시작 항목은 4묶음 순서 */
      { mbrSn, widgetIds: keepWidgetOrder(widgetIds) },
      {
        onSuccess: () => {
          showToast(message, { type: 'success' });
          onClose();
        },
        onError: () => {
          if (isClosedOnError) onClose();
        },
      },
    );
  };

  const saveLater = () => {
    save(
      startIds,
      `추천 항목 ${startIds.length}개로 시작했어요 · [대시보드 편집]에서 바꿀 수 있어요`,
      true,
    );
  };

  const saveFinish = async () => {
    if (isSaving) return;
    const careArtclSns = pickedCareItems.map((item) => item.careArtclSn);
    const careKey = careArtclSns.join(',');
    try {
      if (savedCareKeyRef.current !== careKey) {
        await saveIndications.mutateAsync({ petSn, careArtclSns });
        savedCareKeyRef.current = careKey;
      }
    } catch {
      /** 토스트는 useSaveCareIndications가 표시 */
      return;
    }
    save(draftIds, `${petNm}의 건강기록을 준비했어요`);
  };

  const saveEdit = () => {
    const removedIds = savedIds.filter((id) => !draftIds.includes(id));
    save(
      draftIds,
      removedIds.length > 0
        ? `${joinWidgetNames(removedIds)} 카드를 숨겼어요. 기록은 남아 있어요`
        : '기록 항목을 저장했어요',
    );
  };

  const handleDismiss = () => {
    if (isEdit || (isReplay && step !== LAST_STEP)) onClose();
    else if (step === LAST_STEP) saveFinish();
    else saveLater();
  };

  const handleToggle = (id) => {
    const isOn = draftIds.includes(id);
    setPickedIds(
      isOn ? draftIds.filter((item) => item !== id) : [...draftIds, id],
    );
    setLastPickedId(isOn ? null : id);
  };

  const handleReorder = (ids) => setPickedIds(ids);

  const handleRecommend = (ids) => {
    setPickedIds(ids);
    setLastPickedId(null);
  };

  const title = isEdit
    ? '대시보드 편집'
    : step === 1
      ? `${petNm}에게 필요한 기록과 케어를 골라요`
      : step === 2
        ? '대시보드 항목 고르기'
        : step === 3
          ? '케어리스트 항목 고르기'
          : `${petNm}의 건강기록이 준비됐어요`;

  const footer =
    step === 1 ? (
      <div className="flex w-full justify-between gap-2">
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-md px-4 font-semibold text-ink-2 hover:bg-surface-3 hover:text-ink"
          disabled={saveWidgets.isPending}
          onClick={isReplay ? onClose : saveLater}
        >
          나중에 할래요
        </button>
        <button
          type="button"
          className={`${BTN_PRIMARY} min-w-24`}
          onClick={() => setStep(2)}
        >
          시작할래요
        </button>
      </div>
    ) : narrowStep === 2 ? (
      <>
        <button
          type="button"
          className={`${BTN_SECONDARY} mr-auto min-w-20 gap-0.5`}
          onClick={() => setNarrowEditStep(1)}
        >
          <ChevronLeft className="size-4.5" aria-hidden="true" />
          이전
        </button>
        <button
          type="button"
          disabled={isEmpty || saveWidgets.isPending}
          className={`${BTN_PRIMARY} min-w-20`}
          onClick={saveEdit}
        >
          저장하기
        </button>
      </>
    ) : narrowStep === 1 ? (
      <>
        <p className="mr-auto flex flex-wrap items-center gap-x-3 self-center text-sm">
          {isEmpty && (
            <span role="alert" className="font-semibold text-danger">
              1개 이상 골라 주세요
            </span>
          )}
          <span className="text-muted">
            <b className="text-ink">{draftIds.length}개</b> 골랐어요
          </span>
        </p>
        <button
          type="button"
          className={`${BTN_SECONDARY} min-w-20`}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="button"
          disabled={isEmpty}
          className={`${BTN_PRIMARY} min-w-20 gap-0.5`}
          onClick={() => setNarrowEditStep(2)}
        >
          다음
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </button>
      </>
    ) : step === 2 ? (
      <>
        <p className="mr-auto flex flex-wrap items-center gap-x-3 self-center text-sm">
          {isEmpty && (
            <span role="alert" className="font-semibold text-danger">
              1개 이상 골라 주세요
            </span>
          )}
          <span className="text-muted">
            <b className="text-ink">{draftIds.length}개</b> 골랐어요
          </span>
        </p>
        <button
          type="button"
          className={`${BTN_SECONDARY} min-w-20`}
          onClick={isEdit ? onClose : () => setStep(1)}
        >
          {isEdit ? '취소' : '이전'}
        </button>
        <button
          type="button"
          disabled={isEmpty || saveWidgets.isPending}
          className={`${BTN_PRIMARY} min-w-20`}
          onClick={isEdit ? saveEdit : () => setStep(3)}
        >
          {isEdit ? '저장하기' : '다음'}
        </button>
      </>
    ) : step === 3 ? (
      <>
        <p className="mr-auto flex flex-wrap items-center gap-x-3 self-center text-sm">
          {care.data && isCareShort && (
            <span role="alert" className="font-semibold text-danger">
              5개 이상 골라 주세요
            </span>
          )}
          <span className="text-muted">
            <b className="text-ink">{pickedCareItems.length}개</b> 골랐어요
          </span>
        </p>
        <button
          type="button"
          className={`${BTN_SECONDARY} min-w-20`}
          onClick={() => setStep(2)}
        >
          이전
        </button>
        <button
          type="button"
          disabled={!care.data || isCareShort}
          className={`${BTN_PRIMARY} min-w-20`}
          onClick={() => setStep(LAST_STEP)}
        >
          다음
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          className={`${BTN_SECONDARY} mr-auto`}
          disabled={isSaving}
          onClick={() => {
            setPickedIds(draftIds);
            setStep(2);
          }}
        >
          다시 고르기
        </button>
        <button
          type="button"
          disabled={isSaving}
          className={BTN_PRIMARY}
          onClick={saveFinish}
        >
          건강기록 보러 가기
        </button>
      </>
    );

  return (
    <Modal
      title={title}
      footer={footer}
      isWide
      width={step === 2 ? 1040 : 720}
      isPending={isSaving}
      onClose={handleDismiss}
    >
      {!isEdit && <StepBar steps={STEPS} current={step} />}
      {narrowStep && <StepBar steps={NARROW_EDIT_STEPS} current={narrowStep} />}

      {step === 1 && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="leading-[1.6] text-muted">
            고른 기록은 대시보드와 건강 일지에, 고른 케어는 케어리스트에 보여요.
            <br />
            지금 안 골라도 나중에 [대시보드 편집]·[항목 관리]에서 바꿀 수
            있어요.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check_circle" className="text-brand-500" />
              기록은 1개 이상, 케어는 5개 이상 골라요
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check_circle" className="text-brand-500" />
              추천 항목으로 바로 시작할 수도 있어요
            </span>
          </div>
        </div>
      )}

      {step === 2 && (
        <WidgetPicker
          petNm={petNm}
          isEdit={isEdit}
          isNarrow={isNarrow}
          narrowStep={narrowStep}
          draftIds={draftIds}
          lastPickedId={lastPickedId}
          onToggle={handleToggle}
          onRecommend={handleRecommend}
          onReorder={handleReorder}
        />
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <p className="text-muted">
            {petNm}에게 챙겨 줄 케어를 5개 이상 골라요. 고른 케어만 케어리스트에
            보여요.
          </p>
          {care.isError ? (
            <LoadError
              message={care.error.message}
              onRetry={() => care.refetch()}
              className="py-6"
            />
          ) : care.data ? (
            <CareChipPicker
              items={careItems}
              isOn={isCareOn}
              onToggle={handleToggleCare}
            />
          ) : (
            <Skeleton className="h-40" />
          )}
        </div>
      )}

      {step === LAST_STEP && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <Icon name="task_alt" className="text-[44px] text-brand-500" />
          <p className="text-muted">
            고른 기록은 건강 대시보드에, 고른 케어는 케어리스트에 보여요
          </p>
          <DoneRow label="기록">
            <DoneChip icon="auto_awesome" name="AI 건강분석 리포트" />
            {keepWidgetOrder(draftIds).map((id) => {
              const item = findWidgetItem(id);
              return <DoneChip key={id} icon={item.icon} name={item.nm} />;
            })}
          </DoneRow>
          <DoneRow label="케어">
            {pickedCareItems.map((item) => (
              <DoneChip
                key={item.careArtclSn}
                icon={toCareIcon(item.rprsIconId)}
                name={item.careArtclNm}
              />
            ))}
          </DoneRow>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon name="tune" className="text-subtle" />
            [대시보드 편집]과 케어리스트 [항목 관리]에서 언제든 더하거나 뺄 수
            있어요
          </p>
        </div>
      )}
    </Modal>
  );
}

/** 단계 표시: steps는 단계 이름 목록 */
/**
 * [단계 막대]
 * - 760px 미만은 지금 단계만 이름(나머지는 번호만, 이름은 sr-only), 연결선 12px (※신규 정책, 2026-11-23)
 */
function StepBar({ steps, current }) {
  return (
    <ol className="mb-5 flex items-center gap-2 overflow-x-auto">
      {steps.map((label, index) => {
        const no = index + 1;
        const isCurrent = no === current;
        const isDone = no < current;
        return (
          <li
            key={label}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex items-center gap-2 whitespace-nowrap max-[760px]:text-sm ${
              isCurrent ? 'font-bold text-ink' : 'font-medium text-subtle'
            } ${index > 0 ? "before:h-px before:w-6 before:bg-line before:content-[''] max-[760px]:before:w-3" : ''}`}
          >
            <b
              className={`grid size-7 place-items-center rounded-full text-sm ${
                isCurrent
                  ? 'bg-brand-500 text-white'
                  : isDone
                    ? 'bg-brand-50 text-brand-500'
                    : 'bg-surface-3 text-muted'
              }`}
            >
              {no}
            </b>
            <span className={isCurrent ? '' : 'max-[760px]:sr-only'}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** 완료 단계의 칩 한 줄: 「기록」·「케어」 */
function DoneRow({ label, children }) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <b className="text-sm text-ink">{label}</b>
      <ul className="flex flex-wrap justify-center gap-2">{children}</ul>
    </div>
  );
}

function DoneChip({ icon, name }) {
  return (
    <li className={`${CHIP} gap-1.5`}>
      <Icon name={icon} className="text-lg text-brand-500" />
      {name}
    </li>
  );
}
