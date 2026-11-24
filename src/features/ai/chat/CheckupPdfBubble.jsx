import { FileText } from 'lucide-react';
import { callName } from '@/utils/josa';
import PetChoiceChips from './PetChoiceChips';
import AiAvatar from './AiAvatar';
import AnalyzingStatus from '@/components/AnalyzingStatus';

const bubbleClass =
  'max-w-[592px] rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink';
const buttonClass =
  'h-8 rounded-md px-3 text-base font-semibold disabled:cursor-not-allowed disabled:border-0 disabled:bg-surface-3 disabled:text-line-strong';
const primaryClass = `${buttonClass} bg-brand-500 text-white enabled:hover:bg-brand-600`;
const secondaryClass = `${buttonClass} border border-line bg-white text-ink enabled:hover:bg-surface-2`;

/** 보낸 PDF: 미리보기 대신 파일 아이콘 + 파일명 */
export function PdfFileChip({ name }) {
  return (
    <p className="flex h-10 max-w-[280px] items-center gap-2 rounded-[10px] border border-line bg-white px-3 text-sm leading-[1.25] tracking-[-0.03em] text-ink">
      <FileText aria-hidden="true" className="size-5 shrink-0 text-brand-500" />
      <span className="truncate">{name}</span>
    </p>
  );
}

/** AI 아바타 + 내용 */
function AiRow({ avatarPet, children }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <AiAvatar pet={avatarPet} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        {children}
      </div>
    </div>
  );
}

/**
 * [대화창 검사결과지 PDF 분석 말풍선] (SCR-AIM-013)
 * - 보낸 PDF·글 + 반려동물 되묻기·분석 중·저장 실패
 * - 결과는 checkup-card가 저장한 AI 메시지와 확인 카드로 보이고, 이 말풍선은 걷힌다
 */
export default function CheckupPdfBubble({
  pdf,
  pets,
  onChoosePet,
  onCancel,
  onRetrySave,
  avatarPet,
}) {
  const { status, pet } = pdf;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-end gap-2">
        <PdfFileChip name={pdf.file.name} />
        {pdf.text && (
          <p className="max-w-[592px] whitespace-pre-wrap rounded-[18px_4px_18px_18px] border border-fab-line bg-accent-300 px-4 py-3 text-[15px] leading-relaxed text-ink">
            {pdf.text}
          </p>
        )}
      </div>

      {status === 'choosing' && (
        <>
          <AiRow avatarPet={avatarPet}>
            <p className={bubbleClass}>어느 반려동물의 검사결과지인가요?</p>
          </AiRow>
          <PetChoiceChips
            pets={pets}
            isDisabled={false}
            onSelect={onChoosePet}
          />
        </>
      )}

      {(status === 'analyzing' || status === 'saving') && (
        <AiRow avatarPet={avatarPet}>
          <p role="status" className={bubbleClass}>
            <AnalyzingStatus>
              {callName(pet.petNm)}의 검사결과지를 분석하고 있어요
            </AnalyzingStatus>
          </p>
          {status === 'analyzing' && (
            <button type="button" className={secondaryClass} onClick={onCancel}>
              취소
            </button>
          )}
        </AiRow>
      )}

      {status === 'saveFailed' && (
        <AiRow avatarPet={avatarPet}>
          <p role="alert" className={bubbleClass}>
            결과를 대화에 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.
          </p>
          <button type="button" className={primaryClass} onClick={onRetrySave}>
            다시 시도
          </button>
        </AiRow>
      )}
    </div>
  );
}
