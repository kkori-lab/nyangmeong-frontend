import { ArrowUp, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useAiWindow from '@/hooks/useAiWindow';
import useMediaQuery from '@/hooks/useMediaQuery';
import {
  RECEIPT_ACCEPT,
  RECEIPT_HELP,
  validateReceiptFile,
} from '@/utils/receiptFile';

/**
 * [메인 AI 매니저 검색창] (FN-MAN-002)
 * - 질문을 보내면 AI 매니저(같은 창 모달)를 그 질문으로 연다. 빈 칸이면 첫 메시지 없이 연다
 * - 열면 글·사진을 비운다(넘긴 뒤라 남길 필요 없음)
 * - 검색창 자리(rect)와 복제(ghost)를 넘겨, 검색창이 대화창 입력 자리로 옮겨 가며 대화창으로 바뀌게 한다
 * - 왼쪽 [+]로 사진 1장 첨부: 사진+글(글은 없어도 됨)을 AI 창으로 넘기면 대화창이 종류를 판단한다
 * - 음성 질문 버튼·제안 카드는 뺐다(사람 요청 2026-11-09)
 */

/**
 * 여는 연출용 검색창 복제: 입력한 글을 그대로 보이고 조작은 막는다
 * - id·파일 입력은 빼서 화면의 같은 id와 겹치지 않게 한다
 * - 사진 썸네일은 뺀다(보낸 뒤 미리보기 주소를 해제해 깨져 보이므로)
 */
const cloneForMotion = (form, value) => {
  const ghost = form.cloneNode(true);
  ghost
    .querySelectorAll('ul, input[type="file"]')
    .forEach((element) => element.remove());
  ghost
    .querySelectorAll('[id]')
    .forEach((element) => element.removeAttribute('id'));
  ghost.removeAttribute('role');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  const input = ghost.querySelector('input');
  if (input) input.value = value;
  return ghost;
};

export default function HeroAsk({ petNm }) {
  // 480px 이하는 안내 문구가 잘리므로 짧은 문구를 쓴다
  const isNarrow = useMediaQuery('(max-width: 480px)');
  const openAiWindow = useAiWindow();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [text, setText] = useState('');
  /** { file, previewUrl } */
  const [picked, setPicked] = useState(null);
  const [fileError, setFileError] = useState('');

  /** 미리보기 주소 해제 */
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.previewUrl);
    },
    [picked],
  );

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = formRef.current;
    openAiWindow(text.trim(), picked?.file, {
      from: 'input',
      rect: form.getBoundingClientRect(),
      ghost: cloneForMotion(form, text),
    });
    setText('');
    setPicked(null);
    setFileError('');
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3">
      {/** 사진이 있으면 테두리 안 위쪽에 썸네일, 입력 줄은 그 아래(Claude 입력창처럼) */}
      <form
        ref={formRef}
        data-ai-origin-input
        role="search"
        onSubmit={handleSubmit}
        className={`flex w-full max-w-[600px] flex-wrap items-center gap-2 border border-line bg-white px-1.5 focus-within:border-brand-500 focus-within:ring-focus ${
          picked ? 'rounded-[26px] pt-3 pb-1.5' : 'h-[52px] rounded-full'
        }`}
      >
        {picked && (
          <ul aria-label="첨부한 사진" className="flex basis-full px-2">
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
          aria-label="사진 첨부"
          title={`사진 첨부 (${RECEIPT_HELP})`}
          onClick={() => fileInputRef.current.click()}
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
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
        <label htmlFor="main-ask" className="sr-only">
          AI 매니저에게 질문
        </label>
        <input
          id="main-ask"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          placeholder={
            isNarrow
              ? `${petNm}에게 무엇이든 물어보세요`
              : `${petNm}의 건강, 근처 병원, 놀거리까지 무엇이든 물어보세요`
          }
          className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none placeholder:text-placeholder"
        />
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-50 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-100 max-[700px]:px-3 max-[480px]:size-10 max-[480px]:px-0"
        >
          <ArrowUp
            size={20}
            aria-hidden="true"
            className="min-[481px]:hidden"
          />
          <span className="max-[480px]:sr-only">AI 매니저</span>
        </button>
      </form>
      {fileError && (
        <p role="alert" className="text-sm text-danger">
          {fileError}
        </p>
      )}
    </div>
  );
}
