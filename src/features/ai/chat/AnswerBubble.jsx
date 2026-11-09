import { ArrowRight } from 'lucide-react';
import aiCharacter from '@/assets/ai-character.png';
import MarkdownText from '@/components/MarkdownText';
import { openInMainWindow } from './openInMainWindow';
import { shortcutChips } from './shortcutChips';

const NOTE_MARK = '\n\n※';

const softButtonClass =
  'inline-flex h-8 items-center gap-1 rounded-full bg-[#e9f2f2] px-3 text-sm font-medium text-[#285a5c] hover:bg-[#cde0e0]';

/**
 * 의료 판단 제한 고지: 서버가 본문 끝에 붙여 저장, 화면에서만 구분선 아래로 분리.
 * 본문 안에도 `※` 문단이 올 수 있어 마지막 문단일 때만 뗀다
 */
const splitNote = (text) => {
  const index = text.lastIndexOf(NOTE_MARK);
  if (index === -1) return { body: text, note: null };
  const note = text.slice(index + 2);
  if (note.trimEnd().includes('\n\n')) return { body: text, note: null };
  return {
    body: text.slice(0, index),
    note: note.replace(/^※\s*/, ''),
  };
};

function TypingDots() {
  return (
    <span
      role="status"
      aria-label="답변을 쓰는 중"
      className="inline-flex h-[25px] items-center gap-1"
    >
      {[0, 150, 300].map((delay) => (
        <i
          key={delay}
          aria-hidden="true"
          className="size-1.5 animate-pulse rounded-full bg-[#b5c0c1] motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** AI 답변 말풍선 */
export default function AnswerBubble({
  status,
  text = '',
  shortcuts = [],
  onRetry,
  onRegenerate,
}) {
  const { body, note } = splitNote(text);

  return (
    <div className="flex min-w-0 items-start gap-3">
      <img
        src={aiCharacter}
        alt=""
        width="36"
        height="36"
        className="size-9 shrink-0 rounded-full border border-[#e2e7e7] bg-[#e9f2f2] object-contain p-1"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="max-w-[min(592px,100%)] rounded-[4px_18px_18px_18px] border border-[#e2e7e7] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]">
          {status === 'waiting' && <TypingDots />}
          {status === 'error' && (
            <p role="alert">일시적으로 답변할 수 없어요</p>
          )}
          {body !== '' && <MarkdownText text={body} />}
          {note && (
            <p className="mt-2 border-t border-dashed border-[#e2e7e7] pt-2 text-sm text-[#667374]">
              {note}
            </p>
          )}
        </div>

        {status === 'error' && (
          <>
            <button type="button" className={softButtonClass} onClick={onRetry}>
              다시 시도
            </button>
            <div className="flex flex-wrap gap-2">
              {shortcutChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="h-9 rounded-full border border-[#e2e7e7] bg-white px-4 text-base text-[#3d4a4b] hover:bg-[#f4f6f6]"
                  onClick={() => openInMainWindow(chip.path)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </>
        )}

        {status === 'incomplete' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#667374]">
              답변이 완료되지 않았어요
            </span>
            {onRegenerate && (
              <button
                type="button"
                className={softButtonClass}
                onClick={onRegenerate}
              >
                다시 생성
              </button>
            )}
          </div>
        )}

        {status === 'done' && shortcuts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#667374]">관련 기능 바로가기</span>
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.path}
                type="button"
                className={softButtonClass}
                onClick={() => openInMainWindow(shortcut.path)}
              >
                {shortcut.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
