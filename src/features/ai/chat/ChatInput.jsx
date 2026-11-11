import { useEffect, useState } from 'react';
import { ArrowUp, Plus, X } from 'lucide-react';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';

const MAX_LENGTH = 1000;

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
      {/**
       * 메인 검색창(HeroAsk)과 같은 모양: 한 줄이면 테두리 포함 52px 알약(40px 단추 + 위아래 5px), 사진이 있으면 테두리 안 위쪽에 썸네일.
       * 빈 입력은 한 줄 높이로 고정(좁은 폭에서 안내 문구 줄바꿈으로 높아지지 않게)
       */}
      <form
        data-ai-chat-input
        className={`flex flex-wrap items-end gap-2 rounded-[26px] border border-line bg-white px-1.5 focus-within:border-brand-500 focus-within:ring-focus ${
          picked ? 'pt-3 pb-1.5' : 'py-[5px]'
        }`}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {picked && (
          <ul aria-label="첨부한 파일" className="flex basis-full px-2">
            <li className="relative size-24">
              <img
                src={picked.previewUrl}
                alt={picked.file.name}
                className="size-full rounded-xl border border-line object-cover"
              />
              <button
                type="button"
                aria-label={`${picked.file.name} 첨부 삭제`}
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-line bg-white text-ink-2 shadow-depth-sm hover:bg-surface-2"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          </ul>
        )}
        <button
          type="button"
          aria-label="파일 첨부"
          title={`파일 첨부 (${RECEIPT_HELP})`}
          disabled={isDisabled}
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 enabled:hover:bg-surface-2 disabled:text-placeholder"
          onClick={() => fileInputRef.current.click()}
        >
          <Plus className="size-5" aria-hidden="true" />
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
          className={`max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-placeholder ${
            text
              ? '[field-sizing:content]'
              : 'h-10 overflow-hidden placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap'
          }`}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <span className="shrink-0 pb-2.5 text-sm text-[#667374] max-[760px]:hidden">
          <b>{text.length}</b>/ {MAX_LENGTH.toLocaleString()}
        </span>
        <button
          type="submit"
          aria-label="전송"
          disabled={!canSubmit}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#285a5c] text-white disabled:bg-surface-2 disabled:text-placeholder"
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
