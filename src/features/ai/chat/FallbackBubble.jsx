import { Headset, ArrowRight } from 'lucide-react';
import { PATHS } from '@/routes/paths';
import { useOpenMain } from './aiHost';
import { shortcutChips } from './shortcutChips';
import AiAvatar from './AiAvatar';

/**
 * [매칭 실패 안내 말풍선]
 * - 안내 문구는 저장된 AI 메시지, 칩·고객센터 안내는 최신 실패 메시지에만 표시
 */
export default function FallbackBubble({
  text,
  hasActions,
  hasFaqGuide,
  avatarPet,
}) {
  const openMain = useOpenMain();
  return (
    <div className="flex min-w-0 items-start gap-3">
      <AiAvatar pet={avatarPet} />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="max-w-[592px] rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink">
          {text}
        </p>
        {hasActions && (
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
        )}
        {hasActions && hasFaqGuide && (
          <div className="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] bg-surface-2 px-4 py-3 text-[15px] text-muted">
            <Headset aria-hidden="true" className="size-4 shrink-0" />
            <span>찾으시는 내용이 없다면 고객센터를 이용해 주세요.</span>
            <button
              type="button"
              className="flex items-center gap-1.5 font-bold text-brand-500 hover:underline"
              onClick={() => openMain(PATHS.FAQS)}
            >
              자주 묻는 질문 보기
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
