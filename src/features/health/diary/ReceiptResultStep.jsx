import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { getTodayYmd } from '@/utils/formatDate';
import { usePrepareReceiptSave, useSaveReceiptCheckups } from '../queries';
import { CHECKUP_TYPES } from '../scheduleTypes';
import FieldError from './FieldError';
import FormModal from './FormModal';
import LedgerDupModal from './LedgerDupModal';
import NearScheduleModal from './NearScheduleModal';
import ReceiptAssignList from './ReceiptAssignList';
import ReceiptInfoBlock from './ReceiptInfoBlock';
import ReceiptPetTab from './ReceiptPetTab';
import {
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_ARROW_STYLE,
  SELECT_CLASS,
} from './formStyles';
import {
  SKIP,
  applyLineAssignment,
  buildLines,
  buildNoSectionTabs,
  buildSaveEntries,
  buildSectionTabs,
  formatAmount,
  getSplitDiscount,
  isNoSectionReceipt,
  makeAddedTab,
  makeEmptyDrugRow,
  toAmount,
  validateReceipt,
} from './receiptUtils';

const WIDTH = 'w-[min(760px,calc(100%-32px))]';

const REQUIRED = <span className="ml-0.5 font-bold text-[#b4473a]">*</span>;
const OPTIONAL = (
  <span className="ml-1 text-[13px] font-medium text-[#667374]">선택</span>
);

const aiClass = (isAi) => (isAi ? 'border-dashed' : '');

/** 영수증 원본 주소는 아직 분석 응답에 없어 아이콘으로 대신한다 */
const imgUrl = null;

/**
 * [영수증 인식 결과 확인] (FN-HLT-002-34~46)
 * - LJS의 영수증 업로드 모달(SCR-AIM-008)이 받은 AI 서버 분석 응답을 그대로 받아 확인·수정한다
 * - result: { recptSn, petSn(업로드 때 고른 반려동물), ocr }, onSaved(saved): [{ petSn, petNm, ckupRcdSn }]
 * - onRetake: 입력을 버리고 업로드로 돌아간다
 */
export default function ReceiptResultStep({
  result,
  pets,
  onRetake,
  onSaved,
  onClose,
}) {
  const { ocr } = result;
  const todayYmd = getTodayYmd();
  const isNoSection = isNoSectionReceipt(ocr);
  const splitDiscountAmt = getSplitDiscount(ocr);
  const [lines] = useState(() => (isNoSection ? buildLines(ocr) : []));
  const [ckupYmd, setCkupYmd] = useState(ocr.ckupYmd ?? '');
  const [hospNm, setHospNm] = useState(ocr.hsptlNm ?? '');
  const [isCommonEdited, setIsCommonEdited] = useState({
    ckupYmd: false,
    hospNm: false,
  });
  const [tabs, setTabs] = useState(() =>
    isNoSection
      ? buildNoSectionTabs({ ocr, lines, petSn: result.petSn, todayYmd })
      : buildSectionTabs({ ocr, pets, todayYmd }),
  );
  const [activeId, setActiveId] = useState(() => tabs[0].id);
  /** { [lineSn]: tabId } 구역이 없는 영수증에서 탭이 2개 이상일 때 품목을 나눈다 */
  const [assign, setAssign] = useState({});
  /** 저장 전 확인 단계: { type: 'dup' | 'near', entries, dupTabIds?, nears } */
  const [phase, setPhase] = useState(null);
  const [isRetakeOpen, setIsRetakeOpen] = useState(false);
  const [isOriginalOpen, setIsOriginalOpen] = useState(false);
  const prepare = usePrepareReceiptSave();
  const save = useSaveReceiptCheckups();
  const isPending = prepare.isPending || save.isPending;
  const hasSaveError = prepare.isError || save.isError;

  const validation = validateReceipt({
    ckupYmd,
    hospNm,
    tabs,
    lines,
    assign,
    isNoSection,
  });
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const activeErrors = validation.tabErrors[activeTab.id] ?? {};
  const isActiveSkipped = activeTab.petSn === SKIP;
  const canAddTab = isNoSection && tabs.length < pets.length;
  const findPetNm = (petSn) => pets.find((pet) => pet.petSn === petSn)?.petNm;
  const getTabNm = (tab) => findPetNm(tab.petSn) ?? tab.sectionNm ?? '반려동물';

  const editTab = (id, key, patch) =>
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id
          ? { ...tab, ...patch, edited: { ...tab.edited, [key]: true } }
          : tab,
      ),
    );
  const updateTab = (id, patch) =>
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...patch } : tab)),
    );
  const updateDrugs = (updater) =>
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id ? { ...tab, drugs: updater(tab.drugs) } : tab,
      ),
    );

  const reassign = (nextTabs, nextAssign) => {
    setAssign(nextAssign);
    setTabs(
      applyLineAssignment({
        tabs: nextTabs,
        lines,
        assign: nextAssign,
        discountAmt: splitDiscountAmt,
        ckupYmd,
        todayYmd,
      }),
    );
  };

  const handleAddTab = () => {
    const added = makeAddedTab(tabs, pets);
    if (!added) return;
    reassign([...tabs, added], {});
    setActiveId(added.id);
  };

  const handleAssign = (lineSn, tabId) =>
    reassign(tabs, { ...assign, [lineSn]: tabId });

  const handleAssignAll = (tabId) =>
    reassign(
      tabs,
      Object.fromEntries(lines.map((line) => [line.lineSn, tabId])),
    );

  const submit = (entries, nears, moveByKey) => {
    const payload = entries.map((entry) => {
      const near = nears.find((row) => row.tabId === entry.tabId);
      return {
        ...entry,
        nearSchdlSn:
          near && moveByKey[entry.tabId] ? near.schedule.schdlSn : undefined,
      };
    });
    save.mutate(
      {
        recptSn: result.recptSn,
        ckupYmd,
        hospNm: hospNm.trim(),
        entries: payload,
      },
      {
        onSuccess: (saved) =>
          onSaved(
            saved.map((item) => ({ ...item, petNm: findPetNm(item.petSn) })),
          ),
        onError: () => setPhase(null),
      },
    );
  };

  const goNear = (entries, nears) => {
    if (nears.length > 0) {
      setPhase({ type: 'near', entries, nears });
    } else {
      setPhase(null);
      submit(entries, nears, {});
    }
  };

  const handleSave = () => {
    if (!validation.isValid || isPending) return;
    const entries = buildSaveEntries(tabs);
    save.reset();
    prepare.mutate(
      { ckupYmd, entries },
      {
        onSuccess: ({ dupTabIds, nears }) => {
          if (dupTabIds.length > 0)
            setPhase({ type: 'dup', entries, dupTabIds, nears });
          else goNear(entries, nears);
        },
      },
    );
  };

  const totalAmount = tabs.reduce((sum, tab) => sum + toAmount(tab.amt), 0);
  const hasTotalGap =
    ocr.recptAmt != null &&
    validation.unassignedCount === 0 &&
    totalAmount !== ocr.recptAmt;
  const discountedTabs = tabs.filter((tab) => tab.discount > 0);

  return (
    <>
      <FormModal
        icon="receipt_long"
        title="인식 결과 확인"
        submitLabel="저장하기"
        cancelLabel="다시 촬영하기"
        hasRequiredNote={false}
        widthClassName={WIDTH}
        isPending={isPending}
        isSubmitDisabled={!validation.isValid}
        onSubmit={handleSave}
        onCancel={() => setIsRetakeOpen(true)}
        onClose={onClose}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="영수증 원본 크게 보기"
            className="grid aspect-[3/4] w-16 shrink-0 cursor-zoom-in place-items-center overflow-hidden rounded-[8px] border border-line bg-surface-2 text-subtle"
            onClick={() => setIsOriginalOpen(true)}
          >
            {imgUrl ? (
              <img src={imgUrl} alt="" className="size-full object-cover" />
            ) : (
              <Icon name="receipt_long" className="text-3xl" />
            )}
          </button>
          <p className="text-sm text-muted">
            인식 결과를 확인하고 고칠 수 있어요
            <br />
            원본을 누르면 크게 볼 수 있어요
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 max-sm:grid-cols-1 max-sm:gap-y-5">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>검진일{REQUIRED}</span>
            <input
              type="date"
              value={ckupYmd}
              aria-invalid={validation.common.ckupYmd != null}
              className={`${INPUT_CLASS} tabular-nums ${aiClass(!isCommonEdited.ckupYmd && ckupYmd !== '')}`}
              onChange={(event) => {
                setCkupYmd(event.target.value);
                setIsCommonEdited((prev) => ({ ...prev, ckupYmd: true }));
              }}
            />
            {validation.common.ckupYmd && (
              <FieldError>{validation.common.ckupYmd}</FieldError>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>병원명{REQUIRED}</span>
            <input
              value={hospNm}
              aria-invalid={validation.common.hospNm != null}
              className={`${INPUT_CLASS} ${aiClass(!isCommonEdited.hospNm && hospNm !== '')}`}
              onChange={(event) => {
                setHospNm(event.target.value);
                setIsCommonEdited((prev) => ({ ...prev, hospNm: true }));
              }}
            />
            {validation.common.hospNm && (
              <FieldError>{validation.common.hospNm}</FieldError>
            )}
          </label>
        </div>

        <div>
          <p className="text-sm text-subtle">반려동물별 기록</p>
          <ReceiptPetTab
            tabs={tabs}
            pets={pets}
            activeId={activeTab.id}
            canAdd={canAddTab}
            onSelect={setActiveId}
            onPetChange={(id, petSn) => updateTab(id, { petSn })}
            onAdd={handleAddTab}
          />
          {activeErrors.pet && (
            <div className="mt-2">
              <FieldError>{activeErrors.pet}</FieldError>
            </div>
          )}
          {validation.isAllSkipped && (
            <div className="mt-2">
              <FieldError>저장할 반려동물을 1마리 이상 골라 주세요</FieldError>
            </div>
          )}

          <div className="mt-3 rounded-xl border border-line p-4">
            {isActiveSkipped ? (
              <p className="text-muted">
                이 반려동물은 저장하지 않아요. 다른 탭에서 저장할 기록을 확인해
                주세요
              </p>
            ) : (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL_CLASS}>검진 종류{REQUIRED}</span>
                  <select
                    value={activeTab.ckupTypeCd}
                    aria-invalid={activeErrors.type != null}
                    style={SELECT_ARROW_STYLE}
                    className={`${SELECT_CLASS} ${aiClass(!activeTab.edited.type && activeTab.ckupTypeCd !== '')}`}
                    onChange={(event) =>
                      editTab(activeTab.id, 'type', {
                        ckupTypeCd: event.target.value,
                      })
                    }
                  >
                    <option value="">선택해 주세요</option>
                    {CHECKUP_TYPES.map((type) => (
                      <option key={type.cd} value={type.cd}>
                        {type.nm}
                      </option>
                    ))}
                  </select>
                  {activeErrors.type && (
                    <FieldError>{activeErrors.type}</FieldError>
                  )}
                </label>

                <label className="mt-5 flex flex-col gap-1.5">
                  <span className={LABEL_CLASS}>검진 내용{OPTIONAL}</span>
                  <input
                    value={activeTab.ckupCn}
                    aria-invalid={activeErrors.cn != null}
                    className={`${INPUT_CLASS} ${aiClass(!activeTab.edited.cn && activeTab.ckupCn !== '')}`}
                    onChange={(event) =>
                      editTab(activeTab.id, 'cn', {
                        ckupCn: event.target.value,
                      })
                    }
                  />
                  {activeErrors.cn && (
                    <FieldError>{activeErrors.cn}</FieldError>
                  )}
                </label>

                <label className="mt-5 flex flex-col gap-1.5">
                  <span className={LABEL_CLASS}>검진 메모{OPTIONAL}</span>
                  <input
                    value={activeTab.ckupMemoCn}
                    placeholder="다음에 확인할 것"
                    aria-invalid={activeErrors.memo != null}
                    className={INPUT_CLASS}
                    onChange={(event) =>
                      updateTab(activeTab.id, {
                        ckupMemoCn: event.target.value,
                      })
                    }
                  />
                  {activeErrors.memo && (
                    <FieldError>{activeErrors.memo}</FieldError>
                  )}
                </label>

                <ReceiptInfoBlock
                  tab={activeTab}
                  hospNm={hospNm}
                  errors={activeErrors}
                  onAmountChange={(amt) =>
                    editTab(activeTab.id, 'amt', { amt })
                  }
                  onLedgerChange={(isLedger) =>
                    updateTab(activeTab.id, { isLedger })
                  }
                  onDrugChange={(rowId, patch) =>
                    updateDrugs((drugs) =>
                      drugs.map((drug) =>
                        drug.rowId === rowId
                          ? { ...drug, ...patch, isEdited: true }
                          : drug,
                      ),
                    )
                  }
                  onDrugAdd={() =>
                    updateDrugs((drugs) => [
                      ...drugs,
                      makeEmptyDrugRow(ckupYmd),
                    ])
                  }
                  onDrugRemove={(rowId) =>
                    updateDrugs((drugs) =>
                      drugs.filter((drug) => drug.rowId !== rowId),
                    )
                  }
                />
              </>
            )}
          </div>
        </div>

        {isNoSection && tabs.length >= 2 && (
          <ReceiptAssignList
            lines={lines}
            tabs={tabs}
            pets={pets}
            assign={assign}
            unassignedCount={validation.unassignedCount}
            onAssign={handleAssign}
            onAssignAll={handleAssignAll}
          />
        )}

        <div className="rounded-xl bg-surface-2 px-4 py-3 tabular-nums">
          <p>
            영수증 금액{' '}
            {ocr.recptAmt == null ? '-' : formatAmount(ocr.recptAmt)} · 나눈
            합계 {formatAmount(totalAmount)}
          </p>
          {splitDiscountAmt > 0 && (
            <p className="text-sm text-subtle">
              할인 {formatAmount(splitDiscountAmt)}을 금액 비율로 나눴어요
              {discountedTabs.length > 1 &&
                ` (${discountedTabs
                  .map(
                    (tab) =>
                      `${getTabNm(tab)} ${tab.discount.toLocaleString('ko-KR')}`,
                  )
                  .join(' · ')})`}
            </p>
          )}
          {hasTotalGap && (
            <p className="text-sm text-muted">영수증 금액과 합계가 달라요</p>
          )}
        </div>

        {hasSaveError && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-danger"
          >
            <p className="flex-1">
              저장하지 못했어요. 입력한 내용은 그대로 있으니 다시 시도해 주세요.
            </p>
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={handleSave}
            >
              다시 시도하기
            </button>
          </div>
        )}

        <p className="text-sm text-muted">
          AI가 자동으로 인식·판정한 결과이며 실수가 있을 수 있습니다. 저장 전에
          반드시 확인해 주세요.
        </p>
      </FormModal>

      {isOriginalOpen && (
        <Modal
          title="영수증 원본"
          onClose={() => setIsOriginalOpen(false)}
          footer={
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={() => setIsOriginalOpen(false)}
            >
              닫기
            </button>
          }
        >
          {imgUrl ? (
            <img src={imgUrl} alt="영수증 원본" className="w-full" />
          ) : (
            <div className="grid aspect-[3/4] place-items-center rounded-[8px] bg-surface-2 text-subtle">
              <Icon name="receipt_long" className="text-6xl" />
            </div>
          )}
        </Modal>
      )}

      {isRetakeOpen && (
        <ConfirmModal
          title="입력한 내용을 버리고 다시 촬영할까요?"
          confirmLabel="다시 촬영하기"
          onConfirm={onRetake}
          onCancel={() => setIsRetakeOpen(false)}
        />
      )}

      {phase?.type === 'dup' && (
        <LedgerDupModal
          rows={phase.dupTabIds.map((tabId) => {
            const entry = phase.entries.find((row) => row.tabId === tabId);
            return {
              key: tabId,
              petNm: findPetNm(entry.petSn),
              amt: entry.ledgerAmt,
            };
          })}
          ckupYmd={ckupYmd}
          hospNm={hospNm.trim()}
          onRecord={() => goNear(phase.entries, phase.nears)}
          onSkip={() =>
            goNear(
              phase.entries.map((entry) =>
                phase.dupTabIds.includes(entry.tabId)
                  ? { ...entry, ledgerAmt: null }
                  : entry,
              ),
              phase.nears,
            )
          }
          onClose={() => setPhase(null)}
        />
      )}

      {phase?.type === 'near' && (
        <NearScheduleModal
          rows={phase.nears.map((row) => ({
            key: row.tabId,
            schedule: row.schedule,
          }))}
          ckupYmd={ckupYmd}
          isPending={isPending}
          onConfirm={(moveByKey) =>
            submit(phase.entries, phase.nears, moveByKey)
          }
          onClose={() => setPhase(null)}
        />
      )}
    </>
  );
}
