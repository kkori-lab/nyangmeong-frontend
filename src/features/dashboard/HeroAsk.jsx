import { ChartLine, Mic, ReceiptText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { showToast } from '@/components/toastStore';
import useAiWindow from '@/hooks/useAiWindow';

/**
 * [메인 AI 매니저 검색창 + 제안 카드] (FN-MAN-002)
 * - 질문을 보내면 AI 창을 그 질문으로 연다
 * - 음성 질문은 모양만(누르면 준비 중 안내)
 * - 제안 카드: AI 건강분석 리포트는 행선지가 정해지기 전이라 모양만(JAJ 건강기록 개편 공유 뒤 연결),
 *   영수증 올리기는 onReceipt로 부모가 건강기록 영수증 흐름을 연다(추가-3)
 */
export default function HeroAsk({ petNm, onReceipt }) {
  const openAiWindow = useAiWindow();
  const [text, setText] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  const open = (message) => setIsBlocked(!openAiWindow(message));

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = text.trim();
    if (message) open(message);
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-5">
      <form
        role="search"
        onSubmit={handleSubmit}
        className="flex h-[52px] w-full max-w-[600px] items-center gap-2 rounded-full border border-line bg-white py-0 pr-1.5 pl-5 shadow-depth-sm focus-within:border-brand-500 focus-within:ring-focus max-[700px]:pl-4"
      >
        <label htmlFor="main-ask" className="sr-only">
          AI 매니저에게 질문
        </label>
        <input
          id="main-ask"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          required
          placeholder={`${petNm}의 건강, 근처 병원, 놀거리까지 무엇이든 물어보세요`}
          className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none placeholder:text-placeholder"
        />
        <button
          type="button"
          aria-label="음성으로 질문"
          onClick={() => showToast('음성 질문은 준비 중이에요')}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
        >
          <Mic className="size-4" />
        </button>
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-4 text-sm font-semibold text-brand-600 hover:bg-brand-100 max-[700px]:px-3"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="max-[480px]:sr-only">AI 매니저</span>
        </button>
      </form>
      <ul
        aria-label="제안"
        className="grid w-full max-w-[440px] grid-cols-2 gap-3 max-[480px]:grid-cols-1"
      >
        <li>
          <div className="flex items-center gap-3 rounded-box bg-surface-2 px-4 py-3 text-left">
            <ChartLine
              className="size-4 shrink-0 text-ink-2"
              aria-hidden="true"
            />
            <span className="min-w-0">
              <b className="block text-sm text-ink">AI 건강분석 리포트</b>
              <span className="block truncate text-xs text-muted">
                {petNm}의 최근 기록 요약 보기
              </span>
            </span>
          </div>
        </li>
        <li>
          <button
            type="button"
            onClick={onReceipt}
            className="flex w-full items-center gap-3 rounded-box bg-surface-2 px-4 py-3 text-left hover:bg-surface-3"
          >
            <ReceiptText
              className="size-4 shrink-0 text-ink-2"
              aria-hidden="true"
            />
            <span className="min-w-0">
              <b className="block text-sm text-ink">영수증 올리기</b>
              <span className="block truncate text-xs text-muted">
                사진으로 진료비·가계부 기록
              </span>
            </span>
          </button>
        </li>
      </ul>
      {isBlocked && (
        <p role="alert" className="text-sm text-danger">
          팝업이 차단되어 AI 매니저를 열 수 없어요.
        </p>
      )}
    </div>
  );
}
