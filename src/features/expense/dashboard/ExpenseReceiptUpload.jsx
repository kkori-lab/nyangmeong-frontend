import { Camera, Loader2, Receipt, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { useRecognizeReceipt } from '../queries';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';

const isNothingRecognized = (result) =>
  result.expndYmd == null &&
  result.expndAmt == null &&
  result.dtlMttr == null &&
  result.expndClsfCd == null;

/** 영수증 업로드·인식 */
export default function ExpenseReceiptUpload({
  picked,
  onPick,
  onClear,
  onRecognized,
  onDirect,
  onClose,
}) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const [fileError, setFileError] = useState('');
  /** 인식 실패 시 연결할 영수증 번호 */
  const [failed, setFailed] = useState(null);
  const recognize = useRecognizeReceipt();
  const isAnalyzing = recognize.isPending;

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    setFileError(reason ?? '');
    if (!reason) onPick(file);
  };

  const handleAnalyze = () => {
    const controller = new AbortController();
    abortRef.current = controller;
    recognize.mutate(
      { file: picked.file, signal: controller.signal },
      {
        onSuccess: (result) => {
          if (isNothingRecognized(result)) setFailed({ recptSn: result.recptSn });
          else onRecognized(result);
        },
        onError: (error) => {
          if (error.name !== 'AbortError') setFailed({ recptSn: null });
        },
      },
    );
  };

  const handleCancelAnalyze = () => abortRef.current.abort();

  const handleRetake = () => {
    setFailed(null);
    onClear();
  };

  if (failed) {
    return (
      <Modal
        title="영수증으로 등록"
        isSheet
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={handleRetake}
              className={BTN_SECONDARY}
            >
              다시 촬영
            </button>
            <button
              type="button"
              onClick={() => onDirect(failed.recptSn)}
              className={BTN_PRIMARY}
            >
              직접 입력
            </button>
          </>
        }
      >
        <div className="py-6 text-center">
          <p className="font-bold">영수증을 읽지 못했어요</p>
          <p className="mt-2 text-sm text-muted">
            다시 촬영하거나 직접 입력해 주세요
          </p>
        </div>
      </Modal>
    );
  }

  if (isAnalyzing) {
    return (
      <Modal
        title="영수증으로 등록"
        isSheet
        isPending
        onClose={onClose}
        footer={
          <button
            type="button"
            onClick={handleCancelAnalyze}
            className={BTN_SECONDARY}
          >
            취소
          </button>
        }
      >
        <div
          role="status"
          className="flex flex-col items-center gap-3 py-8 text-muted"
        >
          <Loader2
            className="size-8 animate-spin text-brand-500"
            aria-hidden="true"
          />
          <p>영수증을 분석하고 있어요</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="영수증으로 등록"
      isSheet
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            취소
          </button>
          <button
            type="button"
            disabled={!picked}
            onClick={handleAnalyze}
            className={BTN_PRIMARY}
          >
            분석 요청
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-2 rounded-box border border-dashed border-line-strong bg-surface-2 px-4 py-6 text-subtle">
        {picked ? (
          <img
            src={picked.previewUrl}
            alt="첨부한 영수증"
            className="max-h-48 rounded-md object-contain"
          />
        ) : (
          <>
            <Receipt className="size-8" aria-hidden="true" />
            <span>영수증 이미지</span>
          </>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current.click()}
            className={BTN_SECONDARY}
          >
            <Camera className="size-4" aria-hidden="true" />
            촬영하기
          </button>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className={BTN_SECONDARY}
          >
            <Upload className="size-4" aria-hidden="true" />
            파일 선택
          </button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-label="영수증 촬영"
        />
        <input
          ref={fileRef}
          type="file"
          accept={RECEIPT_ACCEPT}
          onChange={handleFileChange}
          className="hidden"
          aria-label="영수증 파일 선택"
        />
      </div>
      {fileError ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {fileError}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">{RECEIPT_HELP}</p>
      )}
    </Modal>
  );
}
