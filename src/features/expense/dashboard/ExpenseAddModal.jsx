import { ChevronRight, PencilLine, Receipt } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import ExpenseDuplicateDialog from './ExpenseDuplicateDialog';
import ExpenseForm from '../shared/ExpenseForm';
import { formatFullDayHeader } from '../shared/expenseFormat';
import ExpenseReceiptReview from './ExpenseReceiptReview';
import ExpenseReceiptUpload from './ExpenseReceiptUpload';
import { toCreateRequest } from '../api';
import { EXPND_INPT_MTH } from '../shared/expenseCodes';
import { useCreateExpenses, useFindDuplicateExpenses } from '../queries';

const STEP = {
  CHOOSE: 'CHOOSE',
  DIRECT: 'DIRECT',
  UPLOAD: 'UPLOAD',
  REVIEW: 'REVIEW',
};

const OPTION =
  'flex w-full cursor-pointer items-center gap-4 rounded-card border border-line bg-white px-5 py-4 text-left hover:border-brand-500 hover:bg-brand-50';

function ChooseOption({ icon, title, description, onClick }) {
  return (
    <button type="button" onClick={onClick} className={OPTION}>
      <span className="grid size-12 shrink-0 place-items-center rounded-box bg-brand-50 text-brand-500">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <b className="block">{title}</b>
        <span className="block text-sm text-subtle">{description}</span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-line-strong"
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * [지출 등록 모달]
 * - 방법 선택 -> 직접 입력·영수증 업로드 -> 인식 결과 확인 -> 중복 확인
 * - expndYmd: 누른 날짜, onSaved: 저장 날짜(영수증 날짜 별개 가능)
 */
export default function ExpenseAddModal({ expndYmd, pets, onSaved, onClose }) {
  const [step, setStep] = useState(STEP.CHOOSE);
  /** 영수증 파일·미리보기 주소: 분석 취소 후에도 유지 */
  const [picked, setPicked] = useState(null);
  const [recognized, setRecognized] = useState(null);
  /** 직접 입력 전환 시 연결할 영수증 번호 */
  const [directRecptSn, setDirectRecptSn] = useState(null);
  const [isRetakeOpen, setIsRetakeOpen] = useState(false);
  /** 중복 확인 대기 저장: { request, expndYmd, duplicates } */
  const [pendingSave, setPendingSave] = useState(null);
  const pickedRef = useRef(null);

  const findDuplicates = useFindDuplicateExpenses();
  const createExpenses = useCreateExpenses();
  const isSaving = findDuplicates.isPending || createExpenses.isPending;

  useEffect(
    () => () => {
      if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.previewUrl);
    },
    [],
  );

  const handlePick = (file) => {
    if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.previewUrl);
    const next = { file, previewUrl: URL.createObjectURL(file) };
    pickedRef.current = next;
    setPicked(next);
  };
  const handleClear = () => {
    if (pickedRef.current) URL.revokeObjectURL(pickedRef.current.previewUrl);
    pickedRef.current = null;
    setPicked(null);
  };

  const showSaveError = () =>
    showToast('저장하지 못했어요. 잠시 후 다시 시도해 주세요');
  const create = (request) =>
    createExpenses.mutate(request, {
      onSuccess: () => onSaved(request.expndYmd),
      onError: showSaveError,
    });

  /** 중복 지출 조회: 저장 요청(멱등 ID 포함)을 한 번 만들어 확인 뒤 저장에도 그대로 쓴다 */
  const handleSubmit = (items) => {
    const request = toCreateRequest(items);
    findDuplicates.mutate(request, {
      onSuccess: (duplicates) => {
        if (duplicates.length > 0) setPendingSave({ request, duplicates });
        else create(request);
      },
      onError: showSaveError,
    });
  };

  /** 영수증 인식 실패 뒤 직접 입력도 입력방식은 직접입력, 영수증은 연결 */
  const handleSubmitDirect = (item) =>
    handleSubmit([
      {
        ...item,
        expndInptMthCd: EXPND_INPT_MTH.DIRECT,
        recptSn: directRecptSn,
      },
    ]);
  const handleSubmitReview = (items) =>
    handleSubmit(
      items.map((item) => ({
        ...item,
        expndInptMthCd: EXPND_INPT_MTH.OCR,
        recptSn: recognized.recptSn,
      })),
    );

  const handleRecognized = (result) => {
    setRecognized(result);
    setStep(STEP.REVIEW);
  };
  const handleDirect = (recptSn) => {
    setDirectRecptSn(recptSn);
    setStep(STEP.DIRECT);
  };
  const handleRetake = () => {
    setIsRetakeOpen(false);
    handleClear();
    setRecognized(null);
    setStep(STEP.UPLOAD);
  };

  return (
    <>
      {step === STEP.CHOOSE && (
        <Modal
          title="지출 등록"
          isSheet
          onClose={onClose}
          footer={
            <button type="button" onClick={onClose} className={BTN_SECONDARY}>
              취소
            </button>
          }
        >
          <p className="mb-4 text-muted">{formatFullDayHeader(expndYmd)}</p>
          <div className="grid auto-rows-fr gap-2">
            <ChooseOption
              icon={<PencilLine className="size-6" aria-hidden="true" />}
              title="직접 입력하기"
              description="영수증이 없는 지출"
              onClick={() => setStep(STEP.DIRECT)}
            />
            <ChooseOption
              icon={<Receipt className="size-6" aria-hidden="true" />}
              title="영수증으로 등록하기"
              description="사진에서 자동 인식"
              onClick={() => setStep(STEP.UPLOAD)}
            />
          </div>
        </Modal>
      )}
      {step === STEP.DIRECT && (
        <ExpenseForm
          expndYmd={expndYmd}
          pets={pets}
          isPending={isSaving}
          onSubmit={handleSubmitDirect}
          onClose={onClose}
        />
      )}
      {step === STEP.UPLOAD && (
        <ExpenseReceiptUpload
          picked={picked}
          onPick={handlePick}
          onClear={handleClear}
          onRecognized={handleRecognized}
          onDirect={handleDirect}
          onClose={onClose}
        />
      )}
      {step === STEP.REVIEW && (
        <ExpenseReceiptReview
          result={recognized}
          fallbackYmd={expndYmd}
          previewUrl={picked.previewUrl}
          pets={pets}
          isPending={isSaving}
          onSubmit={handleSubmitReview}
          onRetake={() => setIsRetakeOpen(true)}
          onClose={onClose}
        />
      )}
      {isRetakeOpen && (
        <ConfirmModal
          title="입력한 내용이 사라져요. 다시 촬영할까요?"
          confirmLabel="다시 촬영"
          onConfirm={handleRetake}
          onCancel={() => setIsRetakeOpen(false)}
        />
      )}
      {pendingSave && (
        <ExpenseDuplicateDialog
          duplicates={pendingSave.duplicates}
          isPending={createExpenses.isPending}
          onConfirm={() => create(pendingSave.request)}
          onClose={() => setPendingSave(null)}
        />
      )}
    </>
  );
}
