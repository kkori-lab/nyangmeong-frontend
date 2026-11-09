import { useState } from 'react';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { showToast } from '@/components/toastStore';
import { useSaveHealthWidgets } from '../queries';
import WidgetPicker from './WidgetPicker';
import {
  RECOMMENDED_IDS,
  findWidgetItem,
  joinWidgetNames,
  keepWidgetOrder,
  orderWidgetIds,
} from './widgetItems';

const STEPS = ['시작', '기록 고르기', '완료'];

/**
 * [튜토리얼 · 기록 항목 편집 모달] (※신규 정책, 흐름도 D1~D7·D10)
 * - mode 'tutorial': 1 시작 → 2 기록 고르기 → 3 완료. 1·2단계의 [나중에 할래요]·×·Esc·배경은 추천 3개 저장(D3), 3단계 ×는 [건강기록 보러 가기]와 같음
 * - mode 'edit': 2단계만. [저장]은 고른 항목 저장, [취소]·×·Esc·배경은 저장 없이 닫음(D7)
 * - 저장 실패: 서버 message 토스트. [나중에 할래요]·×·Esc는 그래도 닫고(다음에 들어오면 다시 열림), 3단계·편집 저장은 모달을 유지해 다시 시도
 */
export default function WidgetTutorialModal({
  mode,
  mbrSn,
  petNm,
  savedIds,
  onClose,
}) {
  const isEdit = mode === 'edit';
  const [step, setStep] = useState(isEdit ? 2 : 1);
  /** 사람이 칩을 누르기 전에는 null: 튜토리얼은 추천 3개를 미리 고름 */
  const [pickedIds, setPickedIds] = useState(isEdit ? savedIds : null);
  const [lastPickedId, setLastPickedId] = useState(null);
  const saveWidgets = useSaveHealthWidgets();

  /** 시작 항목: [나중에 할래요] 저장값과 2단계 처음 미리 체크가 같음 */
  const startIds = RECOMMENDED_IDS;
  const draftIds = pickedIds ?? startIds;
  const isEmpty = draftIds.length === 0;

  /** isClosedOnError: 실패해도 닫음([나중에 할래요]·×·Esc). 토스트는 useSaveHealthWidgets가 띄움 */
  const save = (widgetIds, message, isClosedOnError = false) => {
    if (saveWidgets.isPending) return;
    saveWidgets.mutate(
      /** 편집은 저장 순서 + 새 항목 맨 뒤, 튜토리얼 첫 저장은 4묶음 순서 */
      {
        mbrSn,
        widgetIds: isEdit
          ? keepWidgetOrder(widgetIds)
          : orderWidgetIds(widgetIds),
      },
      {
        onSuccess: () => {
          showToast(message);
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
      `추천 항목 ${startIds.length}개로 시작했어요 · [기록 항목 편집]에서 바꿀 수 있어요`,
      true,
    );
  };

  const saveFinish = () => save(draftIds, `${petNm}의 대시보드를 만들었어요`);

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
    if (isEdit) onClose();
    else if (step === 3) saveFinish();
    else saveLater();
  };

  const handleToggle = (id) => {
    const isOn = draftIds.includes(id);
    setPickedIds(
      isOn ? draftIds.filter((item) => item !== id) : [...draftIds, id],
    );
    setLastPickedId(isOn ? null : id);
  };

  const handleRecommend = (ids) => {
    setPickedIds(ids);
    setLastPickedId(null);
  };

  const title = isEdit
    ? '기록 항목 편집'
    : step === 1
      ? `${petNm}에게 필요한 기록만 골라요`
      : step === 2
        ? '기록 고르기'
        : `${petNm}의 대시보드가 준비됐어요`;

  const footer =
    step === 1 ? (
      <div className="flex w-full justify-between gap-2">
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-md px-4 font-semibold text-ink-2 hover:bg-surface-3 hover:text-ink"
          disabled={saveWidgets.isPending}
          onClick={saveLater}
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
          {isEdit ? '저장' : '다음'}
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          className={`${BTN_SECONDARY} mr-auto`}
          onClick={() => {
            setPickedIds(draftIds);
            setStep(2);
          }}
        >
          다시 고르기
        </button>
        <button
          type="button"
          disabled={saveWidgets.isPending}
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
      width={720}
      isPending={saveWidgets.isPending}
      onClose={handleDismiss}
    >
      {!isEdit && <StepBar current={step} />}

      {step === 1 && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="leading-[1.6] text-muted">
            고른 기록만 대시보드와 건강 일지에 보여요.
            <br />
            지금 안 골라도 나중에 [기록 항목 편집]에서 바꿀 수 있어요.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check_circle" className="text-brand-500" />
              1개 이상만 고르면 돼요
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
          draftIds={draftIds}
          lastPickedId={lastPickedId}
          onToggle={handleToggle}
          onRecommend={handleRecommend}
        />
      )}

      {step === 3 && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <Icon name="task_alt" className="text-[44px] text-brand-500" />
          <p className="text-muted">
            고른 기록만 건강기록 대시보드에 카드로 보여요
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            <DoneChip icon="auto_awesome" name="AI 건강분석 리포트" />
            {orderWidgetIds(draftIds).map((id) => {
              const item = findWidgetItem(id);
              return <DoneChip key={id} icon={item.icon} name={item.nm} />;
            })}
          </ul>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon name="tune" className="text-subtle" />
            건강기록 화면의 [기록 항목 편집]에서 언제든 더하거나 뺄 수 있어요
          </p>
        </div>
      )}
    </Modal>
  );
}

/** 1·2·3단계 표시 */
function StepBar({ current }) {
  return (
    <ol className="mb-5 flex items-center gap-2 overflow-x-auto">
      {STEPS.map((label, index) => {
        const no = index + 1;
        const isCurrent = no === current;
        const isDone = no < current;
        return (
          <li
            key={label}
            aria-current={isCurrent ? 'step' : undefined}
            className={`flex items-center gap-2 whitespace-nowrap max-[760px]:text-sm ${
              isCurrent ? 'font-bold text-ink' : 'font-medium text-subtle'
            } ${index > 0 ? "before:h-px before:w-6 before:bg-line before:content-['']" : ''}`}
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
            {label}
          </li>
        );
      })}
    </ol>
  );
}

function DoneChip({ icon, name }) {
  return (
    <li className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-ink-2">
      <Icon name={icon} className="text-lg text-brand-500" />
      {name}
    </li>
  );
}
