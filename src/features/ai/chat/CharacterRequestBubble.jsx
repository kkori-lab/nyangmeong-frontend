import { callName } from '@/utils/josa';
import PetChoiceChips from './PetChoiceChips';

const bubbleClass =
  'max-w-[592px] rounded-[4px_18px_18px_18px] border border-[#e2e7e7] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]';
const buttonClass =
  'h-8 rounded-md px-3 text-base font-semibold disabled:cursor-not-allowed disabled:border-0 disabled:bg-[#ebf0f0] disabled:text-[#b9c4c4]';
const primaryClass = `${buttonClass} bg-[#285a5c] text-white enabled:hover:bg-[#1e4a4c]`;
const secondaryClass = `${buttonClass} border border-[#e2e7e7] bg-white text-[#1a3234] enabled:hover:bg-[#f4f6f6]`;

/**
 * [대화창 캐릭터 만들기 말풍선 내용]
 * - 반려동물 고르기 → [만들기]·[취소] → 요청 중 → 만드는 중 안내·[캐릭터 보기]
 * - 실패면 안내 + [다시 시도](다시 해도 같은 실패면 [캐릭터 보기])
 * - [취소]면 화면이 사진 말풍선째 닫는다
 * - characterStatus: 'ready' | 'creating' | 'created' | 'failed'
 * - 요청은 화면(pages)이 캐릭터 생성 API로 보낸다
 */
export default function CharacterRequestBubble({
  pet,
  pets,
  characterStatus,
  errorMessage,
  isRetryable,
  onChoosePet,
  onCreate,
  onCancel,
  onOpenCharacters,
}) {
  if (!pet) {
    if (pets.length === 0) {
      return (
        <p className={bubbleClass}>
          캐릭터를 만들 반려동물이 없어요. 반려동물을 먼저 등록해 주세요.
        </p>
      );
    }
    return (
      <>
        <p className={bubbleClass}>어느 아이의 캐릭터를 만들까요?</p>
        <PetChoiceChips pets={pets} isDisabled={false} onSelect={onChoosePet} />
      </>
    );
  }

  if (characterStatus === 'creating') {
    return (
      <p role="status" className={bubbleClass}>
        {callName(pet.petNm)}의 캐릭터를 요청하고 있어요…
      </p>
    );
  }

  if (characterStatus === 'created') {
    return (
      <>
        <p role="status" className={bubbleClass}>
          {callName(pet.petNm)}의 캐릭터를 만들고 있어요. 완성되면 캐릭터
          화면에서 볼 수 있어요.
        </p>
        <button
          type="button"
          className={primaryClass}
          onClick={onOpenCharacters}
        >
          캐릭터 보기
        </button>
      </>
    );
  }

  if (characterStatus === 'failed') {
    return (
      <>
        <p role="alert" className={bubbleClass}>
          {errorMessage}
        </p>
        {isRetryable ? (
          <button type="button" className={primaryClass} onClick={onCreate}>
            다시 시도
          </button>
        ) : (
          <button
            type="button"
            className={primaryClass}
            onClick={onOpenCharacters}
          >
            캐릭터 보기
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <p className={bubbleClass}>
        이 사진으로 {callName(pet.petNm)}의 캐릭터를 만들까요?
      </p>
      {characterStatus === 'ready' && (
        <div className="flex gap-2">
          <button type="button" className={primaryClass} onClick={onCreate}>
            만들기
          </button>
          <button type="button" className={secondaryClass} onClick={onCancel}>
            취소
          </button>
        </div>
      )}
    </>
  );
}
