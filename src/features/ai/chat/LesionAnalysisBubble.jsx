import { callName } from '@/utils/josa';
import AnalyzingStatus from '@/components/AnalyzingStatus';
import AiAvatar from './AiAvatar';
import PetChoiceChips from './PetChoiceChips';
import { LESION_TITLES } from './useChatLesion';

const bubbleClass =
  'max-w-[592px] rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink';
const buttonClass =
  'h-8 rounded-md px-3 text-base font-semibold disabled:cursor-not-allowed disabled:border-0 disabled:bg-surface-3 disabled:text-line-strong';
const primaryClass = `${buttonClass} bg-brand-500 text-white enabled:hover:bg-brand-600`;
const secondaryClass = `${buttonClass} border border-line bg-white text-ink enabled:hover:bg-surface-2`;

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
 * [대화창 피부·눈 사진 분석 말풍선] (SCR-AIM-013)
 * - 반려동물 되묻기·분석 중·저장 실패·형식 오류, 사진 턴은 저장 메시지가 보여 준다
 * - 결과는 lesion-card가 저장한 요약 메시지와 지속 관찰 확인 카드로 보이고, 이 말풍선은 걷힌다
 */
export default function LesionAnalysisBubble({
  lesion,
  pets,
  onChoosePet,
  onCancel,
  onRetrySave,
  avatarPet,
}) {
  const { status, pet } = lesion;
  const title = LESION_TITLES[lesion.kind];
  return (
    <div className="flex flex-col gap-4">
      {status === 'choosing' && (
        <>
          <AiRow avatarPet={avatarPet}>
            <p className={bubbleClass}>어느 반려동물의 {title} 사진인가요?</p>
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
              {callName(pet.petNm)}의 {title} 사진을 살펴보고 있어요
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

      {status === 'failed' && (
        <AiRow avatarPet={avatarPet}>
          <p role="alert" className={bubbleClass}>
            {lesion.errorMessage}
          </p>
        </AiRow>
      )}
    </div>
  );
}
