import { useEffect, useState } from 'react';
import { ArrowUp, Plus, X } from 'lucide-react';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';

const MAX_LENGTH = 1000;

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))}KB`
    : `${(bytes / 1024 / 1024).toFixed(1)}MB`;

/**
 * [대화 입력창]
 * - 글 입력 규칙과 영수증 이미지 1장 첨부(SCR-AIM-013)
 * - 함께 보낸 글은 말풍선 표시만: 분석 반영 여부 미정
 */
export default function ChatInput({
  petNm,
  isDisabled,
  fileInputRef,
  onSubmit,
  onSubmitReceipt,
}) {
  const [text, setText] = useState('');
  const [isTrimmed, setIsTrimmed] = useState(false);
  /** { file, previewUrl } */
  const [picked, setPicked] = useState(null);
  const [fileError, setFileError] = useState('');

  const canSubmit = (picked !== null || text.trim() !== '') && !isDisabled;

  /** 미리보기 주소 해제 */
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.previewUrl);
    },
    [picked],
  );

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const reason = await validateReceiptFile(file);
    setFileError(reason ?? '');
    if (reason) return;
    setPicked({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleRemoveFile = () => {
    setPicked(null);
    setFileError('');
  };

  const handleChange = (event) => {
    const value = event.target.value;
    /** 입력 길이 제한 */
    if (value.length > MAX_LENGTH) {
      setText(value.slice(0, MAX_LENGTH));
      setIsTrimmed(true);
      return;
    }
    setText(value);
    setIsTrimmed(false);
  };

  const submit = () => {
    if (!canSubmit) return;
    if (picked) {
      onSubmitReceipt(picked.file, text.trim());
      setPicked(null);
    } else {
      onSubmit(text.trim());
    }
    setText('');
    setIsTrimmed(false);
  };

  const handleKeyDown = (event) => {
    /** 한글 조합 중 Enter 전송 방지 */
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    submit();
  };

  return (
    /** 760px 미만: 화면 아래에 붙고 글자 수는 숨김(넘으면 아래 안내가 대신함) */
    <div className="mx-auto w-full max-w-[820px] px-6 pb-4 max-[760px]:px-3 max-[760px]:pb-[calc(8px+env(safe-area-inset-bottom))]">
      <form
        className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[#d3dae2] bg-white py-3 pl-3 pr-4 max-[760px]:items-end max-[760px]:gap-2 max-[760px]:rounded-[22px] max-[760px]:py-1 max-[760px]:pl-2 max-[760px]:pr-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {picked && (
          <ul
            aria-label="첨부한 파일"
            className="flex basis-full flex-wrap gap-2 border-b border-[#edf1f1] pb-3 max-[760px]:pt-2"
          >
            <li className="relative flex max-w-[240px] items-center gap-2.5 rounded-[10px] border border-[#e2e7e7] bg-white py-2 pl-2 pr-9">
              <span className="size-10 shrink-0 overflow-hidden rounded-md bg-[#ebf0f0]">
                <img
                  src={picked.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <b className="truncate text-sm font-semibold text-[#1a3234]">
                  {picked.file.name}
                </b>
                <small className="text-sm text-[#667374]">
                  {formatSize(picked.file.size)}
                </small>
              </span>
              <button
                type="button"
                aria-label={`${picked.file.name} 첨부 삭제`}
                className="absolute right-1.5 top-1/2 -mt-3.5 flex size-7 items-center justify-center rounded-full text-[#667374] hover:bg-[#ebf0f0] hover:text-[#1a3234]"
                onClick={handleRemoveFile}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </li>
          </ul>
        )}
        <button
          type="button"
          aria-label="파일 첨부"
          title={`파일 첨부 (${RECEIPT_HELP})`}
          disabled={isDisabled}
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-[#3d4a4b] enabled:hover:bg-[#ebf0f0] enabled:hover:text-[#1a3234] disabled:text-[#8c9899] max-[760px]:size-8 max-[760px]:rounded-full"
          onClick={() => fileInputRef.current.click()}
        >
          <Plus size={24} strokeWidth={1.7} aria-hidden="true" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={RECEIPT_ACCEPT}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={handleFileChange}
        />
        <textarea
          value={text}
          rows={1}
          aria-label="메시지 입력"
          placeholder={`${petNm ?? '반려동물'}에 대해 물어보거나, "병원 찾아줘"처럼 말해보세요`}
          className="max-h-40 min-w-0 flex-1 resize-none bg-transparent text-base text-[#1a3234] outline-none [field-sizing:content] placeholder:text-[#8c9899] max-[760px]:mb-1 max-[760px]:placeholder:text-[13px]/6"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <span className="shrink-0 text-sm text-[#667374] max-[760px]:hidden">
          <b>{text.length}</b>/ {MAX_LENGTH.toLocaleString()}
        </span>
        <button
          type="submit"
          aria-label="전송"
          disabled={!canSubmit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#285a5c] text-white disabled:bg-[#ebf0f0] disabled:text-[#8c9899] max-[760px]:size-8 max-[760px]:rounded-full"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      </form>
      {fileError && (
        <p role="alert" className="mt-2 text-sm text-[#b4473a]">
          {fileError}
        </p>
      )}
      {isTrimmed && (
        <p role="status" className="mt-2 text-center text-sm text-[#b42318]">
          {MAX_LENGTH.toLocaleString()}자까지 입력할 수 있어요. 넘는 부분은
          잘랐어요
        </p>
      )}
      <p className="mt-2 text-center text-sm text-[#667374] max-[760px]:mt-1.5 max-[760px]:text-xs break-keep">
        AI 매니저는 진단·의료 판단을 하지 않습니다.
        <br className="hidden max-[760px]:inline" /> 이상 징후가 있으면 수의사와
        상담하세요.
      </p>
    </div>
  );
}
