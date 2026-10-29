import { FolderOpen, Image, ImagePlus, Info, Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import { RECEIPT_ACCEPT, validateReceiptFile } from '@/utils/receiptFile';
import { useRecognizeCheckupReceipt } from '../queries';
import {
  FAILURE,
  FILE_ERROR,
  SERVER_ANALYZE_GUARD_MS,
  getFailureByCode,
  isEmptyOcr,
} from './receiptFailure';

/** 진행 막대 갱신 간격과 차오르는 속도(약 6초에 63%, 15초에 약 85%) */
const PROGRESS_TICK_MS = 100;
const PROGRESS_TIME_CONSTANT_MS = 6000;

const HELP = 'jpg · jpeg · png · webp · 1건 10MB 이하';

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

const getPetLabel = (pet) =>
  pet.vrtyNm ? `${pet.petNm} (${pet.vrtyNm})` : pet.petNm;

/** 고른 이미지 한 줄 */
function PickedFile({ picked }) {
  return (
    <div className="flex items-center gap-3 rounded-box border border-line bg-surface-2 p-2">
      <img
        src={picked.previewUrl}
        alt="첨부한 영수증"
        className="size-10 shrink-0 rounded-md object-cover"
      />
      <span className="min-w-0 flex-1 truncate">{picked.file.name}</span>
      <span className="shrink-0 text-sm text-muted">
        {formatSize(picked.file.size)}
      </span>
    </div>
  );
}

/** 진행 막대: 90%를 향해 점점 느려지며 차오름, 응답 시간을 알 수 없어 100%는 완료 때만 */
function AnalyzeProgress() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setPercent(90 * (1 - Math.exp(-elapsed / PROGRESS_TIME_CONSTANT_MS)));
    }, PROGRESS_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="영수증 분석 진행"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-[width] duration-200 ease-linear"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/**
 * 영수증 촬영·업로드 모달 (SCR-AIM-008)
 * pets: [{ petSn, petNm, vrtyNm? }], 목록은 여는 쪽이 넘긴다(features/pet import 금지)
 * onRecognized(result): 인식 성공 { recptSn, petSn, ocr }(일부만 인식돼도 실패 안내 없이 여기로)
 * onManualInput({ rcptSn? }): 직접 입력, 추출 0건 뒤에만 rcptSn(저장 때 영수증 상태를 변경용)
 */
export default function ReceiptUploadModal({
  pets,
  defaultPetSn,
  onRecognized,
  onManualInput,
  onClose,
}) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const isTimedOutRef = useRef(false);
  const isRunningRef = useRef(false);
  const [petSn, setPetSn] = useState(defaultPetSn ?? pets[0]?.petSn ?? null);
  /** { file, previewUrl } */
  const [picked, setPicked] = useState(null);
  const [fileError, setFileError] = useState('');
  /** 분석을 취소해 업로드 화면으로 돌아왔는지 */
  const [isCancelled, setIsCancelled] = useState(false);
  /** 'empty' | 'timeout' | 'error' */
  const [failure, setFailure] = useState(null);
  /** 추출 0건일 때 서버가 만든 영수증 식별자 */
  const [failedRecptSn, setFailedRecptSn] = useState(null);
  const recognize = useRecognizeCheckupReceipt();
  const isAnalyzing = recognize.isPending;
  const hasPetSelect = pets.length >= 2;
  const pet = pets.find((item) => item.petSn === petSn);

  /** 미리보기 주소 해제 */
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.previewUrl);
    },
    [picked],
  );

  /** 닫힐 때 진행 중인 분석 중단 */
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    setFileError(reason ?? '');
    if (reason) return;
    setPicked({ file, previewUrl: URL.createObjectURL(file) });
    setIsCancelled(false);
  };

  const handleAnalyze = () => {
    /** 다시 그려지기 전의 연타 차단 */
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    isTimedOutRef.current = false;
    timerRef.current = setTimeout(() => {
      isTimedOutRef.current = true;
      controller.abort();
    }, SERVER_ANALYZE_GUARD_MS);
    recognize.mutate(
      { file: picked.file, petSn, signal: controller.signal },
      {
        onSuccess: (result) => {
          clearTimeout(timerRef.current);
          isRunningRef.current = false;
          if (!isEmptyOcr(result.ocr)) return onRecognized(result);
          setFailedRecptSn(result.recptSn);
          setFailure('empty');
        },
        onError: (error) => {
          clearTimeout(timerRef.current);
          isRunningRef.current = false;
          if (isTimedOutRef.current) return setFailure('timeout');
          if (controller.signal.aborted) return setIsCancelled(true);
          if (FILE_ERROR[error.code]) {
            setPicked(null);
            return setFileError(FILE_ERROR[error.code]);
          }
          setFailure(getFailureByCode(error.code));
        },
      },
    );
  };

  const handleCancelAnalyze = () => abortRef.current.abort();

  /** 실패 안내에서 다시 촬영: 이미지를 비우고 업로드 화면으로 */
  const handleRetake = () => {
    setFailure(null);
    setFailedRecptSn(null);
    setPicked(null);
    setIsCancelled(false);
  };

  const manualButton = (
    <button
      type="button"
      onClick={() => onManualInput({})}
      className="self-center text-sm text-muted underline underline-offset-2 hover:text-ink"
    >
      직접 입력하기
    </button>
  );

  if (failure) {
    const { title, message, noteStyle } = FAILURE[failure];
    return (
      <Modal
        title={title}
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={() =>
                onManualInput(failedRecptSn ? { rcptSn: failedRecptSn } : {})
              }
              className={BTN_SECONDARY}
            >
              직접 입력
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className={BTN_PRIMARY}
            >
              다시 올리기
            </button>
          </>
        }
      >
        <p
          role="alert"
          className={`flex items-start gap-2 rounded-md border p-3 text-sm ${noteStyle}`}
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </p>
      </Modal>
    );
  }

  if (isAnalyzing) {
    return (
      <Modal
        title="영수증으로 등록하기"
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
        {pet && (
          <p className="mb-3 text-sm text-muted">
            대상 반려동물 · {getPetLabel(pet)}
          </p>
        )}
        <PickedFile picked={picked} />
        <div role="status" className="flex flex-col items-center gap-3 pt-6">
          <AnalyzeProgress />
          <p className="font-bold">분석 중…</p>
          <p className="text-sm text-muted">
            15초 안에 끝나요. 기다리기 어려우면 취소할 수 있어요.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="영수증으로 등록하기"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!picked}
            onClick={handleAnalyze}
            className={BTN_PRIMARY}
          >
            {isCancelled ? '다시 분석' : '분석 요청'}
          </button>
          {manualButton}
        </div>
      }
    >
      <p className="mb-4 text-sm text-muted">
        영수증이나 약봉투를 올리면 내용을 읽어 드려요
      </p>
      {hasPetSelect && (
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-semibold">대상 반려동물</p>
          <Select
            label="대상 반려동물"
            value={String(petSn)}
            onChange={(value) => setPetSn(Number(value))}
            options={pets.map((item) => ({
              value: String(item.petSn),
              label: getPetLabel(item),
            }))}
          />
        </div>
      )}
      {picked ? (
        <PickedFile picked={picked} />
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="flex w-full flex-col items-center gap-2 rounded-box border border-dashed border-line-strong bg-surface-2 px-4 py-6 text-subtle"
        >
          <ImagePlus className="size-8" aria-hidden="true" />
          <b className="font-semibold text-ink">
            영수증 · 약봉투 사진을 올려 주세요
          </b>
          <span className="text-sm">{HELP}</span>
        </button>
      )}
      {fileError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {fileError}
        </p>
      )}
      <div className="mt-2 flex justify-center gap-2">
        {/** 1100px 이하(태블릿·모바일)에서만 노출 */}
        <span className="hidden max-[1100px]:contents">
          <button
            type="button"
            onClick={() => cameraRef.current.click()}
            className={`${BTN_SECONDARY} h-8 px-3 text-sm`}
          >
            <Camera className="size-4" aria-hidden="true" />
            촬영하기
          </button>
        </span>
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className={`${BTN_SECONDARY} h-8 px-3 text-sm`}
        >
          <FolderOpen className="size-4" aria-hidden="true" />
          {picked ? '다른 사진' : '파일 선택'}
        </button>
      </div>
      {picked && (
        <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted">
          <Image className="size-4" aria-hidden="true" />
          {HELP}
        </p>
      )}
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
    </Modal>
  );
}
