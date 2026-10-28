import { Headset, ArrowRight } from 'lucide-react';
import aiCharacter from '@/assets/ai-character.png';
import { PATHS } from '@/routes/paths';
import { openInMainWindow } from './openInMainWindow';
import { shortcutChips } from './shortcutChips';

/**
 * [매칭 실패 안내 말풍선]
 * - 안내 문구는 저장된 AI 메시지, 칩·고객센터 안내는 최신 실패 메시지에만 표시
 */
export default function FallbackBubble({ text, hasActions, hasFaqGuide }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <img
        src={aiCharacter}
        alt=""
        width="36"
        height="36"
        className="size-9 shrink-0 rounded-full border border-[#e2e7e7] bg-[#e9f2f2] object-contain p-1"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="max-w-[592px] rounded-[4px_18px_18px_18px] border border-[#e2e7e7] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]">
          {text}
        </p>
        {hasActions && (
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
        )}
        {hasActions && hasFaqGuide && (
          <div className="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] bg-[#f4f6f6] px-4 py-3 text-[15px] text-[#566465]">
            <Headset aria-hidden="true" className="size-4 shrink-0" />
            <span>찾으시는 내용이 없다면 고객센터를 이용해 주세요.</span>
            <button
              type="button"
              className="flex items-center gap-1.5 font-bold text-[#285a5c] hover:underline"
              onClick={() => openInMainWindow(PATHS.FAQS)}
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
