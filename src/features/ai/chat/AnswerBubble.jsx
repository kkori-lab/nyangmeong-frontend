import { ArrowRight } from 'lucide-react';
import AnalyzingStatus from '@/components/AnalyzingStatus';
import MarkdownText from '@/components/MarkdownText';
import { useOpenMain } from './aiHost';
import { shortcutChips } from './shortcutChips';
import AiAvatar from './AiAvatar';
import useTypewriter from './useTypewriter';

const NOTE_MARK = '\n\n※';

const softButtonClass =
  'inline-flex h-8 items-center gap-1 rounded-full bg-brand-50 px-3 text-sm font-medium text-brand-500 hover:bg-brand-100';

/**
 * 의료 판단 제한 고지: 서버가 본문 끝에 붙여 저장, 화면에서만 구분선 아래로 분리.
 * 본문 안에도 `※` 문단이 올 수 있어 마지막 문단일 때만 분리
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
          className="size-1.5 animate-pulse rounded-full bg-line-strong motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** 에이전트 진행 문구: 읽기는 "○○ 확인 중이에요", 카드 고르기는 "○○ 준비 중이에요"(끝 "…"는 AnalyzingStatus, 사람 결정 2026-11-26) */
const stepText = ({ label, kind }) =>
  kind === 'CARD' ? `${label} 준비 중이에요` : `${label} 확인 중이에요`;

/**
 * AI 답변 말풍선
 * - isTyping: 글을 앞에서부터 펼친다(이번에 받은 답변). 지난 메시지는 false로 바로 전체
 * - 펼치는 동안에는 아래 버튼(바로가기·다시 생성)을 숨긴다
 * - memoKey: 저장 메시지 키. 이 창에서 한 번 펼친(또는 답변 말풍선으로 본) 메시지는 방을 다시 열어도 바로 전체
 * - step: 첫 글자 전 에이전트 진행 { label, kind }, label이 비면 점 세 개
 */
export default function AnswerBubble({
  status,
  text = '',
  shortcuts = [],
  onRetry,
  onRegenerate,
  avatarPet,
  isTyping = true,
  memoKey = null,
  step = null,
}) {
  const openMain = useOpenMain();
  const typed = useTypewriter(text, isTyping, memoKey);
  const { body, note } = splitNote(typed.text);

  return (
    <div className="flex min-w-0 items-start gap-3">
      <AiAvatar pet={avatarPet} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="max-w-[min(592px,100%)] rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink">
          {status === 'waiting' &&
            (step?.label ? (
              <span role="status" className="inline-flex h-[25px] items-center">
                <AnalyzingStatus>{stepText(step)}</AnalyzingStatus>
              </span>
            ) : (
              <TypingDots />
            ))}
          {status === 'error' && (
            <p role="alert">일시적으로 답변할 수 없어요</p>
          )}
          {body !== '' && <MarkdownText text={body} />}
          {note && (
            <p className="mt-2 border-t border-dashed border-line pt-2 text-sm text-subtle">
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
                  className="h-9 rounded-full border border-line bg-white px-4 text-base text-ink-2 hover:bg-surface-2"
                  onClick={() => openMain(chip.path)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </>
        )}

        {status === 'incomplete' && !typed.isRevealing && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-subtle">
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

        {status === 'done' && shortcuts.length > 0 && !typed.isRevealing && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-subtle">관련 기능 바로가기</span>
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.path}
                type="button"
                className={softButtonClass}
                onClick={() => openMain(shortcut.path)}
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
