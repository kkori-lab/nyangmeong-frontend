import aiCharacter from '@/assets/ai-character.png';
import CharacterRequestBubble from './CharacterRequestBubble';
import ImageKindChips from './ImageKindChips';

const bubbleClass =
  'max-w-[592px] rounded-[4px_18px_18px_18px] border border-[#e2e7e7] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]';
const primaryClass =
  'h-8 rounded-md bg-[#285a5c] px-3 text-base font-semibold text-white hover:bg-[#1e4a4c]';

/** AI 아바타 + 내용 */
function AiRow({ children }) {
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
        {children}
      </div>
    </div>
  );
}

/**
 * [대화창 첨부 사진 말풍선]
 * - 판단 중·보내기 실패: 보낸 사진·글을 이 말풍선이 보여 준다(서버 저장 전)
 * - 판단 뒤: 사진 턴과 안내 글은 저장 메시지로 보이고, 여기는 종류 칩·캐릭터 만들기·가계부 버튼만
 * - 진료 영수증은 영수증 분석 말풍선(ReceiptAnalysisBubble)이 이어 받는다
 * - image.status: 'judging' | 'failed' | 'asking' | 'character' | 'expense'
 */
export default function ImageIntentBubble({
  image,
  pets,
  onChooseKind,
  onChoosePet,
  onCreateCharacter,
  onCancelCharacter,
  onOpenCharacters,
  onOpenExpenses,
}) {
  const isSaved = image.aiCnvrsRoomSn != null;
  return (
    <div className="flex flex-col gap-4">
      {!isSaved && (
        <div className="flex flex-col items-end gap-2">
          <img
            src={image.previewUrl}
            alt={image.file.name}
            width="160"
            height="120"
            className="h-[120px] w-40 rounded-[10px] border border-[#e2e7e7] object-cover"
          />
          {image.text && (
            <p className="max-w-[592px] whitespace-pre-wrap rounded-[18px_4px_18px_18px] border border-[#e8d27e] bg-[#f9eaa6] px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]">
              {image.text}
            </p>
          )}
        </div>
      )}

      {image.status === 'judging' && (
        <AiRow>
          <p role="status" className={bubbleClass}>
            사진을 살펴보고 있어요…
          </p>
        </AiRow>
      )}

      {image.status === 'failed' && (
        <p
          role="alert"
          className="self-end text-sm leading-[22px] text-[#b42318]"
        >
          {image.errorMessage}
        </p>
      )}

      {image.status === 'asking' && (
        <ImageKindChips isDisabled={false} onSelect={onChooseKind} />
      )}

      {image.status === 'character' && (
        <AiRow>
          <CharacterRequestBubble
            pet={image.pet}
            pets={pets}
            characterStatus={image.characterStatus}
            errorMessage={image.errorMessage}
            isRetryable={image.isRetryable}
            onChoosePet={onChoosePet}
            onCreate={onCreateCharacter}
            onCancel={onCancelCharacter}
            onOpenCharacters={onOpenCharacters}
          />
        </AiRow>
      )}

      {image.status === 'expense' && (
        <AiRow>
          {image.isChosen && (
            <p className={bubbleClass}>
              가계부 영수증은 가계부 화면에서 올릴 수 있어요.
            </p>
          )}
          <button
            type="button"
            className={primaryClass}
            onClick={onOpenExpenses}
          >
            가계부 열기
          </button>
        </AiRow>
      )}
    </div>
  );
}
